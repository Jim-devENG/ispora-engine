const Redis = require('ioredis');
const { Queue, Worker } = require('bullmq');

// Check if Redis is available
const isRedisAvailable = process.env.REDIS_HOST && process.env.REDIS_HOST !== 'localhost' || 
                         process.env.NODE_ENV === 'production';

// Redis connection options for BullMQ
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  // BullMQ requires this to be null for blocking commands
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Optional ioredis client if needed elsewhere
let redis = null;
let queues = {};
let workers = {};

if (isRedisAvailable) {
  try {
    redis = new Redis({
      ...redisConnection,
      lazyConnect: true,
    });

    // Queue configurations
    queues = {
      notifications: new Queue('notifications', { connection: redisConnection }),
      emails: new Queue('emails', { connection: redisConnection }),
      analytics: new Queue('analytics', { connection: redisConnection }),
    };

    // Worker configurations
    workers = {
      notifications: new Worker('notifications', async (job) => {
        const { type, data } = job.data;
        
        switch (type) {
          case 'send_notification':
            // Process notification sending
            console.log('Processing notification:', data);
            break;
          case 'send_email':
            // Process email sending
            console.log('Processing email:', data);
            break;
          default:
            console.log('Unknown job type:', type);
        }
      }, { connection: redisConnection }),

      emails: new Worker('emails', async (job) => {
        const { template, recipient, data } = job.data;
        console.log(`Sending email to ${recipient} with template ${template}`);
        // Implement actual email sending logic here
      }, { connection: redisConnection }),

      analytics: new Worker('analytics', async (job) => {
        const { event, userId, data } = job.data;
        console.log(`Processing analytics event: ${event} for user ${userId}`);
        // Implement analytics processing logic here
      }, { connection: redisConnection }),
    };
  } catch (error) {
    console.log('Redis not available, running without background jobs:', error.message);
  }
} else {
  console.log('Redis not configured, running without background jobs');
}

// Queue management functions
async function addNotificationJob(type, data, options = {}) {
  if (!isRedisAvailable || !queues.notifications) {
    console.log('Redis not available, processing notification synchronously:', { type, data });
    return null;
  }
  return await queues.notifications.add(type, { type, data }, {
    delay: options.delay || 0,
    attempts: options.attempts || 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    ...options,
  });
}

async function addEmailJob(template, recipient, data, options = {}) {
  if (!isRedisAvailable || !queues.emails) {
    console.log('Redis not available, processing email synchronously:', { template, recipient });
    return null;
  }
  return await queues.emails.add('send_email', {
    template,
    recipient,
    data,
  }, {
    delay: options.delay || 0,
    attempts: options.attempts || 3,
    ...options,
  });
}

async function addAnalyticsJob(event, userId, data, options = {}) {
  if (!isRedisAvailable || !queues.analytics) {
    console.log('Redis not available, processing analytics synchronously:', { event, userId });
    return null;
  }
  return await queues.analytics.add('track_event', {
    event,
    userId,
    data,
  }, {
    delay: options.delay || 0,
    attempts: options.attempts || 1,
    ...options,
  });
}

// Graceful shutdown
async function closeConnections() {
  if (!isRedisAvailable) {
    console.log('No Redis connections to close');
    return;
  }
  
  const closePromises = [];
  if (redis) closePromises.push(redis.quit());
  closePromises.push(...Object.values(queues).map(queue => queue.close()));
  closePromises.push(...Object.values(workers).map(worker => worker.close()));
  
  await Promise.all(closePromises);
}

module.exports = {
  redis,
  queues,
  workers,
  addNotificationJob,
  addEmailJob,
  addAnalyticsJob,
  closeConnections,
};
