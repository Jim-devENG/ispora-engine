const jwt = require('jsonwebtoken');

class SocketService {
  constructor() {
    this.io = null;
    this.rooms = new Map(); // roomId -> Set of socketIds
    this.socketToRoom = new Map(); // socketId -> roomId
    this.socketToUser = new Map(); // socketId -> userId
  }

  initialize(io) {
    this.io = io;
    
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      
      // Handle authentication
      socket.on('authenticate', (data) => {
        try {
          const { token, devKey } = data;
          
          // Check dev key first (for development bypass)
          if (devKey && devKey === process.env.DEV_ACCESS_KEY) {
            socket.userId = 'dev-user';
            socket.userType = 'admin';
            socket.emit('authenticated', { success: true, userId: 'dev-user' });
            return;
          }
          
          // Verify JWT token
          if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            socket.userType = decoded.userType;
            socket.emit('authenticated', { success: true, userId: decoded.userId });
            return;
          }
          
          socket.emit('authenticated', { success: false, error: 'No valid authentication' });
        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('authenticated', { success: false, error: 'Invalid token' });
        }
      });

      // Handle joining a room (session)
      socket.on('join-room', (data) => {
        const { roomId, userId } = data;
        
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Leave previous room if any
        if (this.socketToRoom.has(socket.id)) {
          const previousRoom = this.socketToRoom.get(socket.id);
          this.leaveRoom(socket, previousRoom);
        }

        // Join new room
        socket.join(roomId);
        this.socketToRoom.set(socket.id, roomId);
        this.socketToUser.set(socket.id, userId || socket.userId);

        // Add to room tracking
        if (!this.rooms.has(roomId)) {
          this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId).add(socket.id);

        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
          userId: userId || socket.userId,
          socketId: socket.id
        });

        // Send current room members to the new user
        const roomMembers = Array.from(this.rooms.get(roomId))
          .filter(id => id !== socket.id)
          .map(id => ({
            socketId: id,
            userId: this.socketToUser.get(id)
          }));
        
        socket.emit('room-members', roomMembers);

        console.log(`User ${socket.userId} joined room ${roomId}`);
      });

      // Handle leaving a room
      socket.on('leave-room', (data) => {
        const { roomId } = data;
        this.leaveRoom(socket, roomId);
      });

      // Handle WebRTC signaling
      socket.on('offer', (data) => {
        const { to, offer } = data;
        socket.to(to).emit('offer', {
          from: socket.id,
          offer: offer
        });
      });

      socket.on('answer', (data) => {
        const { to, answer } = data;
        socket.to(to).emit('answer', {
          from: socket.id,
          answer: answer
        });
      });

      socket.on('ice-candidate', (data) => {
        const { to, candidate } = data;
        socket.to(to).emit('ice-candidate', {
          from: socket.id,
          candidate: candidate
        });
      });

      // Handle chat messages
      socket.on('chat-message', (data) => {
        const { roomId, message, userId, userName } = data;
        
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Broadcast to room
        socket.to(roomId).emit('chat-message', {
          id: Date.now().toString(),
          message,
          userId: userId || socket.userId,
          userName: userName || 'Anonymous',
          timestamp: new Date().toISOString(),
          type: 'text'
        });
      });

      // Handle screen sharing events
      socket.on('screen-share-start', (data) => {
        const { roomId } = data;
        socket.to(roomId).emit('screen-share-start', {
          userId: socket.userId,
          socketId: socket.id
        });
      });

      socket.on('screen-share-stop', (data) => {
        const { roomId } = data;
        socket.to(roomId).emit('screen-share-stop', {
          userId: socket.userId,
          socketId: socket.id
        });
      });

      // Handle recording events
      socket.on('recording-start', (data) => {
        const { roomId } = data;
        socket.to(roomId).emit('recording-start', {
          userId: socket.userId,
          socketId: socket.id
        });
      });

      socket.on('recording-stop', (data) => {
        const { roomId } = data;
        socket.to(roomId).emit('recording-stop', {
          userId: socket.userId,
          socketId: socket.id
        });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Leave all rooms
        if (this.socketToRoom.has(socket.id)) {
          const roomId = this.socketToRoom.get(socket.id);
          this.leaveRoom(socket, roomId);
        }

        // Clean up tracking
        this.socketToUser.delete(socket.id);
      });
    });
  }

  leaveRoom(socket, roomId) {
    if (roomId && this.rooms.has(roomId)) {
      // Remove from room tracking
      this.rooms.get(roomId).delete(socket.id);
      
      // If room is empty, delete it
      if (this.rooms.get(roomId).size === 0) {
        this.rooms.delete(roomId);
      } else {
        // Notify others in the room
        socket.to(roomId).emit('user-left', {
          userId: this.socketToUser.get(socket.id),
          socketId: socket.id
        });
      }
    }

    // Clean up tracking
    this.socketToRoom.delete(socket.id);
    socket.leave(roomId);
  }

  // Utility methods for external use
  getRoomMembers(roomId) {
    return this.rooms.get(roomId) || new Set();
  }

  getSocketUser(socketId) {
    return this.socketToUser.get(socketId);
  }

  broadcastToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }
}

module.exports = new SocketService();