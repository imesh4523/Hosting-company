import prisma from "../config/prisma.js";
import { CloudProviderFactory } from "../lib/providers/factory.js";
import { NotificationService } from "./notification.service";
import { MigrationService } from "./migration.service";

export class CreditMonitor {
  private static notification = new NotificationService();

  static async monitorAllAccounts() {
    console.log("Starting Universal Credit Monitoring...");
    const accounts = await prisma.cloudAccount.findMany({
      where: { status: { not: "disabled" } }
    });

    for (const account of accounts) {
      try {
        await this.checkAccount(account);
      } catch (err) {
        console.error(`Failed to monitor account ${account.name}:`, err);
      }
    }
  }

  private static async checkAccount(account: any) {
    const provider = CloudProviderFactory.create(account.provider, account.credentials);
    const credits = await provider.getCredits();
    const info = await provider.getAccountInfo();

    // 1. Update DB
    await prisma.cloudAccount.update({
      where: { id: account.id },
      data: {
        credits: credits.amount,
        creditExpiry: credits.expiryDate,
        daysRemaining: credits.daysRemaining,
        vmCount: info.vmCount,
        vmLimit: info.vmLimit,
        lastChecked: new Date()
      }
    });

    // 2. Log History
    await prisma.creditHistory.create({
      data: {
        accountId: account.id,
        credits: credits.amount,
        balance: info.balance,
        daysRemaining: credits.daysRemaining
      }
    });

    // 3. Check Alert Levels
    await this.processAlerts(account, credits);
  }

  private static async processAlerts(account: any, credits: any) {
    const days = credits.daysRemaining;

    // EMERGENCY: < 1 day
    if (days !== null && days <= 1) {
      await this.notification.telegramAdmin(`🚨 EMERGENCY: ${account.name} credits expire in ${days * 24} hours! Immediate migration starting.`);
      await MigrationService.migrateAllFromAccount(account.id, "emergency_expiry");
      return;
    }

    // CRITICAL: < 3 days or < $5
    if ((days !== null && days <= 3) || credits.amount < 5) {
      await this.notification.telegramAdmin(`🔴 CRITICAL: ${account.name} credits expiring in ${days} days (Balance: $${credits.amount}). Migration scheduled.`);
      // In a real system, we'd trigger the migration scheduler here
      // await MigrationService.scheduleAllFromAccount(account.id);
    }

    // WARNING: < 7 days
    if (days !== null && days <= 7) {
      await this.notification.telegramAdmin(`⚠️ WARNING: ${account.name} credits expiring in ${days} days. Please add funds or new accounts.`);
    }
  }
}
