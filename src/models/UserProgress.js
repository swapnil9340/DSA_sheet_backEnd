import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started', required: true },
  completedAt: { type: Date, default: null },
  attempts: { type: Number, min: 0, default: 0 },
  notes: { type: String, default: '', maxlength: 2000 },
}, { timestamps: true, versionKey: false });

userProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, status: 1, completedAt: -1 });
export default mongoose.model('UserProgress', userProgressSchema);
