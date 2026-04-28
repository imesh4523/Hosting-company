import prisma from '../config/prisma.js';
import { CloudProviderFactory } from '../lib/providers/factory.js';

export class SnapshotManager {
  /**
   * Triggers a snapshot for a specific VM
   */
  static async takeSnapshot(vmId: string) {
    const vm = await prisma.vM.findUnique({
      where: { id: vmId },
      include: { account: true }
    });

    if (!vm || !vm.account) throw new Error('VM or account not found');

    try {
      const provider = CloudProviderFactory.create(vm.account.provider, vm.account.credentials);
      const snapName = `${vm.name}-auto-${Date.now()}`;
      const snap = await provider.createSnapshot(vm.providerId!, snapName);

      // Save snapshot to DB
      await prisma.snapshot.create({
        data: {
          vmId: vm.id,
          cloudAccountId: vm.account.id,
          userId: vm.userId,
          providerSnapshotId: snap.id,
          name: snapName,
          status: 'ready',
          type: 'auto',
          sizeGb: snap.sizeGb
        }
      });

      console.log(`Snapshot completed for ${vm.name}: ${snap.id}`);
      return snap;
    } catch (error) {
      console.error(`Failed to take snapshot for ${vm.name}:`, error);
      throw error;
    }
  }

  /**
   * Schedules snapshots for all active VM instances
   */
  static async runAutomatedBackups() {
    const activeVMs = await prisma.vM.findMany({ where: { status: 'active' } });
    for (const vm of activeVMs) {
      await this.takeSnapshot(vm.id);
    }
  }
}
