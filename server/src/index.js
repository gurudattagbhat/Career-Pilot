import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import trackerRoutes from './routes/trackerRoutes.js';
import { jobAggregatorService } from './services/jobAggregatorService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env, root .env, or container environment
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and body parsers
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-groq-api-key']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tracker', trackerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Job Finder AI & Multi-Platform Aggregator',
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve frontend build in production / Render deployment
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`📦 Serving static client build from ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // SPA fallback for all non-API GET routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'CareerPilot Backend API is online.',
      docs: '/api/health',
      note: 'Build client (`npm run build`) to serve the web UI from this server.'
    });
  });
}

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
function startServer() {
  initDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Job Finder Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`📊 Health check available at /api/health`);
    
    // Warm up job aggregator in background
    jobAggregatorService.getAllAggregatedJobs().catch(err => {
      console.warn('Initial background job aggregation note:', err.message);
    });
  });
}

startServer();

