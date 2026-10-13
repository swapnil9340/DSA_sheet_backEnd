import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { serializeUser } from '../utils/serializers.js';

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: serializeUser(req.user) } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findOneAndUpdate({ _id: req.user._id, isActive: true }, { $set: { name: req.body.name } }, { new: true, runValidators: true });
  if (!user) throw new AppError(404, 'User account not found.', 'USER_NOT_FOUND');
  res.json({ success: true, data: { user: serializeUser(user) } });
});
