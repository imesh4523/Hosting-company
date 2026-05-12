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

    // 3. Save to DB using the correct model VPSInstance
    const vm = await (prisma as any).vPSInstance.create({
      data: {
        name,
        hostname: name,
        providerId: remoteVM.id.toString(),
        plan: planId,
        ram: 2048, // Default or from plan
        cpu: 1,
        disk: 50,
        bandwidth: 1000,
        price: 10,
        hourlyPrice: 0.015,
        region: remoteVM.region || region,
        ip: remoteVM.ip || '0.0.0.0',
        userId,
        cloudAccountId: cloudAccount.id,
        status: 'active',
        password: 'root', // Should be encrypted
        rootPassword: 'root',
      },
    });

    // 4. Update account usage
    await prisma.cloudAccount.update({
      where: { id: cloudAccount.id },
      data: { vmCount: { increment: 1 } },
    });

    res.status(201).json({ message: 'VM deployment started', vm });
  } catch (error: any) {
    console.error('Deploy error:', error);
    res.status(500).json({ message: 'Failed to deploy VM', error: error.message });
  }
};

export const getMyVPS = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const instances = await (prisma as any).vPSInstance.findMany({
      where: { userId },
      include: { 
        CloudAccount: true
      },
    });

    // Map to frontend structure (Frontend expects plan.name and plan.priceMonthly)
    const vms = instances.map((vps: any) => ({
      ...vps,
      plan: {
        name: vps.plan,
        priceMonthly: vps.price
      }
    }));

    res.json(vms);
  } catch (error: any) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Error fetching VM list', error: error.message });
  }
};

export const getVPSDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const vm = await (prisma as any).vPSInstance.findFirst({
      where: { id: id as string, userId },
      include: { 
        CloudAccount: true
      },
    });

    if (!vm) {
      return res.status(404).json({ message: 'VM not found' });
    }

    // Map to frontend structure
    const mappedVm = {
      ...vm,
      plan: {
        name: vm.plan,
        priceMonthly: vm.price
      }
    };

    res.json(mappedVm);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching VM details' });
  }
};

export const vpsAction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // power_on, power_off, reboot
    const userId = (req as any).user.id;

    const vm = await (prisma as any).vPSInstance.findFirst({
      where: { id: id as string, userId },
      include: { CloudAccount: true },
    });

    if (!vm || !vm.providerId || !vm.CloudAccount) {
      return res.status(404).json({ message: 'VM not found' });
    }

    const provider = CloudProviderFactory.create(vm.CloudAccount.provider, vm.CloudAccount.credentials);
    
    if (action === 'power_on') await provider.startVM(vm.providerId);
    else if (action === 'power_off') await provider.stopVM(vm.providerId);
    else if (action === 'reboot') await provider.restartVM(vm.providerId);
    else return res.status(400).json({ message: 'Invalid action' });
    
    res.json({ message: `Action ${action} initiated` });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to perform action', error: error.message });
  }
};
