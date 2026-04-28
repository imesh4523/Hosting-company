import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL!;

// DigitalOcean managed PostgreSQL requires SSL
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
    // Allow self-signed certs from DO managed databases
  },
});

// Handle pool errors gracefully
pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
export default prisma;
