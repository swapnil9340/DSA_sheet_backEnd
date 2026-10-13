import Problem from '../models/Problem.js';
import UserProgress from '../models/UserProgress.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMyProgress = asyncHandler(async (req, res) => {
  const records = await UserProgress.find({ userId: req.user._id, status: 'completed' })
    .populate('problemId', 'slug title number difficulty topicId')
    .sort({ completedAt: -1 }).lean();
  const completedProblemIds = records.filter((row) => row.problemId).map((row) => row.problemId.slug);
  res.json({ success: true, data: {
    completedProblemIds,
    items: records.filter((row) => row.problemId).map((row) => ({ problemId: row.problemId.slug, title: row.problemId.title, number: row.problemId.number, status: row.status, completedAt: row.completedAt })),
    totalCompleted: completedProblemIds.length,
  } });
});

export const setProblemProgress = asyncHandler(async (req, res) => {
  const problem = await Problem.findOne({ slug: req.params.problemSlug, isActive: true }).select('_id slug title number');
  if (!problem) throw new AppError(404, 'Problem not found.', 'PROBLEM_NOT_FOUND');
  const isCompleted = req.body.completed;
  const update = {
    status: isCompleted ? 'completed' : 'not_started',
    completedAt: isCompleted ? new Date() : null,
  };
  const progress = await UserProgress.findOneAndUpdate(
    { userId: req.user._id, problemId: problem._id },
    { $set: update, $setOnInsert: { userId: req.user._id, problemId: problem._id } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();
  res.json({ success: true, data: { problemId: problem.slug, completed: progress.status === 'completed', completedAt: progress.completedAt } });
});
