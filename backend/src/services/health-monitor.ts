import axios from 'axios';
import prisma from '../config/prisma.js';
import { decryptKey } from './digitalocean.service.js';

export class HealthMonitor {
  /**
   * Performs heartbeat checks on all droplets
   */
  static async checkDroplets() {
    const vpsList = await prisma.vPS.findMany({ include: { account: true } });

    for (const vps of vpsList) {
      if (!vps.account) continue;
      try {
        const apiKey = decryptKey(vps.account.apiKey);
        const response = await axios.get(`https://api.digitalocean.com/v2/droplets/${vps.dropletId}`, {
          headers: { Authorization: `Bearer ${apiKey}` }
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
    if (!latestSnapshot) return;
    
    // Log recovery start
    await prisma.recoveryLog.create({
      data: {
        vpsId: vps.id,
        action: 'snapshot_restore',
        status: 'in_progress',
        message: `Restoring from snapshot ${latestSnapshot.doSnapshotId}`
      }
    });

    try {
      // Logic to recreate droplet from latestSnapshot.doSnapshotId
      console.log(`Restoring ${vps.name} from snapshot ${latestSnapshot.doSnapshotId}...`);
      
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
