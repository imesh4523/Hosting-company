import axios from 'axios';
import prisma from '../config/prisma';


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
    const accounts = await prisma.digitalOceanAccount.findMany({ where: { isActive: true } });
    
    for (const account of accounts) {
      try {
        const info = await this.validateKey(account.apiKey);
        await prisma.digitalOceanAccount.update({
          where: { id: account.id },
          data: {
            limit: info.droplet_limit,
            isActive: info.status === 'active'
          }
        });
      } catch (error) {
        // Mark as suspended if API call fails (likely key revoked or account suspended)
        await prisma.digitalOceanAccount.update({
          where: { id: account.id },
          data: { isActive: false }
        });
        console.error(`Account ${account.name} suspended or key invalid.`);
      }
    }
  }

  /**
   * Returns the best account to provision a new VPS (Least Loaded)
   */
  static async getBestAccount() {
    const account = await prisma.digitalOceanAccount.findFirst({
      where: { isActive: true },
      orderBy: { usage: 'asc' }
    });
    
    if (!account) throw new Error('No active DigitalOcean accounts available.');
    return account;
  }
}
