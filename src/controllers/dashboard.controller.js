import Problem from '../models/Problem.js';
import Topic from '../models/Topic.js';
import UserProgress from '../models/UserProgress.js';
import StudyPlan from '../models/StudyPlan.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { serializeStudyPlan } from '../utils/serializers.js';
import { dateInTimeZone } from '../utils/dates.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const today = dateInTimeZone(process.env.APP_TIMEZONE || 'Asia/Kolkata');
  const [totalProblems, completedRows, topics, problemRows, upcomingPlans, difficultyRows] = await Promise.all([
    Problem.countDocuments({ isActive: true }),
    UserProgress.find({ userId: req.user._id, status: 'completed' }).select('problemId completedAt').populate('problemId', 'slug topicId').lean(),
    Topic.find({ isActive: true }).sort({ order: 1 }).lean(),
    Problem.find({ isActive: true }).select('_id topicId difficulty').lean(),
    StudyPlan.find({ userId: req.user._id, scheduledDate: { $gte: today }, status: 'planned' }).sort({ scheduledDate: 1, time: 1 }).limit(5).lean(),
    Problem.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$difficulty', count: { $sum: 1 } } }]),
  ]);
  const validCompleted = completedRows.filter((row) => row.problemId);
  const completedIds = new Set(validCompleted.map((row) => String(row.problemId._id || row.problemId)));
  const completedByTopic = new Map();
  for (const row of validCompleted) {
    const topicId = String(row.problemId.topicId);
    completedByTopic.set(topicId, (completedByTopic.get(topicId) || 0) + 1);
  }
  const totalByTopic = new Map();
  for (const problem of problemRows) {
    const topicId = String(problem.topicId);
    totalByTopic.set(topicId, (totalByTopic.get(topicId) || 0) + 1);
  }
  const chapterStats = topics.map((topic) => {
    const total = totalByTopic.get(String(topic._id)) || 0;
    const done = completedByTopic.get(String(topic._id)) || 0;
    return { chapter: topic.name, topicSlug: topic.slug, total, done, percent: total ? Math.round((done / total) * 100) : 0 };
  });
  const completed = validCompleted.length;
  const difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };
  for (const item of difficultyRows) difficultyCounts[item._id] = item.count;

  res.json({ success: true, data: { stats: {
    total: totalProblems,
    completed,
    remaining: Math.max(0, totalProblems - completed),
    percentage: totalProblems ? Math.round((completed / totalProblems) * 100) : 0,
    plannedSessions: await StudyPlan.countDocuments({ userId: req.user._id, status: 'planned' }),
  }, chapterStats, difficultyCounts, upcoming: upcomingPlans.map(serializeStudyPlan), today } });
});
