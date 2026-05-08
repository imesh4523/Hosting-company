import { Router, Request, Response } from "express";
import prisma from "../config/prisma.js";
import { NotificationService } from "../services/notification.service.js";
import { CloudProviderFactory } from "../lib/providers/factory.js";
import crypto from "crypto";

const router = Router();
const notify = new NotificationService();
const ENC_KEY = process.env.ENCRYPTION_KEY ?? crypto.randomBytes(32).toString("hex");

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENC_KEY.padEnd(32).slice(0, 32));
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  return iv.toString("hex") + ":" + cipher.update(text, "utf8", "hex") + cipher.final("hex");
}

function decrypt(enc: string): string {
  try {
    const parts = enc.split(":");
    if (parts.length < 2) return enc;
    const iv = Buffer.from(parts[0]!, "hex");
    const key = Buffer.from(ENC_KEY.padEnd(32).slice(0, 32));
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    return decipher.update(parts[1]!, "hex", "utf8") + decipher.final("utf8");
  } catch { return enc; }
}

// GET /api/admin/cloud-accounts
router.get("/", async (_req: Request, res: Response) => {
  try {
    const accounts = await prisma.cloudAccount.findMany({
      include: { _count: { select: { vms: true } }, creditHistory: { orderBy: { checkedAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, accounts });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// GET /api/admin/cloud-accounts/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const account = await prisma.cloudAccount.findUnique({
      where: { id: req.params.id as string },
      include: { vms: { include: { user: { select: { name: true, email: true } } } }, creditHistory: { orderBy: { checkedAt: "desc" }, take: 30 } },
    });
    if (!account) { res.status(404).json({ success: false, error: "Account not found" }); return; }
    res.json({ success: true, account });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/cloud-accounts
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, provider, credentials, region, vmLimit, notes } = req.body as {
      name: string; provider: string; credentials: Record<string, string>; region?: string; vmLimit?: number; notes?: string;
    };
    if (!name || !provider || !credentials) { res.status(400).json({ success: false, error: "Missing required fields" }); return; }

    // Encrypt all credential values
    const encCreds = Object.fromEntries(Object.entries(credentials).map(([k, v]) => [k, encrypt(v)]));

    const account = await prisma.cloudAccount.create({
      data: { name, provider, credentials: encCreds, region: region ?? "global", vmLimit: vmLimit ?? 10, notes: notes ?? null },
    });

    res.json({ success: true, account });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// PUT /api/admin/cloud-accounts/:id
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name, credentials, region, vmLimit, notes, status } = req.body as {
      name?: string; credentials?: Record<string, string>; region?: string; vmLimit?: number; notes?: string; status?: string;
    };

    const data: Record<string, unknown> = {};
    if (name) data.name = name;
    if (region) data.region = region;
    if (vmLimit) data.vmLimit = vmLimit;
    if (notes !== undefined) data.notes = notes;
    if (status) data.status = status;
    if (credentials) {
      data.credentials = Object.fromEntries(Object.entries(credentials).map(([k, v]) => [k, encrypt(v)]));
    }

    const account = await prisma.cloudAccount.update({ where: { id: req.params.id as string }, data });
    res.json({ success: true, account });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// DELETE /api/admin/cloud-accounts/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const vmCount = await prisma.vM.count({ where: { cloudAccountId: req.params.id as string, status: "active" } });
    if (vmCount > 0) { res.status(400).json({ success: false, error: `Cannot delete: ${vmCount} active VMs still use this account` }); return; }
    await prisma.cloudAccount.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/cloud-accounts/:id/test
router.post("/:id/test", async (req: Request, res: Response) => {
  try {
    const account = await prisma.cloudAccount.findUnique({ where: { id: req.params.id as string } });
    if (!account) { res.status(404).json({ success: false, error: "Account not found" }); return; }

    const creds = account.credentials as Record<string, string>;
    const decrypted = Object.fromEntries(Object.entries(creds).map(([k, v]) => [k, decrypt(v)]));
    const provider = CloudProviderFactory.create(account.provider, decrypted);
    const info = await provider.getAccountInfo();

    await prisma.cloudAccount.update({ where: { id: account.id }, data: { lastChecked: new Date() } });
    res.json({ success: true, info });
  } catch (err) {
    res.json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/cloud-accounts/test-credentials (before saving)
router.post("/test-credentials", async (req: Request, res: Response) => {
  try {
    const { provider, credentials } = req.body as { provider: string; credentials: Record<string, string> };
    const p = CloudProviderFactory.create(provider, credentials);
    const info = await p.getAccountInfo();
    res.json({ success: true, info });
  } catch (err) {
    res.json({ success: false, error: (err as Error).message });
  }
});

export default router;
