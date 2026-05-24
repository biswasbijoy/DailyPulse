import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTemplateSchema, updateTemplateSchema } from '../utils/validation';
import * as templateController from '../controllers/templateController';

const router = Router();

router.use(authenticate);

router.get('/', templateController.list);
router.post('/', validate(createTemplateSchema), templateController.create);
router.post('/:id/apply', templateController.apply);
router.put('/:id', validate(updateTemplateSchema), templateController.update);
router.delete('/:id', templateController.remove);

export default router;
