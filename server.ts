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


  // === API ENDPOINTS ===
  
  // Auth/OTP
  app.post('/api/auth/register', (req, res) => {
    res.json({ message: 'User registered, OTP sent' });
  });

  // Products
  app.get('/api/products', (req, res) => {
    res.json({ products: [] });
  });

  // Orders
  app.post('/api/orders/checkout', (req, res) => {
    // Process checkout
    res.json({ message: 'Checkout successful', orderId: 'o2' });
  });

  // Admin Stats
  app.get('/api/admin/stats', (req, res) => {
    res.json({ 
      totalSales: 15000000, 
      activeOrders: 12,
      newUsers: 50 
    });
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
