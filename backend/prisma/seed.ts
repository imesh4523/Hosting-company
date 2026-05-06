import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = [
    { name: 'Shared Hosting', description: 'Affordable hosting for small websites' },
    { name: 'VPS Hosting', description: 'High performance virtual private servers' },
    { name: 'VDS Hosting', description: 'Dedicated resources for demanding apps' },
  ];

  for (const cat of categories) {
    const category = await prisma.planCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });

    if (cat.name === 'Shared Hosting') {
      await prisma.plan.createMany({
        data: [
          { name: 'Basic Shared', categoryId: category.id, priceMonthly: 3.50, ram: '1GB', cpu: '1 Core', storage: '20GB SSD' },
          { name: 'Plus Shared', categoryId: category.id, priceMonthly: 7.50, ram: '2GB', cpu: '2 Cores', storage: '50GB SSD' },
        ],
        skipDuplicates: true,
      });
    } else if (cat.name === 'VPS Hosting') {
      await prisma.plan.createMany({
        data: [
          { name: 'Starter VPS', categoryId: category.id, priceMonthly: 12.90, ram: '2GB', cpu: '1 Core', storage: '40GB NVMe', doSize: 's-1vcpu-2gb' },
          { name: 'Premium VPS', categoryId: category.id, priceMonthly: 25.90, ram: '4GB', cpu: '2 Cores', storage: '80GB NVMe', doSize: 's-2vcpu-4gb' },
        ],
        skipDuplicates: true,
      });
    }
  }

  // Hash the password properly with bcrypt
  const hashedPassword = await bcrypt.hash('SecureHost!@#2026', 10);
  console.log('Hashed password generated');

  // Create OR UPDATE the test user - ALWAYS update password to hashed version
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {
      password: hashedPassword,
      status: 'active',
    },
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      status: 'active',
    },
  });

  console.log('Test user created/updated:', testUser.email);

  // Create sample data only if it doesn't exist
  const existingInvoice = await prisma.invoice.findFirst({ where: { userId: testUser.id } });
  if (!existingInvoice) {
    await prisma.invoice.create({
      data: {
        userId: testUser.id,
        amount: 15.50,
        status: 'unpaid',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const existingTicket = await prisma.supportTicket.findFirst({ where: { userId: testUser.id } });
  if (!existingTicket) {
    await prisma.supportTicket.create({
      data: {
        userId: testUser.id,
        subject: 'Server is slow',
        priority: 'high',
        status: 'open',
        messages: {
          create: {
            sender: 'user',
            message: 'My VPS is responding very slowly today. Can you check?',
          },
        },
      },
    });
  }

  const existingDomain = await prisma.domain.findFirst({ where: { userId: testUser.id } });
  if (!existingDomain) {
    await prisma.domain.create({
      data: {
        userId: testUser.id,
        domainName: 'testdomain.com',
        status: 'active',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        nextDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('✅ Seed complete. Login: test@example.com / SecureHost!@#2026');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
