import Stripe from "stripe";
import { prisma } from "../lib/prisma.js";
import { NotificationService } from "./notification.service.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-01-27.acacia",
});

const notify = new NotificationService();

export const PLANS = [
  { id: "starter",  name: "Starter",  ram: 1, cpu: 1, disk: 20,  bandwidth: 1000,  price: 5,  priceId: process.env.STRIPE_PRICE_STARTER  ?? "" },
  { id: "basic",    name: "Basic",    ram: 2, cpu: 1, disk: 40,  bandwidth: 2000,  price: 10, priceId: process.env.STRIPE_PRICE_BASIC    ?? "" },
  { id: "pro",      name: "Pro",      ram: 4, cpu: 2, disk: 80,  bandwidth: 4000,  price: 20, priceId: process.env.STRIPE_PRICE_PRO      ?? "" },
  { id: "business", name: "Business", ram: 8, cpu: 4, disk: 160, bandwidth: 8000,  price: 40, priceId: process.env.STRIPE_PRICE_BUSINESS ?? "" },
];

export class BillingService {
  /** Create Stripe checkout session */
  async createCheckout(userId: string, planId: string, customerEmail: string) {
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) throw new Error(`Plan not found: ${planId}`);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            recurring: { interval: "month" },
            product_data: {
              name: `${plan.name} VPS Plan`,
              description: `${plan.cpu}CPU · ${plan.ram}GB RAM · ${plan.disk}GB SSD`,
            },
            unit_amount: plan.price * 100,
          },
          quantity: 1,
        },
      ],
      metadata: { userId, planId },
      success_url: `${process.env.FRONTEND_URL}/dashboard/billing?success=1`,
      cancel_url:  `${process.env.FRONTEND_URL}/dashboard/billing?cancelled=1`,
    });

    return { url: session.url };
  }

  /** Handle Stripe webhook events */
  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET ?? ""
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${(err as Error).message}`);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.onCheckoutComplete(session);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await this.onPaymentSucceeded(invoice);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await this.onPaymentFailed(invoice);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await this.onSubscriptionCancelled(sub);
        break;
      }
    }

    return { received: true };
  }

  private async onCheckoutComplete(session: Stripe.Checkout.Session) {
    const { userId, planId } = session.metadata ?? {};
    if (!userId || !planId) return;

    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return;

    // Record transaction
    await prisma.transaction.create({
      data: {
        userId,
        amount: plan.price,
        status: "success",
        stripeSessionId: session.id,
        plan: planId,
        provider: "stripe",
      },
    });

    // Notify admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    await notify.telegramAdmin(
      `💳 *Payment Received*\nUser: ${user?.email}\nPlan: ${plan.name}\nAmount: $${plan.price}/mo`
    );

    // Trigger VPS deployment via queue (dispatched separately)
    console.log(`[Billing] Triggering VPS deploy for user ${userId} plan ${planId}`);
  }

  private async onPaymentSucceeded(invoice: Stripe.Invoice) {
    // Renewal payment — ensure VPS stays active
    const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
    console.log(`[Billing] Renewal payment succeeded for customer ${customerId}`);
  }

  private async onPaymentFailed(invoice: Stripe.Invoice) {
    const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
    if (!customerId) return;

    // Find user by Stripe customer ID — you'd store this on the user record
    // Suspend their VPS after 3 failed payments (tracked via invoice attempt count)
    const attemptCount = invoice.attempt_count ?? 1;
    if (attemptCount >= 3) {
      console.log(`[Billing] 3 failed payments — suspending VPS for customer ${customerId}`);
      // Suspend VPS logic here
    }

    await notify.telegramAdmin(
      `❌ *Payment Failed*\nStripe Customer: \`${customerId}\`\nAttempt: ${attemptCount}/3`
    );
  }

  private async onSubscriptionCancelled(sub: Stripe.Subscription) {
    console.log(`[Billing] Subscription cancelled: ${sub.id}`);
    // Graceful VPS suspension on cancellation
  }

  /** Get all invoices for a user */
  async getUserInvoices(stripeCustomerId: string) {
    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 24,
    });
    return invoices.data.map(inv => ({
      id: inv.id,
      amount: (inv.amount_paid ?? 0) / 100,
      status: inv.status,
      date: new Date((inv.created ?? 0) * 1000).toISOString(),
      pdfUrl: inv.invoice_pdf,
    }));
  }
}
