import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { serializeUser } from '../utils/serializers.js';
import { env } from '../config/env.js';

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production' || env.cookieSameSite === 'none',
  sameSite: env.cookieSameSite,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

function issueSession(user, res) {
  const token = jwt.sign({ role: user.role }, env.jwtSecret, {
    subject: String(user._id),
    expiresIn: env.jwtExpiresIn,
    issuer: 'dsa-sheet-api',
    audience: 'dsa-sheet-client',
  });
  res.cookie(env.authCookieName, token, cookieOptions());
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.exists({ email });
  if (existing) throw new AppError(409, 'An account with this email already exists.', 'EMAIL_ALREADY_REGISTERED');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  issueSession(user, res);
  res.status(201).json({ success: true, data: { user: serializeUser(user) } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  const validPassword = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !validPassword || !user.isActive) {
    throw new AppError(401, 'Email or password is incorrect.', 'INVALID_CREDENTIALS');
  }
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  issueSession(user, res);
  res.json({ success: true, data: { user: serializeUser(user) } });
});

export const logout = (_req, res) => {
  res.clearCookie(env.authCookieName, {
    httpOnly: true,
    secure: env.nodeEnv === 'production' || env.cookieSameSite === 'none',
    sameSite: env.cookieSameSite,
    path: '/',
  });
  res.json({ success: true, data: { message: 'Signed out successfully.' } });
};

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: serializeUser(req.user) } });
});
