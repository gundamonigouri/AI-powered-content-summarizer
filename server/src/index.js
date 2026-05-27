import app from './app.js';
import { config } from './config/index.js';

const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} (${config.nodeEnv})`);
  console.log(`Health check: http://localhost:${config.port}/api/health`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
