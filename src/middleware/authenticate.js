import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function tokenFromRequest(req) {
  const cookieToken = req.cookies?.[env.authCookieName];
  if (cookieToken) return cookieToken;
  const header = req.get('authorization');
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = tokenFromRequest(req);
  if (!token) throw new AppError(401, 'Please sign in to continue.', 'AUTHENTICATION_REQUIRED');
  const payload = jwt.verify(token, env.jwtSecret, { issuer: 'dsa-sheet-api', audience: 'dsa-sheet-client' });
  const user = await User.findOne({ _id: payload.sub, isActive: true }).select('_id name email role isActive');
  if (!user) throw new AppError(401, 'Account was not found or is disabled.', 'AUTHENTICATION_REQUIRED');
  req.user = user;
  next();
});

export const optionalAuthenticate = asyncHandler(async (req, _res, next) => {
  const token = tokenFromRequest(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, env.jwtSecret, { issuer: 'dsa-sheet-api', audience: 'dsa-sheet-client' });
    req.user = await User.findOne({ _id: payload.sub, isActive: true }).select('_id name email role isActive');
  } catch {
    // Public catalog requests may be anonymous; invalid optional tokens do not grant identity.
  }
  next();
});
