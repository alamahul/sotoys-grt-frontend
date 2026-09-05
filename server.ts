import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // === MOCK DATABASE & CRON JOB ===
  let mockOrders: any[] = [
    { id: 'o1', status: 'PENDING_PAYMENT', createdAt: new Date(Date.now() - 3600000 * 25) } // 25 hours ago
  ];

  // 1. Cron Job (SetInterval) - Cancel orders pending > 24h
  setInterval(() => {
    const now = Date.now();
    let cancelledCount = 0;
    mockOrders = mockOrders.map(order => {
      if (order.status === 'PENDING_PAYMENT') {
        const orderTime = new Date(order.createdAt).getTime();
        // If more than 24 hours (86400000 ms)
        if (now - orderTime > 86400000) {
          cancelledCount++;
          return { ...order, status: 'CANCELLED', updatedAt: new Date() };
        }
      }
      return order;
    });
    if (cancelledCount > 0) {
      console.log(`[Scheduler] Cancelled ${cancelledCount} unpaid orders.`);
    }
  }, 60000); // Check every minute


  // === PROXY API REQUESTS TO BACKEND (Port 5000) ===
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
  app.use('/api', async (req, res) => {
    try {
      const targetUrl = `${BACKEND_URL}${req.originalUrl}`;
      const headers = { ...req.headers };
      delete headers.host;

      const fetchOptions: RequestInit = {
        method: req.method,
        headers: headers as Record<string, string>,
      };

      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
        fetchOptions.body = JSON.stringify(req.body);
      }

      const backendRes = await fetch(targetUrl, fetchOptions);
      res.status(backendRes.status);
      backendRes.headers.forEach((value, name) => {
        if (name.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(name, value);
        }
      });
      const data = await backendRes.arrayBuffer();
      res.send(Buffer.from(data));
    } catch (err: any) {
      res.status(502).json({ message: 'Backend service unavailable on ' + BACKEND_URL, error: err.message });
    }
  });

  // Serve static assets (uploads, images, etc.) from project and backend
  const assetsPath = path.join(process.cwd(), 'assets');
  const backendAssetsPath = path.join(process.cwd(), '..', 'backend', 'public', 'assets');
  app.use('/assets', express.static(assetsPath));
  app.use('/assets', express.static(backendAssetsPath));
  app.use('/assets', async (req, res, next) => {
    try {
      const targetUrl = `${BACKEND_URL}${req.originalUrl}`;
      const backendRes = await fetch(targetUrl);
      if (backendRes.ok) {
        res.status(backendRes.status);
        backendRes.headers.forEach((value, name) => {
          if (name.toLowerCase() !== 'transfer-encoding') {
            res.setHeader(name, value);
          }
        });
        const data = await backendRes.arrayBuffer();
        return res.send(Buffer.from(data));
      }
    } catch (e) {}
    next();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
