import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  topic: { type: String, required: true, trim: true, maxlength: 120 },
  scheduledDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  time: { type: String, required: true, match: /^(?:[01]\d|2[0-3]):[0-5]\d$/ },
  durationMinutes: { type: Number, required: true, enum: [25, 45, 60, 90, 120] },
  notes: { type: String, default: '', maxlength: 2000 },
  status: { type: String, enum: ['planned', 'completed', 'cancelled'], default: 'planned' },
}, { timestamps: true, versionKey: false });

studyPlanSchema.index({ userId: 1, scheduledDate: 1, time: 1 });
export default mongoose.model('StudyPlan', studyPlanSchema);
