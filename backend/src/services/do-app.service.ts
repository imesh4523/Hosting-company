import axios from 'axios';
import { DetectedConfig } from './framework-detector.service.js';

export interface DeployConfig extends DetectedConfig {
  appName: string;
  repoPath: string; // "username/repo"
  branch: string;
  region?: string;
  envVars?: { key: string, value: string, secret?: boolean }[];
  dbUrl?: string;
}

export class DOAppPlatformService {
  private baseUrl = 'https://api.digitalocean.com/v2/apps';

  constructor(private apiKey: string) {}

  async deployApp(config: DeployConfig): Promise<any> {
    const appSpec = this.buildAppSpec(config);
    
    try {
      const response = await axios.post(
        this.baseUrl,
        { spec: appSpec },
        { 
          headers: { 
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.app;
    } catch (error: any) {
      console.error('DO Deploy Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to deploy to DigitalOcean');
    }
  }

  private buildAppSpec(config: DeployConfig) {
    const spec: any = {
      name: config.appName,
      region: config.region || 'sgp',
    };

    const commonProps = {
      name: 'app',
      github: {
        repo: config.repoPath,
        branch: config.branch,
        deploy_on_push: true
      },
      instance_count: 1,
      instance_size_slug: 'basic-xxs',
      envs: config.envVars?.map(e => ({
        key: e.key,
        value: e.value,
        type: e.secret ? 'SECRET' : 'GENERAL'
      })) || []
    };

    // Add DB URL if exists
    if (config.dbUrl) {
      commonProps.envs.push({
        key: 'DATABASE_URL',
        value: config.dbUrl,
        type: 'SECRET'
      });
    }

    // Docker app
    if (config.framework === 'docker') {
      spec.services = [{
        ...commonProps,
        source_dir: '/',
        dockerfile_path: 'Dockerfile',
        http_port: config.port
      }];
    }
    
    // Static site (React/Vite)
    else if (config.outputDir) {
      spec.static_sites = [{
        name: 'app',
        github: commonProps.github,
        build_command: config.buildCommand,
        output_dir: config.outputDir
      }];
    }
    
    // Service (Node/Python/etc)
    else {
      spec.services = [{
        ...commonProps,
        build_command: config.buildCommand,
        run_command: config.runCommand,
        http_port: config.port
      }];
    }

    return spec;
  }

  async getDeploymentLogs(appId: string, deploymentId: string): Promise<string> {
    try {
      const res = await axios.get(
        `${this.baseUrl}/${appId}/deployments/${deploymentId}/logs`,
        { headers: { Authorization: `Bearer ${this.apiKey}` }}
      );
      return res.data.historic_urls?.[0] || '';
    } catch (error) {
      return '';
    }
  }

  async getDeploymentStatus(appId: string, deploymentId: string) {
    const res = await axios.get(
      `${this.baseUrl}/${appId}/deployments/${deploymentId}`,
      { headers: { Authorization: `Bearer ${this.apiKey}` }}
    );
    return res.data.deployment;
  }

  async getApp(appId: string): Promise<any> {
    const res = await axios.get(
      `${this.baseUrl}/${appId}`,
      { headers: { Authorization: `Bearer ${this.apiKey}` }}
    );
    return res.data.app;
  }

  async addDomain(appId: string, domain: string) {
    await axios.post(
      `${this.baseUrl}/${appId}/domains`,
      { domain: { domain, type: 'PRIMARY' }},
      { headers: { Authorization: `Bearer ${this.apiKey}` }}
    );
  }
}
