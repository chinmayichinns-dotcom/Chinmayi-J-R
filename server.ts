import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { handleComplaintAnalysis } from './src/server/apiHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CivicPulse AI Municipal Backend',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// AI Complaint Analysis
app.post('/api/analyze-complaint', async (req, res) => {
  try {
    const result = await handleComplaintAnalysis(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// Serve frontend build if dist exists
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`CivicPulse AI Server running on port ${port}`);
});
