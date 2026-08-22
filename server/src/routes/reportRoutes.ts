import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';
import { authGuard } from '../middleware/authGuard.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = Router();
router.use(authGuard);
router.use(roleGuard('ADMIN'));

router.get('/attendance', reportController.getAttendanceReport);
router.get('/leave', reportController.getLeaveReport);
router.get('/attendance/export', reportController.exportAttendanceCSV);

export { router as reportRoutes };
