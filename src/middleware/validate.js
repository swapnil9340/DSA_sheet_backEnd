import AppError from '../utils/AppError.js';

export const validate = (schema, target = 'body') => (req, _res, next) => {
  const parsed = schema.safeParse(req[target]);
  if (!parsed.success) {
    return next(new AppError(400, 'Please correct the highlighted input.', 'VALIDATION_ERROR', parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))));
  }
  if (target === 'query') req.validatedQuery = parsed.data;
  else req[target] = parsed.data;
  next();
};
