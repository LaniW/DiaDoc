import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import linkRoutes from './routes/link.js';
import docsRoutes from './routes/docs.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/link', linkRoutes);
app.use('/api/docs', docsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DiaDoc API is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 DiaDoc API running on http://localhost:${PORT}`);
  console.log(`📊 Gemini API: ${process.env.GEMINI_API_KEY ? 'Connected' : 'NOT CONFIGURED'}`);
});
