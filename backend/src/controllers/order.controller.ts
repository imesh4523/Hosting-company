import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { planId, amount, billingCycle, paymentMethod } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let plan;
    if (planId) {
      plan = await prisma.plan.findUnique({ where: { id: planId } });
    } else if (req.body.planName) {
      plan = await prisma.plan.findFirst({ where: { name: req.body.planName } });
    }

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        planId,
        amount: parseFloat(amount),
        billingCycle: billingCycle || 'monthly',
        paymentMethod: paymentMethod || 'stripe',
        status: 'pending'
      },
      include: {
        plan: true
      }
    });

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: 'Error creating order', error: error instanceof Error ? error.message : String(error) });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};
