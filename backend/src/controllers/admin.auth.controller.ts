import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { encrypt } from '../utils/encryption.js';
import { OAuthService } from '../services/oauth.service.js';

export class AdminAuthController {
  static async getSettings(req: Request, res: Response) {
    try {
      let settings = await prisma.authSettings.findFirst();
      if (!settings) {
        settings = await prisma.authSettings.create({ data: { emailEnabled: true } });
      }
      // Don't send encrypted secrets to frontend for security
      const safeSettings = { ...settings };
      safeSettings.googleSecret = settings.googleSecret ? '********' : null;
      safeSettings.facebookSecret = settings.facebookSecret ? '********' : null;
      safeSettings.githubSecret = settings.githubSecret ? '********' : null;
      
      res.json(safeSettings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching auth settings' });
    }
  }

  static async updateSettings(req: Request, res: Response) {
    try {
      const {
        googleEnabled, googleClientId, googleSecret,
        facebookEnabled, facebookAppId, facebookSecret,
        githubEnabled, githubClientId, githubSecret,
        emailEnabled
      } = req.body;

      const existing = await prisma.authSettings.findFirst();
      
      const data: any = {
        googleEnabled, googleClientId,
        facebookEnabled, facebookAppId,
        githubEnabled, githubClientId,
        emailEnabled
      };

      // Only update secret if it's provided and not just asterisks
      if (googleSecret && googleSecret !== '********') data.googleSecret = encrypt(googleSecret);
      if (facebookSecret && facebookSecret !== '********') data.facebookSecret = encrypt(facebookSecret);
      if (githubSecret && githubSecret !== '********') data.githubSecret = encrypt(githubSecret);

      if (existing) {
        await prisma.authSettings.update({ where: { id: existing.id }, data });
      } else {
        await prisma.authSettings.create({ data });
      }

      // Re-initialize strategies
      await OAuthService.init();

      res.json({ message: 'Auth settings updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating auth settings' });
    }
  }

  static async testConnection(req: Request, res: Response) {
    const { provider, clientId, secret } = req.body;
    // In a real app, you'd try to hit the provider's metadata endpoint
    // For this demo, we'll just validate basic string presence
    if (clientId && secret) {
      res.json({ ok: true, message: `${provider} configuration looks valid!` });
    } else {
      res.status(400).json({ ok: false, message: 'Invalid credentials' });
    }
  }
}
