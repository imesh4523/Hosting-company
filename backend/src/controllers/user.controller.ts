import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

// GET /api/user/profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        postcode: true,
        country: true,
        createdAt: true,
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Derive firstName/lastName from legacy 'name' field if not set
    const nameParts = (user.name || '').split(' ');
    const profileData = {
      ...user,
      firstName: user.firstName || nameParts[0] || '',
      lastName: user.lastName || nameParts.slice(1).join(' ') || '',
    };

    res.json(profileData);
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// PUT /api/user/profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { firstName, lastName, phone, address, city, state, postcode, country } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, phone, address, city, state, postcode, country },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, address: true, city: true, state: true, postcode: true, country: true
      }
    });

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// POST /api/user/change-password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Current password is incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// GET /api/user/payment-methods
export const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;

    const methods = await (prisma as any).paymentMethod?.findMany?.({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    }) || [];

    res.json(methods);
  } catch (error) {
    console.error('getPaymentMethods error:', error);
    res.json([]); // Return empty array if table doesn't exist yet
  }
};

// POST /api/user/payment-methods
export const addPaymentMethod = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { cardNumber, cardHolder, expiryDate, nickname } = req.body;

    if (!cardNumber || !cardHolder || !expiryDate) {
      return res.status(400).json({ error: 'Card number, holder name, and expiry date are required' });
    }

    // Store only last 4 digits for security
    const last4 = cardNumber.slice(-4);
    const cardType = getCardType(cardNumber);

    const method = await (prisma as any).paymentMethod?.create?.({
      data: { userId, last4, cardType, cardHolder, expiryDate, nickname: nickname || null }
    });

    res.json({ message: 'Payment method added', method: method || { last4, cardType, cardHolder, expiryDate, nickname } });
  } catch (error) {
    console.error('addPaymentMethod error:', error);
    res.status(500).json({ error: 'Failed to add payment method' });
  }
};

// DELETE /api/user/payment-methods/:id
export const deletePaymentMethod = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { id } = req.params;

    await (prisma as any).paymentMethod?.delete?.({
      where: { id, userId }
    });

    res.json({ message: 'Payment method removed' });
  } catch (error) {
    console.error('deletePaymentMethod error:', error);
    res.status(500).json({ error: 'Failed to remove payment method' });
  }
};

function getCardType(number: string): string {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'American Express';
  if (/^6(?:011|5)/.test(n)) return 'Discover';
  return 'Credit Card';
}
