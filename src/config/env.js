import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number.parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  authCookieName: process.env.AUTH_COOKIE_NAME || 'dsa_access_token',
  cookieSameSite: (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase(),
  trustProxy: process.env.TRUST_PROXY === 'true',
  redisUrl: process.env.REDIS_URL || '',
  redisTtlSeconds: Number.parseInt(process.env.REDIS_TTL_SECONDS || '300', 10),
  logLevel: process.env.LOG_LEVEL || 'dev',
};

export function validateRuntimeEnv() {
  const missing = [];
  if (!env.mongoUri) missing.push('MONGO_URI');
  if (!env.jwtSecret || env.jwtSecret.length < 32) missing.push('JWT_SECRET (at least 32 characters)');
  if (!['lax', 'strict', 'none'].includes(env.cookieSameSite)) missing.push('COOKIE_SAME_SITE (lax, strict, or none)');
  if (missing.length) {
    throw new Error(`Missing/invalid environment configuration: ${missing.join(', ')}. Copy .env.example to .env and configure it.`);
  }
  if (env.nodeEnv === 'production' && env.jwtSecret.toLowerCase().includes('replace_this')) {
    throw new Error('Replace the example JWT_SECRET before running in production.');
  }
}
