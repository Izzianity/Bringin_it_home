import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (prisma) {
    return prisma;
  }

  prisma = new PrismaClient({
    log: ["error", "warn"],
  });

  return prisma;
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}
