import { Router, Request, Response } from "express";
import prisma from "../config/prisma.js";
import { NotificationService } from "../services/notification.service.js";

const router = Router();
const notify = new NotificationService();

// GET /api/admin/settings
router.get("/", async (_req: Request, res: Response) => {
  try {
    let settings = await (prisma as any).settings.findUnique({ where: { id: "singleton" } });
    if (!settings) {
      settings = await (prisma as any).settings.create({
        data: { id: "singleton", updatedAt: new Date() },
      });
    }
    // Mask sensitive fields
    res.json({
      success: true,
      settings: {
        ...settings,
        telegramBotToken: settings.telegramBotToken ? "••••••••" : null,
        resendApiKey: settings.resendApiKey ? "••••••••" : null,
        cloudflareApiKey: settings.cloudflareApiKey ? "••••••••" : null,
        ipqsApiKey: settings.ipqsApiKey ? "••••••••" : null,
        b2AppKey: settings.b2AppKey ? "••••••••" : null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// PUT /api/admin/settings
router.put("/", async (req: Request, res: Response) => {
  try {
    const {
      maintenanceMode, maintenanceMessage, telegramBotToken, telegramAdminChatId,
      backupSchedule, backupRetentionDays, fraudAutobanScore, resendApiKey,
      cloudflareApiKey, cloudflareZoneId, ipqsApiKey, domain, b2KeyId, b2AppKey, b2BucketName,
    } = req.body as Record<string, string | number | boolean>;

    const data: Record<string, unknown> = {};
    if (maintenanceMode !== undefined) data.maintenanceMode = maintenanceMode;
    if (maintenanceMessage !== undefined) data.maintenanceMessage = maintenanceMessage;
    if (telegramBotToken && telegramBotToken !== "••••••••") data.telegramBotToken = String(telegramBotToken);
    if (telegramAdminChatId !== undefined) data.telegramAdminChatId = String(telegramAdminChatId);
    if (backupSchedule !== undefined) data.backupSchedule = backupSchedule;
    if (backupRetentionDays !== undefined) data.backupRetentionDays = Number(backupRetentionDays);
    if (fraudAutobanScore !== undefined) data.fraudAutobanScore = Number(fraudAutobanScore);
    if (resendApiKey && resendApiKey !== "••••••••") data.resendApiKey = String(resendApiKey);
    if (cloudflareApiKey && cloudflareApiKey !== "••••••••") data.cloudflareApiKey = String(cloudflareApiKey);
    if (cloudflareZoneId !== undefined) data.cloudflareZoneId = cloudflareZoneId;
    if (ipqsApiKey && ipqsApiKey !== "••••••••") data.ipqsApiKey = String(ipqsApiKey);
    if (domain !== undefined) data.domain = domain;
    if (b2KeyId !== undefined) data.b2KeyId = b2KeyId;
    if (b2AppKey && b2AppKey !== "••••••••") data.b2AppKey = String(b2AppKey);
    if (b2BucketName !== undefined) data.b2BucketName = b2BucketName;

    const settings = await (prisma as any).settings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", ...data, updatedAt: new Date() },
      update: { ...data },
    });

    res.json({ success: true, message: "Settings saved", settings });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/settings/test-telegram
router.post("/test-telegram", async (_req: Request, res: Response) => {
  try {
    const settings = await (prisma as any).settings.findUnique({ where: { id: "singleton" } });
    if (!settings?.telegramBotToken || !settings?.telegramAdminChatId) {
      res.status(400).json({ success: false, error: "Telegram not configured" }); return;
    }
    await notify.telegramAdmin("✅ *Test Message*\nTelegram notifications are working correctly!");
    res.json({ success: true, message: "Test message sent!" });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/settings/test-email
router.post("/test-email", async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email: string };
    if (!email) { res.status(400).json({ success: false, error: "Email required" }); return; }
    await notify.sendEmail(email, "Test Email", "<h1>Test</h1><p>Email notifications are working correctly!</p>");
    res.json({ success: true, message: `Test email sent to ${email}` });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

export default router;
