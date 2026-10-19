import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`==================================================`);
    console.log(`🏰 ROYAL VISTA HMS BACKEND SERVER STARTED`);
    console.log(`📡 Port: ${env.PORT}`);
    console.log(`🌐 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 Health Check: http://localhost:${env.PORT}/api/health`);
    console.log(`💻 Allowed Frontend Origin: ${env.FRONTEND_URL}`);
    console.log(`==================================================`);
  });

  // Graceful shutdown handling
  const shutdown = async () => {
    console.log('[Server] Gracefully shutting down server...');
    const { closeDB } = await import('./config/db.js');
    await closeDB();
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch((err) => {
  console.error('[Fatal Error] Failed to start server:', err);
  process.exit(1);
});
