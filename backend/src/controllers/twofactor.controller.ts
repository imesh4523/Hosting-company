import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { TwoFactorService } from '../services/2fa.service.js';
import { encrypt } from '../utils/encryption.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export class TwoFactorController {
  static async setup(req: Request, res: Response) {
    res.status(501).json({ message: '2FA is disabled' });
  }

  static async verifyAndEnable(req: Request, res: Response) {
    res.status(501).json({ message: '2FA is disabled' });
  }

  static async verifyLogin(req: Request, res: Response) {
    res.status(501).json({ message: '2FA is disabled' });
  }

  static async disable(req: Request, res: Response) {
    res.status(501).json({ message: '2FA is disabled' });
  }
}
