import { Router } from 'express';
import { attendanceController } from '../controllers/attendanceController.js';
import { authGuard } from '../middleware/authGuard.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = Router();
router.use(authGuard);

// Employee routes
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/today', attendanceController.getTodayStatus);
router.get('/me', attendanceController.getMyAttendance);

// Admin routes
router.get('/all', roleGuard('ADMIN'), attendanceController.getAllAttendance);

export { router as attendanceRoutes };
