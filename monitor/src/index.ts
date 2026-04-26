import cron from 'node-cron';
import prisma from '../backend/src/config/prisma';
import { DigitalOceanService } from '../backend/src/services/digitalocean.service';
import axios from 'axios';

// Heartbeat check every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Running VPS health checks...');
  
  const activeVPS = await prisma.vps.findMany({
    where: { status: 'RUNNING' },
    include: { doAccount: true }
  });

  for (const vps of activeVPS) {
    if (!vps.ipAddress || !vps.dropletId) continue;

    try {
      // Check if IP is pingable (simple HTTP check for now)
      await axios.get(`http://${vps.ipAddress}`, { timeout: 5000 });
      console.log(`VPS ${vps.name} is healthy.`);
    } catch (error) {
      console.warn(`VPS ${vps.name} is unreachable! Checking DO status...`);
      
      const droplet = await DigitalOceanService.getDropletStatus(vps.doAccount.apiKey, vps.dropletId);
      
      if (droplet.status !== 'active') {
        console.error(`VPS ${vps.name} is down in DigitalOcean. Triggering failover...`);
        // Trigger Failover Logic here
      }
    }
  }
});
