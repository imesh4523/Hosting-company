import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../config/prisma.js';
import { ProvisioningService } from '../services/provisioning.service.js';
import { PaymentConfigService } from '../services/payment-config.service.js';

export class PaymentController {
  
  private getStripe = async () => {
    const config = await PaymentConfigService.getStripeConfig();
    return new Stripe(config.secretKey || '');
  };

  public createPaymentIntent = async (req: Request, res: Response) => {
    try {
      const stripe = await this.getStripe();
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

  public createAddFundsIntent = async (req: Request, res: Response) => {
    try {
      const stripe = await this.getStripe();
      const { amount, paymentMethodId } = req.body;
      const userId = (req.user as any).id;

      if (!amount || amount < 1) {
        return res.status(400).json({ success: false, message: 'Invalid amount' });
      }

      // 1. Get or Create Stripe Customer
      let user = await prisma.user.findUnique({ where: { id: userId } });
      let customerId = user?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user?.email || '',
          name: user?.name || user?.firstName + ' ' + user?.lastName || 'User',
          metadata: { userId }
        });
        customerId = customer.id;
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customerId }
        });
      }

      // 2. Create PaymentIntent
      const intentData: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(amount * 100),
        currency: 'usd',
        customer: customerId,
        automatic_payment_methods: { enabled: true },
        setup_future_usage: 'off_session', // Save card for later
        metadata: {
          type: 'add_funds',
          userId: userId
        }
      };

      // If using a saved card
      if (paymentMethodId) {
        delete intentData.setup_future_usage;
        intentData.payment_method = paymentMethodId;
        intentData.confirm = true;
        intentData.off_session = true;
      }

      const paymentIntent = await stripe.paymentIntents.create(intentData);

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        requiresAction: paymentIntent.status === 'requires_action',
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error('Stripe Error:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public getSavedCards = async (req: Request, res: Response) => {
    try {
      const stripe = await this.getStripe();
      const userId = (req.user as any).id;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user?.stripeCustomerId) {
        return res.json({ success: true, cards: [] });
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      });

      const cards = paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
      }));

      res.json({ success: true, cards });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public handleWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const config = await PaymentConfigService.getStripeConfig();
    const stripe = new Stripe(config.secretKey || '');

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig!,
        config.webhookSecret || ''
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { orderId, type, userId } = paymentIntent.metadata;

      if (type === 'add_funds' && userId) {
        const amount = paymentIntent.amount / 100;
        
        // 1. Update user balance
        await prisma.user.update({
          where: { id: userId },
          data: { balance: { increment: amount } }
        });

        // 2. Record transaction
        await prisma.transaction.create({
          data: {
            userId,
            amount,
            method: 'stripe',
            status: 'success',
            stripeSessionId: paymentIntent.id
          }
        });

        console.log(`[Payment] User ${userId} balance increased by $${amount}`);
      } else if (orderId) {
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
