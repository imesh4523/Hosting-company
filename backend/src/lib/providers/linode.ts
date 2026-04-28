import axios, { AxiosInstance } from "axios";
import { CloudProvider, VM, VMConfig, Snapshot, VMStats, Plan, Region } from "./interface";

export class LinodeProvider implements CloudProvider {
  private api: AxiosInstance;

  constructor(token: string) {
    this.api = axios.create({
      baseURL: "https://api.linode.com/v4",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      timeout: 30000,
    });
  }

  async getAccountInfo() {
    const res = await this.api.get("/account");
    const credits = await this.getCredits();
    return {
      email: res.data.email,
      credits: credits.amount,
      creditExpiry: credits.expiryDate,
      balance: res.data.balance,
      status: 'active',
      vmLimit: 100,
      vmCount: 0
    };
  }

  async getCredits() {
    const res = await this.api.get("/account");
    // Linode balance is negative for credit
    return {
      amount: res.data.balance < 0 ? Math.abs(res.data.balance) : 0,
      expiryDate: null,
      daysRemaining: null,
      percentUsed: 0
    };
  }

  async createVM(config: VMConfig): Promise<VM> {
    const res = await this.api.post("/linode/instances", {
      region: config.region,
      type: config.plan,
      label: config.name,
      image: config.image || "linode/ubuntu22.04",
      root_pass: Math.random().toString(36).slice(-10) + "A1!",
      booted: true
    });
    return this.mapVM(res.data);
  }

  async deleteVM(vmId: string) { await this.api.delete(`/linode/instances/${vmId}`); }
  async startVM(vmId: string) { await this.api.post(`/linode/instances/${vmId}/boot`); }
  async stopVM(vmId: string) { await this.api.post(`/linode/instances/${vmId}/shutdown`); }
  async restartVM(vmId: string) { await this.api.post(`/linode/instances/${vmId}/reboot`); }

  async listVMs(): Promise<VM[]> {
    const res = await this.api.get("/linode/instances");
    return res.data.data.map((i: any) => this.mapVM(i));
  }

  async getVM(vmId: string): Promise<VM> {
    const res = await this.api.get(`/linode/instances/${vmId}`);
    return this.mapVM(res.data);
  }

  async createSnapshot(vmId: string, name: string): Promise<Snapshot> {
    const res = await this.api.post(`/linode/instances/${vmId}/backups`, { label: name });
    return {
      id: res.data.id.toString(),
      name: res.data.label,
      sizeGb: 0,
      status: 'ready',
      createdAt: new Date()
    };
  }

  async restoreSnapshot(snapshotId: string, targetVmId?: string): Promise<VM> {
    await this.api.post(`/linode/instances/${targetVmId}/backups/${snapshotId}/restore`, { overwrite: true });
    return this.getVM(targetVmId!);
  }

  async listSnapshots(): Promise<Snapshot[]> {
    const res = await this.api.get("/linode/images?filter=" + JSON.stringify({ "type": "manual" }));
    return res.data.data.map((s: any) => ({
      id: s.id,
      name: s.label,
      sizeGb: s.size,
      status: 'ready',
      createdAt: new Date(s.created)
    }));
  }

  async deleteSnapshot(snapshotId: string) { await this.api.delete(`/images/${snapshotId}`); }

  async getVMStats(vmId: string): Promise<VMStats> {
    return { cpu: 0, memory: 0, disk: 0, bandwidth: 0 };
  }

  async getConsoleUrl(vmId: string): Promise<string> {
    return `https://cloud.linode.com/linodes/${vmId}/lish`;
  }

  async getPlans(): Promise<Plan[]> {
    const res = await this.api.get("/linode/types");
    return res.data.data.map((t: any) => ({
      id: t.id,
      name: t.label,
      memory: t.memory,
      vcpus: t.vcpus,
      disk: t.disk,
      transfer: t.transfer,
      priceMonthly: t.price.monthly
    }));
  }

  async getRegions(): Promise<Region[]> {
    const res = await this.api.get("/regions");
    return res.data.data.map((r: any) => ({
      id: r.id,
      name: r.label,
      available: r.status === 'ok'
    }));
  }

  private mapVM(i: any): VM {
    return {
      id: i.id.toString(),
      providerId: i.id.toString(),
      name: i.label,
      ip: i.ipv4[0] || null,
      status: i.status,
      region: i.region,
      plan: i.type,
      createdAt: new Date(i.created)
    };
  }
}
