import apiService from './api.service';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

class DiscussionService {
  constructor() {
    this.socket = null;
    this.messageHandlers = [];
    this.typingHandlers = [];
    this.statusHandlers = [];
  }

  // Connect to WebSocket
  connect(discussionCode) {
    if (this.socket?.connected) {
      this.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      query: { discussionCode },
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.socket.emit('join_discussion', { discussionCode });
    });

    this.socket.on('joined_discussion', (data) => {
      console.log('Joined discussion:', data);
    });

    this.socket.on('new_message', (message) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('user_typing', (data) => {
      this.typingHandlers.forEach(handler => handler(data));
    });

    this.socket.on('user_stopped_typing', (data) => {
      this.typingHandlers.forEach(handler => handler({ ...data, typing: false }));
    });

    this.socket.on('status_changed', (data) => {
      this.statusHandlers.forEach(handler => handler(data));
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Send message via WebSocket
  sendMessageViaSocket(discussionCode, content, sender) {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('send_message', {
        discussionCode,
        content,
        sender,
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Failed to send message'));
        }
      });
    });
  }

  // Send typing indicator
  sendTyping(discussionCode, sender) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { discussionCode, sender });
    }
  }

  // Stop typing indicator
  stopTyping(discussionCode, sender) {
    if (this.socket?.connected) {
      this.socket.emit('stop_typing', { discussionCode, sender });
    }
  }

  // Register message handler
  onMessage(handler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  // Register typing handler
  onTyping(handler) {
    this.typingHandlers.push(handler);
    return () => {
      this.typingHandlers = this.typingHandlers.filter(h => h !== handler);
    };
  }

  // Register status change handler
  onStatusChange(handler) {
    this.statusHandlers.push(handler);
    return () => {
      this.statusHandlers = this.statusHandlers.filter(h => h !== handler);
    };
  }

  // Get discussion by code (REST)
  async getDiscussion(discussionCode) {
    try {
      const response = await apiService.get(`/discussions/${discussionCode}`);
      
      return {
        success: true,
        discussion: response.discussion,
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Get messages (REST)
  async getMessages(discussionCode, page = 1, limit = 50) {
    try {
      const response = await apiService.get(
        `/discussions/${discussionCode}/messages?page=${page}&limit=${limit}`
      );
      
      return {
        success: true,
        messages: response.messages,
        total: response.total,
        hasMore: response.hasMore,
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Send message (REST - fallback if WebSocket not available)
  async sendMessage(discussionCode, content, sender) {
    try {
      const response = await apiService.post(
        `/discussions/${discussionCode}/messages`,
        { content, sender }
      );
      
      return {
        success: true,
        message: response.message,
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Mark messages as read (for schools)
  async markAsRead(discussionCode) {
    try {
      await apiService.post(
        `/discussions/${discussionCode}/messages/school/read`
      );
      
      return {
        success: true,
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Get unread count (for schools)
  async getUnreadCount(schoolId) {
    try {
      const response = await apiService.get(
        `/discussions/school/${schoolId}/unread`
      );
      
      return {
        success: true,
        unreadCount: response.unreadCount,
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }
}

export default new DiscussionService();
