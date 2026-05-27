import app from './app.js';
import { config } from './config/index.js';

const startServer = (port, attemptsLeft = 5) => {
  const server = app.listen(port, () => {
    console.log(`✓ Server running on port ${port} (${config.nodeEnv})`);
    console.log(`  Health: http://localhost:${port}/api/health`);
    console.log(`  Diagnostics: http://localhost:${port}/api/_diag`);
  });

  // Handle port conflict errors asynchronously
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`✗ Port ${port} is already in use.`);
      if (config.nodeEnv !== 'production' && attemptsLeft > 0) {
        const nextPort = port + 1;
        console.log(`  Retrying on port ${nextPort} (${attemptsLeft - 1} attempts left)...`);
        startServer(nextPort, attemptsLeft - 1);
      } else {
        console.error('  → Free the port (taskkill /PID <pid> /F on Windows) or set PORT env var to a different value.');
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
  });
};

startServer(config.port);
