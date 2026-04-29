import { Router, Request, Response } from "express";
import prisma from "../config/prisma.js";
import { tracking } from "../services/tracking.service.js";
import { MigrationService } from "../services/migration.service.js";

const router  = Router();
const migSvc  = new MigrationService();

// ─── GET /api/admin/migrations ─────────────────────────────────────────────
router.get("/", async (_req: Request, res: Response) => {
  try {
    const [migrations, stats] = await Promise.all([
      prisma.migration.findMany({
        include: {
          user:       { select: { id: true, name: true, email: true } },
          vm:         { select: { name: true, ip: true } },
          fromAccount:{ select: { id: true, name: true } },
          toAccount:  { select: { id: true, name: true } },
          steps:      { orderBy: { step: "asc" } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      tracking.getMigrationStats(),
    ]);
    res.json({ migrations, stats });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

// ─── GET /api/admin/migrations/:id ─────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const m = await prisma.migration.findUnique({
      where: { id: req.params.id as string },
      include: {
        user:        { select: { id: true, name: true, email: true } },
        vm:          true,
        fromAccount: true,
        toAccount:   true,
        steps:       { orderBy: { step: "asc" } },
        snapshot:    true,
      },
    });
    if (!m) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ migration: m });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

// ─── POST /api/admin/migrations/trigger ────────────────────────────────────
// Admin manual migration
router.post("/trigger", async (req: Request, res: Response) => {
  const { vpsId, targetAccountId, adminId } = req.body;
  if (!vpsId) { res.status(400).json({ error: "vpsId required" }); return; }
  try {
    // Fire and forget (runs async)
    migSvc.adminMigrate(vpsId, targetAccountId, adminId ?? "admin").catch(console.error);
    res.json({ started: true, vpsId });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

// ─── GET /api/admin/migrations/accounts/health ─────────────────────────────
router.get("/accounts/health", async (_req: Request, res: Response) => {
  try {
    const accounts = await prisma.cloudAccount.findMany({
      include: {
        vms: {
          where:  { status: "active" },
          select: { id: true, name: true, ip: true, status: true },
        },
        _count: { select: { vms: true, migrations: true, migrationsTo: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    res.json({ accounts });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

// ─── GET /api/admin/tracking/user/:userId ──────────────────────────────────
router.get("/user/:userId/journey", async (req: Request, res: Response) => {
  try {
    const journey = await tracking.getUserJourney(req.params.userId as string);
    res.json(journey);
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

// ─── GET /api/admin/tracking/vps/:vpsId ────────────────────────────────────
router.get("/vps/:vpsId/timeline", async (req: Request, res: Response) => {
  try {
    const timeline = await tracking.getVMTimeline(req.params.vpsId as string);
    res.json(timeline);
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

// ─── GET /api/admin/tracking/log ───────────────────────────────────────────
router.get("/log", async (req: Request, res: Response) => {
  const { event, userId, accountId, dateFrom, dateTo, limit } = req.query;
  try {
    const log = await tracking.getSystemLog({
      event:      event as string,
      userId:     userId as string,
      accountId:  accountId as string,
      dateFrom:   dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo:     dateTo   ? new Date(dateTo   as string) : undefined,
      limit:      limit ? parseInt(limit as string) : 100,
    });
    res.json({ log });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

// ─── GET /api/admin/migrations/accounts/:id/history ─────────────────────────
router.get("/accounts/:id/history", async (req: Request, res: Response) => {
  try {
    const data = await tracking.getAccountHistory(req.params.id as string);
    res.json(data);
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

// ─── POST /api/admin/migrations/accounts/:id/set-primary ───────────────────
router.post("/accounts/:id/set-primary", async (req: Request, res: Response) => {
  try {
    res.status(501).json({ error: "Not implemented" });
  } catch (err) { res.status(500).json({ error: (err as Error).message }); }
});

export default router;
