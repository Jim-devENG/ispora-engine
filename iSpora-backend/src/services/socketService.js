class SocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // Map userId to socketId
  }

  initialize(io) {
    this.io = io;
    
    io.on('connection', (socket) => {
      console.log(`🔗 User connected: ${socket.id}`);

      // Handle user authentication and store mapping
      socket.on('authenticate', (data) => {
        const { userId, token } = data;
        // In production, verify JWT token here
        if (userId) {
          this.userSockets.set(userId, socket.id);
          socket.userId = userId;
          socket.join(`user:${userId}`);
          console.log(`✅ User ${userId} authenticated and joined room`);
          
          // Update user online status
          this.updateUserOnlineStatus(userId, true);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.id}`);
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
          this.updateUserOnlineStatus(socket.userId, false);
        }
      });

      // Handle joining project rooms
      socket.on('joinProject', (projectId) => {
        socket.join(`project:${projectId}`);
        console.log(`📁 User ${socket.userId} joined project ${projectId}`);
      });

      // Handle leaving project rooms
      socket.on('leaveProject', (projectId) => {
        socket.leave(`project:${projectId}`);
        console.log(`📁 User ${socket.userId} left project ${projectId}`);
      });

      // Handle joining conversation rooms
      socket.on('joinConversation', (conversationId) => {
        socket.join(`conversation:${conversationId}`);
        console.log(`💬 User ${socket.userId} joined conversation ${conversationId}`);
      });

      // Handle leaving conversation rooms
      socket.on('leaveConversation', (conversationId) => {
        socket.leave(`conversation:${conversationId}`);
        console.log(`💬 User ${socket.userId} left conversation ${conversationId}`);
      });

      // Handle session rooms
      socket.on('joinSession', (sessionId) => {
        socket.join(`session:${sessionId}`);
        console.log(`🎥 User ${socket.userId} joined session ${sessionId}`);
        
        // Notify other participants
        socket.to(`session:${sessionId}`).emit('userJoinedSession', {
          userId: socket.userId,
          timestamp: new Date()
        });
      });

      socket.on('leaveSession', (sessionId) => {
        socket.leave(`session:${sessionId}`);
        console.log(`🎥 User ${socket.userId} left session ${sessionId}`);
        
        // Notify other participants
        socket.to(`session:${sessionId}`).emit('userLeftSession', {
          userId: socket.userId,
          timestamp: new Date()
        });
      });

      // Handle typing indicators
      socket.on('typing', (data) => {
        const { conversationId, isTyping } = data;
        socket.to(`conversation:${conversationId}`).emit('userTyping', {
          userId: socket.userId,
          isTyping,
          timestamp: new Date()
        });
      });

      // Handle real-time cursor positions (for collaborative editing)
      socket.on('cursorPosition', (data) => {
        const { projectId, position, selection } = data;
        socket.to(`project:${projectId}`).emit('cursorUpdate', {
          userId: socket.userId,
          position,
          selection,
          timestamp: new Date()
        });
      });

      // Handle file changes (collaborative editing)
      socket.on('fileChange', (data) => {
        const { projectId, fileId, changes } = data;
        socket.to(`project:${projectId}`).emit('fileUpdate', {
          userId: socket.userId,
          fileId,
          changes,
          timestamp: new Date()
        });
      });

      // Handle session screen sharing
      socket.on('startScreenShare', (data) => {
        const { sessionId, streamId } = data;
        socket.to(`session:${sessionId}`).emit('screenShareStarted', {
          userId: socket.userId,
          streamId,
          timestamp: new Date()
        });
      });

      socket.on('stopScreenShare', (data) => {
        const { sessionId } = data;
        socket.to(`session:${sessionId}`).emit('screenShareStopped', {
          userId: socket.userId,
          timestamp: new Date()
        });
      });

      // Handle session whiteboard updates
      socket.on('whiteboardUpdate', (data) => {
        const { sessionId, drawingData } = data;
        socket.to(`session:${sessionId}`).emit('whiteboardChange', {
          userId: socket.userId,
          drawingData,
          timestamp: new Date()
        });
      });
    });
  }

  // Send notification to specific user
  sendNotificationToUser(userId, notification) {
    if (this.io && this.userSockets.has(userId)) {
      this.io.to(`user:${userId}`).emit('notification', notification);
      return true;
    }
    return false;
  }

  // Send message to conversation
  sendMessageToConversation(conversationId, message, senderId = null) {
    if (this.io) {
      const room = `conversation:${conversationId}`;
      if (senderId) {
        // Send to everyone in conversation except sender
        this.io.to(room).emit('newMessage', message);
      } else {
        // Send to everyone in conversation
        this.io.to(room).emit('newMessage', message);
      }
      return true;
    }
    return false;
  }

  // Send update to project members
  sendProjectUpdate(projectId, update, senderId = null) {
    if (this.io) {
      const room = `project:${projectId}`;
      if (senderId) {
        // Send to everyone in project except sender
        this.io.to(room).emit('projectUpdate', update);
      } else {
        // Send to everyone in project
        this.io.to(room).emit('projectUpdate', update);
      }
      return true;
    }
    return false;
  }

  // Send session update to participants
  sendSessionUpdate(sessionId, update) {
    if (this.io) {
      this.io.to(`session:${sessionId}`).emit('sessionUpdate', update);
      return true;
    }
    return false;
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
      return true;
    }
    return false;
  }

  // Get online user count
  getOnlineUserCount() {
    return this.userSockets.size;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.userSockets.has(userId);
  }

  // Get all online users
  getOnlineUsers() {
    return Array.from(this.userSockets.keys());
  }

  // Update user online status in database
  async updateUserOnlineStatus(userId, isOnline) {
    try {
      const db = require('../database/connection');
      await db('users')
        .where({ id: userId })
        .update({ 
          is_online: isOnline,
          last_active: new Date(),
          updated_at: new Date()
        });
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  }

  // Send typing indicator
  sendTypingIndicator(conversationId, userId, isTyping) {
    if (this.io) {
      this.io.to(`conversation:${conversationId}`).emit('typing', {
        userId,
        isTyping,
        timestamp: new Date()
      });
      return true;
    }
    return false;
  }

  // Send connection request notification
  sendConnectionRequest(receiverId, requesterData) {
    return this.sendNotificationToUser(receiverId, {
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${requesterData.name} wants to connect with you`,
      data: requesterData,
      timestamp: new Date()
    });
  }

  // Send mentorship request notification
  sendMentorshipRequest(mentorId, menteeData) {
    return this.sendNotificationToUser(mentorId, {
      type: 'mentorship_request',
      title: 'New Mentorship Request',
      message: `${menteeData.name} wants you to be their mentor`,
      data: menteeData,
      timestamp: new Date()
    });
  }

  // Send project invitation
  sendProjectInvitation(userId, projectData) {
    return this.sendNotificationToUser(userId, {
      type: 'project_invitation',
      title: 'Project Invitation',
      message: `You've been invited to join ${projectData.title}`,
      data: projectData,
      timestamp: new Date()
    });
  }
}

// Export singleton instance
const socketService = new SocketService();
module.exports = socketService;