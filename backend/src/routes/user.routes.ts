import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getProfile,
  updateProfile,
  changePassword,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
} from '../controllers/user.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Password
router.post('/change-password', changePassword);

// Payment Methods
router.get('/payment-methods', getPaymentMethods);
router.post('/payment-methods', addPaymentMethod);
router.delete('/payment-methods/:id', deletePaymentMethod);

export default router;
