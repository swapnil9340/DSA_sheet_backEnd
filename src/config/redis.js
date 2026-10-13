import { createClient } from 'redis';
import { env } from './env.js';

let client = null;

export async function connectRedis() {
  if (!env.redisUrl) {
    console.log('Redis disabled: REDIS_URL is not configured; cache will be bypassed.');
    return null;
  }
  let errorReported = false;
  client = createClient({
    url: env.redisUrl,
    socket: {
      // Redis is an optional cache. Don't let an unavailable Redis instance
      // trigger an endless reconnect loop or flood the development console.
      reconnectStrategy: (retries) => retries >= 3 ? false : Math.min((retries + 1) * 250, 1000),
    },
  });
  client.on('error', (error) => {
    if (errorReported) return;
    errorReported = true;
    console.error('Redis error; retrying briefly, then continuing without cache:', error.message);
  });
  try {
    await client.connect();
    console.log('Redis connected.');
  } catch (error) {
    console.error('Redis unavailable; API will continue without cache:', error.message);
    try { if (client.isOpen) await client.disconnect(); } catch (error) { console.error('Redis disconnect failed:', error.message); }
    client = null;
  }
  return client;
}

export function getRedisClient() {
  return client?.isReady ? client : null;
}

export async function closeRedis() {
  if (client?.isOpen) await client.quit();
  client = null;
}

export async function cacheJson(key, ttlSeconds, factory) {
  const redis = getRedisClient();
  if (!redis) return factory();
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    console.error('Redis read failed; bypassing cache:', error.message);
    return factory();
  }
  const value = await factory();
  try { await redis.set(key, JSON.stringify(value), { EX: ttlSeconds }); }
  catch (error) { console.error('Redis write failed; bypassing cache:', error.message); }
  return value;
}
