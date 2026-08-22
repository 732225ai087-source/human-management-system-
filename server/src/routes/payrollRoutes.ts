import { Router } from 'express';
import { payrollController } from '../controllers/payrollController.js';
import { authGuard } from '../middleware/authGuard.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = Router();
router.use(authGuard);

// Employee routes
router.get('/me', payrollController.getMyPayroll);
router.get('/slip/:id', payrollController.downloadSlip);
router.get('/salary-structure', payrollController.getSalaryStructure);

// Admin routes
router.get('/all', roleGuard('ADMIN'), payrollController.getAllPayroll);
router.put('/salary-structure/:userId', roleGuard('ADMIN'), payrollController.updateSalaryStructure);
router.post('/generate', roleGuard('ADMIN'), payrollController.generatePayroll);

export { router as payrollRoutes };
