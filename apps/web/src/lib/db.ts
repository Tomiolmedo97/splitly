import "server-only";
import { PrismaClient } from "@prisma/client";

/**
 * Singleton de Prisma Client. En desarrollo, el hot reload de Next vuelve a
 * evaluar los módulos; guardamos la instancia en globalThis para no abrir
 * una conexión nueva en cada recarga. En Vercel cada función usa la suya.
 *
 * Instanciar el cliente no abre conexiones: el build funciona sin DATABASE_URL.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
