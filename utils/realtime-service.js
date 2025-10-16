const { logger } = require('./log');

class RealtimeService {
  constructor() {
    this.connections = new Map();
    this.channels = new Map();
    this.eventBus = new Map();
  }

  // Initialize WebSocket connection
  initializeConnection(userId, socket) {
    try {
      this.connections.set(userId, socket);
      logger.info(`User ${userId} connected to realtime service`);

      socket.on('subscribe', (channel) => this.subscribe(userId, channel, socket));
      socket.on('unsubscribe', (channel) => this.unsubscribe(userId, channel));
      socket.on('message', (data) => this.handleMessage(userId, data));
      socket.on('disconnect', () => this.handleDisconnect(userId));

      return { success: true, userId };
    } catch (error) {
      logger.error('Connection initialization error:', error);
      throw error;
    }
  }

  // Subscribe to channel
  subscribe(userId, channel, socket) {
    try {
      if (!this.channels.has(channel)) {
        this.channels.set(channel, new Set());
      }

      this.channels.get(channel).add(userId);
      socket.join(channel);

      logger.info(`User ${userId} subscribed to ${channel}`);

      return { success: true, channel };
    } catch (error) {
      logger.error('Subscribe error:', error);
      throw error;
    }
  }

  // Unsubscribe from channel
  unsubscribe(userId, channel) {
    try {
      if (this.channels.has(channel)) {
        this.channels.get(channel).delete(userId);
      }

      logger.info(`User ${userId} unsubscribed from ${channel}`);

      return { success: true };
    } catch (error) {
      logger.error('Unsubscribe error:', error);
      throw error;
    }
  }

  // Handle incoming message
  handleMessage(userId, data) {
    try {
      const { channel, type, payload } = data;

      this.broadcast(channel, {
        type,
        userId,
        payload,
        timestamp: new Date()
      });

      logger.debug(`Message from ${userId} on ${channel}:`, type);
    } catch (error) {
      logger.error('Message handling error:', error);
    }
  }

  // Broadcast to channel
  broadcast(channel, message) {
    try {
      if (this.channels.has(channel)) {
        const subscribers = this.channels.get(channel);
        subscribers.forEach(userId => {
          const socket = this.connections.get(userId);
          if (socket) {
            socket.emit('message', message);
          }
        });
      }
    } catch (error) {
      logger.error('Broadcast error:', error);
    }
  }

  // Handle disconnect
  handleDisconnect(userId) {
    try {
      this.connections.delete(userId);

      // Remove from all channels
      this.channels.forEach((subscribers, channel) => {
        subscribers.delete(userId);
      });

      logger.info(`User ${userId} disconnected from realtime service`);
    } catch (error) {
      logger.error('Disconnect handling error:', error);
    }
  }

  // Emit event
  emit(event, data) {
    try {
      if (!this.eventBus.has(event)) {
        this.eventBus.set(event, []);
      }

      this.eventBus.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error(`Event handler error for ${event}:`, error);
        }
      });
    } catch (error) {
      logger.error('Event emission error:', error);
    }
  }

  // Listen to event
  on(event, callback) {
    try {
      if (!this.eventBus.has(event)) {
        this.eventBus.set(event, []);
      }

      this.eventBus.get(event).push(callback);
    } catch (error) {
      logger.error('Event listener registration error:', error);
    }
  }

  // Get active connections count
  getActiveConnections() {
    return this.connections.size;
  }

  // Get channel subscribers
  getChannelSubscribers(channel) {
    return this.channels.get(channel)?.size || 0;
  }
}

class NotificationEngine {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  // Queue notification
  async queueNotification(userId, notification) {
    try {
      this.queue.push({
        userId,
        ...notification,
        createdAt: new Date(),
        status: 'pending'
      });

      if (!this.processing) {
        await this.processQueue();
      }

      return { success: true, queued: true };
    } catch (error) {
      logger.error('Queue notification error:', error);
      throw error;
    }
  }

  // Process notification queue
  async processQueue() {
    try {
      this.processing = true;

      while (this.queue.length > 0) {
        const notification = this.queue.shift();
        await this.sendNotification(notification);
      }

      this.processing = false;
    } catch (error) {
      logger.error('Queue processing error:', error);
      this.processing = false;
    }
  }

  // Send notification
  async sendNotification(notification) {
    try {
      const { userId, title, message, type, data } = notification;

      // Simulate sending (in production, use email/SMS service)
      logger.info(`Notification sent to ${userId}:`, title);

      return { success: true, notificationId: Date.now() };
    } catch (error) {
      logger.error('Send notification error:', error);
      throw error;
    }
  }

  // Batch notifications
  async sendBatchNotifications(userIds, notification) {
    try {
      const results = await Promise.all(
        userIds.map(userId =>
          this.queueNotification(userId, notification)
        )
      );

      return { success: true, sent: results.length };
    } catch (error) {
      logger.error('Batch notification error:', error);
      throw error;
    }
  }

  // Schedule notification
  scheduleNotification(userId, notification, delayMs) {
    try {
      setTimeout(() => {
        this.queueNotification(userId, notification);
      }, delayMs);

      return { success: true, scheduled: true };
    } catch (error) {
      logger.error('Schedule notification error:', error);
      throw error;
    }
  }

  // Get queue status
  getQueueStatus() {
    return {
      pending: this.queue.length,
      processing: this.processing
    };
  }
}

class LiveActivityTracker {
  constructor() {
    this.activities = new Map();
    this.sessions = new Map();
  }

  // Start tracking session
  startSession(userId, sessionType) {
    try {
      const sessionId = `${userId}-${Date.now()}`;
      const session = {
        sessionId,
        userId,
        type: sessionType,
        startTime: new Date(),
        events: [],
        duration: 0
      };

      this.sessions.set(sessionId, session);

      return { success: true, sessionId };
    } catch (error) {
      logger.error('Start session error:', error);
      throw error;
    }
  }

  // Track activity
  trackActivity(sessionId, activity) {
    try {
      const session = this.sessions.get(sessionId);

      if (session) {
        session.events.push({
          ...activity,
          timestamp: new Date()
        });

        session.duration = Date.now() - session.startTime.getTime();
      }

      return { success: true };
    } catch (error) {
      logger.error('Track activity error:', error);
      throw error;
    }
  }

  // End session
  endSession(sessionId) {
    try {
      const session = this.sessions.get(sessionId);

      if (session) {
        session.endTime = new Date();
        session.duration = session.endTime - session.startTime;

        // Store for analytics
        if (!this.activities.has(session.userId)) {
          this.activities.set(session.userId, []);
        }

        this.activities.get(session.userId).push(session);
      }

      this.sessions.delete(sessionId);

      return { success: true, session };
    } catch (error) {
      logger.error('End session error:', error);
      throw error;
    }
  }

  // Get user activities
  getUserActivities(userId) {
    try {
      return this.activities.get(userId) || [];
    } catch (error) {
      logger.error('Get user activities error:', error);
      return [];
    }
  }

  // Get activity statistics
  getActivityStats(userId) {
    try {
      const activities = this.activities.get(userId) || [];

      const totalSessions = activities.length;
      const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);
      const avgDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

      const sessionsByType = {};
      activities.forEach(a => {
        sessionsByType[a.type] = (sessionsByType[a.type] || 0) + 1;
      });

      return {
        totalSessions,
        totalDuration,
        avgDuration,
        sessionsByType
      };
    } catch (error) {
      logger.error('Get activity stats error:', error);
      throw error;
    }
  }
}

class PresenceTracker {
  constructor() {
    this.presence = new Map();
  }

  // Set user presence
  setPresence(userId, status, metadata = {}) {
    try {
      this.presence.set(userId, {
        userId,
        status,
        metadata,
        lastSeen: new Date()
      });

      return { success: true };
    } catch (error) {
      logger.error('Set presence error:', error);
      throw error;
    }
  }

  // Get user presence
  getPresence(userId) {
    try {
      return this.presence.get(userId) || null;
    } catch (error) {
      logger.error('Get presence error:', error);
      return null;
    }
  }

  // Get all online users
  getOnlineUsers() {
    try {
      const users = [];
      this.presence.forEach((data, userId) => {
        if (data.status === 'online') {
          users.push(userId);
        }
      });
      return users;
    } catch (error) {
      logger.error('Get online users error:', error);
      return [];
    }
  }

  // Clear offline users
  clearOfflineUsers(maxAge = 3600000) {
    try {
      const now = Date.now();
      let cleared = 0;

      this.presence.forEach((data, userId) => {
        if (now - data.lastSeen.getTime() > maxAge) {
          this.presence.delete(userId);
          cleared++;
        }
      });

      return { success: true, cleared };
    } catch (error) {
      logger.error('Clear offline users error:', error);
      throw error;
    }
  }
}

const realtimeService = new RealtimeService();
const notificationEngine = new NotificationEngine();
const liveActivityTracker = new LiveActivityTracker();
const presenceTracker = new PresenceTracker();

module.exports = {
  realtimeService,
  notificationEngine,
  liveActivityTracker,
  presenceTracker,
  RealtimeService,
  NotificationEngine,
  LiveActivityTracker,
  PresenceTracker
};
