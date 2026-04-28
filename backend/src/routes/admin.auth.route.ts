import { Router } from 'express';
import { AdminAuthController } from '../controllers/admin.auth.controller.js';

const router = Router();

// In production, add admin authentication middleware here
router.get('/settings', AdminAuthController.getSettings);
router.post('/settings', AdminAuthController.updateSettings);
router.post('/test', AdminAuthController.testConnection);

export default router;
