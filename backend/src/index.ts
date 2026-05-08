import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import prisma from './config/prisma.js';
import authRoutes from './routes/auth.routes.js';
import vpsRoutes from './routes/vps.routes.js';
import userRoutes from './routes/user.routes.js';
import aiRoutes from './routes/ai.routes.js';
import adminServerRoutes from './routes/admin.servers.route.js';
import adminMigrationRoutes from './routes/admin.migrations.route.js';
import adminAuthRoutes from './routes/admin.auth.route.js';
import adminSettingsRoutes from './routes/admin.settings.route.js';
import adminVpsRoutes from './routes/admin.vps.route.js';
import adminUsersRoutes from './routes/admin.users.route.js';
import adminAccountsRoutes from './routes/admin.accounts.route.js';
import adminAlertsRoutes from './routes/admin.alerts.route.js';
import adminBackupsRoutes from './routes/admin.backups.route.js';
import adminPlansRoutes from './routes/admin.plans.route.js';
import adminAuditRoutes from './routes/admin.audit.route.js';
import adminAnalyticsRoutes from './routes/admin.analytics.route.js';
import adminSupportRoutes from './routes/admin.support.route.js';
import adminPlatformSettingsRoutes from './routes/admin.platform-settings.route.js';
import appDeployRoutes from './routes/app-deploy.routes.js';
import accountRoutes from './routes/account.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import billingRoutes from './routes/billing.routes.js';
import domainRoutes from './routes/domain.routes.js';
import newsRoutes from './routes/news.routes.js';
import publicRoutes from './routes/public.routes.js';
import { SuspensionDetector } from './services/suspension.service.js';

import passport from 'passport';
import { OAuthService } from './services/oauth.service.js';
import { standardLimiter, authLimiter } from './middleware/rate-limit.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(passport.initialize());
app.use(standardLimiter);

// Customer routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/vps', vpsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/xhr.php', aiRoutes);
app.use('/api/apps', appDeployRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/public', publicRoutes);

// Admin routes
app.use('/api/admin/servers',           adminServerRoutes);
app.use('/api/admin/migrations',        adminMigrationRoutes);
app.use('/api/admin/auth',              adminAuthRoutes);
app.use('/api/admin/settings',          adminSettingsRoutes);
app.use('/api/admin/vps',               adminVpsRoutes);
app.use('/api/admin/users',             adminUsersRoutes);
app.use('/api/admin/cloud-accounts',    adminAccountsRoutes);
app.use('/api/admin/alerts',            adminAlertsRoutes);
app.use('/api/admin/backups',           adminBackupsRoutes);
app.use('/api/admin/plans',             adminPlansRoutes);
app.use('/api/admin/audit',             adminAuditRoutes);
app.use('/api/admin/analytics',         adminAnalyticsRoutes);
app.use('/api/admin/support',           adminSupportRoutes);
app.use('/api/admin/platform-settings', adminPlatformSettingsRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'VPS Reseller Platform API is running' });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'Error', database: 'Disconnected' });
  }
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  // Initialize OAuth strategies
  try {
    await OAuthService.init();
    console.log('[OAuth] Strategies initialized');
  } catch (e) {
    console.error('[OAuth] Init failed:', e);
  }

  // ─── Suspension Monitor (every 60s) ────────────────────────────────────
  const detector = new SuspensionDetector();
  setInterval(() => {
    detector.monitorAllAccounts().catch(e => console.error('[Monitor]', e.message));
  }, 60 * 1000);
  // Run immediately on startup
  detector.monitorAllAccounts().catch(() => {});
  console.log('[Monitor] Suspension detector active — checking every 60s');
});
