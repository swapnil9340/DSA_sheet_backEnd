import { Router } from 'express';
import { getProblem, listProblems } from '../controllers/problems.controller.js';
import { optionalAuthenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { listQuerySchema } from '../validators/schemas.js';

const router = Router();
router.get('/', optionalAuthenticate, validate(listQuerySchema, 'query'), listProblems);
router.get('/:slug', getProblem);
export default router;
