import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authGuard } from '../middleware/authGuard.js';
import { signUpSchema, signInSchema } from '../validators/authValidator.js';

const router = Router();

// Public routes
router.post('/signup', validate(signUpSchema), authController.signup);
router.post('/signin', validate(signInSchema), authController.signin);
router.post('/refresh', authController.refresh);
router.get('/verify-email/:token', authController.verifyEmail);

// Protected routes
router.post('/logout', authGuard, authController.logout);
router.get('/me', authGuard, authController.getMe);

export { router as authRoutes };
