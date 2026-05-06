import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export class DomainController {
  
  public getDomains = async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const domains = await prisma.domain.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      });
      res.json({ success: true, data: domains });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public checkAvailability = async (req: Request, res: Response) => {
    try {
      const { domainName } = req.body;
      
      // Simulation of a domain availability check (Mock)
      const available = !domainName.includes('taken');
      const price = 12.99;

      res.json({
        success: true,
        available,
        price,
        currency: 'USD',
        domainName
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public registerDomain = async (req: Request, res: Response) => {
    try {
      const { domainName, years } = req.body;
      const userId = (req.user as any).id;

      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + (years || 1));

      const domain = await prisma.domain.create({
        data: {
          userId,
          domainName,
          status: 'active',
          expiryDate,
          nextDueDate: expiryDate
        }
      });

      res.status(201).json({ success: true, data: domain });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
