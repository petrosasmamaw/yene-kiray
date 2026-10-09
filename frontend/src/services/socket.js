import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.currentUserId = null;
  }

  connect(userId = null) {
    if (userId) {
      this.currentUserId = userId;
    }

    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('⚡ [Socket.io Client] Connected with ID:', this.socket.id);
        if (this.currentUserId) {
          this.socket.emit('join_user', this.currentUserId);
          console.log(`[Socket.io Client] Auto-joined user room: user_${this.currentUserId}`);
        }
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 [Socket.io Client] Disconnected');
      });
    } else if (this.socket.connected && this.currentUserId) {
      this.socket.emit('join_user', this.currentUserId);
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
