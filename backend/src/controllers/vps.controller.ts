import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { CloudProviderFactory } from '../lib/providers/factory.js';

export const deployVPS = async (req: Request, res: Response) => {
  try {
    const { name, planId, region, image, provider: requestedProvider } = req.body;
    const userId = (req as any).user.id;

    // 1. Find best available cloud account
    const cloudAccount = await prisma.cloudAccount.findFirst({
      where: { 
        status: 'active',
        ...(requestedProvider && { provider: requestedProvider })
      },
      orderBy: { vmCount: 'asc' },
    });

    if (!cloudAccount) {
      return res.status(500).json({ message: 'No available cloud accounts' });
    }

    // 2. Create VM via Provider API
    const provider = CloudProviderFactory.create(cloudAccount.provider, cloudAccount.credentials);
    const remoteVM = await provider.createVM({
      name,
      region: region || cloudAccount.region,
      plan: planId,
      image,
    });

    // 3. Save to DB
    const vm = await prisma.vM.create({
      data: {
        name,
        providerId: remoteVM.id,
        plan: planId,
        region: remoteVM.region,
        ip: remoteVM.ip,
        userId,
        cloudAccountId: cloudAccount.id,
        provider: cloudAccount.provider,
        status: 'active',
      },
    });

    // 4. Update account usage
    await prisma.cloudAccount.update({
      where: { id: cloudAccount.id },
      data: { vmCount: { increment: 1 } },
    });

    res.status(201).json({ message: 'VM deployment started', vm });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to deploy VM', error: error.message });
  }
};

export const getMyVPS = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const vms = await prisma.vM.findMany({
      where: { userId },
      include: { 
        account: true,
        plan: {
          select: { name: true, priceMonthly: true }
        }
      },
    });
    res.json(vms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching VM list' });
  }
};

export const getVPSDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const vm = await prisma.vM.findFirst({
      where: { id: id as string, userId },
      include: { 
        account: true,
        plan: true
      },
    });

    if (!vm) {
      return res.status(404).json({ message: 'VM not found' });
    }

    res.json(vm);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching VM details' });
  }
};

export const vpsAction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // power_on, power_off, reboot
    const userId = (req as any).user.id;

    const vm = await prisma.vM.findFirst({
      where: { id: id as string, userId },
      include: { account: true },
    });

    if (!vm || !vm.providerId || !vm.account) {
      return res.status(404).json({ message: 'VM not found' });
    }

    const provider = CloudProviderFactory.create(vm.account.provider, vm.account.credentials);
    
    if (action === 'power_on') await provider.startVM(vm.providerId);
    else if (action === 'power_off') await provider.stopVM(vm.providerId);
    else if (action === 'reboot') await provider.restartVM(vm.providerId);
    else return res.status(400).json({ message: 'Invalid action' });
    
    res.json({ message: `Action ${action} initiated` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to perform action' });
  }
};
