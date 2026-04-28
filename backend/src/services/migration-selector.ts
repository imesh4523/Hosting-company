import prisma from "../config/prisma.js";
import { CloudProviderFactory } from "../lib/providers/factory.js";

export class SmartMigrationSelector {
  
  /**
   * Finds the best target account for a VM migration based on scoring
   */
  static async findBestTarget(sourceAccountId: string, vmId: string): Promise<any> {
    const vm = await prisma.vM.findUnique({ where: { id: vmId } });
    if (!vm) throw new Error("VM not found");

    const allAccounts = await prisma.cloudAccount.findMany({
      where: { 
        status: "active", 
        id: { not: sourceAccountId } 
      }
    });

    const scored = await Promise.all(
      allAccounts.map(async (account) => ({
        account,
        score: await this.scoreAccount(account, vm)
      }))
    );

    // Sort by score (highest = best)
    scored.sort((a, b) => b.score - a.score);

    if (scored.length === 0) throw new Error("No target accounts available");
    return scored[0].account;
  }

  private static async scoreAccount(account: any, vm: any): Promise<number> {
    let score = 100;
    
    try {
      const provider = CloudProviderFactory.create(account.provider, account.credentials);
      const info = await provider.getAccountInfo();
      const credits = await provider.getCredits();

      // Credits remaining (more = better)
      score += credits.amount * 2;

      // Days remaining (more = better)
      if (credits.daysRemaining) {
        score += credits.daysRemaining * 5;
      } else {
        // No expiry (e.g. Vultr balance) = big bonus
        score += 500;
      }

      // Available VM slots
      const available = info.vmLimit - info.vmCount;
      score += available * 10;

      // Prefer same region (less latency / easier snapshot movement if same provider)
      if (account.region === vm.region) {
        score += 100;
      }

      // Prefer same provider (easier snapshot transfer)
      if (account.provider === vm.provider) {
        score += 150;
      }

      // Penalize if nearly full
      const usagePercent = info.vmCount / info.vmLimit;
      if (usagePercent > 0.8) score -= 200;

      // Penalize if credits expiring soon
      if (credits.daysRemaining !== null) {
        if (credits.daysRemaining < 7) score -= 100;
        if (credits.daysRemaining < 3) score -= 300;
      }

    } catch (err) {
      // If we can't connect, give it a very low score
      return -9999;
    }

    return score;
  }
}
