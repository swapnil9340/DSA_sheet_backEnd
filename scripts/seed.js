import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import Topic from '../src/models/Topic.js';
import Problem from '../src/models/Problem.js';
import topicSeed from '../src/data/topicSeed.json' with { type: 'json' };
import problemSeed from '../src/data/problemSeed.json' with { type: 'json' };

async function seed() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required. Copy .env.example to .env and configure MongoDB.');
  await connectDatabase(process.env.MONGO_URI);

  const topicsByName = new Map();
  for (const topic of topicSeed) {
    const saved = await Topic.findOneAndUpdate(
      { slug: topic.slug },
      { $set: { name: topic.name, description: topic.description, order: topic.order, isActive: true }, $setOnInsert: { slug: topic.slug, parentTopicId: null } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
    topicsByName.set(topic.name, saved);
  }

  let upserted = 0;
  for (const item of problemSeed) {
    const topic = topicsByName.get(item.chapter);
    if (!topic) throw new Error(`No topic was found for problem ${item.id}: ${item.chapter}`);
    await Problem.updateOne(
      { slug: item.id },
      { $set: {
        number: item.number,
        title: item.title,
        topicId: topic._id,
        difficulty: item.difficulty,
        pattern: item.pattern,
        summary: item.summary,
        estimatedMinutes: 30,
        resources: { practiceUrl: item.practiceUrl, youtubeUrl: item.youtubeUrl, articleUrl: item.articleUrl },
        isActive: true,
        sourceTag: 'curated-v1',
      }, $setOnInsert: { slug: item.id } },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    upserted += 1;
  }

  const [topicCount, problemCount, difficultyCounts] = await Promise.all([
    Topic.countDocuments({ isActive: true }),
    Problem.countDocuments({ isActive: true }),
    Problem.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$difficulty', count: { $sum: 1 } } }]),
  ]);
  console.log(`Seed complete: ${topicCount} chapters, ${problemCount} problems (${upserted} upserts).`);
  console.log('Difficulty distribution:', Object.fromEntries(difficultyCounts.map((item) => [item._id, item.count])));
  console.log('Resource note: practice links are problem-specific; YouTube and article URLs are currently starter search links and should be QA-verified before production.');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
}).finally(async () => {
  if (mongoose.connection.readyState) await disconnectDatabase();
});
