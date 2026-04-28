import { Router } from 'express';
import { deployVPS, getMyVPS, vpsAction } from '../controllers/vps.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/deploy', authenticate, deployVPS);
router.get('/my-vps', authenticate, getMyVPS);
router.post('/:id/action', authenticate, vpsAction);

export default router;
