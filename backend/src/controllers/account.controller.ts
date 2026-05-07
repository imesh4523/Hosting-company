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
  
  private getOrCreateStripeCustomer = async (userId: string, email: string): Promise<string> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.stripeCustomerId) return user.stripeCustomerId;

    const customer = await stripe.customers.create({ email, metadata: { userId } });
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id }
    });
    return customer.id;
  };

  public getPaymentMethods = async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const customerId = await this.getOrCreateStripeCustomer(user.id, user.email);
      
      const methods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      const cards: any[] = [];
      const fingerprintsSeenInThisRequest = new Set<string>();

      for (const pm of methods.data) {
        try {
          const fingerprint = pm.card?.fingerprint;
          if (!fingerprint) continue;

          // 1. Check for duplicates in this specific API response
          const isDuplicateInList = fingerprintsSeenInThisRequest.has(fingerprint);
          fingerprintsSeenInThisRequest.add(fingerprint);

          // 2. Sync with local database
          let userCard = await prisma.userCard.findUnique({
            where: { stripePmId: pm.id }
          });

          if (!userCard) {
            // Check if this fingerprint already exists for this user in our DB
            const existingSameFingerprint = await prisma.userCard.findFirst({
              where: { userId: user.id, fingerprint: fingerprint }
            });

            // If it's a duplicate and we already have a record for this fingerprint,
            // we skip creating a new one but don't detach yet to be safe
            if (existingSameFingerprint && isDuplicateInList) {
               console.log(`[FRAUD] Duplicate card skipped for user ${user.id}: ${pm.id}`);
               continue; 
            }

            // Create record if not exists
            userCard = await prisma.userCard.create({
              data: {
                userId: user.id,
                stripePmId: pm.id,
                fingerprint: fingerprint,
                brand: pm.card?.brand,
                last4: pm.card?.last4 || '',
                expMonth: pm.card?.exp_month || 0,
                expYear: pm.card?.exp_year || 0,
              }
            });
          }

          // 3. Multi-Account Check (Fraud)
          const otherUsersWithThisCard = await prisma.userCard.findFirst({
            where: {
              fingerprint: fingerprint,
              userId: { not: user.id }
            }
          });

          if (otherUsersWithThisCard && !userCard.isFlagged) {
            await prisma.userCard.updateMany({
              where: { fingerprint: fingerprint },
              data: { isFlagged: true }
            });
            userCard.isFlagged = true;
          }

          cards.push({
            id: pm.id,
            brand: pm.card?.brand,
            last4: pm.card?.last4,
            expMonth: pm.card?.exp_month,
            expYear: pm.card?.exp_year,
            funding: pm.card?.funding,
            description: pm.metadata?.description || '',
            isFlagged: userCard.isFlagged || isDuplicateInList
          });
        } catch (innerError) {
          console.error("[DEBUG] Syncing individual card failed:", innerError);
          // Continue to next card even if one fails
        }
      }

      res.json({ success: true, data: cards });
    } catch (error) {
      console.error("[DEBUG] getPaymentMethods Error:", error);
      res.status(500).json({ success: false, message: 'Failed to fetch payment methods' });
    }
  };

  public createSetupIntent = async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const customerId = await this.getOrCreateStripeCustomer(user.id, user.email);

      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        usage: 'off_session',
      });
      res.json({ success: true, clientSecret: setupIntent.client_secret });
    } catch (error: any) {
      console.error("[DEBUG] createSetupIntent Error:", error);
      res.status(500).json({ success: false, message: error.message || 'Failed to initialize payment setup' });
    }
  };

  public removePaymentMethod = async (req: Request, res: Response) => {
    try {
      await stripe.paymentMethods.detach(req.params.id as string);
      // Also remove from our local DB
      // We no longer delete from local DB to maintain ownership history
      // This ensures the card remains "locked" to this user's ID forever
      // await prisma.userCard.deleteMany({ where: { stripePmId: req.params.id } });
      res.json({ success: true, message: 'Payment method removed' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to remove payment method' });
    }
  };

  public verifyNewPaymentMethod = async (req: Request, res: Response) => {
    try {
      const { paymentMethodId } = req.body;
      const user = req.user as any;

      if (!paymentMethodId) {
        return res.status(400).json({ success: false, message: 'Payment method ID is required' });
      }

      // Fetch the new PM details from Stripe
      const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
      const fingerprint = pm.card?.fingerprint;

      if (!fingerprint) {
        return res.status(400).json({ success: false, message: 'Could not verify card details' });
      }

      // 1. Permanent Ownership Check (The "Lock" logic)
      // Find the EARLIEST record of this card in our system
      const originalOwnerRecord = await prisma.userCard.findFirst({
        where: { fingerprint: fingerprint },
        orderBy: { createdAt: 'asc' } // Earliest first
      });

      if (originalOwnerRecord && originalOwnerRecord.userId !== user.id) {
        console.log(`[FRAUD] User ${user.id} tried to add card ${fingerprint} originally owned by user ${originalOwnerRecord.userId}.`);
        await stripe.paymentMethods.detach(paymentMethodId);
        
        // Flag all instances of this card as fraudulent
        await prisma.userCard.updateMany({
          where: { fingerprint: fingerprint },
          data: { isFlagged: true }
        });

        return res.status(400).json({ 
          success: false, 
          message: 'Security Alert: This card is permanently linked to another account. Please contact support if you believe this is an error.' 
        });
      }

      // 2. Active Duplicate Check (Same account)
      // Check if the card is CURRENTLY active in this account (has a valid Stripe PM ID and not just a history record)
      // Since we don't delete history, we need to check if the user is trying to add what they already have active.
      // We can verify this by checking Stripe's current state in getPaymentMethods, 
      // but here we check if they have any OTHER active PM ID for this card.
      const activeSameAccountCard = await prisma.userCard.findFirst({
        where: { 
          userId: user.id, 
          fingerprint: fingerprint,
          stripePmId: { not: paymentMethodId }
        }
      });

      // Note: If they deleted it from the UI, it's detached from Stripe, so it's fine to add again as a NEW PM ID.
      // We allow the upsert below to handle the update/creation.

      // If not a duplicate, ensure it's in our DB (sync it now)
      await prisma.userCard.upsert({
        where: { stripePmId: paymentMethodId },
        update: {},
        create: {
          userId: user.id,
          stripePmId: paymentMethodId,
          fingerprint: fingerprint,
          brand: pm.card?.brand,
          last4: pm.card?.last4 || '',
          expMonth: pm.card?.exp_month || 0,
          expYear: pm.card?.exp_year || 0,
        }
      });

      res.json({ success: true, message: 'Card verified' });
    } catch (error: any) {
      console.error("[DEBUG] verifyNewPaymentMethod Error:", error);
      res.status(500).json({ success: false, message: error.message || 'Verification failed' });
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
