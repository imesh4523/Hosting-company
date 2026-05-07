import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import express from 'express';

const router = Router();
const paymentController = new PaymentController();

// Use raw body for webhook verification
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Protected routes
router.use(authenticate);
router.post('/create-intent', paymentController.createPaymentIntent);
router.post('/create-add-funds-intent', paymentController.createAddFundsIntent);
router.get('/saved-cards', paymentController.getSavedCards);

export default router;
