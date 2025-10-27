const { addNotificationJob, addEmailJob, addAnalyticsJob } = require('../config/redis');
const { createChildLogger } = require('../config/logger');

const logger = createChildLogger({ service: 'notification' });

class NotificationService {
  // Send immediate notification
  async sendNotification(userId, type, title, message, data = {}) {
    try {
      await addNotificationJob('send_notification', {
        userId,
        type,
        title,
        message,
        data,
        timestamp: new Date().toISOString(),
      });

      logger.info({
        userId,
        type,
        title,
      }, 'Notification queued');

      return { success: true };
    } catch (error) {
      logger.error({ error: error.message, userId, type }, 'Failed to queue notification');
      throw error;
    }
  }

  // Send email notification
  async sendEmail(userId, template, data = {}) {
    try {
      await addEmailJob(template, userId, data);
      
      logger.info({
        userId,
        template,
      }, 'Email queued');

      return { success: true };
    } catch (error) {
      logger.error({ error: error.message, userId, template }, 'Failed to queue email');
      throw error;
    }
  }

  // Send bulk notifications
  async sendBulkNotifications(notifications) {
    try {
      const promises = notifications.map(notification => 
        this.sendNotification(
          notification.userId,
          notification.type,
          notification.title,
          notification.message,
          notification.data
        )
      );

      await Promise.all(promises);

      logger.info({
        count: notifications.length,
      }, 'Bulk notifications queued');

      return { success: true, count: notifications.length };
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to queue bulk notifications');
      throw error;
    }
  }

  // Send delayed notification
  async sendDelayedNotification(userId, type, title, message, delay, data = {}) {
    try {
      await addNotificationJob('send_notification', {
        userId,
        type,
        title,
        message,
        data,
        timestamp: new Date().toISOString(),
      }, { delay });

      logger.info({
        userId,
        type,
        title,
        delay,
      }, 'Delayed notification queued');

      return { success: true };
    } catch (error) {
      logger.error({ error: error.message, userId, type }, 'Failed to queue delayed notification');
      throw error;
    }
  }

  // Track analytics event
  async trackEvent(userId, event, data = {}) {
    try {
      await addAnalyticsJob(event, userId, data);

      logger.info({
        userId,
        event,
      }, 'Analytics event queued');

      return { success: true };
    } catch (error) {
      logger.error({ error: error.message, userId, event }, 'Failed to queue analytics event');
      throw error;
    }
  }

  // Send project update notification
  async sendProjectUpdate(projectId, updateType, data = {}) {
    try {
      // Get project members
      const members = await this.getProjectMembers(projectId);
      
      const notifications = members.map(member => ({
        userId: member.userId,
        type: 'project_update',
        title: `Project Update: ${updateType}`,
        message: `Your project has been updated: ${updateType}`,
        data: {
          projectId,
          updateType,
          ...data,
        },
      }));

      await this.sendBulkNotifications(notifications);

      logger.info({
        projectId,
        updateType,
        memberCount: members.length,
      }, 'Project update notifications sent');

      return { success: true };
    } catch (error) {
      logger.error({ error: error.message, projectId, updateType }, 'Failed to send project update notifications');
      throw error;
    }
  }

  // Send mentorship notification
  async sendMentorshipNotification(mentorId, menteeId, type, data = {}) {
    try {
      const notifications = [
        {
          userId: mentorId,
          type: 'mentorship',
          title: `Mentorship ${type}`,
          message: `You have a new mentorship ${type}`,
          data: { ...data, role: 'mentor' },
        },
        {
          userId: menteeId,
          type: 'mentorship',
          title: `Mentorship ${type}`,
          message: `You have a new mentorship ${type}`,
          data: { ...data, role: 'mentee' },
        },
      ];

      await this.sendBulkNotifications(notifications);

      logger.info({
        mentorId,
        menteeId,
        type,
      }, 'Mentorship notifications sent');

      return { success: true };
    } catch (error) {
      logger.error({ error: error.message, mentorId, menteeId, type }, 'Failed to send mentorship notifications');
      throw error;
    }
  }

  // Helper method to get project members (mock implementation)
  async getProjectMembers(projectId) {
    // This would typically query the database
    // For now, return mock data
    return [
      { userId: 'user-1' },
      { userId: 'user-2' },
    ];
  }
}

module.exports = new NotificationService();
