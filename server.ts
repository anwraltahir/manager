import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- API Routes ---
  
  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'Anwar Projects & Quotations Management API',
    });
  });

  // System status and environment info
  app.get('/api/system-info', (_req, res) => {
    res.json({
      name: 'نظام إدارة أنور للمشاريع وعروض الأسعار والتسليم',
      version: '1.0.0',
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      features: [
        'Interactive Quotations Engine (Word DOCX Export)',
        'Scope of Work & Milestones Tracking',
        'Secure Handover Document Builder',
        'Credentials & Passwords Vault',
        'Client CRM & Dynamic Custom Fields',
        'JSON Backup & State Synchronization',
        'Bilingual Arabic / English Support',
      ],
    });
  });

  // Optional Server-side data sync / backup storage endpoint
  let memoryBackup: Record<string, any> | null = null;

  app.get('/api/backup', (_req, res) => {
    if (!memoryBackup) {
      return res.status(404).json({ message: 'No server backup found' });
    }
    return res.json(memoryBackup);
  });

  app.post('/api/backup', (req, res) => {
    try {
      const payload = req.body;
      memoryBackup = {
        ...payload,
        serverSavedAt: new Date().toISOString(),
      };
      return res.json({ success: true, message: 'Backup saved successfully on server' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to save backup', details: err.message });
    }
  });

  // --- Frontend / Vite Middleware Setup ---
  if (process.env.NODE_ENV !== 'production') {
    // Development mode with Vite dev server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve static production assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Itqan Server] Running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('[Itqan Server] Startup error:', err);
  process.exit(1);
});
