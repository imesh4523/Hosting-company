import { Router, Request, Response } from "express";
import prisma from "../config/prisma.js";

const router = Router();

// GET /api/admin/audit
router.get("/", async (req: Request, res: Response) => {
  try {
    const { adminId, action, page = "1", limit = "50" } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: Record<string, unknown> = {};
    if (adminId) where.adminId = adminId;
    if (action) where.action = { contains: action, mode: "insensitive" };

    const [logs, total] = await Promise.all([
      (prisma as any).auditLog.findMany({
        where,
        include: { admin: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      (prisma as any).auditLog.count({ where }),
    ]);

    res.json({ success: true, logs, total });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

export default router;
