import { CloudProvider } from "./interface";
import { DigitalOceanProvider } from "./digitalocean";
import { VultrProvider } from "./vultr";
import { LinodeProvider } from "./linode";
import { AWSProvider } from "./aws";
import { UpCloudProvider } from "./upcloud";

export class CloudProviderFactory {
  static create(provider: string, credentials: any): CloudProvider {
    switch (provider.toLowerCase()) {
      case 'digitalocean':
        return new DigitalOceanProvider(credentials.apiKey);
      case 'vultr':
        return new VultrProvider(credentials.apiKey);
      case 'linode':
        return new LinodeProvider(credentials.token);
      case 'aws':
        return new AWSProvider(credentials.accessKey, credentials.secretKey, credentials.region || 'us-east-1');
      case 'upcloud':
        return new UpCloudProvider(credentials.username, credentials.password);
      default:
        // Fallback for others or mock
        return new DigitalOceanProvider(credentials.apiKey || '');
    }
  }
}
