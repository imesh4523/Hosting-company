import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { DigitalOceanService } from '../services/digitalocean.service';

export const deployVPS = async (req: Request, res: Response) => {
  try {
    const { name, planId, region, image } = req.body;
    const userId = (req as any).user.id;

    // 1. Find best available DO account (Load Balancing)
    const doAccount = await prisma.digitalOceanAccount.findFirst({
      where: { isActive: true },
      orderBy: { usage: 'asc' }, // Get account with least usage
    });

    if (!doAccount) {
      return res.status(500).json({ message: 'No available DigitalOcean accounts' });
    }

    // 2. Create droplet via DO API
    // Note: In real production, apiKey would be decrypted here
    const droplet = await DigitalOceanService.createDroplet(doAccount.apiKey, {
      name,
      region,
      size: planId,
      image,
    });

    // 3. Save to DB
    const vps = await prisma.vps.create({
      data: {
        name,
        dropletId: droplet.id.toString(),
        planId,
        region,
        image,
        userId,
        doAccountId: doAccount.id,
        status: 'STARTING',
      },
    });

    // 4. Update DO account usage
    await prisma.digitalOceanAccount.update({
      where: { id: doAccount.id },
      data: { usage: { increment: 1 } },
    });

    res.status(201).json({ message: 'VPS deployment started', vps });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to deploy VPS', error: error.message });
  }
};

export const getMyVPS = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const vpsList = await prisma.vps.findMany({
      where: { userId },
      include: { doAccount: true },
    });
    res.json(vpsList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching VPS list' });
  }
};

export const vpsAction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // power_on, power_off, reboot
    const userId = (req as any).user.id;

    const vps = await prisma.vps.findFirst({
      where: { id, userId },
      include: { doAccount: true },
    });

    if (!vps || !vps.dropletId) {
      return res.status(404).json({ message: 'VPS not found' });
    }

    await DigitalOceanService.performAction(vps.doAccount.apiKey, vps.dropletId, action);
    
    res.json({ message: `Action ${action} initiated` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to perform action' });
  }
};
