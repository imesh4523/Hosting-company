import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export class BillingController {
  
  public getInvoices = async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const invoices = await prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, data: invoices });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public getInvoiceDetails = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any).id;

      const invoice = await prisma.invoice.findUnique({
        where: { id, userId },
        include: { transactions: true }
      });

      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }

      res.json({ success: true, data: invoice });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
