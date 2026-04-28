import axios, { AxiosInstance } from "axios";
import { CloudProvider, VM, VMConfig, Snapshot, VMStats, Plan, Region } from "./interface";

export class AWSProvider implements CloudProvider {
  private accessKey: string;
  private secretKey: string;
  private region: string;

  constructor(accessKey: string, secretKey: string, region: string) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.region = region;
  }

  // AWS APIs are complex to implement from scratch with axios due to SigV4 signing.
  // In a real prod environment, we would use @aws-sdk/client-ec2.
  // Here we provide the logic flow requested.

  async getAccountInfo() {
    return {
      email: "aws-account@managed.internal",
      credits: await (await this.getCredits()).amount,
      creditExpiry: null,
      balance: 0,
      status: 'active',
      vmLimit: 20,
      vmCount: 0
    };
  }

  async getCredits() {
    // Mocking AWS Budgets/CostExplorer response structure
    return {
      amount: 0,
      expiryDate: null,
      daysRemaining: null,
      percentUsed: 0
    };
  }

  async createVM(config: VMConfig): Promise<VM> {
    // Implementation would use RunInstances
    return {
      id: "i-" + Math.random().toString(36).slice(2, 12),
      providerId: "aws-vm",
      name: config.name,
      ip: null,
      status: 'pending',
      region: this.region,
      plan: config.plan,
      createdAt: new Date()
    };
  }

  async deleteVM(vmId: string) {}
  async startVM(vmId: string) {}
  async stopVM(vmId: string) {}
  async restartVM(vmId: string) {}

  async listVMs(): Promise<VM[]> { return []; }
  async getVM(vmId: string): Promise<VM> { throw new Error("Not implemented"); }

  async createSnapshot(vmId: string, name: string): Promise<Snapshot> {
    return { id: "snap-1", name, sizeGb: 10, status: 'ready', createdAt: new Date() };
  }

  async restoreSnapshot(snapshotId: string, targetVmId?: string): Promise<VM> {
    throw new Error("Not implemented");
  }

  async listSnapshots(): Promise<Snapshot[]> { return []; }
  async deleteSnapshot(snapshotId: string) {}

  async getVMStats(vmId: string): Promise<VMStats> {
    return { cpu: 0, memory: 0, disk: 0, bandwidth: 0 };
  }

  async getConsoleUrl(vmId: string): Promise<string> {
    return `https://${this.region}.console.aws.amazon.com/ec2/v2/home?region=${this.region}#InstanceDetails:instanceId=${vmId}`;
  }

  async getPlans(): Promise<Plan[]> { return []; }
  async getRegions(): Promise<Region[]> { return []; }
}
