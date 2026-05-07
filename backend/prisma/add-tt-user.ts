import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
    connectionString, 
    ssl: { rejectUnauthorized: false } 
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const user = await prisma.user.upsert({
        where: { email: 'tt@gmail.com' },
        update: { password: 'password' },
        create: {
            email: 'tt@gmail.com',
            name: 'TT User',
            password: 'password',
            status: 'active'
        }
    });
    console.log('User created/updated successfully:', user.email);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
