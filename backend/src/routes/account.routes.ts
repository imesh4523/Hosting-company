import { Router } from 'express';
import { AccountController } from '../controllers/account.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
const controller = new AccountController();

// All account routes require authentication
router.use(authenticate);

// 1. Account Details
router.get('/details', controller.getAccountDetails);
router.put('/details', controller.updateAccountDetails);

// 2. User Management
router.get('/users', controller.getSubUsers);
router.post('/users/invite', controller.inviteSubUser);
router.delete('/users/:id', controller.removeSubUser);

// 3. Contacts
router.get('/contacts', controller.getContacts);
router.post('/contacts', controller.addContact);
router.put('/contacts/:id', controller.updateContact);
router.delete('/contacts/:id', controller.removeContact);

// 4. Account Security
router.post('/security/password', controller.changePassword);
router.post('/security/2fa/generate', controller.generate2FA);
router.post('/security/2fa/verify', controller.verify2FA);
router.post('/security/2fa/disable', controller.disable2FA);

// 5. Payment Methods (Stripe)
router.get('/payment-methods', controller.getPaymentMethods);
router.post('/payment-methods/setup-intent', controller.createSetupIntent);
router.delete('/payment-methods/:id', controller.removePaymentMethod);

// 6. Email History
router.get('/emails', controller.getEmailHistory);

// 7. Dashboard Summary
router.get('/summary', controller.getDashboardSummary);

export default router;
