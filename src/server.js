import app from './app.js';
import { env, validateRuntimeEnv } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { closeRedis, connectRedis } from './config/redis.js';

let server;
let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received; shutting down gracefully.`);
  if (server) await new Promise((resolve) => server.close(resolve));
  try { await closeRedis(); } catch (error) { console.error('Redis shutdown failed:', error.message); }
  try { await disconnectDatabase(); } catch (error) { console.error('MongoDB shutdown failed:', error.message); }
  process.exit(0);
}

async function start() {
  validateRuntimeEnv();
  await connectDatabase(env.mongoUri);
  await connectRedis();
  server = app.listen(env.port, () => console.log(`DSA Sheet API listening on port ${env.port} (${env.nodeEnv})`));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
start().catch((error) => {
  console.error('Unable to start DSA Sheet API:', error.message);
  process.exit(1);
});
