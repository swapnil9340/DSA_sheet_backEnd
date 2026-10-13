import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: '', maxlength: 500 },
  order: { type: Number, required: true, min: 1 },
  parentTopicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', default: null },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true, versionKey: false });

topicSchema.index({ order: 1, name: 1 });
export default mongoose.model('Topic', topicSchema);
