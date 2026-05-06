import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export class TicketController {
  
  public createTicket = async (req: Request, res: Response) => {
    try {
      const { subject, priority, message } = req.body;
      const userId = (req.user as any).id;

      const ticket = await prisma.supportTicket.create({
        data: {
          userId,
          subject,
          priority: priority || 'medium',
          status: 'open',
          messages: {
            create: {
              sender: 'user',
              message
            }
          }
        },
        include: { messages: true }
      });

      res.status(201).json({ success: true, data: ticket });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public getTickets = async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const tickets = await prisma.supportTicket.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      });
      res.json({ success: true, data: tickets });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public getTicketDetails = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any).id;

      const ticket = await prisma.supportTicket.findUnique({
        where: { id, userId },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });

      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
      }

      res.json({ success: true, data: ticket });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public replyTicket = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const userId = (req.user as any).id;

      const ticket = await prisma.supportTicket.findUnique({ where: { id, userId } });
      if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

      const reply = await prisma.ticketMessage.create({
        data: {
          ticketId: id,
          sender: 'user',
          message
        }
      });

      // Update ticket status/updatedAt
      await prisma.supportTicket.update({
        where: { id },
        data: { status: 'open', updatedAt: new Date() }
      });

      res.json({ success: true, data: reply });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
