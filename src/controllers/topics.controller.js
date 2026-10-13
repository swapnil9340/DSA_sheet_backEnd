import Topic from '../models/Topic.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { serializeTopic } from '../utils/serializers.js';
import { cacheJson } from '../config/redis.js';
import { env } from '../config/env.js';

export const listTopics = asyncHandler(async (_req, res) => {
  const topics = await cacheJson('catalog:topics:v1', env.redisTtlSeconds, async () => {
    const rows = await Topic.find({ isActive: true }).sort({ order: 1 }).lean();
    return rows.map(serializeTopic);
  });
  res.json({ success: true, data: { items: topics, total: topics.length } });
});
