import { PrismaClient } from "@prisma/client";

// Cache the client on globalThis in dev so Next/Turbopack hot reloads reuse a
// single PrismaClient instead of spawning a new one each reload — which leaks
// DB connections and eventually exhausts the database pooler.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default function GetPrismaClient() {
  return prisma;
}
