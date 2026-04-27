import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import prisma from './config/prisma';
import authRoutes from './routes/auth.routes';
import vpsRoutes from './routes/vps.routes';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vps', vpsRoutes);
app.use('/api/user', userRoutes);

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
