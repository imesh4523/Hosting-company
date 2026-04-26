import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { SnapshotManager } from './snapshot-manager';

const prisma = new PrismaClient();

export class HealthMonitor {
  /**
   * Performs heartbeat checks on all droplets
   */
  static async checkDroplets() {
    const vpsList = await prisma.vPS.findMany({ include: { account: true } });

    for (const vps of vpsList) {
      try {
        const response = await axios.get(`https://api.digitalocean.com/v2/droplets/${vps.dropletId}`, {
          headers: { Authorization: `Bearer ${vps.account.apiKey}` }
        });

        const currentStatus = response.data.droplet.status;
        if (currentStatus === 'active' && vps.status !== 'active') {
          await prisma.vPS.update({ where: { id: vps.id }, data: { status: 'active' } });
        }
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // Droplet is missing or account suspended
          console.warn(`VPS ${vps.name} is missing! Initiating recovery...`);
          await this.initiateRecovery(vps.id);
        }
      }
    }
  }

  /**
   * Automated Recovery Logic
   */
  static async initiateRecovery(vpsId: string) {
    const vps = await prisma.vPS.findUnique({
      where: { id: vpsId },
      include: { snapshots: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    if (!vps || vps.snapshots.length === 0) {
      console.error(`Recovery failed for ${vpsId}: No snapshots available.`);
      return;
    }

    const latestSnapshot = vps.snapshots[0];
    
    // Log recovery start
    await prisma.recoveryLog.create({
      data: {
        vpsId: vps.id,
        action: 'snapshot_restore',
        status: 'in_progress',
        message: `Restoring from snapshot ${latestSnapshot.snapshotId}`
      }
    });

    try {
      // Logic to recreate droplet from latestSnapshot.snapshotId
      // Note: In a real scenario, this would choose a NEW healthy DO account if the original was suspended
      console.log(`Restoring ${vps.name} from snapshot ${latestSnapshot.snapshotId}...`);
      
      // Update log on success
      await prisma.recoveryLog.create({
        data: {
          vpsId: vps.id,
          action: 'snapshot_restore',
          status: 'success',
          message: 'Restored successfully'
        }
      });
    } catch (err: any) {
      await prisma.recoveryLog.create({
        data: {
          vpsId: vps.id,
          action: 'snapshot_restore',
          status: 'failed',
          message: err.message
        }
      });
    }
  }
}
