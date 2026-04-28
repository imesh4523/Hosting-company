import axios from 'axios';
import prisma from '../config/prisma.js';

export class SubdomainService {
  private cfApi = 'https://api.cloudflare.com/client/v4';
  private zoneId = process.env.CF_ZONE_ID;
  private apiToken = process.env.CF_API_TOKEN;
  private domain = process.env.ROOT_DOMAIN || 'yourdomain.com';

  async createSubdomain(appName: string, userId: string, doAppUrl: string, appId: string): Promise<string> {
    if (!this.apiToken || !this.zoneId) {
      console.warn('Cloudflare credentials missing. Skipping subdomain creation.');
      return doAppUrl;
    }

    // Generate subdomain slug
    const slug = `${appName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${userId.slice(0, 6)}`;
    const fullDomain = `${slug}.${this.domain}`;
    
    try {
      // Cloudflare API - Create CNAME record
      await axios.post(
        `${this.cfApi}/zones/${this.zoneId}/dns_records`,
        {
          type: 'CNAME',
          name: slug,
          content: doAppUrl.replace('https://', '').replace(/\/$/, ''),
          proxied: true // Enable Cloudflare proxy for SSL
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Save to DB
      await prisma.subDomain.create({
        data: {
          appId: appId,
          subdomain: slug,
          fullUrl: `https://${fullDomain}`,
          sslActive: true
        }
      });
      
      return `https://${fullDomain}`;
    } catch (error: any) {
      console.error('Cloudflare Error:', error.response?.data || error.message);
      return doAppUrl; // Fallback to DO URL
    }
  }
}
