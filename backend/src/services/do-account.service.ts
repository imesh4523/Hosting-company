import axios from 'axios';
import prisma from '../config/prisma.js';

export class DOAccountService {
  /**
   * Validates a DigitalOcean API key and returns account info
   */
  static async validateKey(apiKey: string) {
    try {
      const response = await axios.get('https://api.digitalocean.com/v2/account', {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      return response.data.account;
    } catch (error) {
      throw new Error('Invalid DigitalOcean API key');
    }
  }

  /**
   * Checks the health and limits of all registered accounts
   */
  static async syncAccountHealth() {
    const accounts = await prisma.cloudAccount.findMany({ where: { provider: 'digitalocean', status: 'active' } });
    
    for (const account of accounts) {
      try {
        const info = await this.validateKey((account.credentials as any).apiKey);
        await prisma.cloudAccount.update({
          where: { id: account.id },
          data: {
            vmLimit: info.droplet_limit,
            status: info.status === 'active' ? 'active' : 'suspended',
            lastChecked: new Date()
          }
        });
      } catch (error) {
        // Mark as suspended if API call fails (likely key revoked or account suspended)
        await prisma.cloudAccount.update({
          where: { id: account.id },
          data: { status: 'suspended', suspendReason: 'API Validation Failed' }
        });
        console.error(`Account ${account.name} suspended or key invalid.`);
      }
    }
  }

  /**
   * Returns the best account to provision a new VPS (Least Loaded)
   */
  static async getBestAccount() {
    const account = await prisma.cloudAccount.findFirst({
      where: { provider: 'digitalocean', status: 'active' },
      orderBy: { vmCount: 'asc' }
    });
    
    if (!account) throw new Error('No active DigitalOcean accounts available.');
    return account;
  }
}
