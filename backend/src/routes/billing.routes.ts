import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
const billingController = new BillingController();

router.use(authenticate);

router.get('/invoices', billingController.getInvoices);
router.get('/invoices/:id', billingController.getInvoiceDetails);

export default router;
