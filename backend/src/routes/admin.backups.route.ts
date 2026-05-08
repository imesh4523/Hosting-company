import { Router, Request, Response } from "express";
import prisma from "../config/prisma.js";

const router = Router();

// GET /api/admin/backups
router.get("/", async (req: Request, res: Response) => {
  try {
    const { userId, status, page = "1", limit = "50" } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [backups, total] = await Promise.all([
      (prisma as any).backup.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          vm: { select: { name: true, ip: true, provider: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      (prisma as any).backup.count({ where }),
    ]);

    // Group by user for summary view
    const userSummary = await (prisma as any).backup.groupBy({
      by: ["userId"],
      _count: { id: true },
      _sum: { sizeGb: true },
      _max: { createdAt: true },
    });

    res.json({ success: true, backups, total, userSummary });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// GET /api/admin/backups/:userId/list — all backups for a user
router.get("/:userId/list", async (req: Request, res: Response) => {
  try {
    const backups = await (prisma as any).backup.findMany({
      where: { userId: req.params.userId as string },
      include: { vm: { select: { name: true, ip: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, backups });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/backups/:userId/run — trigger backup for a user
router.post("/:userId/run", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const vms = await prisma.vM.findMany({ where: { userId, status: "active" } });
    if (vms.length === 0) { res.status(404).json({ success: false, error: "No active VMs found for this user" }); return; }

    const backupPromises = vms.map(vm =>
      (prisma as any).backup.create({
        data: { userId, vmId: vm.id, status: "pending", type: "manual" },
      })
    );
    const backups = await Promise.all(backupPromises);

    res.json({ success: true, message: `Backup triggered for ${vms.length} VM(s)`, backups });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/backups/run-all — trigger backup for all users
router.post("/run-all", async (req: Request, res: Response) => {
  try {
    const vms = await prisma.vM.findMany({ where: { status: "active" } });
    const backups = await Promise.all(
      vms.map(vm =>
        (prisma as any).backup.create({ data: { userId: vm.userId, vmId: vm.id, status: "pending", type: "manual" } })
      )
    );
    res.json({ success: true, message: `Backup triggered for ${vms.length} VM(s)`, count: backups.length });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/backups/:userId/restore
router.post("/:userId/restore", async (req: Request, res: Response) => {
  try {
    const { backupId, targetVmId, restoreType } = req.body as {
      backupId: string; targetVmId?: string; restoreType: "same" | "new";
    };

    const backup = await (prisma as any).backup.findUnique({
      where: { id: backupId },
      include: { vm: true },
    });
    if (!backup) { res.status(404).json({ success: false, error: "Backup not found" }); return; }

    // Queue restore job — in production this would enqueue to Bull
    await (prisma as any).backup.update({
      where: { id: backupId },
      data: { status: "restoring" },
    });

    res.json({
      success: true,
      message: `Restore initiated for ${restoreType === "same" ? "existing" : "new"} VM`,
      backupId,
      vmId: targetVmId ?? backup.vmId,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

export default router;
