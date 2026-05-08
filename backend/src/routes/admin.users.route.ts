import { Router, Request, Response } from "express";
import prisma from "../config/prisma.js";
import { NotificationService } from "../services/notification.service.js";

const router = Router();
const notify = new NotificationService();

async function logAudit(adminId: string, action: string, target: string, details: object, ip: string) {
  try { await (prisma as any).auditLog.create({ data: { adminId, action, target, details, ip } }); } catch {}
}

// GET /api/admin/users
router.get("/", async (req: Request, res: Response) => {
  try {
    const { search, status, page = "1", limit = "50" } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: Record<string, unknown> = { role: "customer" };
    if (status === "suspended") where.suspended = true;
    if (status === "active") where.suspended = false;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, role: true,
          fraudScore: true, trustLevel: true, suspended: true,
          balance: true, walletBalance: true, createdAt: true,
          _count: { select: { vms: true, invoices: true, tickets: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// GET /api/admin/users/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string },
      include: {
        vms: { include: { account: { select: { name: true, provider: true } } } },
        invoices: { orderBy: { createdAt: "desc" }, take: 20 },
        tickets: { orderBy: { createdAt: "desc" }, take: 10 },
        fraudLogs: { orderBy: { createdAt: "desc" }, take: 10 },
        oauthAccounts: true,
      },
    });
    if (!user) { res.status(404).json({ success: false, error: "User not found" }); return; }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// PUT /api/admin/users/:id/ban
router.put("/:id/ban", async (req: Request, res: Response) => {
  try {
    const { reason } = req.body as { reason: string };
    if (!reason) { res.status(400).json({ success: false, error: "Ban reason required" }); return; }

    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { suspended: true, banReason: reason, trustLevel: "banned" },
    });

    await notify.telegramAdmin(`🚫 *User Banned*\nEmail: ${user.email}\nReason: ${reason}`);
    await logAudit((req as any).user?.id ?? "system", "user_ban", user.id, { email: user.email, reason }, req.ip ?? "");
    res.json({ success: true, message: "User banned" });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// PUT /api/admin/users/:id/unban
router.put("/:id/unban", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { suspended: false, banReason: null, trustLevel: "new" },
    });

    await logAudit((req as any).user?.id ?? "system", "user_unban", user.id, { email: user.email }, req.ip ?? "");
    res.json({ success: true, message: "User unbanned" });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/users/:id/balance
router.post("/:id/balance", async (req: Request, res: Response) => {
  try {
    const { amount, note, operation } = req.body as { amount: number; note: string; operation: "add" | "deduct" };
    if (!amount || !operation) { res.status(400).json({ success: false, error: "Amount and operation required" }); return; }

    const delta = operation === "add" ? Math.abs(amount) : -Math.abs(amount);
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { walletBalance: { increment: delta } },
    });

    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: Math.abs(amount),
        status: "success",
        plan: `admin_${operation}`,
        method: "admin",
      },
    });

    await logAudit(
      (req as any).user?.id ?? "system",
      `balance_${operation}`,
      user.id,
      { email: user.email, amount, note },
      req.ip ?? ""
    );

    res.json({ success: true, newBalance: user.walletBalance + delta });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// DELETE /api/admin/users/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id as string } });
    if (!user) { res.status(404).json({ success: false, error: "User not found" }); return; }

    // Soft delete — set status to deleted
    await prisma.user.update({ where: { id: user.id }, data: { status: "deleted", email: `deleted_${Date.now()}_${user.email}` } });

    await logAudit((req as any).user?.id ?? "system", "user_delete", user.id, { email: user.email }, req.ip ?? "");
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

export default router;
