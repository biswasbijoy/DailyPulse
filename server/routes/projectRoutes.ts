import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProjectSchema, updateProjectSchema } from '../utils/validation';
import * as projectController from '../controllers/projectController';

const router = Router();

router.use(authenticate);

router.get('/', projectController.list);
router.post('/', validate(createProjectSchema), projectController.create);
router.put('/:id', validate(updateProjectSchema), projectController.update);
router.delete('/:id', projectController.remove);

export default router;
