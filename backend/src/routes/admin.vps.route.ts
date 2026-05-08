import { Router, Request, Response } from "express";
import prisma from "../config/prisma.js";
import { NotificationService } from "../services/notification.service.js";
import { CloudProviderFactory } from "../lib/providers/factory.js";
import crypto from "crypto";

const router = Router();
const notify = new NotificationService();

const ENC_KEY = process.env.ENCRYPTION_KEY ?? crypto.randomBytes(32).toString("hex");

function decrypt(enc: string): string {
  try {
    const parts = enc.split(":");
    if (parts.length < 2) return enc;
    const iv = Buffer.from(parts[0]!, "hex");
    const key = Buffer.from(ENC_KEY.padEnd(32).slice(0, 32));
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    return decipher.update(parts[1]!, "hex", "utf8") + decipher.final("utf8");
  } catch {
    return enc;
  }
}

async function logAudit(adminId: string, action: string, target: string, details: object, ip: string) {
  try {
    await (prisma as any).auditLog.create({ data: { adminId, action, target, details, ip } });
  } catch {}
}

// GET /api/admin/vps — list all VPS across all accounts
router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, userId, search, page = "1", limit = "50" } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (search) {
      where.OR = [
        { ip: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { hostname: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [vms, total] = await Promise.all([
      prisma.vM.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          account: { select: { id: true, name: true, provider: true } },
          plan: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.vM.count({ where }),
    ]);

    res.json({ success: true, vms, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// GET /api/admin/vps/:id — single VPS detail
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const vm = await prisma.vM.findUnique({
      where: { id: req.params.id as string },
      include: {
        user: { select: { id: true, name: true, email: true, balance: true } },
        account: true,
        plan: true,
        snapshots: { orderBy: { createdAt: "desc" }, take: 10 },
        migrations: { orderBy: { startedAt: "desc" }, take: 5 },
        vmHistory: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });
    if (!vm) { res.status(404).json({ success: false, error: "VM not found" }); return; }
    res.json({ success: true, vm });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/vps/:id/start
router.post("/:id/start", async (req: Request, res: Response) => {
  try {
    const vm = await prisma.vM.findUnique({ where: { id: req.params.id as string }, include: { account: true } });
    if (!vm) { res.status(404).json({ success: false, error: "VM not found" }); return; }

    const creds = vm.account.credentials as Record<string, string>;
    const decrypted = Object.fromEntries(Object.entries(creds).map(([k, v]) => [k, decrypt(v)]));
    const provider = CloudProviderFactory.create(vm.provider, decrypted);
    await provider.startVM(vm.providerId!);

    await prisma.vM.update({ where: { id: vm.id }, data: { status: "active" } });
    await prisma.vMHistory.create({
      data: { vmId: vm.id, userId: vm.userId, event: "started", triggeredBy: "admin" },
    });
    await logAudit((req as any).user?.id ?? "system", "vps_start", vm.id, { vmName: vm.name }, req.ip ?? "");
    res.json({ success: true, message: "VM started" });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/vps/:id/stop
router.post("/:id/stop", async (req: Request, res: Response) => {
  try {
    const vm = await prisma.vM.findUnique({ where: { id: req.params.id as string }, include: { account: true } });
    if (!vm) { res.status(404).json({ success: false, error: "VM not found" }); return; }

    const creds = vm.account.credentials as Record<string, string>;
    const decrypted = Object.fromEntries(Object.entries(creds).map(([k, v]) => [k, decrypt(v)]));
    const provider = CloudProviderFactory.create(vm.provider, decrypted);
    await provider.stopVM(vm.providerId!);

    await prisma.vM.update({ where: { id: vm.id }, data: { status: "stopped" } });
    await prisma.vMHistory.create({
      data: { vmId: vm.id, userId: vm.userId, event: "stopped", triggeredBy: "admin" },
    });
    await logAudit((req as any).user?.id ?? "system", "vps_stop", vm.id, { vmName: vm.name }, req.ip ?? "");
    res.json({ success: true, message: "VM stopped" });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/vps/:id/restart
router.post("/:id/restart", async (req: Request, res: Response) => {
  try {
    const vm = await prisma.vM.findUnique({ where: { id: req.params.id as string }, include: { account: true } });
    if (!vm) { res.status(404).json({ success: false, error: "VM not found" }); return; }

    const creds = vm.account.credentials as Record<string, string>;
    const decrypted = Object.fromEntries(Object.entries(creds).map(([k, v]) => [k, decrypt(v)]));
    const provider = CloudProviderFactory.create(vm.provider, decrypted);
    await provider.restartVM(vm.providerId!);

    await prisma.vMHistory.create({
      data: { vmId: vm.id, userId: vm.userId, event: "restarted", triggeredBy: "admin" },
    });
    await logAudit((req as any).user?.id ?? "system", "vps_restart", vm.id, { vmName: vm.name }, req.ip ?? "");
    res.json({ success: true, message: "VM restarted" });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/vps/:id/reset-password
router.post("/:id/reset-password", async (req: Request, res: Response) => {
  try {
    const vm = await prisma.vM.findUnique({ where: { id: req.params.id as string } });
    if (!vm) { res.status(404).json({ success: false, error: "VM not found" }); return; }

    const newPassword = crypto.randomBytes(12).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENC_KEY.padEnd(32).slice(0, 32));
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const encrypted = iv.toString("hex") + ":" + cipher.update(newPassword, "utf8", "hex") + cipher.final("hex");

    await prisma.vM.update({ where: { id: vm.id }, data: { rootPassword: encrypted } });
    await prisma.vMHistory.create({
      data: { vmId: vm.id, userId: vm.userId, event: "password_reset", triggeredBy: "admin" },
    });
    await logAudit((req as any).user?.id ?? "system", "vps_reset_password", vm.id, { vmName: vm.name }, req.ip ?? "");
    res.json({ success: true, newPassword });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// DELETE /api/admin/vps/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const vm = await prisma.vM.findUnique({ where: { id: req.params.id as string }, include: { account: true } });
    if (!vm) { res.status(404).json({ success: false, error: "VM not found" }); return; }

    try {
      const creds = vm.account.credentials as Record<string, string>;
      const decrypted = Object.fromEntries(Object.entries(creds).map(([k, v]) => [k, decrypt(v)]));
      const provider = CloudProviderFactory.create(vm.provider, decrypted);
      if (vm.providerId) await provider.deleteVM(vm.providerId);
    } catch {}

    await prisma.vM.update({ where: { id: vm.id }, data: { status: "deleted" } });
    await logAudit((req as any).user?.id ?? "system", "vps_delete", vm.id, { vmName: vm.name, userEmail: "" }, req.ip ?? "");
    res.json({ success: true, message: "VM deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/vps/:id/snapshot
router.post("/:id/snapshot", async (req: Request, res: Response) => {
  try {
    const vm = await prisma.vM.findUnique({ where: { id: req.params.id as string }, include: { account: true } });
    if (!vm) { res.status(404).json({ success: false, error: "VM not found" }); return; }

    const name = `admin-snap-${Date.now()}`;
    const creds = vm.account.credentials as Record<string, string>;
    const decrypted = Object.fromEntries(Object.entries(creds).map(([k, v]) => [k, decrypt(v)]));
    const provider = CloudProviderFactory.create(vm.provider, decrypted);
    const snap = await provider.createSnapshot(vm.providerId!, name);

    await prisma.snapshot.create({
      data: {
        vmId: vm.id,
        cloudAccountId: vm.cloudAccountId,
        userId: vm.userId,
        name,
        providerSnapshotId: snap.id,
        status: "ready",
        type: "manual",
      },
    });

    await logAudit((req as any).user?.id ?? "system", "vps_snapshot", vm.id, { vmName: vm.name, snapName: name }, req.ip ?? "");
    res.json({ success: true, message: "Snapshot created" });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

export default router;
