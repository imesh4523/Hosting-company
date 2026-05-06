import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { TwoFactorService } from '../services/2fa.service.js';
import { encrypt } from '../utils/encryption.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export class TwoFactorController {
  /**
   * Start 2FA Setup
   */
  static async setup(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (user.twoFactorEnabled) return res.status(400).json({ message: '2FA already enabled' });

      const { otpauthUrl, base32 } = TwoFactorService.generateSecret(user.email);
      const qrCode = await TwoFactorService.generateQRCode(otpauthUrl!);

      // Save TEMPORARY secret to user (not enabled yet)
      // We'll store it encrypted
      const encryptedSecret = encrypt(base32);
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorSecret: encryptedSecret }
      });

      res.json({ qrCode, secret: base32 });
    } catch (error) {
      res.status(500).json({ message: 'Error setting up 2FA', error });
    }
  }

  /**
   * Verify and Enable 2FA
   */
  static async verifyAndEnable(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const userId = (req.user as any).id;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ message: '2FA setup not initiated' });
      }

      const isValid = TwoFactorService.verifyToken(user.twoFactorSecret, token);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid 2FA token' });
      }

      // Generate recovery codes
      const backupCodes = TwoFactorService.generateBackupCodes();

      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: true,
          twoFactorBackupCodes: backupCodes
        }
      });

      res.json({ success: true, backupCodes });
    } catch (error) {
      res.status(500).json({ message: 'Error enabling 2FA', error });
    }
  }

  /**
   * Verify 2FA during Login
   */
  static async verifyLogin(req: Request, res: Response) {
    try {
      const { userId, token } = req.body;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        return res.status(400).json({ message: '2FA not enabled for this user' });
      }

      const isValid = TwoFactorService.verifyToken(user.twoFactorSecret, token);
      
      // Also check backup codes
      let usedBackupCode = false;
      if (!isValid && user.twoFactorBackupCodes.includes(token.toUpperCase())) {
        usedBackupCode = true;
        // Remove used backup code
        await prisma.user.update({
          where: { id: userId },
          data: {
            twoFactorBackupCodes: user.twoFactorBackupCodes.filter(c => c !== token.toUpperCase())
          }
        });
      }

      if (!isValid && !usedBackupCode) {
        return res.status(401).json({ success: false, message: 'Invalid 2FA token' });
      }

      // 2FA Success - Issue real tokens
      const authToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
      const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: '7d' });

      res.json({
        success: true,
        token: authToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error verifying 2FA login', error });
    }
  }

  /**
   * Disable 2FA
   */
  static async disable(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { password } = req.body; // Security check

      // Logic to verify password before disabling could go here
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorBackupCodes: []
        }
      });

      res.json({ success: true, message: '2FA disabled successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error disabling 2FA', error });
    }
  }
}
