import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { getDOClient, DigitalOceanService } from '../services/digitalocean.service.js';

export const deployVPS = async (req: Request, res: Response) => {
  try {
    const { name, planId, region, image } = req.body;
    const userId = (req as any).user.id;

    // 1. Find best available DO account (Load Balancing)
    const doAccount = await prisma.dOAccount.findFirst({
      where: { status: 'active' },
      orderBy: { dropletCount: 'asc' }, // Get account with least usage
    });

    if (!doAccount) {
      return res.status(500).json({ message: 'No available DigitalOcean accounts' });
    }

    // 2. Create droplet via DO API
    const doClient = getDOClient(doAccount.apiKey);
    const droplet = await doClient.createDroplet({
      name,
      region: region || doAccount.region,
      size: planId,
      image,
    });

    const publicIp = DigitalOceanService.getPublicIP(droplet);

    // 3. Save to DB
    const vps = await prisma.vPS.create({
      data: {
        name,
        dropletId: droplet.id.toString(),
        planId,
        region: droplet.region.slug,
        ipAddress: publicIp,
        userId,
        doAccountId: doAccount.id,
        status: 'active',
      },
    });

    // 4. Update DO account usage
    await prisma.dOAccount.update({
      where: { id: doAccount.id },
      data: { dropletCount: { increment: 1 } },
    });

    res.status(201).json({ message: 'VPS deployment started', vps });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to deploy VPS', error: error.message });
  }
};

export const getMyVPS = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const vpsList = await prisma.vPS.findMany({
      where: { userId },
      include: { account: true, plan: true },
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

    const vps = await prisma.vPS.findFirst({
      where: { id: id as string, userId },
      include: { account: true },
    });

    if (!vps || !vps.dropletId || !vps.account) {
      return res.status(404).json({ message: 'VPS not found' });
    }

    const doClient = getDOClient(vps.account.apiKey);
    
    if (action === 'power_on') await doClient.powerOnDroplet(vps.dropletId);
    else if (action === 'power_off') await doClient.powerOffDroplet(vps.dropletId);
    else if (action === 'reboot') await doClient.rebootDroplet(vps.dropletId);
    else return res.status(400).json({ message: 'Invalid action' });
    
    res.json({ message: `Action ${action} initiated` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to perform action' });
  }
};
