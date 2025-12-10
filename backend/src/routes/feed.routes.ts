import express from 'express';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { DatabaseService } from '../database/database.js';
import { v4 as uuidv4 } from 'uuid';
import { FeedItem, UserAction, AdminHighlight } from '../types/index.js';

const router = express.Router();
const db = DatabaseService.getInstance();

// Get feed items
router.get('/', optionalAuth, (req: AuthRequest, res) => {
  try {
    const { type, category, limit, offset, sort } = req.query;
    
    let items = db.getFeedItems();
    
    // Filter by type
    if (type && type !== 'all') {
      items = items.filter(item => item.type === type);
    }
    
    // Filter by category
    if (category) {
      items = items.filter(item => item.category === category);
    }
    
    // Sort
    if (sort === 'trending') {
      items.sort((a, b) => b.likes - a.likes);
    } else if (sort === 'significance') {
      const significanceOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      items.sort((a, b) => (significanceOrder[b.significance] || 0) - (significanceOrder[a.significance] || 0));
    } else {
      // Default: recent
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    
    // Pagination
    const offsetNum = parseInt(offset as string) || 0;
    const limitNum = parseInt(limit as string) || 50;
    const paginatedItems = items.slice(offsetNum, offsetNum + limitNum);
    
    res.json({
      items: paginatedItems,
      total: items.length,
      offset: offsetNum,
      limit: limitNum,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Record user action
router.post('/actions', authenticate, (req: AuthRequest, res) => {
  try {
    const actionData = req.body;
    const user = db.getUserById(req.user!.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const action: UserAction = {
      id: uuidv4(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userLocation: user.location,
      actionType: actionData.actionType,
      entityId: actionData.entityId,
      entityType: actionData.entityType,
      entityTitle: actionData.entityTitle,
      entityCategory: actionData.entityCategory,
      timestamp: new Date().toISOString(),
      metadata: actionData.metadata,
      visibility: actionData.visibility || 'public',
    };
    
    const created = db.createUserAction(action);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create admin highlight
router.post('/admin/highlights', authenticate, (req: AuthRequest, res) => {
  try {
    const highlightData = req.body;
    
    const highlight: AdminHighlight = {
      id: uuidv4(),
      type: highlightData.type,
      title: highlightData.title,
      description: highlightData.description,
      image: highlightData.image,
      ctaText: highlightData.ctaText,
      ctaLink: highlightData.ctaLink,
      isPinned: highlightData.isPinned || false,
      expiresAt: highlightData.expiresAt,
      createdBy: req.user!.id,
      createdAt: new Date().toISOString(),
      visibility: highlightData.visibility || 'public',
      projectId: highlightData.projectId,
      opportunityId: highlightData.opportunityId,
    };
    
    const created = db.createAdminHighlight(highlight);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get feed stats
router.get('/stats', authenticate, (req: AuthRequest, res) => {
  try {
    const items = db.getFeedItems();
    const actions = db.getDatabase().userActions;
    const highlights = db.getAdminHighlights();
    
    const stats = {
      totalItems: items.length,
      totalActions: actions.length,
      totalHighlights: highlights.length,
      itemsByType: items.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      pinnedItems: items.filter(item => item.isPinned).length,
      liveItems: items.filter(item => item.isLive).length,
    };
    
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

