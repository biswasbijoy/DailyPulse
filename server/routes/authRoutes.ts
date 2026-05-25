import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register, login, logout, me,
  updateProfile, changePassword, updateSettings,
} from '../controllers/authController';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema, updateSettingsSchema } from '../utils/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.put('/password', authenticate, validate(changePasswordSchema), changePassword);
router.put('/settings', authenticate, validate(updateSettingsSchema), updateSettings);

export default router;
