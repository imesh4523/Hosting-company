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
    const accounts = await prisma.dOAccount.findMany({ where: { status: 'active' } });
    
    for (const account of accounts) {
      try {
        const info = await this.validateKey(account.apiKey);
        await prisma.dOAccount.update({
          where: { id: account.id },
          data: {
            dropletLimit: info.droplet_limit,
            status: info.status === 'active' ? 'active' : 'suspended',
            lastChecked: new Date()
          }
        });
      } catch (error) {
        // Mark as suspended if API call fails (likely key revoked or account suspended)
        await prisma.dOAccount.update({
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
    const account = await prisma.dOAccount.findFirst({
      where: { status: 'active' },
      orderBy: { dropletCount: 'asc' }
    });
    
    if (!account) throw new Error('No active DigitalOcean accounts available.');
    return account;
  }
}
