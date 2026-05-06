import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fake', {
  apiVersion: '2023-10-16' as any, // fallback for types
});

export class AccountController {
  
  // ─── 1. Account Details ───────────────────────────────────────────────
  
  public getAccountDetails = async (req: Request, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: (req.user as any).id },
        select: {
          id: true, email: true, name: true, company: true,
          phone: true, address1: true, address2: true,
          city: true, state: true, postcode: true, country: true,
          twoFactorEnabled: true, avatar: true
        }
      });
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

  public updateAccountDetails = async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const user = await prisma.user.update({
        where: { id: (req.user as any).id },
        data: {
          name: data.name,
          company: data.company,
          phone: data.phone,
          address1: data.address1,
          address2: data.address2,
          city: data.city,
          state: data.state,
          postcode: data.postcode,
          country: data.country,
        }
      });
      res.json({ success: true, message: 'Account updated successfully', data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Update failed' });
    }
  };

  // ─── 2. User Management ────────────────────────────────────────────────
  
  public getSubUsers = async (req: Request, res: Response) => {
    try {
      const subUsers = await prisma.subUser.findMany({
        where: { parentId: (req.user as any).id }
      });
      res.json({ success: true, data: subUsers });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

  public inviteSubUser = async (req: Request, res: Response) => {
    try {
      const { email, name, permissions } = req.body;
      const subUser = await prisma.subUser.create({
        data: {
          parentId: (req.user as any).id,
          email,
          name,
          permissions: permissions || [],
          inviteToken: Math.random().toString(36).substring(2, 15) // simple token
        }
      });
      // TODO: Send email using Nodemailer
      res.json({ success: true, message: 'Invitation sent', data: subUser });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Invite failed' });
    }
  };

  public removeSubUser = async (req: Request, res: Response) => {
    try {
      await prisma.subUser.deleteMany({
        where: { id: req.params.id as string, parentId: (req.user as any).id }
      });
      res.json({ success: true, message: 'Sub-user removed' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Removal failed' });
    }
  };

  // ─── 3. Contacts ───────────────────────────────────────────────────────
  
  public getContacts = async (req: Request, res: Response) => {
    try {
      const contacts = await prisma.contact.findMany({
        where: { userId: (req.user as any).id }
      });
      res.json({ success: true, data: contacts });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

  public addContact = async (req: Request, res: Response) => {
    try {
      const contact = await prisma.contact.create({
        data: { ...req.body, userId: (req.user as any).id }
      });
      res.json({ success: true, message: 'Contact added', data: contact });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to add contact' });
    }
  };

  public updateContact = async (req: Request, res: Response) => {
    try {
      const contact = await prisma.contact.updateMany({
        where: { id: req.params.id as string, userId: (req.user as any).id },
        data: req.body
      });
      res.json({ success: true, message: 'Contact updated' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Update failed' });
    }
  };

  public removeContact = async (req: Request, res: Response) => {
    try {
      await prisma.contact.deleteMany({
        where: { id: req.params.id as string, userId: (req.user as any).id }
      });
      res.json({ success: true, message: 'Contact removed' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Removal failed' });
    }
  };

  // ─── 4. Account Security ────────────────────────────────────────────────
  
  public changePassword = async (req: Request, res: Response): Promise<any> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await prisma.user.findUnique({ where: { id: (req.user as any).id } });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) return res.status(400).json({ success: false, message: 'Invalid current password' });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: (req.user as any).id },
        data: { password: hashedPassword }
      });
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Password change failed' });
    }
  };

  public generate2FA = async (req: Request, res: Response) => {
    try {
      const secret = speakeasy.generateSecret({ name: 'HostingApp' });
      const user = await prisma.user.findUnique({ where: { id: (req.user as any).id } });
      
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      await prisma.user.update({
        where: { id: (req.user as any).id },
        data: { twoFactorSecret: secret.base32 } // Not enabled yet, just generated
      });

      res.json({ success: true, qrCodeUrl, secret: secret.base32 });
    } catch (error) {
      res.status(500).json({ success: false, message: '2FA generation failed' });
    }
  };

  public verify2FA = async (req: Request, res: Response): Promise<any> => {
    try {
      const { code } = req.body;
      const user = await prisma.user.findUnique({ where: { id: (req.user as any).id } });
      
      if (!user?.twoFactorSecret) return res.status(400).json({ success: false, message: 'No 2FA secret found' });

      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code
      });
      
      if (isValid) {
        await prisma.user.update({
          where: { id: (req.user as any).id },
          data: { twoFactorEnabled: true }
        });
        return res.json({ success: true, message: '2FA Enabled successfully' });
      }
      res.status(400).json({ success: false, message: 'Invalid code' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Verification failed' });
    }
  };
  
  public disable2FA = async (req: Request, res: Response) => {
    try {
      await prisma.user.update({
        where: { id: (req.user as any).id },
        data: { twoFactorEnabled: false, twoFactorSecret: null }
      });
      res.json({ success: true, message: '2FA Disabled' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to disable 2FA' });
    }
  };

  // ─── 5. Payment Methods (Stripe) ────────────────────────────────────────
  
  public getPaymentMethods = async (req: Request, res: Response) => {
    try {
      // In a real app, user should have stripeCustomerId saved in the DB.
      // Here we assume it's stored or we fetch based on email (placeholder).
      res.json({ success: true, data: [] }); 
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch payment methods' });
    }
  };

  public createSetupIntent = async (req: Request, res: Response) => {
    try {
      // Create a SetupIntent to collect payment method securely
      const setupIntent = await stripe.setupIntents.create({
        usage: 'off_session',
      });
      res.json({ success: true, clientSecret: setupIntent.client_secret });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to initialize payment setup' });
    }
  };

  public removePaymentMethod = async (req: Request, res: Response) => {
    try {
      await stripe.paymentMethods.detach(req.params.id as string);
      res.json({ success: true, message: 'Payment method removed' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to remove payment method' });
    }
  };

  // ─── 6. Email History ───────────────────────────────────────────────────
  
  public getEmailHistory = async (req: Request, res: Response) => {
    try {
      const emails = await prisma.emailLog.findMany({
        where: { userId: (req.user as any).id },
        orderBy: { sentAt: 'desc' },
        take: 50
      });
      res.json({ success: true, data: emails });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

  // ─── 7. Dashboard Summary ───────────────────────────────────────────────
  
  public getDashboardSummary = async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      
      const [vmsCount, ticketsCount, invoicesCount, ordersCount] = await Promise.all([
        prisma.vM.count({ where: { userId } }),
        prisma.supportTicket.count({ where: { userId, status: 'open' } }),
        prisma.invoice.count({ where: { userId, status: 'pending' } }),
        prisma.order.count({ where: { userId, status: 'active' } })
      ]);

      res.json({
        success: true,
        data: {
          user: { name: (req.user as any).name || 'User' },
          services: vmsCount + ordersCount,
          tickets: ticketsCount,
          invoices: invoicesCount,
          domains: 0 // Placeholder
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch dashboard summary' });
    }
  };
}
