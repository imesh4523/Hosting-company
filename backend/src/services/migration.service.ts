import prisma from "../config/prisma.js";
import { CloudProviderFactory } from "../lib/providers/factory.js";
import { tracking } from "./tracking.service.js";
import { NotificationService } from "./notification.service.js";
import net from "net";
import { NodeSSH } from "node-ssh";

const notify = new NotificationService();
const MAX_RETRIES = 3;

interface MigrationOpts {
  vpsId: string;
  trigger: string;
  reason: string;
  targetAccountId?: string;
  adminId?: string;
}



export class MigrationService {
  // ─── Migrate all VMs from an account ─────────────────────────────────────
  static async migrateAllFromAccount(accountId: string, reason: string): Promise<void> {
    const vms = await prisma.vM.findMany({
      where: { cloudAccountId: accountId, status: { notIn: ["migrated", "deleted"] } }
    });
    
    const service = new MigrationService();
    for (const vm of vms) {
      await service.startMigration({ vpsId: vm.id, trigger: "auto", reason });
    }
  }

  // ─── Start migration (with retry) ─────────────────────────────────────────
  async startMigration(opts: MigrationOpts): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await this.runMigration(opts, attempt);
        return; // success
      } catch (err) {
        lastError = err as Error;
        console.error(`[Migration] Attempt ${attempt}/${MAX_RETRIES} failed: ${lastError.message}`);

        if (attempt < MAX_RETRIES) {
          await this.sleep(30000 * attempt); // backoff
        }
      }
    }

    // All retries exhausted
    await notify.telegramAdmin(
      `🚨 *MIGRATION FAILED — ALL RETRIES EXHAUSTED*\nVPS: ${opts.vpsId}\nTrigger: ${opts.trigger}\nError: ${lastError?.message}\n\n*ADMIN ACTION REQUIRED IMMEDIATELY*`
    );
  }

  private async runMigration(opts: MigrationOpts, attempt: number): Promise<void> {
    const vm = await prisma.vM.findUnique({ where: { id: opts.vpsId }, include: { account: true, user: true } });
    if (!vm) throw new Error(`VM ${opts.vpsId} not found`);

    const user = vm.user;
    const fromAccount = vm.account;

    // Find best target account
    const targetAccount = opts.targetAccountId
      ? await prisma.cloudAccount.findUnique({ where: { id: opts.targetAccountId } })
      : await this.findBestAccount(vm.cloudAccountId);

    if (!targetAccount) throw new Error("No available target account for migration");

    // Create migration record
    const migration = await prisma.migration.create({
      data: {
        userId:        user.id,
        vmId:          vm.id,
        fromAccountId: fromAccount.id,
        toAccountId:   targetAccount.id,
        fromVpsId:     vm.id,
        fromIp:        vm.ip ?? "",
        trigger:       opts.trigger,
        status:        "pending",
        retryCount:    attempt - 1,
      },
    });

    await notify.telegramAdmin(
      `🔄 *Auto-Migration Started*\nUser: ${user.email}\nVPS: ${vm.name}\nFrom: ${fromAccount.name}\nTo: ${targetAccount.name}\nReason: ${opts.reason}\nAttempt: ${attempt}/${MAX_RETRIES}`
    );

    // ── Step context shared across steps
    const ctx: {
      snapshotId?: string;
      newIp?: string;
      startTime: number;
    } = { startTime: Date.now() };

    const steps: Array<{ n: string; action: () => Promise<void> }> = [
      { n: "detect", action: async () => {
        await tracking.logEvent({ vmId: vm.id, userId: user.id, event: "migration_started", fromAccountId: fromAccount.id, toAccountId: targetAccount.id, reason: opts.trigger, triggeredBy: "auto" });
      }},

      { n: "take_snapshot", action: async () => {
        const fromProvider = CloudProviderFactory.create(fromAccount.provider, fromAccount.credentials);
        const snap = await fromProvider.createSnapshot(vm.providerId!, `mig-${vm.id}`);
        
        const dbSnap = await prisma.snapshot.create({
          data: { 
            vmId: vm.id, 
            cloudAccountId: fromAccount.id, 
            userId: user.id, 
            providerSnapshotId: snap.id, 
            name: snap.name, 
            type: "pre-migration", 
            status: "ready",
            sizeGb: snap.sizeGb
          },
        });
        ctx.snapshotId = snap.id;
        await prisma.migration.update({ where: { id: migration.id }, data: { snapshotId: dbSnap.id } });
      }},

      { n: "provision_target", action: async () => {
        const toProvider = CloudProviderFactory.create(targetAccount.provider, targetAccount.credentials);
        const newVM = await toProvider.createVM({
          name: vm.name,
          region: targetAccount.region,
          plan: vm.plan || "s-1vcpu-2gb",
          image: ctx.snapshotId!
        });

        ctx.newIp = newVM.ip || "";
        await prisma.migration.update({ where: { id: migration.id }, data: { toVpsId: newVM.id, toIp: ctx.newIp } });
      }},

      { n: "update_database", action: async () => {
        const newVmDb = await prisma.vM.create({
          data: {
            providerId:   ctx.newIp, // Simplified
            cloudAccountId: targetAccount.id,
            userId:      user.id,
            name:        vm.name,
            ip:          ctx.newIp,
            status:      "active",
            plan:        vm.plan,
            region:      targetAccount.region,
            provider:    targetAccount.provider,
            username:    vm.username,
            rootPassword: vm.rootPassword,
          },
        });

        await prisma.vM.update({ where: { id: vm.id }, data: { status: "migrated", migratedAt: new Date(), migratedTo: newVmDb.id } });
        await prisma.cloudAccount.update({ where: { id: targetAccount.id }, data: { vmCount: { increment: 1 } } });
      }},

      { n: "notify", action: async () => {
        await notify.sendFailoverComplete(user.email, vm.ip ?? "old", ctx.newIp ?? "new", "unchanged");
      }},
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]!;
      await tracking.setStep(migration.id, i + 1, step.n, "running");
      try {
        await step.action();
        await tracking.setStep(migration.id, i + 1, step.n, "done");
      } catch (err) {
        await tracking.setStep(migration.id, i + 1, step.n, "failed", { error: (err as Error).message });
        throw err;
      }
    }
  }

  async findBestAccount(excludeAccountId: string) {
    return prisma.cloudAccount.findFirst({
      where: { status: "active", id: { not: excludeAccountId } },
      orderBy: { vmCount: "asc" },
    });
  }

  // ─── Manual migration trigger (admin) ────────────────────────────────────
  async adminMigrate(vpsId: string, targetAccountId: string, adminId: string) {
    return this.startMigration({ vpsId, trigger: "manual", reason: "Admin initiated", targetAccountId, adminId });
  }

  private tcpPing(ip: string, port: number, timeout = 10000): Promise<boolean> {
    return new Promise(resolve => {
      const sock = new net.Socket();
      sock.setTimeout(timeout);
      sock.on("connect", () => { sock.destroy(); resolve(true); });
      sock.on("timeout", () => { sock.destroy(); resolve(false); });
      sock.on("error",   () => { sock.destroy(); resolve(false); });
      sock.connect(port, ip);
    });
  }

  private sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
}
