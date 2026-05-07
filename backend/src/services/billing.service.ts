import Stripe from "stripe";
import prisma from "../config/prisma.js";
import { NotificationService } from "./notification.service.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-04-22.dahlia",
});

const notify = new NotificationService();

export const PLANS = [
  { id: "starter",  name: "Starter",  ram: 1, cpu: 1, disk: 20,  bandwidth: 1000,  price: 5,  priceId: process.env.STRIPE_PRICE_STARTER  ?? "" },
  { id: "basic",    name: "Basic",    ram: 2, cpu: 1, disk: 40,  bandwidth: 2000,  price: 10, priceId: process.env.STRIPE_PRICE_BASIC    ?? "" },
  { id: "pro",      name: "Pro",      ram: 4, cpu: 2, disk: 80,  bandwidth: 4000,  price: 20, priceId: process.env.STRIPE_PRICE_PRO      ?? "" },
  { id: "business", name: "Business", ram: 8, cpu: 4, disk: 160, bandwidth: 8000,  price: 40, priceId: process.env.STRIPE_PRICE_BUSINESS ?? "" },
];
export class BillingService {
  /** Get or create Stripe customer */
  private async getOrCreateCustomer(userId: string, email: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.stripeCustomerId) return user.stripeCustomerId;

    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  /** Create a SetupIntent for saving a card */
  async createSetupIntent(userId: string, email: string) {
    const customerId = await this.getOrCreateCustomer(userId, email);
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    });
    return { clientSecret: setupIntent.client_secret };
  }

  /** List saved payment methods for a user */
  async listSavedCards(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.stripeCustomerId) return [];

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });

    return paymentMethods.data.map(pm => ({
      id: pm.id,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
    }));
  }

  /** Charge a saved card for 'Add Funds' */
  async chargeSavedCard(userId: string, paymentMethodId: string, amount: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.stripeCustomerId) throw new Error("No Stripe customer found");

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      customer: user.stripeCustomerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      description: `Wallet top-up: $${amount}`,
      metadata: { userId, type: "wallet_topup" },
    });

    if (paymentIntent.status === "succeeded") {
      await this.updateWalletBalance(userId, amount, paymentIntent.id);
    }

    return paymentIntent;
  }

  /** Create a PaymentIntent for a new card (Add Funds) */
  async createPaymentIntent(userId: string, email: string, amount: number) {
    const customerId = await this.getOrCreateCustomer(userId, email);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      customer: customerId,
      setup_future_usage: "off_session",
      metadata: { userId, type: "wallet_topup" },
    });
    return { clientSecret: paymentIntent.client_secret };
  }

  private async updateWalletBalance(userId: string, amount: number, stripeId: string) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          userId,
          amount,
          status: "success",
          stripeSessionId: stripeId,
          plan: "wallet_topup",
        },
      }),
    ]);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    await notify.telegramAdmin(
      `💰 *Wallet Top-up*\nUser: ${user?.email}\nAmount: $${amount}\nNew Balance: $${user?.walletBalance}`
    );
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
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        if (intent.metadata.type === "wallet_topup") {
          await this.updateWalletBalance(
            intent.metadata.userId as string,
            intent.amount / 100,
            intent.id
          );
        }
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.onCheckoutComplete(session);
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
      },
    });

    // Notify admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    await notify.telegramAdmin(
      `💳 *Payment Received*\nUser: ${user?.email}\nPlan: ${plan.name}\nAmount: $${plan.price}/mo`
    );
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
