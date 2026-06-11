import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config();

// Import modules
import { initializeDatabase } from './models/init.sqlite.js';
import { initRedis } from './config/redis.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { decryptRequestBody } from './middlewares/encryption.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import menuRoutes from './routes/menu.js';
import chatRoutes from './routes/chat.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initializeDatabase();

// Initialize Redis (optional, fallback to memory)
initRedis();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(decryptRequestBody);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
