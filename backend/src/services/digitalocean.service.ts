import axios from 'axios';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your_32_byte_secret_key_here_!!!'; // Must be 32 bytes
const IV_LENGTH = 16;

function decrypt(text: string) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export class DigitalOceanService {
  private static async getClient(apiKey: string) {
    return axios.create({
      baseURL: 'https://api.digitalocean.com/v2',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  static async createDroplet(apiKey: string, config: {
    name: string;
    region: string;
    size: string;
    image: string;
    backups?: boolean;
  }) {
    const client = await this.getClient(apiKey);
    const response = await client.post('/droplets', {
      name: config.name,
      region: config.region,
      size: config.size,
      image: config.image,
      backups: config.backups || false,
      monitoring: true,
    });
    return response.data.droplet;
  }

  static async getDropletStatus(apiKey: string, dropletId: string) {
    const client = await this.getClient(apiKey);
    const response = await client.get(`/droplets/${dropletId}`);
    return response.data.droplet;
  }

  static async performAction(apiKey: string, dropletId: string, action: 'power_on' | 'power_off' | 'reboot' | 'rebuild', params?: any) {
    const client = await this.getClient(apiKey);
    const response = await client.post(`/droplets/${dropletId}/actions`, {
      type: action,
      ...params
    });
    return response.data.action;
  }

  static async getSnapshots(apiKey: string, dropletId: string) {
    const client = await this.getClient(apiKey);
    const response = await client.get(`/droplets/${dropletId}/snapshots`);
    return response.data.snapshots;
  }
}
