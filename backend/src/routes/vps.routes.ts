import { Router } from 'express';
import { deployVPS, getMyVPS, vpsAction, getVPSDetails } from '../controllers/vps.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/deploy', authenticate, deployVPS);
router.get('/my-vps', authenticate, getMyVPS);
router.get('/:id', authenticate, getVPSDetails);
router.post('/:id/action', authenticate, vpsAction);

export default router;
