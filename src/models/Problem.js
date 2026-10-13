import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  number: { type: Number, required: true, unique: true, min: 1 },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true, index: true },
  pattern: { type: String, required: true, trim: true, maxlength: 100 },
  summary: { type: String, default: '', maxlength: 1200 },
  estimatedMinutes: { type: Number, min: 5, max: 600, default: 30 },
  resources: {
    practiceUrl: { type: String, required: true },
    youtubeUrl: { type: String, required: true },
    articleUrl: { type: String, required: true },
  },
  isActive: { type: Boolean, default: true, index: true },
  sourceTag: { type: String, default: 'curated-v1' },
}, { timestamps: true, versionKey: false });

problemSchema.index({ topicId: 1, difficulty: 1, number: 1 });
problemSchema.index({ title: 1, pattern: 1 });
export default mongoose.model('Problem', problemSchema);
