import { Router, Request, Response } from "express";
import prisma from "../config/prisma.js";
import { ProxmoxService } from "../services/proxmox.service.js";
import { NotificationService } from "../services/notification.service.js";
import crypto from "crypto";

const router = Router();
const notify = new NotificationService();

// ─── AES-256 encryption for stored API keys ───────────────────────────────────
const ENC_KEY = process.env.AES_ENCRYPTION_KEY ?? crypto.randomBytes(32).toString("hex");
const IV_LEN  = 16;

function encrypt(text: string): string {
  const iv  = crypto.randomBytes(IV_LEN);
  const key = Buffer.from(ENC_KEY.slice(0, 64), "hex");
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  return iv.toString("hex") + ":" + cipher.update(text, "utf8", "hex") + cipher.final("hex");
}

function decrypt(enc: string): string {
  const parts    = enc.split(":");
  const ivHex    = parts[0] ?? "";
  const encrypted = parts[1] ?? "";
  const iv  = Buffer.from(ivHex, "hex");
  const key = Buffer.from(ENC_KEY.slice(0, 64), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
}

function proxmoxFor(server: { apiUrl: string; apiUser?: string | null; apiKey?: string | null; node?: string | null }) {
  const pass = server.apiKey ? decrypt(server.apiKey) : "";
  return new ProxmoxService(server.apiUrl, server.apiUser ?? "root@pam", pass, server.node ?? "pve");
}

// ─── GET /api/admin/servers ─────────────────────────────────────────────────
router.get("/", async (_req: Request, res: Response) => {
  try {
    const servers = await prisma.server.findMany({
      include: { _count: { select: { vms: true } } },
      orderBy: { createdAt: "asc" },
    });

    // Enrich with live Proxmox data in parallel
    const enriched = await Promise.all(
      servers.map(async (s: typeof servers[number]) => {
        if (s.type !== "proxmox") return { ...s, liveNodes: [], liveStats: null };
        try {
          const px = proxmoxFor(s);
          const nodes = await px.getNodes();
          const totalMem    = nodes.reduce((a, n) => a + n.maxmem, 0);
          const usedMem     = nodes.reduce((a, n) => a + n.mem, 0);
          const avgCpu      = nodes.length ? nodes.reduce((a, n) => a + n.cpu, 0) / nodes.length : 0;
          return {
            ...s,
            liveNodes: nodes,
            liveStats: { totalMem, usedMem, avgCpu: Math.round(avgCpu * 100) },
          };
        } catch {
          return { ...s, liveNodes: [], liveStats: null };
        }
      })
    );

    res.json({ servers: enriched });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── GET /api/admin/servers/:id ─────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const server = await prisma.server.findUnique({
      where: { id: req.params.id as string },
      include: {
        vms: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    if (!server) { res.status(404).json({ error: "Server not found" }); return; }

    let liveData: { nodes?: object[]; vms?: object[]; resources?: object[] } = {};
    if (server.type === "proxmox") {
      try {
        const px = proxmoxFor(server);
        const [nodes, resources] = await Promise.all([
          px.getNodes(),
          px.getClusterResources(),
        ]);
        liveData = { nodes, resources };
      } catch {}
    }

    res.json({ server, liveData });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── POST /api/admin/servers ─────────────────────────────────────────────────
router.post("/", async (req: Request, res: Response) => {
  const { name, type, apiUrl, apiUser, apiKey, region, node, maxVMs, notes } = req.body;
  if (!name || !type || !apiUrl) { res.status(400).json({ error: "Missing required fields" }); return; }

  try {
    const server = await prisma.server.create({
      data: {
        name,
        type,
        apiUrl,
        apiUser: apiUser ?? null,
        apiKey:  apiKey ? encrypt(apiKey) : null,
        region:  region ?? null,
        node:    node   ?? "pve",
        maxVMs:  maxVMs ? parseInt(maxVMs) : 50,
        notes:   notes  ?? null,
        status:  "active",
      },
    });
    res.json({ server });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── PUT /api/admin/servers/:id ─────────────────────────────────────────────
router.put("/:id", async (req: Request, res: Response) => {
  const { name, apiUrl, apiUser, apiKey, region, node, maxVMs, notes, status, maintenanceMode } = req.body;
  try {
    const server = await prisma.server.update({
      where: { id: req.params.id as string },
      data: {
        ...(name            && { name }),
        ...(apiUrl          && { apiUrl }),
        ...(apiUser         && { apiUser }),
        ...(apiKey          && { apiKey: encrypt(apiKey) }),
        ...(region          && { region }),
        ...(node            && { node }),
        ...(maxVMs          && { maxVMs: parseInt(maxVMs) }),
        ...(notes  !== undefined && { notes }),
        ...(status          && { status }),
        ...(maintenanceMode !== undefined && { maintenanceMode }),
      },
    });
    res.json({ server });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── POST /api/admin/servers/:id/test ───────────────────────────────────────
router.post("/:id/test", async (req: Request, res: Response) => {
  try {
    const server = await prisma.server.findUnique({ where: { id: req.params.id as string } });
    if (!server) { res.status(404).json({ error: "Server not found" }); return; }

    const px = proxmoxFor(server);
    const result = await px.testConnection();
    res.json(result);
  } catch (err) {
    res.json({ ok: false, error: (err as Error).message });
  }
});

// ─── POST /api/admin/servers/test-credentials ───────────────────────────────
// Test before saving (no DB record needed)
router.post("/test-credentials", async (req: Request, res: Response) => {
  const { apiUrl, apiUser, apiKey } = req.body;
  try {
    const px = new ProxmoxService(apiUrl, apiUser, apiKey);
    const result = await px.testConnection();
    res.json(result);
  } catch (err) {
    res.json({ ok: false, error: (err as Error).message });
  }
});

// ─── GET /api/admin/servers/:id/vms ─────────────────────────────────────────
router.get("/:id/vms", async (req: Request, res: Response) => {
  try {
    const server = await prisma.server.findUnique({ where: { id: req.params.id as string } });
    if (!server || server.type !== "proxmox") { res.json({ vms: [] }); return; }

    const px = proxmoxFor(server);
    const nodes = await px.getNodes();
    const allVMs = await Promise.all(nodes.map(n => px.getAllVMs(n.node)));
    res.json({ vms: allVMs.flat() });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── POST /api/admin/servers/:id/vm/:vmId/start ─────────────────────────────
router.post("/:id/vm/:vmId/start", async (req: Request, res: Response) => {
  const { node, type } = req.body;
  try {
    const server = await prisma.server.findUnique({ where: { id: req.params.id as string } });
    if (!server) { res.status(404).json({ error: "Server not found" }); return; }
    const px = proxmoxFor(server);
    const task = await px.startVM(node as string, parseInt((req.params.vmId as string) ?? "0"), (type as "qemu" | "lxc") ?? "lxc");
    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── POST /api/admin/servers/:id/vm/:vmId/stop ──────────────────────────────
router.post("/:id/vm/:vmId/stop", async (req: Request, res: Response) => {
  const { node, type } = req.body;
  try {
    const server = await prisma.server.findUnique({ where: { id: req.params.id as string } });
    if (!server) { res.status(404).json({ error: "Server not found" }); return; }
    const px = proxmoxFor(server);
    const task = await px.stopVM(node as string, parseInt((req.params.vmId as string) ?? "0"), (type as "qemu" | "lxc") ?? "lxc");
    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── POST /api/admin/servers/:id/disable ────────────────────────────────────
router.post("/:id/disable", async (req: Request, res: Response) => {
  const { action, targetServerId } = req.body;
  // action: "keep" | "migrate" | "suspend"
  try {
    if (action === "suspend") {
      await prisma.vM.updateMany({
        where: { serverId: req.params.id as string },
        data:  { status: "suspended" },
      });
    } else if (action === "migrate" && targetServerId) {
      // Move all VPS to target server
      await prisma.vM.updateMany({
        where: { serverId: req.params.id as string },
        data:  { serverId: String(targetServerId) },
      });
    }
    const server = await prisma.server.update({
      where: { id: req.params.id as string },
      data:  { status: "disabled" },
    });
    res.json({ server });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── POST /api/admin/servers/:id/maintenance ─────────────────────────────────
router.post("/:id/maintenance", async (req: Request, res: Response) => {
  const { enabled } = req.body;
  try {
    const server = await prisma.server.update({
      where: { id: req.params.id as string },
      data:  { maintenanceMode: enabled },
    });

    if (enabled) {
      await notify.telegramAdmin(`🔧 *Maintenance Mode ON*\nServer: ${server.name}\nNo new VPS will be provisioned on this server.`);
    }

    res.json({ server });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── GET /api/admin/servers/:id/stats ────────────────────────────────────────
// Real-time stats for polling
router.get("/:id/stats", async (req: Request, res: Response) => {
  try {
    const server = await prisma.server.findUnique({ where: { id: req.params.id as string } });
    if (!server || server.type !== "proxmox") { res.json({ nodes: [] }); return; }

    const px    = proxmoxFor(server);
    const nodes = await px.getNodes();
    res.json({ nodes, updatedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
