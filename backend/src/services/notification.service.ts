import axios from "axios";

export class NotificationService {
  private botToken   = process.env.TELEGRAM_BOT_TOKEN ?? "";
  private adminChat  = process.env.TELEGRAM_ADMIN_CHAT_ID ?? "";
  private resendKey  = process.env.RESEND_API_KEY ?? "";
  private fromEmail  = process.env.FROM_EMAIL ?? "noreply@yourdomain.com";

  // ─── Telegram ────────────────────────────────────────────────────────────────
  async telegramAdmin(message: string): Promise<void> {
    if (!this.botToken || !this.adminChat) return;
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        { chat_id: this.adminChat, text: message, parse_mode: "Markdown" }
      );
    } catch (err) {
      console.error("[Telegram] Failed to send alert:", (err as Error).message);
    }
  }

  // ─── Email via Resend ─────────────────────────────────────────────────────────
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!this.resendKey) return;
    try {
      await axios.post(
        "https://api.resend.com/emails",
        { from: this.fromEmail, to, subject, html },
        { headers: { Authorization: `Bearer ${this.resendKey}`, "Content-Type": "application/json" } }
      );
    } catch (err) {
      console.error("[Email] Failed:", (err as Error).message);
    }
  }

  // ─── Email Templates ──────────────────────────────────────────────────────────
  async sendWelcome(to: string, name: string) {
    await this.sendEmail(to, "Welcome to UltaCore VPS!", `
      <h2>Welcome, ${name}!</h2>
      <p>Your account has been created. You can now purchase a VPS plan from your dashboard.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;padding:12px 24px;background:#5145FF;color:#fff;border-radius:8px;text-decoration:none;">Go to Dashboard</a>
    `);
    await this.telegramAdmin(`👤 *New User Signup*\nEmail: ${to}\nName: ${name}`);
  }

  async sendVPSReady(to: string, vpsDetails: { ip: string; username: string; password: string; plan: string }) {
    await this.sendEmail(to, "Your VPS is Ready!", `
      <h2>Your VPS is live!</h2>
      <p>Here are your access details:</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #eee"><strong>IP Address</strong></td><td style="padding:8px;border:1px solid #eee"><code>${vpsDetails.ip}</code></td></tr>
        <tr><td style="padding:8px;border:1px solid #eee"><strong>Username</strong></td><td style="padding:8px;border:1px solid #eee"><code>${vpsDetails.username}</code></td></tr>
        <tr><td style="padding:8px;border:1px solid #eee"><strong>Password</strong></td><td style="padding:8px;border:1px solid #eee"><code>${vpsDetails.password}</code></td></tr>
        <tr><td style="padding:8px;border:1px solid #eee"><strong>Plan</strong></td><td style="padding:8px;border:1px solid #eee">${vpsDetails.plan}</td></tr>
      </table>
      <p>Connect via SSH: <code>ssh ${vpsDetails.username}@${vpsDetails.ip}</code></p>
    `);
  }

  async sendPaymentReceipt(to: string, amount: number, plan: string, invoiceUrl?: string) {
    await this.sendEmail(to, `Payment Receipt — $${amount}/mo`, `
      <h2>Payment Confirmed</h2>
      <p>Thank you for your payment of <strong>$${amount}</strong> for the <strong>${plan}</strong> plan.</p>
      ${invoiceUrl ? `<a href="${invoiceUrl}">Download Invoice</a>` : ""}
    `);
    await this.telegramAdmin(`💳 *Payment Received*\nEmail: ${to}\nPlan: ${plan}\nAmount: $${amount}`);
  }

  async sendVPSSuspended(to: string, reason: string) {
    await this.sendEmail(to, "VPS Suspended — Action Required", `
      <h2>Your VPS has been suspended</h2>
      <p>Reason: <strong>${reason}</strong></p>
      <p>Please update your payment method in the billing section to restore service.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard/billing" style="display:inline-block;padding:12px 24px;background:#EF4444;color:#fff;border-radius:8px;text-decoration:none;">Update Payment</a>
    `);
  }

  async sendFailoverComplete(to: string, oldIP: string, newIP: string, newPassword: string) {
    await this.sendEmail(to, "VPS Restored — New IP Address", `
      <h2>Your VPS has been automatically restored</h2>
      <p>We detected a failure and automatically restored your VPS to a new server.</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #eee"><strong>Old IP</strong></td><td style="padding:8px;border:1px solid #eee;color:#9CA3AF"><code>${oldIP}</code> (offline)</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee"><strong>New IP</strong></td><td style="padding:8px;border:1px solid #eee;color:#10B981"><code>${newIP}</code></td></tr>
        <tr><td style="padding:8px;border:1px solid #eee"><strong>Password</strong></td><td style="padding:8px;border:1px solid #eee"><code>${newPassword}</code></td></tr>
      </table>
    `);
    await this.telegramAdmin(`🔄 *Failover Complete*\nEmail: ${to}\nOld IP: ${oldIP} → New IP: ${newIP}`);
  }

  async sendBackupComplete(to: string, vpsId: string, date: string) {
    await this.sendEmail(to, "Backup Completed Successfully", `
      <h2>Backup Complete</h2>
      <p>Your VPS backup for <code>${vpsId}</code> completed successfully on ${date}.</p>
      <p>You have 7 daily and 4 weekly backups retained. Older backups are automatically removed.</p>
    `);
  }

  async sendBackupFailed(to: string, vpsId: string, reason: string) {
    await this.sendEmail(to, "Backup Failed — Warning", `
      <h2>Backup Failed</h2>
      <p>Your VPS backup for <code>${vpsId}</code> failed.</p>
      <p>Error: ${reason}</p>
      <p>We will retry automatically. Contact support if this persists.</p>
    `);
    await this.telegramAdmin(`⚠️ *Backup Failed*\nVPS: ${vpsId}\nEmail: ${to}\nReason: ${reason}`);
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    await this.sendEmail(to, "Password Reset Request", `
      <h2>Password Reset</h2>
      <p>Click the button below to reset your password. This link expires in 15 minutes.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#5145FF;color:#fff;border-radius:8px;text-decoration:none;">Reset Password</a>
      <p style="color:#9CA3AF;font-size:12px">If you didn't request this, ignore this email.</p>
    `);
  }

  // ─── Admin Telegram Alerts ─────────────────────────────────────────────────
  async alertVPSDown(vpsId: string, ip: string, userId: string) {
    await this.telegramAdmin(`🔴 *VPS DOWN*\nVPS: ${vpsId}\nIP: ${ip}\nUser: ${userId}\n⚡ Auto-failover initiated`);
  }

  async alertServerHealth(serverName: string, metric: string, value: number) {
    await this.telegramAdmin(`⚠️ *Server Health Alert*\nServer: ${serverName}\n${metric}: ${value}%\nThreshold exceeded`);
  }

  async alertFraudDetected(userId: string, email: string, score: number) {
    await this.telegramAdmin(`🛡️ *Fraud Detected*\nUser: ${userId}\nEmail: ${email}\nScore: ${score}/100\nAuto-action triggered`);
  }
}
