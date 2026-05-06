import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../config/prisma.js';
import { ProvisioningService } from '../services/provisioning.service.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51P...placeholder');

export class PaymentController {
  
  public createPaymentIntent = async (req: Request, res: Response) => {
    try {
      const { orderId } = req.body;
      const userId = (req.user as any).id;

      const order = await prisma.order.findUnique({
        where: { id: orderId, userId },
        include: { plan: true }
      });

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round((order.totalPrice || 0) * 100), // in cents
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          orderId: order.id,
          userId: userId
        }
      });

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error('Stripe Error:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public handleWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig!,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        // Update order status
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'paid' }
        });

        // Trigger Provisioning (Phase 2 step)
        console.log(`[Payment] Order ${orderId} marked as paid. Triggering provisioning...`);
        ProvisioningService.provisionOrder(orderId).catch(err => console.error('Provisioning Error:', err));
      }
    }

    res.json({ received: true });
  };
}
