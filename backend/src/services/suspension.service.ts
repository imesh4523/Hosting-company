import prisma from "../config/prisma.js";
import { getDOClient, decryptKey } from "./digitalocean.service.js";
import { tracking } from "./tracking.service.js";
import { NotificationService } from "./notification.service.js";
import net from "net";

const notify = new NotificationService();

export class SuspensionDetector {
  private downSince = new Map<string, number>(); // vpsId → timestamp

  // ─── Main monitor loop ────────────────────────────────────────────────────
  async monitorAllAccounts() {
    let accounts: { id: string; name: string; apiKey: string; status: string; dropletCount: number }[] = [];
    try {
      accounts = await prisma.dOAccount.findMany({ where: { status: { not: "disabled" } } });
    } catch { return; } // DB offline

    await Promise.allSettled(accounts.map(a => this.checkAccount(a)));
  }

  async checkAccount(account: { id: string; name: string; apiKey: string; status: string; dropletCount: number }) {
    try {
      const client = getDOClient(account.apiKey);
      await client.getAccount(); // Will throw 401/403 if suspended

      // Account is healthy
      if (account.status === "suspended") {
        await prisma.dOAccount.update({ where: { id: account.id }, data: { status: "active" } });
      }
      await prisma.dOAccount.update({ where: { id: account.id }, data: { lastChecked: new Date() } });

    } catch (err) {
      const e = err as { response?: { status?: number }; message: string };
      const status = e.response?.status;

      if (status === 401 || status === 403) {
        await this.handleAccountSuspension(account, e.message);
      } else {
        // Network / timeout — not suspended
        console.warn(`[Monitor] Account ${account.name} check failed (network): ${e.message}`);
      }
    }

    // Check individual droplets
    await this.checkDroplets(account.id);
  }

  private async checkDroplets(accountId: string) {
    let droplets: { id: string; ipAddress: string | null; userId: string; doAccountId: string }[] = [];
    try {
      droplets = await prisma.vPS.findMany({ where: { doAccountId: accountId, status: "active" } });
    } catch { return; }

    await Promise.allSettled(droplets.map(async (d) => {
      if (!d.ipAddress) return;

      const alive = await this.ping(d.ipAddress);

      if (!alive) {
        const now = Date.now();
        if (!this.downSince.has(d.id)) {
          this.downSince.set(d.id, now);
          await tracking.logEvent({ vpsId: d.id, userId: d.userId, event: "vps_unreachable", fromAccountId: accountId, reason: "ping failed", triggeredBy: "auto" });
        }

        const downMs = now - (this.downSince.get(d.id) ?? now);
        if (downMs > 5 * 60 * 1000) {
          // Down > 5 min — start failover
          this.downSince.delete(d.id);
          const { MigrationService } = await import("./migration.service.js");
          const ms = new MigrationService();
          await ms.startMigration({ vpsId: d.id, trigger: "failover", reason: "vps_unreachable_5min" }).catch(console.error);
        }
      } else {
        this.downSince.delete(d.id);
      }
    }));
  }

  private async handleAccountSuspension(account: { id: string; name: string; dropletCount: number }, reason: string) {
    if ((await prisma.dOAccount.findUnique({ where: { id: account.id } }))?.status === "suspended") return;

    // 1. Mark suspended
    await prisma.dOAccount.update({
      where: { id: account.id },
      data: { status: "suspended", suspendedAt: new Date(), suspendReason: reason },
    });

    // 2. Log
    await tracking.logEvent({ vpsId: "system", userId: "system", event: "account_suspended", fromAccountId: account.id, reason, triggeredBy: "auto" }).catch(() => {});

    // 3. Alert admin immediately
    await notify.telegramAdmin(
      `🚨 *DO Account SUSPENDED!*\nAccount: ${account.name}\nReason: ${reason}\nDroplets affected: ${account.dropletCount}\n⚡ Auto-migration STARTING NOW`
    );

    // 4. Queue migration for all active droplets
    const droplets = await prisma.vPS.findMany({ where: { doAccountId: account.id, status: "active" } });
    const { MigrationService } = await import("./migration.service.js");
    const ms = new MigrationService();

    for (const droplet of droplets) {
      await ms.startMigration({ vpsId: droplet.id, trigger: "account_suspended", reason }).catch(async (err) => {
        await notify.telegramAdmin(`❌ Migration failed for VPS ${droplet.id}: ${(err as Error).message}`);
      });
    }
  }

  // ─── Simple TCP ping ──────────────────────────────────────────────────────
  private ping(ip: string, port = 22, timeout = 5000): Promise<boolean> {
    return new Promise(resolve => {
      const sock = new net.Socket();
      sock.setTimeout(timeout);
      sock.on("connect", () => { sock.destroy(); resolve(true); });
      sock.on("timeout", () => { sock.destroy(); resolve(false); });
      sock.on("error", () => { sock.destroy(); resolve(false); });
      sock.connect(port, ip);
    });
  }
}
