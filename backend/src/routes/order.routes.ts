import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { createOrder, getOrders } from '../controllers/order.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createOrder);
router.get('/', getOrders);

export default router;
