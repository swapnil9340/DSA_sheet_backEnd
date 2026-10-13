import { z } from 'zod';

const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters.').max(72, 'Password must be 72 characters or fewer.'),
}).strict();
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(72) }).strict();
export const profileSchema = z.object({ name: z.string().trim().min(2).max(80) }).strict();
export const progressSchema = z.object({ completed: z.boolean() }).strict();
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD for date.').refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, 'Please provide a real calendar date.');
const timeSchema = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour HH:mm time.');
export const studyPlanCreateSchema = z.object({
  title: z.string().trim().min(2).max(120),
  topic: z.string().trim().min(1).max(120),
  date: isoDateSchema,
  time: timeSchema,
  duration: z.coerce.number().int().refine((value) => [25, 45, 60, 90, 120].includes(value), 'Duration must be 25, 45, 60, 90, or 120 minutes.'),
  notes: z.string().trim().max(2000).optional().default(''),
}).strict();
export const studyPlanPatchSchema = studyPlanCreateSchema.partial().extend({ status: z.enum(['planned', 'completed', 'cancelled']).optional() }).strict().refine((value) => Object.keys(value).length > 0, 'At least one field is required.');
export const listQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  q: z.string().trim().max(100).optional(),
  chapter: z.string().trim().max(120).optional(),
  topic: z.string().trim().max(120).optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  page: z.coerce.number().int().min(1).max(100000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  status: z.enum(['completed', 'incomplete']).optional(),
}).passthrough();
