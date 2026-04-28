import axios, { AxiosInstance } from "axios";

interface DODroplet {
  id: number; name: string; status: string;
  networks: { v4: { ip_address: string; type: string }[] };
  memory: number; vcpus: number; disk: number;
  created_at: string; size_slug: string; region: { slug: string };
}

interface DOSnapshotResult { id: number; name: string; size_gigabytes: number; regions: string[]; created_at: string; }

interface CreateDropletOpts {
  name: string; size: string; image: string | number;
  region: string; ssh_keys?: number[]; user_data?: string;
  tags?: string[];
}

export class DigitalOceanService {
  private api: AxiosInstance;

  constructor(apiKey: string) {
    this.api = axios.create({
      baseURL: "https://api.digitalocean.com/v2",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      timeout: 30000,
    });
  }

  // ─── Account ───────────────────────────────────────────────────────────────
  async getAccount() {
    const r = await this.api.get("/account");
    return r.data.account as {
      email: string; droplet_limit: number; status: string;
      floating_ip_limit: number; volume_limit: number;
    };
  }

  async testConnection(): Promise<{ ok: boolean; email?: string; dropletLimit?: number; error?: string }> {
    try {
      const acc = await this.getAccount();
      return { ok: true, email: acc.email, dropletLimit: acc.droplet_limit };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  // ─── Droplets ──────────────────────────────────────────────────────────────
  async listDroplets(): Promise<DODroplet[]> {
    const r = await this.api.get("/droplets?per_page=200");
    return r.data.droplets;
  }

  async getDroplet(id: string | number): Promise<DODroplet> {
    const r = await this.api.get(`/droplets/${id}`);
    return r.data.droplet;
  }

  async createDroplet(opts: CreateDropletOpts): Promise<DODroplet> {
    const r = await this.api.post("/droplets", opts);
    const id = r.data.droplet.id;
    // Wait until active
    return await this.waitForActive(id);
  }

  async deleteDroplet(id: string | number): Promise<void> {
    await this.api.delete(`/droplets/${id}`);
  }

  async powerOnDroplet(id: string | number): Promise<void> {
    await this.api.post(`/droplets/${id}/actions`, { type: "power_on" });
  }

  async powerOffDroplet(id: string | number): Promise<void> {
    await this.api.post(`/droplets/${id}/actions`, { type: "power_off" });
  }

  async rebootDroplet(id: string | number): Promise<void> {
    await this.api.post(`/droplets/${id}/actions`, { type: "reboot" });
  }

  private async waitForActive(id: number, maxMs = 300000): Promise<DODroplet> {
    const start = Date.now();
    while (Date.now() - start < maxMs) {
      await this.sleep(10000);
      const d = await this.getDroplet(id);
      if (d.status === "active" && d.networks.v4.length > 0) return d;
    }
    throw new Error(`Droplet ${id} did not become active within 5 minutes`);
  }

  // ─── Snapshots ─────────────────────────────────────────────────────────────
  async listSnapshots(): Promise<DOSnapshotResult[]> {
    const r = await this.api.get("/snapshots?resource_type=droplet&per_page=200");
    return r.data.snapshots;
  }

  async listDropletSnapshots(dropletId: string | number): Promise<DOSnapshotResult[]> {
    const r = await this.api.get(`/droplets/${dropletId}/snapshots`);
    return r.data.snapshots;
  }

  async createSnapshot(dropletId: string | number, name: string): Promise<{ action_id: number; snapshot_id?: number }> {
    // First power off for consistent snapshot
    await this.powerOffDroplet(dropletId);
    await this.sleep(15000);

    const r = await this.api.post(`/droplets/${dropletId}/actions`, { type: "snapshot", name });
    const actionId = r.data.action.id;

    // Wait for snapshot completion
    const snapshotId = await this.waitForSnapshot(dropletId, actionId);
    return { action_id: actionId, snapshot_id: snapshotId };
  }

  private async waitForSnapshot(dropletId: string | number, actionId: number, maxMs = 600000): Promise<number | undefined> {
    const start = Date.now();
    while (Date.now() - start < maxMs) {
      await this.sleep(15000);
      const r = await this.api.get(`/droplets/${dropletId}/actions/${actionId}`);
      if (r.data.action.status === "completed") {
        // Get latest snapshot
        const snaps = await this.listDropletSnapshots(dropletId);
        return snaps[snaps.length - 1]?.id;
      }
      if (r.data.action.status === "errored") throw new Error("Snapshot action errored");
    }
    throw new Error("Snapshot timed out after 10 minutes");
  }

  async transferSnapshot(snapshotId: number, toRegion: string): Promise<void> {
    await this.api.post(`/snapshots/${snapshotId}/actions`, {
      type: "transfer", region: toRegion,
    });
    // Wait for transfer
    await this.sleep(30000);
  }

  async deleteSnapshot(snapshotId: number): Promise<void> {
    await this.api.delete(`/snapshots/${snapshotId}`);
  }

  // ─── Account droplet count ─────────────────────────────────────────────────
  async getDropletCount(): Promise<number> {
    const r = await this.api.get("/droplets?per_page=1");
    return r.data.meta?.total ?? 0;
  }

  // ─── Get public IP from droplet ────────────────────────────────────────────
  static getPublicIP(droplet: DODroplet): string {
    return droplet.networks.v4.find(n => n.type === "public")?.ip_address ?? "";
  }

  private sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
}

// Factory — decrypts key and returns DO client
import crypto from "crypto";
const ENC_KEY = process.env.AES_ENCRYPTION_KEY ?? "";

export function decryptKey(enc: string): string {
  try {
    const [ivHex, encrypted] = enc.split(":");
    const iv  = Buffer.from(ivHex, "hex");
    const key = Buffer.from(ENC_KEY.slice(0, 64), "hex");
    const d   = crypto.createDecipheriv("aes-256-cbc", key, iv);
    return d.update(encrypted, "hex", "utf8") + d.final("utf8");
  } catch { return enc; } // fallback if not encrypted (dev mode)
}

export function getDOClient(encryptedApiKey: string): DigitalOceanService {
  return new DigitalOceanService(decryptKey(encryptedApiKey));
}
