import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';
import { MCPChatbot } from './mcp-chatbot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/chatbot-bridge.log' })
  ]
});

const app = express();
const server = createServer(app);

// Configure CORS for your EspoCRM domain
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      "http://100.117.215.126",
      "http://localhost",
      "http://localhost:3000",
      "http://localhost:8080"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.socket.io"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

app.use(cors({
  origin: [
    "http://100.117.215.126",
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8080"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize MCP Chatbot
const chatbot = new MCPChatbot({
  mcpServerPath: path.join(__dirname, '../../build/index.js'),
  openaiApiKey: process.env.OPENAI_API_KEY,
  logger: logger
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Chat widget endpoint - serves the embeddable chat widget
app.get('/widget', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/chat-widget.html'));
});

// API endpoint for getting chat widget script
app.get('/api/widget.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '../public/widget.js'));
});

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info('New chat connection', { socketId: socket.id });

  socket.on('chat_message', async (data) => {
    try {
      logger.info('Received chat message', { 
        socketId: socket.id, 
        message: data.message?.substring(0, 100) 
      });

      // Emit typing indicator
      socket.emit('bot_typing', { typing: true });

      // Process message through MCP chatbot
      const response = await chatbot.processMessage(data.message, {
        userId: data.userId || socket.id,
        sessionId: data.sessionId || socket.id
      });

      // Stop typing indicator
      socket.emit('bot_typing', { typing: false });

      // Send response back to client
      socket.emit('bot_response', {
        message: response.message,
        timestamp: new Date().toISOString(),
        type: response.type || 'text',
        data: response.data || null
      });

      logger.info('Sent bot response', { 
        socketId: socket.id, 
        responseLength: response.message?.length 
      });

    } catch (error) {
      logger.error('Error processing chat message', {
        socketId: socket.id,
        error: error.message,
        stack: error.stack
      });

      socket.emit('bot_typing', { typing: false });
      socket.emit('bot_response', {
        message: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        type: 'error'
      });
    }
  });

  socket.on('disconnect', () => {
    logger.info('Chat connection disconnected', { socketId: socket.id });
  });
});

const PORT = process.env.CHATBOT_PORT || 3001;

server.listen(PORT, () => {
  logger.info(`EspoCRM Chatbot Bridge Server running on port ${PORT}`);
  logger.info('Ready to serve chat widget and process MCP requests');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});