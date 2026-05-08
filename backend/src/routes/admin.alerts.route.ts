import { Router, Request, Response } from "express";
import prisma from "../config/prisma.js";

const router = Router();

// GET /api/admin/alerts
router.get("/", async (req: Request, res: Response) => {
  try {
    const { resolved, severity, page = "1", limit = "50" } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: Record<string, unknown> = {};
    if (resolved !== undefined) where.resolved = resolved === "true";
    if (severity) where.severity = severity;

    const [alerts, total, unresolvedCount] = await Promise.all([
      (prisma as any).alert.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: parseInt(limit) }),
      (prisma as any).alert.count({ where }),
      (prisma as any).alert.count({ where: { resolved: false } }),
    ]);

    res.json({ success: true, alerts, total, unresolvedCount });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// PUT /api/admin/alerts/:id/resolve
router.put("/:id/resolve", async (req: Request, res: Response) => {
  try {
    const alert = await (prisma as any).alert.update({
      where: { id: req.params.id as string },
      data: { resolved: true, resolvedAt: new Date(), resolvedBy: (req as any).user?.id ?? "admin" },
    });
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// DELETE /api/admin/alerts/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await (prisma as any).alert.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: "Alert deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/alerts — create alert (internal use)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { type, severity, message, metadata } = req.body as { type: string; severity: string; message: string; metadata?: object };
    const alert = await (prisma as any).alert.create({ data: { type, severity: severity ?? "info", message, metadata } });
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

export default router;
