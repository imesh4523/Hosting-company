import axios, { AxiosInstance } from "axios";
import https from "https";

interface ProxmoxAuth {
  ticket: string;
  csrf: string;
}

interface VMConfig {
  vmId: number;
  hostname: string;
  ram: number;      // MB
  cpu: number;
  disk: number;     // GB
  rootPassword: string;
  osTemplate?: string;
  node?: string;
}

export class ProxmoxService {
  private host: string;
  private user: string;
  private password: string;
  private node: string;
  private api: AxiosInstance;
  private auth: ProxmoxAuth | null = null;
  private authExpiry: number = 0;

  constructor(host?: string, user?: string, password?: string, node?: string) {
    this.host     = host     ?? process.env.PROXMOX_HOST     ?? "";
    this.user     = user     ?? process.env.PROXMOX_USER     ?? "root@pam";
    this.password = password ?? process.env.PROXMOX_PASSWORD ?? "";
    this.node     = node     ?? process.env.PROXMOX_NODE     ?? "pve";

    // Accept self-signed certs (common in Proxmox)
    this.api = axios.create({
      baseURL: `${this.host}/api2/json`,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 15000,
    });

    // Inject auth ticket on every request
    this.api.interceptors.request.use(async (config) => {
      const a = await this.getAuth();
      config.headers["Cookie"] = `PVEAuthCookie=${a.ticket}`;
      if (config.method !== "get") config.headers["CSRFPreventionToken"] = a.csrf;
      return config;
    });
  }

  // ─── Auth ──────────────────────────────────────────────────────────────────
  private async getAuth(): Promise<ProxmoxAuth> {
    if (this.auth && Date.now() < this.authExpiry) return this.auth;
    return this.authenticate(this.host, this.user, this.password);
  }

  async authenticate(host: string, user: string, password: string): Promise<ProxmoxAuth> {
    const res = await axios.post(
      `${host}/api2/json/access/ticket`,
      { username: user, password },
      { httpsAgent: new https.Agent({ rejectUnauthorized: false }), timeout: 10000 }
    );
    this.auth = {
      ticket: res.data.data.ticket,
      csrf:   res.data.data.CSRFPreventionToken,
    };
    this.authExpiry = Date.now() + 1.5 * 60 * 60 * 1000; // 1.5 hr
    return this.auth;
  }

  /** Test connection — returns true if credentials work */
  async testConnection(): Promise<{ ok: boolean; version?: string; error?: string }> {
    try {
      await this.getAuth();
      const res = await this.api.get("/version");
      return { ok: true, version: res.data.data.version };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  // ─── Nodes ─────────────────────────────────────────────────────────────────
  async getNodes() {
    const res = await this.api.get("/nodes");
    return res.data.data as {
      node: string; status: string; cpu: number;
      mem: number; maxmem: number; disk: number; maxdisk: number;
      uptime: number;
    }[];
  }

  async getNodeStatus(node: string) {
    const res = await this.api.get(`/nodes/${node}/status`);
    return res.data.data;
  }

  // ─── VMs & Containers ────────────────────────────────────────────────────--
  async getAllVMs(node?: string) {
    const n = node ?? this.node;
    const [vmsRes, lxcRes] = await Promise.allSettled([
      this.api.get(`/nodes/${n}/qemu`),
      this.api.get(`/nodes/${n}/lxc`),
    ]);
    const vms = vmsRes.status === "fulfilled" ? vmsRes.value.data.data.map((v: object) => ({ ...v, type: "qemu" })) : [];
    const lxc = lxcRes.status === "fulfilled" ? lxcRes.value.data.data.map((v: object) => ({ ...v, type: "lxc"  })) : [];
    return [...vms, ...lxc];
  }

  async getVMStatus(node: string, vmId: number, type: "qemu" | "lxc") {
    const res = await this.api.get(`/nodes/${node}/${type}/${vmId}/status/current`);
    return res.data.data;
  }

  async getVMStats(node: string, vmId: number, type: "qemu" | "lxc", timeframe: "hour" | "day" | "week" = "hour") {
    const res = await this.api.get(`/nodes/${node}/${type}/${vmId}/rrddata?timeframe=${timeframe}`);
    return res.data.data;
  }

  // ─── Power Controls ────────────────────────────────────────────────────────
  async startVM(node: string, vmId: number, type: "qemu" | "lxc") {
    const res = await this.api.post(`/nodes/${node}/${type}/${vmId}/status/start`);
    return res.data.data; // Returns UPID task ID
  }

  async stopVM(node: string, vmId: number, type: "qemu" | "lxc") {
    const res = await this.api.post(`/nodes/${node}/${type}/${vmId}/status/stop`);
    return res.data.data;
  }

  async restartVM(node: string, vmId: number, type: "qemu" | "lxc") {
    const res = await this.api.post(`/nodes/${node}/${type}/${vmId}/status/reboot`);
    return res.data.data;
  }

  // ─── Create Container (LXC) ────────────────────────────────────────────────
  async createContainer(node: string, config: VMConfig) {
    const res = await this.api.post(`/nodes/${node}/lxc`, {
      vmid:       config.vmId,
      hostname:   config.hostname,
      memory:     config.ram,
      cores:      config.cpu,
      rootfs:     `local-lvm:${config.disk}`,
      password:   config.rootPassword,
      ostemplate: config.osTemplate ?? "local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst",
      net0:       "name=eth0,bridge=vmbr0,ip=dhcp",
      start:      1,
      unprivileged: 1,
    });
    return res.data.data;
  }

  async deleteVM(node: string, vmId: number, type: "qemu" | "lxc") {
    // Stop first if running
    try { await this.stopVM(node, vmId, type); await this.sleep(3000); } catch {}
    const res = await this.api.delete(`/nodes/${node}/${type}/${vmId}`);
    return res.data.data;
  }

  // ─── Snapshots ─────────────────────────────────────────────────────────────
  async listSnapshots(node: string, vmId: number, type: "qemu" | "lxc") {
    const res = await this.api.get(`/nodes/${node}/${type}/${vmId}/snapshot`);
    return res.data.data;
  }

  async createSnapshot(node: string, vmId: number, type: "qemu" | "lxc", name: string) {
    const res = await this.api.post(`/nodes/${node}/${type}/${vmId}/snapshot`, {
      snapname: name,
      description: `Auto-snapshot ${new Date().toISOString()}`,
    });
    return res.data.data;
  }

  async restoreSnapshot(node: string, vmId: number, type: "qemu" | "lxc", snapname: string) {
    const res = await this.api.post(
      `/nodes/${node}/${type}/${vmId}/snapshot/${snapname}/rollback`
    );
    return res.data.data;
  }

  async deleteSnapshot(node: string, vmId: number, type: "qemu" | "lxc", snapname: string) {
    const res = await this.api.delete(`/nodes/${node}/${type}/${vmId}/snapshot/${snapname}`);
    return res.data.data;
  }

  // ─── Console ───────────────────────────────────────────────────────────────
  async getConsoleToken(node: string, vmId: number, type: "qemu" | "lxc") {
    const endpoint = type === "qemu"
      ? `/nodes/${node}/qemu/${vmId}/vncproxy`
      : `/nodes/${node}/lxc/${vmId}/vncproxy`;
    const res = await this.api.post(endpoint, { websocket: 1 });
    return {
      ...res.data.data,
      host: this.host,
      node,
    };
  }

  // ─── Task monitoring ───────────────────────────────────────────────────────
  async waitForTask(node: string, upid: string, maxWaitMs = 60000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const res = await this.api.get(`/nodes/${node}/tasks/${encodeURIComponent(upid)}/status`);
      const status = res.data.data.status;
      if (status === "stopped") return res.data.data.exitstatus === "OK";
      await this.sleep(2000);
    }
    throw new Error("Task timeout");
  }

  // ─── Next free VMID ────────────────────────────────────────────────────────
  async nextVMID(): Promise<number> {
    const res = await this.api.get("/cluster/nextid");
    return parseInt(res.data.data);
  }

  // ─── Cluster resource summary ──────────────────────────────────────────────
  async getClusterResources() {
    const res = await this.api.get("/cluster/resources");
    return res.data.data;
  }

  // ─── Storage list ──────────────────────────────────────────────────────────
  async getStorage(node: string) {
    const res = await this.api.get(`/nodes/${node}/storage`);
    return res.data.data;
  }

  private sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
  }
}

// Singleton per host
const instances = new Map<string, ProxmoxService>();
export function getProxmoxService(host?: string, user?: string, password?: string, node?: string): ProxmoxService {
  const key = host ?? process.env.PROXMOX_HOST ?? "default";
  if (!instances.has(key)) instances.set(key, new ProxmoxService(host, user, password, node));
  return instances.get(key)!;
}
