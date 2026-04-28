import prisma from '../config/prisma.js';
import { getDOClient } from './digitalocean.service.js';

export class SnapshotManager {
  /**
   * Triggers a snapshot for a specific VPS
   */
  static async takeSnapshot(vpsId: string) {
    const vps = await prisma.vPS.findUnique({
      where: { id: vpsId },
      include: { account: true }
    });

    if (!vps || !vps.account) throw new Error('VPS or account not found');

    try {
      const doClient = getDOClient(vps.account.apiKey);
      const snapName = `${vps.name}-auto-${Date.now()}`;
      const result = await doClient.createSnapshot(vps.dropletId, snapName);

      // Save snapshot to DB
      await prisma.dOSnapshot.create({
        data: {
          vpsId: vps.id,
          doAccountId: vps.account.id,
          userId: vps.userId,
          doSnapshotId: result.snapshot_id?.toString(),
          name: snapName,
          status: 'ready',
          type: 'auto'
        }
      });

      console.log(`Snapshot completed for ${vps.name}: ${result.snapshot_id}`);
      return result;
    } catch (error) {
      console.error(`Failed to take snapshot for ${vps.name}:`, error);
      throw error;
    }
  }

  /**
   * Schedules snapshots for all active VPS instances
   */
  static async runAutomatedBackups() {
    const activeVPS = await prisma.vPS.findMany({ where: { status: 'active' } });
    for (const vps of activeVPS) {
      await this.takeSnapshot(vps.id);
    }
  }
}
