import prisma from '../config/prisma.js';
import { encrypt, decrypt } from '../utils/encryption.js';

export class PaymentConfigService {
  static async getStripeConfig() {
    const settings = await (prisma as any).settings.findUnique({ where: { id: "singleton" } });
    if (!settings) {
      return {
        enabled: true, // Default to true if no settings record
        secretKey: process.env.STRIPE_SECRET_KEY,
        publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      };
    }

    return {
      enabled: true, // Settings model doesn't have a global 'enabled' for stripe, assume true if keys exist
      secretKey: settings.stripeSecretKey ? decrypt(settings.stripeSecretKey) : process.env.STRIPE_SECRET_KEY,
      publicKey: settings.stripePublicKey || process.env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: settings.stripeWebhookSecret ? decrypt(settings.stripeWebhookSecret) : process.env.STRIPE_WEBHOOK_SECRET,
    };
  }

  static async updateStripeConfig(data: {
    enabled?: boolean;
    secretKey?: string;
    publicKey?: string;
    webhookSecret?: string;
  }) {
    const updateData: any = {};
    if (data.publicKey !== undefined) updateData.stripePublicKey = data.publicKey;
    if (data.secretKey) updateData.stripeSecretKey = encrypt(data.secretKey);
    if (data.webhookSecret) updateData.stripeWebhookSecret = encrypt(data.webhookSecret);
    updateData.updatedAt = new Date();

    return await (prisma as any).settings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", ...updateData },
      update: updateData,
    });
  }
}
