import axios, { AxiosInstance } from "axios";
import { CloudProvider, VM, VMConfig, Snapshot, VMStats, Plan, Region } from "./interface";

export class UpCloudProvider implements CloudProvider {
  private api: AxiosInstance;

  constructor(username: string, password: string) {
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    this.api = axios.create({
      baseURL: "https://api.upcloud.com/1.3",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      timeout: 30000,
    });
  }

  async getAccountInfo() {
    const res = await this.api.get("/account");
    return {
      email: res.data.account.username,
      credits: res.data.account.credits / 100,
      creditExpiry: null,
      balance: res.data.account.credits / 100,
      status: 'active',
      vmLimit: 20,
      vmCount: 0
    };
  }

  async getCredits() {
    const info = await this.getAccountInfo();
    return {
      amount: info.credits,
      expiryDate: null,
      daysRemaining: null,
      percentUsed: 0
    };
  }

  async createVM(config: VMConfig): Promise<VM> {
    const res = await this.api.post("/server", {
      server: {
        zone: config.region,
        title: config.name,
        hostname: config.name.toLowerCase().replace(/ /g, '-'),
        plan: config.plan,
        storage_devices: {
          storage_device: [{ action: 'clone', storage: config.image || '01000000-0000-4000-8000-000030080200', title: 'OS Disk' }]
        }
      }
    });
    return this.mapVM(res.data.server);
  }

  async deleteVM(vmId: string) { await this.api.delete(`/server/${vmId}`); }
  async startVM(vmId: string) { await this.api.post(`/server/${vmId}/start`); }
  async stopVM(vmId: string) { await this.api.post(`/server/${vmId}/stop`); }
  async restartVM(vmId: string) { await this.api.post(`/server/${vmId}/restart`); }

  async listVMs(): Promise<VM[]> {
    const res = await this.api.get("/server");
    return res.data.servers.server.map((s: any) => this.mapVM(s));
  }

  async getVM(vmId: string): Promise<VM> {
    const res = await this.api.get(`/server/${vmId}`);
    return this.mapVM(res.data.server);
  }

  async createSnapshot(vmId: string, name: string): Promise<Snapshot> {
    const server = await this.api.get(`/server/${vmId}`);
    const storageId = server.data.server.storage_devices.storage_device[0].storage;
    const res = await this.api.post(`/storage/${storageId}/backup`, { backup: { title: name } });
    const snap = res.data.storage;
    return {
      id: snap.uuid,
      name: snap.title,
      sizeGb: snap.size,
      status: snap.state,
      createdAt: new Date(snap.created)
    };
  }

  async restoreSnapshot(snapshotId: string, targetVmId?: string): Promise<VM> {
    throw new Error("Restore requires specific storage replacement flow on UpCloud");
  }

  async listSnapshots(): Promise<Snapshot[]> {
    const res = await this.api.get("/storage/backup");
    return res.data.storages.storage.map((s: any) => ({
      id: s.uuid,
      name: s.title,
      sizeGb: s.size,
      status: s.state,
      createdAt: new Date(s.created)
    }));
  }

  async deleteSnapshot(snapshotId: string) { await this.api.delete(`/storage/${snapshotId}`); }

  async getVMStats(vmId: string): Promise<VMStats> {
    return { cpu: 0, memory: 0, disk: 0, bandwidth: 0 };
  }

  async getConsoleUrl(vmId: string): Promise<string> {
    return `https://hub.upcloud.com/servers/${vmId}/console`;
  }

  async getPlans(): Promise<Plan[]> {
    const res = await this.api.get("/plan");
    return res.data.plans.plan.map((p: any) => ({
      id: p.name,
      name: p.name,
      memory: p.memory_amount,
      vcpus: p.core_number,
      disk: p.storage_size,
      transfer: p.public_traffic_out,
      priceMonthly: 5 // Example, price not in plans API
    }));
  }

  async getRegions(): Promise<Region[]> {
    const res = await this.api.get("/zone");
    return res.data.zones.zone.map((z: any) => ({
      id: z.id,
      name: z.description,
      available: true
    }));
  }

  private mapVM(s: any): VM {
    return {
      id: s.uuid,
      providerId: s.uuid,
      name: s.title,
      ip: s.ip_addresses?.ip_address?.find((ip: any) => ip.access === 'public')?.address || null,
      status: s.state,
      region: s.zone,
      plan: s.plan,
      createdAt: new Date()
    };
  }
}
