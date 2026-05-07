import { Router } from 'express';
import { AdminSettingsController } from '../controllers/admin.settings.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require admin authentication
router.use(authenticate, authorize(['admin']));

router.get('/payment', AdminSettingsController.getPaymentSettings);
router.post('/payment', AdminSettingsController.updatePaymentSettings);

export default router;
