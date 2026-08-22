import { Router } from 'express';
import { profileController } from '../controllers/profileController.js';
import { authGuard } from '../middleware/authGuard.js';
import { roleGuard } from '../middleware/roleGuard.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = Router();

// All routes require auth
router.use(authGuard);

// Employee routes
router.get('/me', profileController.getProfile);
router.put('/me', profileController.updateProfile);
router.post('/me/picture', uploadMiddleware.profilePicture, profileController.uploadProfilePicture);
router.post('/me/documents', uploadMiddleware.document, profileController.uploadDocument);
router.delete('/documents/:id', profileController.deleteDocument);

// Admin routes
router.get('/all', roleGuard('ADMIN'), profileController.getAllProfiles);
router.get('/:userId', profileController.getProfile);
router.put('/:userId', roleGuard('ADMIN'), profileController.updateProfile);
router.delete('/:userId', roleGuard('ADMIN'), profileController.deleteProfile);
router.post('/:userId/picture', roleGuard('ADMIN'), uploadMiddleware.profilePicture, profileController.uploadProfilePicture);
router.post('/:userId/documents', roleGuard('ADMIN'), uploadMiddleware.document, profileController.uploadDocument);

export { router as profileRoutes };
