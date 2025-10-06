const Redis = require('ioredis');
const { Queue, Worker } = require('bullmq');

// Redis connection
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  // BullMQ requires this to be null for blocking commands
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

// Queue configurations
const queues = {
  notifications: new Queue('notifications', { connection: redis }),
  emails: new Queue('emails', { connection: redis }),
  analytics: new Queue('analytics', { connection: redis }),
};

// Worker configurations
const workers = {
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
  }, { connection: redis }),

  emails: new Worker('emails', async (job) => {
    const { template, recipient, data } = job.data;
    console.log(`Sending email to ${recipient} with template ${template}`);
    // Implement actual email sending logic here
  }, { connection: redis }),

  analytics: new Worker('analytics', async (job) => {
    const { event, userId, data } = job.data;
    console.log(`Processing analytics event: ${event} for user ${userId}`);
    // Implement analytics processing logic here
  }, { connection: redis }),
};

// Queue management functions
async function addNotificationJob(type, data, options = {}) {
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
  await Promise.all([
    redis.quit(),
    ...Object.values(queues).map(queue => queue.close()),
    ...Object.values(workers).map(worker => worker.close()),
  ]);
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
