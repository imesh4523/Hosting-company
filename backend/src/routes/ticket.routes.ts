import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
const ticketController = new TicketController();

router.use(authenticate);

router.get('/', ticketController.getTickets);
router.post('/', ticketController.createTicket);
router.get('/:id', ticketController.getTicketDetails);
router.post('/:id/reply', ticketController.replyTicket);

export default router;
