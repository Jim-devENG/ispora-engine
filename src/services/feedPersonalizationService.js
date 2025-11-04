/**
 * Feed Personalization Service
 * Phase 3: Personalized feed generation with optional Redis caching
 */

const ProjectUpdate = require('../models/ProjectUpdate');
const Project = require('../models/Project');
const Opportunity = require('../models/Opportunity');
const Follow = require('../models/Follow');
const FeedPreference = require('../models/FeedPreference');
const logger = require('../utils/logger');

let redisClient = null;

// Initialize Redis client if REDIS_URL is set
try {
  if (process.env.REDIS_URL) {
    // Try to require ioredis, but fallback gracefully if not installed
    let redis;
    try {
      redis = require('ioredis');
    } catch (requireError) {
      logger.warn('ioredis not installed, Redis caching disabled. Install with: npm install ioredis');
      redisClient = null;
    }
    
    if (redis) {
      redisClient = new redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

      redisClient.on('connect', () => {
        logger.info('Redis connected for feed caching');
      });

      redisClient.on('error', (err) => {
        logger.warn({ error: err.message }, 'Redis connection error, falling back to DB');
        redisClient = null;
      });
    }
  }
} catch (error) {
  logger.warn({ error: error.message }, 'Redis not available, using DB fallback');
  redisClient = null;
}

/**
 * Get personalized feed for a user
 */
const getFeedForUser = async (userId, options = {}) => {
  try {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const cacheKey = `feed:user:${userId}:page:${page}`;
    const cacheTTL = parseInt(process.env.FEED_CACHE_TTL) || 30; // Default 30 seconds

    // Try to get from cache if Redis is available
    if (redisClient) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          logger.debug({ userId, page }, 'Feed retrieved from cache');
          return JSON.parse(cached);
        }
      } catch (cacheError) {
        logger.warn({ error: cacheError.message }, 'Cache read error, falling back to DB');
      }
    }

    // Get user feed preferences
    const feedPref = await FeedPreference.findOne({ userId }) || {
      sources: { projects: true, people: true, opportunities: true },
      sort: 'recent',
      topics: []
    };

    // Build feed items
    const feedItems = [];

    // 1. Get followed users
    const following = await Follow.find({ follower: userId })
      .select('followee')
      .lean();
    const followeeIds = following.map(f => f.followee);

    // 2. Get projects user follows or owns
    const userProjects = await Project.find({
      $or: [
        { owner: userId },
        { _id: { $in: followeeIds.map(id => Project.find({ owner: id }).select('_id')) } }
      ]
    }).select('_id').lean();
    const projectIds = userProjects.map(p => p._id);

    // 3. Get project updates (if projects source enabled)
    if (feedPref.sources.projects) {
      const updates = await ProjectUpdate.find({
        projectId: { $in: projectIds },
        ...(feedPref.topics.length > 0 ? { tags: { $in: feedPref.topics } } : {})
      })
        .populate('author', 'name email firstName lastName username avatar')
        .populate('projectId', 'title owner')
        .sort({ createdAt: -1 })
        .limit(limit * 2) // Get more to allow for deduplication
        .lean();

      feedItems.push(...updates.map(update => ({
        type: 'update',
        id: update._id.toString(),
        author: update.author,
        project: update.projectId,
        content: update.content,
        title: update.title,
        createdAt: update.createdAt,
        score: calculateScore(update.createdAt, userId, update.author._id, feedPref)
      })));
    }

    // 4. Get opportunities (if opportunities source enabled)
    if (feedPref.sources.opportunities) {
      const opportunities = await Opportunity.find({
        status: 'active',
        visibility: 'public',
        ...(feedPref.topics.length > 0 ? { tags: { $in: feedPref.topics } } : {})
      })
        .populate('createdBy', 'name email firstName lastName username avatar')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      feedItems.push(...opportunities.map(opp => ({
        type: 'opportunity',
        id: opp._id.toString(),
        author: opp.createdBy,
        title: opp.title,
        description: opp.description,
        createdAt: opp.createdAt,
        score: calculateScore(opp.createdAt, userId, opp.createdBy?._id, feedPref)
      })));
    }

    // 5. Deduplicate and sort
    const uniqueItems = deduplicateFeedItems(feedItems);

    if (feedPref.sort === 'personalized') {
      uniqueItems.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else {
      uniqueItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // 6. Paginate
    const skip = (page - 1) * limit;
    const paginatedItems = uniqueItems.slice(skip, skip + limit);

    const result = {
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total: uniqueItems.length,
        pages: Math.ceil(uniqueItems.length / limit)
      }
    };

    // Cache result if Redis is available
    if (redisClient && paginatedItems.length > 0) {
      try {
        await redisClient.setex(cacheKey, cacheTTL, JSON.stringify(result));
        logger.debug({ userId, page, cacheTTL }, 'Feed cached');
      } catch (cacheError) {
        logger.warn({ error: cacheError.message }, 'Cache write error');
      }
    }

    return result;
  } catch (error) {
    logger.error({ error: error.message, userId, options }, 'Failed to get feed for user');
    throw error;
  }
};

/**
 * Calculate personalization score for a feed item
 * Simple scoring: recency + follow_weight + topic_match
 */
const calculateScore = (createdAt, userId, authorId, feedPref) => {
  let score = 0;

  // Recency score (more recent = higher score)
  const ageInHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  score += Math.max(0, 100 - ageInHours); // Max 100 points for recency

  // Follow weight (if user follows the author)
  // Note: This would require checking Follow model - simplified for now
  // In real implementation, check if userId follows authorId
  // if (isFollowing(userId, authorId)) {
  //   score += 50;
  // }

  // Topic match (if item matches user's preferred topics)
  // Simplified - in real implementation, check item tags against feedPref.topics
  // if (itemMatchesTopics(item, feedPref.topics)) {
  //   score += 30;
  // }

  return score;
};

/**
 * Deduplicate feed items by ID
 */
const deduplicateFeedItems = (items) => {
  const seen = new Set();
  return items.filter(item => {
    const key = `${item.type}:${item.id}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

/**
 * Clear cache for a user (useful after profile/follow changes)
 */
const clearUserCache = async (userId) => {
  if (redisClient) {
    try {
      const keys = await redisClient.keys(`feed:user:${userId}:*`);
      if (keys.length > 0) {
        await redisClient.del(...keys);
        logger.info({ userId, keysCleared: keys.length }, 'User feed cache cleared');
      }
    } catch (error) {
      logger.warn({ error: error.message, userId }, 'Failed to clear user cache');
    }
  }
};

module.exports = {
  getFeedForUser,
  clearUserCache
};

