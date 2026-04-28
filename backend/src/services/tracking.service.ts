import prisma from "../config/prisma.js";

interface LogEventData {
  vpsId: string;
  userId: string;
  event: string;
  fromAccountId?: string;
  toAccountId?: string;
  fromIp?: string;
  toIp?: string;
  fromServer?: string;
  toServer?: string;
  snapshotId?: string;
  reason?: string;
  triggeredBy: "auto" | "admin" | "user";
  adminId?: string;
  metadata?: Record<string, unknown>;
  duration?: number;
}

export class TrackingService {

  // ─── Log every event ──────────────────────────────────────────────────────
  async logEvent(data: LogEventData) {
    return prisma.dropletHistory.create({
      data: {
        vpsId:         data.vpsId,
        userId:        data.userId,
        event:         data.event,
        fromAccountId: data.fromAccountId,
        toAccountId:   data.toAccountId,
        fromIp:        data.fromIp,
        toIp:          data.toIp,
        fromServer:    data.fromServer,
        toServer:      data.toServer,
        snapshotId:    data.snapshotId,
        reason:        data.reason,
        triggeredBy:   data.triggeredBy,
        adminId:       data.adminId,
        metadata:      data.metadata ?? {},
        duration:      data.duration,
      },
    });
  }

  // ─── User's complete VPS journey ──────────────────────────────────────────
  async getUserJourney(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        vPS: {
          where: { status: { in: ["active", "provisioning"] } },
          include: { account: true, server: true, plan: true },
          take: 1,
        },
      },
    });

    if (!user) throw new Error("User not found");

    const history = await prisma.dropletHistory.findMany({
      where: { userId },
      include: { fromAccount: true },
      orderBy: { createdAt: "asc" },
    });

    const currentVPS = user.vPS[0];

    return {
      user: { id: user.id, name: user.name, email: user.email },
      currentVPS: currentVPS ? {
        id:        currentVPS.id,
        ip:        currentVPS.ipAddress,
        account:   currentVPS.account?.name,
        server:    currentVPS.server?.name,
        status:    currentVPS.status,
        plan:      currentVPS.plan?.name,
        createdAt: currentVPS.createdAt,
      } : null,
      history: history.map(h => ({
        id:           h.id,
        date:         h.createdAt,
        event:        h.event,
        fromAccount:  h.fromAccount?.name,
        toAccountId:  h.toAccountId,
        fromIp:       h.fromIp,
        toIp:         h.toIp,
        reason:       h.reason,
        triggeredBy:  h.triggeredBy,
        duration:     h.duration,
        metadata:     h.metadata,
      })),
    };
  }

  // ─── Droplet full timeline ────────────────────────────────────────────────
  async getDropletTimeline(vpsId: string) {
    const vps = await prisma.vPS.findUnique({
      where: { id: vpsId },
      include: { user: true, account: true, plan: true },
    });
    if (!vps) throw new Error("VPS not found");

    const events = await prisma.dropletHistory.findMany({
      where: { vpsId },
      include: { fromAccount: true },
      orderBy: { createdAt: "asc" },
    });

    const migrations = await prisma.migration.findMany({
      where: { vpsId },
      include: { fromAccount: true, toAccount: true, steps: { orderBy: { step: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return { vps, events, migrations };
  }

  // ─── Account event history ────────────────────────────────────────────────
  async getAccountHistory(accountId: string) {
    const account = await prisma.dOAccount.findUnique({
      where: { id: accountId },
      include: { droplets: { include: { user: true } } },
    });

    const history = await prisma.dropletHistory.findMany({
      where: { fromAccountId: accountId },
      include: { vps: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const migrations = await prisma.migration.findMany({
      where: { OR: [{ fromAccountId: accountId }, { toAccountId: accountId }] },
      include: { user: true, vps: true },
      orderBy: { createdAt: "desc" },
    });

    return { account, history, migrations };
  }

  // ─── System-wide event log with filters ──────────────────────────────────
  async getSystemLog(filters: {
    event?: string; userId?: string;
    accountId?: string; dateFrom?: Date; dateTo?: Date;
    limit?: number;
  }) {
    return prisma.dropletHistory.findMany({
      where: {
        ...(filters.event     && { event:         filters.event }),
        ...(filters.userId    && { userId:         filters.userId }),
        ...(filters.accountId && { fromAccountId:  filters.accountId }),
        ...(filters.dateFrom || filters.dateTo
          ? { createdAt: { ...(filters.dateFrom && { gte: filters.dateFrom }), ...(filters.dateTo && { lte: filters.dateTo }) } }
          : {}),
      },
      include: {
        vps:         true,
        user:        { select: { id: true, name: true, email: true } },
        fromAccount: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: filters.limit ?? 100,
    });
  }

  // ─── Update migration step status ────────────────────────────────────────
  async setStep(migrationId: string, step: number, name: string, status: "pending" | "running" | "done" | "failed", opts?: { error?: string; metadata?: Record<string, unknown> }) {
    const existing = await prisma.migrationStep.findFirst({ where: { migrationId, step } });

    const data = {
      migrationId, step, name, status,
      ...(status === "running"    && { startedAt:   new Date() }),
      ...(status === "done"       && { completedAt: new Date() }),
      ...(status === "failed"     && { completedAt: new Date() }),
      ...(opts?.error             && { error: opts.error }),
      ...(opts?.metadata          && { metadata: opts.metadata }),
    };

    if (existing) return prisma.migrationStep.update({ where: { id: existing.id }, data });
    return prisma.migrationStep.create({ data });
  }

  // ─── Stats summary ────────────────────────────────────────────────────────
  async getMigrationStats() {
    const [total, today, active, failed] = await Promise.all([
      prisma.migration.count(),
      prisma.migration.count({ where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
      prisma.migration.count({ where: { status: { in: ["pending","snapshot_taken","deploying","restoring"] } } }),
      prisma.migration.count({ where: { status: "failed" } }),
    ]);
    return { total, today, active, failed };
  }
}

export const tracking = new TrackingService();
