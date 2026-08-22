import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = Router();
router.use(authGuard);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

export { router as notificationRoutes };
