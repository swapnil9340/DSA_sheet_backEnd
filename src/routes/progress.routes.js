import { Router } from 'express';
import { getMyProgress, setProblemProgress } from '../controllers/progress.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { progressSchema } from '../validators/schemas.js';

const router = Router();
router.use(authenticate);
router.get('/', getMyProgress);
router.put('/:problemSlug', validate(progressSchema), setProblemProgress);
export default router;
