import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authGuard } from '../middleware/authGuard.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = Router();
router.use(authGuard);

router.get('/employee', dashboardController.getEmployeeDashboard);
router.get('/admin', roleGuard('ADMIN'), dashboardController.getAdminDashboard);
router.get('/employees', roleGuard('ADMIN'), dashboardController.getEmployeeList);

export { router as dashboardRoutes };
