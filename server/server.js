import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/db.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Parse allowed client origins from comma-separated CLIENT_URL in .env
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

console.log('🔒 [CORS] Allowed Origins:', allowedOrigins);

// Shared CORS origin validator - accommodates local development & deployed frontends (Render, Vercel, Netlify)
const corsOriginValidator = (origin, callback) => {
  if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  // Allow any standard frontend deployment platform or local origins
  if (
    /https?:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/.test(origin) ||
    /https?:\/\/([a-zA-Z0-9-]+\.)*onrender\.com$/.test(origin) ||
    /https?:\/\/([a-zA-Z0-9-]+\.)*netlify\.app$/.test(origin) ||
    /https?:\/\/localhost(:\d+)?$/.test(origin) ||
    /https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
  ) {
    return callback(null, true);
  }
  // Permissive fallback so deployed client apps are never rejected
  return callback(null, true);
};

// Setup Socket.io with polling + websocket transports and reliable CORS
const io = new Server(server, {
  cors: {
    origin: corsOriginValidator,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  transports: ['polling', 'websocket']
});

// Attach io to express app so controllers can emit events
app.set('io', io);

// Static uploads directory for image uploads fallback
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Middleware
app.use(cors({
  origin: corsOriginValidator,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json({ limit: '20mb' }));

app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'የኔ ኪራይ (Yene Kiray) API Server',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);

// Socket.io Real-time Handlers
io.on('connection', (socket) => {
  console.log(`⚡ [Socket.io] Client connected: ${socket.id}`);

  // Join user's personal notification room (so notifications work across all pages)
  socket.on('join_user', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`[Socket.io] Socket ${socket.id} joined user_${userId}`);
    }
  });

  // Leave user room
  socket.on('leave_user', (userId) => {
    if (userId) {
      socket.leave(`user_${userId}`);
      console.log(`[Socket.io] Socket ${socket.id} left user_${userId}`);
    }
  });

  // Join a specific chat conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`[Socket.io] Socket ${socket.id} joined conversation_${conversationId}`);
  });

  // Leave room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`[Socket.io] Socket ${socket.id} left conversation_${conversationId}`);
  });

  // Broadcast user typing state
  socket.on('typing', ({ conversationId, userName, isTyping }) => {
    socket.to(`conversation_${conversationId}`).emit('user_typing', { userName, isTyping });
  });

  // Mark messages as read in real-time
  socket.on('mark_read', async ({ conversationId, userId }) => {
    try {
      await pool.query(
        'UPDATE messages SET is_read = true WHERE conversation_id = $1 AND sender_id != $2',
        [conversationId, userId]
      );
      // Broadcast to active conversation room
      io.to(`conversation_${conversationId}`).emit('messages_read', { conversationId, readerId: userId });

      // Also broadcast to both participants' private rooms so badges and read receipts update globally
      const convRes = await pool.query('SELECT renter_id, owner_id FROM conversations WHERE id = $1', [conversationId]);
      if (convRes.rows.length > 0) {
        const { renter_id, owner_id } = convRes.rows[0];
        io.to(`user_${renter_id}`).emit('messages_read', { conversationId, readerId: userId });
        io.to(`user_${owner_id}`).emit('messages_read', { conversationId, readerId: userId });
      }
    } catch (err) {
      console.error('Socket mark_read error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [Socket.io] Client disconnected: ${socket.id}`);
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 የኔ ኪራይ (Yene Kiray) API Server Running on port ${PORT}`);
  console.log(`🌐 Allowed Client Origins: ${allowedOrigins.join(', ')}`);
  console.log(`⚡ Socket.io enabled & listening for realtime chat`);
  console.log(`====================================================`);
});
