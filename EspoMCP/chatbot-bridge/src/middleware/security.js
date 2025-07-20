import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting middleware
export const chatRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 30, // 30 requests per minute per IP
  message: {
    error: 'Too many chat requests from this IP, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

// WebSocket rate limiting (in-memory store)
class WebSocketRateLimit {
  constructor() {
    this.connections = new Map();
    this.windowMs = 60000; // 1 minute
    this.maxMessages = 20; // 20 messages per minute per connection
  }

  checkLimit(socketId) {
    const now = Date.now();
    const connection = this.connections.get(socketId) || { count: 0, resetTime: now + this.windowMs };
    
    if (now > connection.resetTime) {
      connection.count = 0;
      connection.resetTime = now + this.windowMs;
    }
    
    connection.count++;
    this.connections.set(socketId, connection);
    
    return connection.count <= this.maxMessages;
  }

  removeConnection(socketId) {
    this.connections.delete(socketId);
  }

  // Clean up old connections periodically
  cleanup() {
    const now = Date.now();
    for (const [socketId, connection] of this.connections.entries()) {
      if (now > connection.resetTime + this.windowMs) {
        this.connections.delete(socketId);
      }
    }
  }
}

export const wsRateLimit = new WebSocketRateLimit();

// Clean up old connections every 5 minutes
setInterval(() => {
  wsRateLimit.cleanup();
}, 300000);

// Content Security Policy for chat widget
export const cspPolicy = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'", 
      "'unsafe-inline'", // Needed for inline scripts
      "cdn.socket.io",
      "cdnjs.cloudflare.com"
    ],
    styleSrc: [
      "'self'", 
      "'unsafe-inline'", // Needed for dynamic styles
      "fonts.googleapis.com"
    ],
    fontSrc: [
      "'self'",
      "fonts.gstatic.com"
    ],
    connectSrc: [
      "'self'",
      "ws:",
      "wss:",
      process.env.ESPOCRM_URL || "http://localhost"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https:"
    ]
  }
});

// Input sanitization
export function sanitizeMessage(message) {
  if (typeof message !== 'string') {
    throw new Error('Message must be a string');
  }
  
  // Limit message length
  if (message.length > 2000) {
    throw new Error('Message too long (max 2000 characters)');
  }
  
  // Basic XSS prevention - remove potentially dangerous HTML
  const sanitized = message
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  return sanitized.trim();
}

// Validate user context
export function validateUserContext(context) {
  if (!context || typeof context !== 'object') {
    return null;
  }
  
  const validated = {};
  
  // Validate userId (alphanumeric + underscore + dash)
  if (context.userId && /^[a-zA-Z0-9_-]{1,50}$/.test(context.userId)) {
    validated.userId = context.userId;
  }
  
  // Validate sessionId
  if (context.sessionId && /^[a-zA-Z0-9_-]{1,50}$/.test(context.sessionId)) {
    validated.sessionId = context.sessionId;
  }
  
  // Validate EspoCRM specific context
  if (context.userRole && ['admin', 'regular', 'portal', 'api'].includes(context.userRole)) {
    validated.userRole = context.userRole;
  }
  
  return validated;
}

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
      .split(',')
      .map(origin => origin.trim());
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Session validation (if using sessions)
export function validateSession(req, res, next) {
  // Skip session validation for public endpoints
  if (req.path === '/health' || req.path === '/widget' || req.path.startsWith('/api/widget')) {
    return next();
  }
  
  // Add session validation logic here if needed
  next();
}

// API key validation for sensitive operations
export function validateApiAccess(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // Validate API key format (basic check)
  if (!/^[a-zA-Z0-9]{32,}$/.test(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key format' });
  }
  
  // Here you would validate against your API key store
  // For now, we'll just check if it's the same as the EspoCRM API key
  if (apiKey !== process.env.ESPOCRM_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
}

// Socket authentication
export function authenticateSocket(socket, next) {
  try {
    // Extract user context from handshake
    const userContext = socket.handshake.auth.userContext || {};
    
    // Validate the context
    const validated = validateUserContext(userContext);
    
    // Store validated context in socket
    socket.userContext = validated;
    
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
}

// Message validation for WebSocket
export function validateWebSocketMessage(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid message format');
  }
  
  if (!data.message || typeof data.message !== 'string') {
    throw new Error('Message is required and must be a string');
  }
  
  // Sanitize the message
  data.message = sanitizeMessage(data.message);
  
  // Validate user context if provided
  if (data.userContext) {
    data.userContext = validateUserContext(data.userContext);
  }
  
  return data;
}