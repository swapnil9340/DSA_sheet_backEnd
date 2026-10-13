import { Router } from 'express';
import { createStudyPlan, deleteStudyPlan, listStudyPlans, updateStudyPlan } from '../controllers/calendar.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { studyPlanCreateSchema, studyPlanPatchSchema } from '../validators/schemas.js';

const router = Router();
router.use(authenticate);
router.get('/', listStudyPlans);
router.post('/', validate(studyPlanCreateSchema), createStudyPlan);
router.patch('/:id', validate(studyPlanPatchSchema), updateStudyPlan);
router.delete('/:id', deleteStudyPlan);
export default router;
