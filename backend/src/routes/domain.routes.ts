import { Router } from 'express';
import { DomainController } from '../controllers/domain.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
const domainController = new DomainController();

router.use(authenticate);

router.get('/', domainController.getDomains);
router.post('/check', domainController.checkAvailability);
router.post('/register', domainController.registerDomain);

export default router;
