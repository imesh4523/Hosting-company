import { Router, Request, Response } from "express";
import prisma from "../config/prisma.js";

const router = Router();

// GET /api/admin/analytics/overview
router.get("/overview", async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalUsers, newUsersToday, totalVMS, activeVMS, suspendedVMS,
      monthlyRevenue, totalRevenue, openTickets, activeAlerts,
      activeMigrations, totalAccounts,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "customer" } }),
      prisma.user.count({ where: { role: "customer", createdAt: { gte: startOfDay } } }),
      prisma.vM.count(),
      prisma.vM.count({ where: { status: "active" } }),
      prisma.vM.count({ where: { status: "suspended" } }),
      prisma.transaction.aggregate({ where: { status: "success", createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { status: "success" }, _sum: { amount: true } }),
      prisma.supportTicket.count({ where: { status: "open" } }),
      (prisma as any).alert.count({ where: { resolved: false } }),
      prisma.migration.count({ where: { status: { in: ["pending", "snapshot_taken", "deploying", "restoring", "verifying"] } } }),
      prisma.cloudAccount.count({ where: { status: "active" } }),
    ]);

    res.json({
      success: true,
      overview: {
        totalUsers, newUsersToday, totalVMS, activeVMS, suspendedVMS,
        monthlyRevenue: monthlyRevenue._sum.amount ?? 0,
        totalRevenue: totalRevenue._sum.amount ?? 0,
        openTickets, activeAlerts, activeMigrations, totalAccounts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// GET /api/admin/analytics/revenue
router.get("/revenue", async (req: Request, res: Response) => {
  try {
    const { period = "30" } = req.query as { period?: string };
    const days = parseInt(period);
    const from = new Date();
    from.setDate(from.getDate() - days);

    const transactions = await prisma.transaction.findMany({
      where: { status: "success", createdAt: { gte: from } },
      select: { amount: true, createdAt: true, method: true },
      orderBy: { createdAt: "asc" },
    });

    // Group by day
    const byDay: Record<string, number> = {};
    for (const tx of transactions) {
      const day = tx.createdAt.toISOString().slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + tx.amount;
    }

    const chart = Object.entries(byDay).map(([date, revenue]) => ({ date, revenue }));
    const total = transactions.reduce((s, t) => s + t.amount, 0);

    res.json({ success: true, chart, total, period: days });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// GET /api/admin/analytics/vps-stats
router.get("/vps-stats", async (_req: Request, res: Response) => {
  try {
    const [byProvider, byStatus, byRegion, recentVMS] = await Promise.all([
      prisma.vM.groupBy({ by: ["provider"], _count: { id: true } }),
      prisma.vM.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.vM.groupBy({ by: ["region"], _count: { id: true } }),
      prisma.vM.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    res.json({ success: true, byProvider, byStatus, byRegion, recentVMS });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

export default router;
