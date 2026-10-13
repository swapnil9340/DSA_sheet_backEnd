import StudyPlan from '../models/StudyPlan.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { serializeStudyPlan } from '../utils/serializers.js';

function validateOptionalDate(value, field) {
  if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new AppError(400, `${field} must use YYYY-MM-DD.`, 'VALIDATION_ERROR');
}

export const listStudyPlans = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  validateOptionalDate(from, 'from');
  validateOptionalDate(to, 'to');
  if (from && to && from > to) throw new AppError(400, '`from` must be on or before `to`.', 'VALIDATION_ERROR');
  const filter = { userId: req.user._id };
  if (from || to) {
    filter.scheduledDate = {};
    if (from) filter.scheduledDate.$gte = from;
    if (to) filter.scheduledDate.$lte = to;
  }
  const plans = await StudyPlan.find(filter).sort({ scheduledDate: 1, time: 1 }).limit(250).lean();
  res.json({ success: true, data: { items: plans.map(serializeStudyPlan), total: plans.length } });
});

export const createStudyPlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.create({
    userId: req.user._id,
    title: req.body.title,
    topic: req.body.topic,
    scheduledDate: req.body.date,
    time: req.body.time,
    durationMinutes: req.body.duration,
    notes: req.body.notes || '',
  });
  res.status(201).json({ success: true, data: { plan: serializeStudyPlan(plan) } });
});

export const updateStudyPlan = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (Object.hasOwn(update, 'date')) { update.scheduledDate = update.date; delete update.date; }
  if (Object.hasOwn(update, 'duration')) { update.durationMinutes = update.duration; delete update.duration; }
  const plan = await StudyPlan.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $set: update }, { new: true, runValidators: true });
  if (!plan) throw new AppError(404, 'Study session not found.', 'STUDY_PLAN_NOT_FOUND');
  res.json({ success: true, data: { plan: serializeStudyPlan(plan) } });
});

export const deleteStudyPlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!plan) throw new AppError(404, 'Study session not found.', 'STUDY_PLAN_NOT_FOUND');
  res.json({ success: true, data: { id: String(plan._id), deleted: true } });
});
