import Problem from '../models/Problem.js';
import Topic from '../models/Topic.js';
import UserProgress from '../models/UserProgress.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { serializeProblem } from '../utils/serializers.js';
import { cacheJson } from '../config/redis.js';
import { env } from '../config/env.js';

function makeBaseFilter(query) {
  const filter = { isActive: true };
  if (query.difficulty) filter.difficulty = query.difficulty;
  const phrase = query.search || query.q;
  if (phrase) {
    const expression = new RegExp(escapeRegex(phrase), 'i');
    filter.$or = [{ title: expression }, { pattern: expression }, { summary: expression }];
  }
  return filter;
}

async function resolveTopicFilter(query, filter) {
  const nameOrSlug = query.topic || query.chapter;
  if (!nameOrSlug || nameOrSlug === 'All chapters') return filter;
  const topic = await Topic.findOne({ isActive: true, $or: [{ slug: nameOrSlug.toLowerCase() }, { name: nameOrSlug }] }).select('_id');
  filter.topicId = topic ? topic._id : null;
  return filter;
}

function problemCacheKey(query) {
  const safe = Object.fromEntries(Object.entries(query).filter(([key]) => ['search', 'q', 'chapter', 'topic', 'difficulty', 'page', 'limit'].includes(key)).sort(([a], [b]) => a.localeCompare(b)));
  return `catalog:problems:v1:${JSON.stringify(safe)}`;
}

export const listProblems = asyncHandler(async (req, res) => {
  const query = req.validatedQuery || req.query;
  if (query.status && !req.user) throw new AppError(401, 'Sign in to filter by your completion status.', 'AUTHENTICATION_REQUIRED');
  const base = makeBaseFilter(query);
  await resolveTopicFilter(query, base);
  if (base.topicId === null) return res.json({ success: true, data: { items: [], pagination: { page: Number(query.page || 1), limit: Number(query.limit || 50), total: 0, pages: 0 } } });

  const page = Number(query.page || 1);
  const limit = Number(query.limit || 50);
  const filter = { ...base };
  if (query.status && req.user) {
    const completedRows = await UserProgress.find({ userId: req.user._id, status: 'completed' }).select('problemId').lean();
    const completedIds = completedRows.map((row) => row.problemId);
    filter._id = query.status === 'completed' ? { $in: completedIds } : { $nin: completedIds };
  }

  const load = async () => {
    const [rows, total] = await Promise.all([
      Problem.find(filter).populate('topicId', 'name slug order').sort({ number: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Problem.countDocuments(filter),
    ]);
    return { items: rows.map(serializeProblem), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  };
  const result = query.status ? await load() : await cacheJson(problemCacheKey(query), env.redisTtlSeconds, load);
  res.json({ success: true, data: result });
});

export const getProblem = asyncHandler(async (req, res) => {
  const item = await cacheJson(`catalog:problem:v1:${req.params.slug}`, env.redisTtlSeconds, async () => {
    const problem = await Problem.findOne({ slug: req.params.slug, isActive: true }).populate('topicId', 'name slug order').lean();
    return problem ? serializeProblem(problem) : null;
  });
  if (!item) throw new AppError(404, 'Problem not found.', 'PROBLEM_NOT_FOUND');
  res.json({ success: true, data: { problem: item } });
});
