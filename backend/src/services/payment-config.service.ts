import prisma from '../config/prisma.js';
import { encrypt, decrypt } from '../utils/encryption.js';

export class PaymentConfigService {
  static async getStripeConfig() {
    const settings = await prisma.paymentSettings.findFirst();
    if (!settings) {
      return {
        enabled: false,
        secretKey: process.env.STRIPE_SECRET_KEY,
        publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      };
    }

    return {
      enabled: settings.stripeEnabled,
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
    let settings = await prisma.paymentSettings.findFirst();

    const updateData: any = {};
    if (data.enabled !== undefined) updateData.stripeEnabled = data.enabled;
    if (data.publicKey !== undefined) updateData.stripePublicKey = data.publicKey;
    if (data.secretKey) updateData.stripeSecretKey = encrypt(data.secretKey);
    if (data.webhookSecret) updateData.stripeWebhookSecret = encrypt(data.webhookSecret);

    if (settings) {
      return await prisma.paymentSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    } else {
      return await prisma.paymentSettings.create({
        data: updateData,
      });
    }
  }
}
