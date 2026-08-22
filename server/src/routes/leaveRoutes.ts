import { Router } from 'express';
import { leaveController } from '../controllers/leaveController.js';
import { authGuard } from '../middleware/authGuard.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = Router();
router.use(authGuard);

// Employee routes
router.post('/', leaveController.applyLeave);
router.get('/me', leaveController.getMyLeaves);
router.get('/:id', leaveController.getLeaveById);

// Admin routes
router.get('/', roleGuard('ADMIN'), leaveController.getAllLeaves);
router.put('/:id/approve', roleGuard('ADMIN'), leaveController.approveLeave);
router.put('/:id/reject', roleGuard('ADMIN'), leaveController.rejectLeave);

export { router as leaveRoutes };
