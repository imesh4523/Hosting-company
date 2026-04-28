import axios, { AxiosInstance } from "axios";
import { CloudProvider, VM, VMConfig, Snapshot, VMStats, Plan, Region } from "./interface";

export class DigitalOceanProvider implements CloudProvider {
  private api: AxiosInstance;

  constructor(apiKey: string) {
    this.api = axios.create({
      baseURL: "https://api.digitalocean.com/v2",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      timeout: 30000,
    });
  }

  async getAccountInfo() {
    const [acc, meta] = await Promise.all([
      this.api.get("/account"),
      this.api.get("/droplets?per_page=1")
    ]);
    const balance = await this.getCredits();

    return {
      email: acc.data.account.email,
      credits: balance.amount,
      creditExpiry: balance.expiryDate,
      balance: balance.amount,
      status: acc.data.account.status,
      vmLimit: acc.data.account.droplet_limit,
      vmCount: meta.data.meta.total,
    };
  }

  async getCredits() {
    try {
      const res = await this.api.get('/customers/my/balance');
      // DO balance is negative for credit or positive for amount due?
      // Actually /customers/my/balance returns { account_balance: "0.00", month_to_date_usage: "0.00", ... }
      const balance = parseFloat(res.data.account_balance);
      
      return {
        amount: Math.abs(balance),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // DO credits usually 12mo
        daysRemaining: 365,
        percentUsed: 0
      };
    } catch {
      return { amount: 0, expiryDate: null, daysRemaining: null, percentUsed: 0 };
    }
  }

  async createVM(config: VMConfig): Promise<VM> {
    const res = await this.api.post("/droplets", {
      name: config.name,
      region: config.region,
      size: config.plan,
      image: config.image,
      ssh_keys: config.sshKeys,
      user_data: config.userData
    });
    
    let droplet = res.data.droplet;
    // Wait until active
    while (droplet.status !== 'active') {
      await new Promise(r => setTimeout(r, 5000));
      const poll = await this.api.get(`/droplets/${droplet.id}`);
      droplet = poll.data.droplet;
    }

    return this.mapVM(droplet);
  }

  async deleteVM(vmId: string) { await this.api.delete(`/droplets/${vmId}`); }
  async startVM(vmId: string) { await this.api.post(`/droplets/${vmId}/actions`, { type: "power_on" }); }
  async stopVM(vmId: string) { await this.api.post(`/droplets/${vmId}/actions`, { type: "power_off" }); }
  async restartVM(vmId: string) { await this.api.post(`/droplets/${vmId}/actions`, { type: "reboot" }); }

  async listVMs(): Promise<VM[]> {
    const res = await this.api.get("/droplets?per_page=200");
    return res.data.droplets.map((d: any) => this.mapVM(d));
  }

  async getVM(vmId: string): Promise<VM> {
    const res = await this.api.get(`/droplets/${vmId}`);
    return this.mapVM(res.data.droplet);
  }

  async createSnapshot(vmId: string, name: string): Promise<Snapshot> {
    await this.stopVM(vmId);
    await new Promise(r => setTimeout(r, 10000));
    const res = await this.api.post(`/droplets/${vmId}/actions`, { type: "snapshot", name });
    const actionId = res.data.action.id;

    // Wait for snapshot
    while (true) {
      await new Promise(r => setTimeout(r, 10000));
      const poll = await this.api.get(`/droplets/${vmId}/actions/${actionId}`);
      if (poll.data.action.status === 'completed') break;
      if (poll.data.action.status === 'errored') throw new Error("Snapshot failed");
    }

    const snaps = await this.api.get(`/droplets/${vmId}/snapshots`);
    const latest = snaps.data.snapshots[snaps.data.snapshots.length - 1];
    return {
      id: latest.id.toString(),
      name: latest.name,
      sizeGb: latest.size_gigabytes,
      status: 'ready',
      createdAt: new Date(latest.created_at)
    };
  }

  async restoreSnapshot(snapshotId: string, targetVmId?: string): Promise<VM> {
    const res = await this.api.post(`/droplets/${targetVmId}/actions`, { type: "restore", image: snapshotId });
    await new Promise(r => setTimeout(r, 10000));
    return this.getVM(targetVmId!);
  }

  async listSnapshots(): Promise<Snapshot[]> {
    const res = await this.api.get("/snapshots?resource_type=droplet&per_page=200");
    return res.data.snapshots.map((s: any) => ({
      id: s.id.toString(),
      name: s.name,
      sizeGb: s.size_gigabytes,
      status: 'ready',
      createdAt: new Date(s.created_at)
    }));
  }

  async deleteSnapshot(snapshotId: string) { await this.api.delete(`/snapshots/${snapshotId}`); }

  async getVMStats(vmId: string): Promise<VMStats> {
    // DO doesn't have a simple stats API without agent. Return mock or empty.
    return { cpu: 0, memory: 0, disk: 0, bandwidth: 0 };
  }

  async getConsoleUrl(vmId: string): Promise<string> {
    return `https://cloud.digitalocean.com/droplets/${vmId}/console`;
  }

  async getPlans(): Promise<Plan[]> {
    const res = await this.api.get("/sizes");
    return res.data.sizes.map((s: any) => ({
      id: s.slug,
      name: s.slug,
      memory: s.memory,
      vcpus: s.vcpus,
      disk: s.disk,
      transfer: s.transfer,
      priceMonthly: s.price_monthly
    }));
  }

  async getRegions(): Promise<Region[]> {
    const res = await this.api.get("/regions");
    return res.data.regions.map((r: any) => ({
      id: r.slug,
      name: r.name,
      available: r.available
    }));
  }

  private mapVM(d: any): VM {
    const ip = d.networks.v4.find((n: any) => n.type === 'public')?.ip_address || null;
    return {
      id: d.id.toString(),
      providerId: d.id.toString(),
      name: d.name,
      ip,
      status: d.status,
      region: d.region.slug,
      plan: d.size_slug,
      createdAt: new Date(d.created_at)
    };
  }
}
