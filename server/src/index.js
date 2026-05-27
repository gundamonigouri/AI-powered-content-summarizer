import app from './app.js';
import { config } from './config/index.js';

const startServer = async (port, attemptsLeft = 5) => {
  try {
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port} (${config.nodeEnv})`);
      console.log(`Health check: http://localhost:${port}/api/health`);
    });

    server.on('error', (err) => {
      console.error('Server error event:', err);
    });

    process.on('SIGTERM', () => {
      server.close(() => process.exit(0));
    });

    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
    });

    return server;
  } catch (err) {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use.`);
      if (config.nodeEnv !== 'production' && attemptsLeft > 0) {
        const nextPort = port + 1;
        console.log(`Attempting to start on port ${nextPort} instead (${attemptsLeft - 1} attempts left)...`);
        return startServer(nextPort, attemptsLeft - 1);
      }
      console.error('Exiting due to port conflict. Free the port or set PORT env var to a different value.');
      process.exit(1);
    }
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer(config.port);
