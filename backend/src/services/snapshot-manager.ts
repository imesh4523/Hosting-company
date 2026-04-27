import axios from 'axios';
import prisma from '../config/prisma';

export class SnapshotManager {
  /**
   * Triggers a snapshot for a specific VPS
   */
  static async takeSnapshot(vpsId: string) {
    const vps = await prisma.vPS.findUnique({
      where: { id: vpsId },
      include: { account: true }
    });

    if (!vps) throw new Error('VPS not found');

    try {
      const response = await axios.post(
        `https://api.digitalocean.com/v2/droplets/${vps.dropletId}/actions`,
        {
          type: 'snapshot',
          name: `${vps.name}-auto-${Date.now()}`
        },
        { headers: { Authorization: `Bearer ${vps.account.apiKey}` } }
      );

      console.log(`Snapshot triggered for ${vps.name}: ${response.data.action.id}`);
      return response.data.action;
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
      // Logic to check if 6 hours passed since last snapshot
      await this.takeSnapshot(vps.id);
    }
  }
}
