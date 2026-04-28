import prisma from '../config/prisma.js';
import { CloudProviderFactory } from '../lib/providers/factory.js';

export class HealthMonitor {
  /**
   * Performs heartbeat checks on all VMs
   */
  static async checkVMs() {
    const vmList = await prisma.vM.findMany({ include: { account: true } });

    for (const vm of vmList) {
      if (!vm.account) continue;
      try {
        const provider = CloudProviderFactory.create(vm.account.provider, vm.account.credentials);
        const remoteVM = await provider.getVM(vm.providerId!);

        if (remoteVM.status === 'active' && vm.status !== 'active') {
          await prisma.vM.update({ where: { id: vm.id }, data: { status: 'active' } });
        }
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // VM is missing or account suspended
          console.warn(`VM ${vm.name} is missing! Initiating recovery...`);
          await this.initiateRecovery(vm.id);
        }
      }
    }
  }

  /**
   * Automated Recovery Logic
   */
  static async initiateRecovery(vmId: string) {
    const vm = await prisma.vM.findUnique({
      where: { id: vmId },
      include: { snapshots: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    if (!vm || vm.snapshots.length === 0) {
      console.error(`Recovery failed for ${vmId}: No snapshots available.`);
      return;
    }

    const latestSnapshot = vm.snapshots[0];
    if (!latestSnapshot) return;
    
    // Log recovery start
    await prisma.recoveryLog.create({
      data: {
        vpsId: vm.id,
        action: 'snapshot_restore',
        status: 'in_progress',
        message: `Restoring from snapshot ${latestSnapshot.providerSnapshotId}`
      }
    });

    try {
      console.log(`Restoring ${vm.name} from snapshot ${latestSnapshot.providerSnapshotId}...`);
      
      // Logic would be to deploy a new VM from snapshot
      // ...
      
      // Update log on success
      await prisma.recoveryLog.create({
        data: {
          vpsId: vm.id,
          action: 'snapshot_restore',
          status: 'success',
          message: 'Restored successfully'
        }
      });
    } catch (err: any) {
      await prisma.recoveryLog.create({
        data: {
          vpsId: vm.id,
          action: 'snapshot_restore',
          status: 'failed',
          message: err.message
        }
      });
    }
  }
}
