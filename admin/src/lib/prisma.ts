import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  try {
    return new PrismaClient({ log: ["error"] });
  } catch (e) {
    console.warn("[Prisma] Client init failed — DB features will return empty data.", e);
    return null;
  }
}

export const prisma = (globalForPrisma.prisma ?? createPrismaClient()) as PrismaClient;

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}

