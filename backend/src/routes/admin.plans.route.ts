import { Router, Request, Response } from "express";
import prisma from "../config/prisma.js";

const router = Router();

// GET /api/admin/plans
router.get("/", async (_req: Request, res: Response) => {
  try {
    const plans = await prisma.plan.findMany({
      include: { category: true, _count: { select: { vms: true } } },
      orderBy: { priceMonthly: "asc" },
    });
    const categories = await prisma.planCategory.findMany({ orderBy: { name: "asc" } });
    res.json({ success: true, plans, categories });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/plans
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, categoryId, priceMonthly, priceYearly, ram, cpu, storage, bandwidth, doSize } = req.body as {
      name: string; categoryId: string; priceMonthly: number; priceYearly?: number;
      ram?: string; cpu?: string; storage?: string; bandwidth?: string; doSize?: string;
    };
    if (!name || !categoryId || !priceMonthly) { res.status(400).json({ success: false, error: "Missing required fields" }); return; }

    const plan = await prisma.plan.create({
      data: { name, categoryId, priceMonthly, priceYearly, ram, cpu, storage, bandwidth, doSize },
      include: { category: true },
    });
    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// PUT /api/admin/plans/:id
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name, priceMonthly, priceYearly, ram, cpu, storage, bandwidth, doSize, categoryId } = req.body as {
      name?: string; priceMonthly?: number; priceYearly?: number; ram?: string; cpu?: string;
      storage?: string; bandwidth?: string; doSize?: string; categoryId?: string;
    };

    const data: Record<string, unknown> = {};
    if (name) data.name = name;
    if (priceMonthly !== undefined) data.priceMonthly = priceMonthly;
    if (priceYearly !== undefined) data.priceYearly = priceYearly;
    if (ram !== undefined) data.ram = ram;
    if (cpu !== undefined) data.cpu = cpu;
    if (storage !== undefined) data.storage = storage;
    if (bandwidth !== undefined) data.bandwidth = bandwidth;
    if (doSize !== undefined) data.doSize = doSize;
    if (categoryId) data.categoryId = categoryId;

    const plan = await prisma.plan.update({ where: { id: req.params.id as string }, data, include: { category: true } });
    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// DELETE /api/admin/plans/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const vmCount = await prisma.vM.count({ where: { planId: req.params.id as string } });
    if (vmCount > 0) { res.status(400).json({ success: false, error: `Cannot delete: ${vmCount} VMs use this plan` }); return; }
    await prisma.plan.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/plans/categories
router.post("/categories", async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body as { name: string; description?: string };
    const category = await prisma.planCategory.create({ data: { name, description } });
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

export default router;
