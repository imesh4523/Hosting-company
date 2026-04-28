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
import appDeployRoutes from './routes/app-deploy.routes.js';
import { SuspensionDetector } from './services/suspension.service.js';

import passport from 'passport';
import { OAuthService } from './services/oauth.service.js';

dotenv.config();

const app = express();
const PORT = 5000; // Hardcoded to avoid conflict with Next.js using process.env.PORT

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vps', vpsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/xhr.php', aiRoutes);
app.use('/api/admin/servers',    adminServerRoutes);
app.use('/api/admin/migrations', adminMigrationRoutes);
app.use('/api/admin/auth',       adminAuthRoutes);
app.use('/api/apps',             appDeployRoutes);

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
