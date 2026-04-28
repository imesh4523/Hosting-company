import axios from "axios";
import prisma from "../config/prisma.js";
import { NotificationService } from "./notification.service.js";

const notify = new NotificationService();

// Known disposable email domains (abbreviated)
const DISPOSABLE_DOMAINS = new Set([
  "tempmail.io","guerrillamail.com","yopmail.com","mailinator.com",
  "10minutemail.com","throwaway.email","sharklasers.com","trashmail.com",
  "maildrop.cc","fakeinbox.com","dispostable.com","tempr.email",
]);

interface FraudCheckResult {
  score: number;
  reasons: string[];
  action: "allow" | "review" | "require_email_verify" | "ban";
}

export class FraudDetectionService {
  private ipqsKey = process.env.IPQS_API_KEY ?? "";

  /** Full fraud check on new user signup */
  async checkNewUser(data: {
    userId: string;
    email: string;
    ip: string;
    userAgent: string;
  }): Promise<FraudCheckResult> {
    let score = 0;
    const reasons: string[] = [];

    // 1. Check disposable email
    const domain = data.email.split("@")[1]?.toLowerCase();
    if (domain && DISPOSABLE_DOMAINS.has(domain)) {
      score += 20;
      reasons.push("Disposable email provider");
    }

    // 2. Check same IP multiple accounts
    const sameIPCount = await prisma.user.count({
      where: { lastLoginIp: data.ip, id: { not: data.userId } },
    });
    if (sameIPCount >= 2) {
      score += 30;
      reasons.push(`${sameIPCount + 1} accounts from same IP`);
    }

    // 3. IPQualityScore VPN/Proxy check
    if (this.ipqsKey && data.ip) {
      try {
        const res = await axios.get(
          `https://ipqualityscore.com/api/json/ip/${this.ipqsKey}/${data.ip}`,
          { timeout: 5000 }
        );
        const ipqs = res.data;
        if (ipqs.vpn || ipqs.proxy || ipqs.tor) {
          score += 25;
          reasons.push(`VPN/Proxy/Tor detected (IPQS: ${ipqs.fraud_score})`);
        }
        if (ipqs.fraud_score > 75) {
          score += 10;
          reasons.push(`High IP fraud score: ${ipqs.fraud_score}`);
        }
      } catch {
        // IPQS unavailable — skip
      }
    }

    // Determine action
    const action = this.scoreToAction(score);

    // Persist fraud log
    await prisma.fraudLog.create({
      data: { userId: data.userId, score, reasons, action },
    });

    // Update user fraud score
    await prisma.user.update({
      where: { id: data.userId },
      data: { fraudScore: score, trustLevel: action === "ban" ? "BANNED" : action === "review" ? "FLAGGED" : "NORMAL" },
    });

    // Alert admin if high risk
    if (score >= 61) {
      await notify.alertFraudDetected(data.userId, data.email, score);
    }

    // Auto-ban
    if (score >= 81) {
      await this.banUser(data.userId, `Auto-ban: fraud score ${score}/100`);
    }

    return { score, reasons, action };
  }

  /** Update user's fraud score for a specific reason */
  async updateUserScore(userId: string, reason: string, points: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const newScore = Math.min(100, (user.fraudScore ?? 0) + points);

    await prisma.fraudLog.create({
      data: { userId, score: points, reasons: [reason], action: this.scoreToAction(newScore) },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        fraudScore: newScore,
        trustLevel: newScore >= 81 ? "BANNED" : newScore >= 61 ? "FLAGGED" : "NORMAL",
      },
    });

    if (newScore >= 81) {
      await this.banUser(userId, `Score threshold reached: ${newScore}/100`);
    }

    return newScore;
  }

  /** Ban a user and suspend their VPS */
  async banUser(userId: string, reason: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { status: "banned", trustLevel: "BANNED", banReason: reason },
    });

    // Suspend all their VMs
    await prisma.vM.updateMany({
      where: { userId },
      data: { status: "suspended" },
    });

    console.log(`[Fraud] User ${userId} banned: ${reason}`);
  }

  /** Assess payment risk */
  async checkPayment(data: { userId: string; amount: number; ip: string }): Promise<"low" | "medium" | "high"> {
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    const score = user?.fraudScore ?? 0;
    if (score >= 61) return "high";
    if (score >= 31) return "medium";
    return "low";
  }

  private scoreToAction(score: number): "allow" | "review" | "require_email_verify" | "ban" {
    if (score >= 81) return "ban";
    if (score >= 61) return "require_email_verify";
    if (score >= 31) return "review";
    return "allow";
  }
}
