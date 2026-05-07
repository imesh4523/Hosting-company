import { Request, Response } from 'express';
import { PaymentConfigService } from '../services/payment-config.service.js';

export class AdminSettingsController {
  
  static async getPaymentSettings(req: Request, res: Response) {
    try {
      const config = await PaymentConfigService.getStripeConfig();
      // Mask secret keys for security
      res.json({
        success: true,
        data: {
          stripeEnabled: config.enabled,
          stripePublicKey: config.publicKey,
          stripeSecretKey: config.secretKey ? '********' : null,
          stripeWebhookSecret: config.webhookSecret ? '********' : null,
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updatePaymentSettings(req: Request, res: Response) {
    try {
      const { stripeEnabled, stripePublicKey, stripeSecretKey, stripeWebhookSecret } = req.body;
      
      const updateData: any = {
        enabled: stripeEnabled,
        publicKey: stripePublicKey,
      };

      // Only update secret keys if they are provided and not masked
      if (stripeSecretKey && stripeSecretKey !== '********') {
        updateData.secretKey = stripeSecretKey;
      }
      if (stripeWebhookSecret && stripeWebhookSecret !== '********') {
        updateData.webhookSecret = stripeWebhookSecret;
      }

      await PaymentConfigService.updateStripeConfig(updateData);
      
      res.json({ success: true, message: 'Payment settings updated successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
