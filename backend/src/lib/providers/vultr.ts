import axios, { AxiosInstance } from "axios";
import { CloudProvider, VM, VMConfig, Snapshot, VMStats, Plan, Region } from "./interface";

export class VultrProvider implements CloudProvider {
  private api: AxiosInstance;

  constructor(apiKey: string) {
    this.api = axios.create({
      baseURL: "https://api.vultr.com/v2",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      timeout: 30000,
    });
  }

  async getAccountInfo() {
    const res = await this.api.get("/account");
    const credits = await this.getCredits();
    return {
      email: res.data.account.email,
      credits: credits.amount,
      creditExpiry: null,
      balance: parseFloat(res.data.account.balance),
      status: 'active',
      vmLimit: 10, // Vultr doesn't expose this easily in /account
      vmCount: 0   // Need to list
    };
  }

  async getCredits() {
    const res = await this.api.get("/account");
    return {
      amount: Math.abs(parseFloat(res.data.account.balance)),
      expiryDate: null,
      daysRemaining: null,
      percentUsed: 0
    };
  }

  async createVM(config: VMConfig): Promise<VM> {
    const res = await this.api.post("/instances", {
      region: config.region,
      plan: config.plan,
      label: config.name,
      os_id: 387, // Ubuntu 22.04 example
      user_data: config.userData ? Buffer.from(config.userData).toString('base64') : undefined
    });
    const instance = res.data.instance;
    return this.mapVM(instance);
  }

  async deleteVM(vmId: string) { await this.api.delete(`/instances/${vmId}`); }
  async startVM(vmId: string) { await this.api.post(`/instances/${vmId}/start`); }
  async stopVM(vmId: string) { await this.api.post(`/instances/${vmId}/halt`); }
  async restartVM(vmId: string) { await this.api.post(`/instances/${vmId}/reboot`); }

  async listVMs(): Promise<VM[]> {
    const res = await this.api.get("/instances");
    return res.data.instances.map((i: any) => this.mapVM(i));
  }

  async getVM(vmId: string): Promise<VM> {
    const res = await this.api.get(`/instances/${vmId}`);
    return this.mapVM(res.data.instance);
  }

  async createSnapshot(vmId: string, name: string): Promise<Snapshot> {
    const res = await this.api.post("/snapshots", { instance_id: vmId, description: name });
    const snap = res.data.snapshot;
    return {
      id: snap.id,
      name: snap.description,
      sizeGb: snap.size / (1024 * 1024 * 1024),
      status: snap.status,
      createdAt: new Date(snap.date_created)
    };
  }

  async restoreSnapshot(snapshotId: string, targetVmId?: string): Promise<VM> {
    await this.api.post(`/instances/${targetVmId}/restore`, { snapshot_id: snapshotId });
    return this.getVM(targetVmId!);
  }

  async listSnapshots(): Promise<Snapshot[]> {
    const res = await this.api.get("/snapshots");
    return res.data.snapshots.map((s: any) => ({
      id: s.id,
      name: s.description,
      sizeGb: s.size / (1024 * 1024 * 1024),
      status: s.status,
      createdAt: new Date(s.date_created)
    }));
  }

  async deleteSnapshot(snapshotId: string) { await this.api.delete(`/snapshots/${snapshotId}`); }

  async getVMStats(vmId: string): Promise<VMStats> {
    return { cpu: 0, memory: 0, disk: 0, bandwidth: 0 };
  }

  async getConsoleUrl(vmId: string): Promise<string> {
    return `https://my.vultr.com/subs/setup/manage/${vmId}`;
  }

  async getPlans(): Promise<Plan[]> {
    const res = await this.api.get("/plans");
    return res.data.plans.map((p: any) => ({
      id: p.id,
      name: p.id,
      memory: p.ram,
      vcpus: p.vcpu_count,
      disk: p.disk,
      transfer: p.bandwidth,
      priceMonthly: p.monthly_cost
    }));
  }

  async getRegions(): Promise<Region[]> {
    const res = await this.api.get("/regions");
    return res.data.regions.map((r: any) => ({
      id: r.id,
      name: r.city,
      available: true
    }));
  }

  private mapVM(i: any): VM {
    return {
      id: i.id,
      providerId: i.id,
      name: i.label,
      ip: i.main_ip || null,
      status: i.status,
      region: i.region,
      plan: i.plan,
      createdAt: new Date(i.date_created)
    };
  }
}
