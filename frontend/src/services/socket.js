import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.currentUserId = null;
    this.status = 'disconnected'; // 'connected' | 'connecting' | 'reconnecting' | 'disconnected' | 'error'
    this.statusListeners = new Set();
  }

  notifyStatus(newStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((cb) => {
      try { cb(newStatus); } catch (e) { console.error('Socket status listener error:', e); }
    });
  }

  subscribeStatus(callback) {
    if (typeof callback === 'function') {
      this.statusListeners.add(callback);
      callback(this.status);
      return () => this.statusListeners.delete(callback);
    }
    return () => {};
  }

  getStatus() {
    return this.status;
  }

  connect(userId = null) {
    if (userId) {
      this.currentUserId = userId;
    }

    if (!this.socket) {
      this.notifyStatus('connecting');
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['polling', 'websocket'],
        reconnectionAttempts: 15,
        reconnectionDelay: 1500,
        timeout: 10000
      });

      this.socket.on('connect', () => {
        console.log('⚡ [Socket.io Client] Connected with ID:', this.socket.id);
        this.notifyStatus('connected');
        if (this.currentUserId) {
          this.socket.emit('join_user', this.currentUserId);
          console.log(`[Socket.io Client] Auto-joined user room: user_${this.currentUserId}`);
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 [Socket.io Client] Disconnected:', reason);
        this.notifyStatus('disconnected');
      });

      this.socket.on('connect_error', (err) => {
        console.warn('⚠️ [Socket.io Client] Connection error:', err.message);
        this.notifyStatus('error');
      });

      this.socket.io.on('reconnect_attempt', () => {
        this.notifyStatus('reconnecting');
      });

      this.socket.io.on('reconnect', () => {
        this.notifyStatus('connected');
        if (this.currentUserId) {
          this.socket.emit('join_user', this.currentUserId);
        }
      });

      this.socket.io.on('reconnect_failed', () => {
        this.notifyStatus('disconnected');
      });
    } else if (this.socket.connected && this.currentUserId) {
      this.socket.emit('join_user', this.currentUserId);
    } else if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  }

  joinUser(userId) {
    if (userId) {
      this.currentUserId = userId;
      if (this.socket && this.socket.connected) {
        this.socket.emit('join_user', userId);
      }
    }
  }

  leaveUser(userId) {
    if (this.socket && userId) {
      this.socket.emit('leave_user', userId);
    }
    if (this.currentUserId === userId) {
      this.currentUserId = null;
    }
  }

  getSocket() {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  emitTyping(conversationId, userName, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { conversationId, userName, isTyping });
    }
  }

  emitMarkRead(conversationId, userId) {
    if (this.socket) {
      this.socket.emit('mark_read', { conversationId, userId });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

const socketService = new SocketService();
export default socketService;
