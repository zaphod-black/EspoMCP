/**
 * EspoCRM Chat Widget - Embeddable Chat Interface
 * Integrates with MCP-powered chatbot for CRM operations
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    serverUrl: window.ESPOCRM_CHAT_SERVER || 'http://localhost:3001',
    position: 'bottom-right',
    zIndex: 9999,
    theme: {
      primaryColor: '#007bff',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      borderRadius: '8px'
    }
  };

  class EspoCRMChatWidget {
    constructor() {
      this.isOpen = false;
      this.socket = null;
      this.messages = [];
      this.container = null;
      this.chatWindow = null;
      this.messageInput = null;
      this.messagesContainer = null;
      
      this.init();
    }

    init() {
      this.createStyles();
      this.createWidget();
      this.connectSocket();
      this.bindEvents();
    }

    createStyles() {
      const styles = `
        .espocrm-chat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: ${CONFIG.zIndex};
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .espocrm-chat-bubble {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, ${CONFIG.theme.primaryColor}, #0056b3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
          position: relative;
        }

        .espocrm-chat-bubble:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }

        .espocrm-chat-bubble svg {
          width: 24px;
          height: 24px;
          fill: white;
        }

        .espocrm-chat-notification {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4757;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        .espocrm-chat-window {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 350px;
          height: 500px;
          background: ${CONFIG.theme.backgroundColor};
          border-radius: ${CONFIG.theme.borderRadius};
          box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          display: none;
          flex-direction: column;
          overflow: hidden;
        }

        .espocrm-chat-window.open {
          display: flex;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .espocrm-chat-header {
          background: ${CONFIG.theme.primaryColor};
          color: white;
          padding: 15px;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .espocrm-chat-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .espocrm-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          background: #f8f9fa;
        }

        .espocrm-chat-message {
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
        }

        .espocrm-chat-message.user {
          align-items: flex-end;
        }

        .espocrm-chat-message.bot {
          align-items: flex-start;
        }

        .espocrm-chat-message-bubble {
          max-width: 80%;
          padding: 10px 12px;
          border-radius: 18px;
          word-wrap: break-word;
          line-height: 1.4;
        }

        .espocrm-chat-message.user .espocrm-chat-message-bubble {
          background: ${CONFIG.theme.primaryColor};
          color: white;
        }

        .espocrm-chat-message.bot .espocrm-chat-message-bubble {
          background: white;
          color: ${CONFIG.theme.textColor};
          border: 1px solid #e1e5e9;
        }

        .espocrm-chat-message-time {
          font-size: 11px;
          color: #6c757d;
          margin-top: 4px;
          margin-bottom: 0;
        }

        .espocrm-chat-typing {
          display: none;
          align-items: center;
          color: #6c757d;
          font-style: italic;
          margin-bottom: 10px;
        }

        .espocrm-chat-typing.show {
          display: flex;
        }

        .espocrm-chat-typing-dots {
          margin-left: 8px;
        }

        .espocrm-chat-typing-dots span {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6c757d;
          margin: 0 1px;
          animation: typing 1.4s infinite ease-in-out both;
        }

        .espocrm-chat-typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .espocrm-chat-typing-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        .espocrm-chat-input-container {
          padding: 15px;
          background: white;
          border-top: 1px solid #e1e5e9;
          display: flex;
          gap: 10px;
        }

        .espocrm-chat-input {
          flex: 1;
          border: 1px solid #e1e5e9;
          border-radius: 20px;
          padding: 10px 15px;
          outline: none;
          font-size: 14px;
          resize: none;
          min-height: 20px;
          max-height: 80px;
        }

        .espocrm-chat-input:focus {
          border-color: ${CONFIG.theme.primaryColor};
        }

        .espocrm-chat-send {
          background: ${CONFIG.theme.primaryColor};
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          transition: background-color 0.3s ease;
        }

        .espocrm-chat-send:hover {
          background: #0056b3;
        }

        .espocrm-chat-send:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .espocrm-chat-send svg {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }

        @media (max-width: 480px) {
          .espocrm-chat-window {
            width: calc(100vw - 40px);
            height: calc(100vh - 120px);
            bottom: 80px;
            right: 20px;
          }
        }
      `;

      const styleSheet = document.createElement('style');
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }

    createWidget() {
      // Create main container
      this.container = document.createElement('div');
      this.container.className = 'espocrm-chat-widget';

      // Create chat bubble
      const bubble = document.createElement('div');
      bubble.className = 'espocrm-chat-bubble';
      bubble.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
        <div class="espocrm-chat-notification" style="display: none;">1</div>
      `;

      // Create chat window
      this.chatWindow = document.createElement('div');
      this.chatWindow.className = 'espocrm-chat-window';
      this.chatWindow.innerHTML = `
        <div class="espocrm-chat-header">
          <span>EspoCRM Assistant</span>
          <button class="espocrm-chat-close">×</button>
        </div>
        <div class="espocrm-chat-messages">
          <div class="espocrm-chat-message bot">
            <div class="espocrm-chat-message-bubble">
              👋 Hello! I'm your EspoCRM assistant. I can help you create contacts, search accounts, manage opportunities, and much more. What can I help you with today?
            </div>
            <div class="espocrm-chat-message-time">${this.formatTime(new Date())}</div>
          </div>
          <div class="espocrm-chat-typing">
            Assistant is typing
            <div class="espocrm-chat-typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
        <div class="espocrm-chat-input-container">
          <textarea class="espocrm-chat-input" placeholder="Type your message..." rows="1"></textarea>
          <button class="espocrm-chat-send">
            <svg viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      `;

      this.container.appendChild(bubble);
      this.container.appendChild(this.chatWindow);
      document.body.appendChild(this.container);

      // Store references
      this.messagesContainer = this.chatWindow.querySelector('.espocrm-chat-messages');
      this.messageInput = this.chatWindow.querySelector('.espocrm-chat-input');
      this.sendButton = this.chatWindow.querySelector('.espocrm-chat-send');
      this.typingIndicator = this.chatWindow.querySelector('.espocrm-chat-typing');
    }

    bindEvents() {
      // Toggle chat window
      this.container.querySelector('.espocrm-chat-bubble').addEventListener('click', () => {
        this.toggleChat();
      });

      // Close chat window
      this.container.querySelector('.espocrm-chat-close').addEventListener('click', () => {
        this.closeChat();
      });

      // Send message on Enter (but allow Shift+Enter for new lines)
      this.messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Send message on button click
      this.sendButton.addEventListener('click', () => {
        this.sendMessage();
      });

      // Auto-resize input
      this.messageInput.addEventListener('input', () => {
        this.autoResizeInput();
      });
    }

    connectSocket() {
      try {
        // Load Socket.IO
        if (!window.io) {
          const script = document.createElement('script');
          script.src = `${CONFIG.serverUrl}/socket.io/socket.io.js`;
          script.onload = () => this.initializeSocket();
          document.head.appendChild(script);
        } else {
          this.initializeSocket();
        }
      } catch (error) {
        console.error('Failed to connect to chat server:', error);
        this.showErrorMessage('Unable to connect to chat server');
      }
    }

    initializeSocket() {
      this.socket = io(CONFIG.serverUrl);

      this.socket.on('connect', () => {
        console.log('Connected to EspoCRM chat server');
      });

      this.socket.on('bot_response', (data) => {
        this.hideTyping();
        this.addMessage('bot', data.message, data.timestamp);
      });

      this.socket.on('bot_typing', (data) => {
        if (data.typing) {
          this.showTyping();
        } else {
          this.hideTyping();
        }
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from chat server');
        this.showErrorMessage('Connection lost. Please refresh the page.');
      });
    }

    toggleChat() {
      if (this.isOpen) {
        this.closeChat();
      } else {
        this.openChat();
      }
    }

    openChat() {
      this.isOpen = true;
      this.chatWindow.classList.add('open');
      this.messageInput.focus();
      this.scrollToBottom();
    }

    closeChat() {
      this.isOpen = false;
      this.chatWindow.classList.remove('open');
    }

    sendMessage() {
      const message = this.messageInput.value.trim();
      if (!message || !this.socket) return;

      // Add user message to chat
      this.addMessage('user', message);
      this.messageInput.value = '';
      this.autoResizeInput();

      // Send to server
      this.socket.emit('chat_message', {
        message: message,
        timestamp: new Date().toISOString(),
        userId: this.getUserId(),
        sessionId: this.getSessionId()
      });
    }

    addMessage(sender, content, timestamp = null) {
      const messageElement = document.createElement('div');
      messageElement.className = `espocrm-chat-message ${sender}`;
      
      const time = timestamp ? new Date(timestamp) : new Date();
      
      messageElement.innerHTML = `
        <div class="espocrm-chat-message-bubble">${this.escapeHtml(content)}</div>
        <div class="espocrm-chat-message-time">${this.formatTime(time)}</div>
      `;

      // Insert before typing indicator
      this.messagesContainer.insertBefore(messageElement, this.typingIndicator);
      this.scrollToBottom();
    }

    showTyping() {
      this.typingIndicator.classList.add('show');
      this.scrollToBottom();
    }

    hideTyping() {
      this.typingIndicator.classList.remove('show');
    }

    showErrorMessage(message) {
      this.addMessage('bot', `⚠️ ${message}`);
    }

    autoResizeInput() {
      this.messageInput.style.height = 'auto';
      this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
    }

    scrollToBottom() {
      setTimeout(() => {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      }, 100);
    }

    formatTime(date) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML.replace(/\n/g, '<br>');
    }

    getUserId() {
      // Try to get EspoCRM user ID if available
      if (window.app && window.app.getUser && window.app.getUser()) {
        return window.app.getUser().id;
      }
      
      // Fallback to session-based ID
      let userId = localStorage.getItem('espocrm-chat-user-id');
      if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('espocrm-chat-user-id', userId);
      }
      return userId;
    }

    getSessionId() {
      let sessionId = sessionStorage.getItem('espocrm-chat-session-id');
      if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('espocrm-chat-session-id', sessionId);
      }
      return sessionId;
    }
  }

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new EspoCRMChatWidget();
    });
  } else {
    new EspoCRMChatWidget();
  }

})();