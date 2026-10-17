/**
 * Seed de datos de ejemplo. SOLO corre en local o en previews de Vercel
 * (branch de Neon del preview). Nunca en producción.
 *
 *   pnpm --filter @splitly/web db:seed
 *
 * Es idempotente: se puede correr varias veces sin duplicar datos.
 * Usuarios de prueba (contraseña: splitly-demo-123):
 *   tomas@example.com, lucia@example.com → integrantes de "Viaje a Bariloche"
 *     (junto con Martín, invitado sin cuenta).
 *   nora@example.com → NO comparte ningún grupo con nadie: sirve para probar
 *     NOT_FOUND (grupo ajeno, addMember kind "user" con alguien desconocido).
 */
import { PrismaClient } from "@prisma/client";
import { splitEqual, splitPercent } from "@splitly/core";
import { toDbCents } from "../src/lib/cents";
import { hashPassword } from "../src/lib/password";

const DEMO_PASSWORD = "splitly-demo-123";

/** Permite el seed en local (sin VERCEL_ENV) o en previews; lo bloquea en cualquier otro caso. */
export function canSeed(env: NodeJS.ProcessEnv): boolean {
  if (env.VERCEL_ENV === "preview") return true;
  return env.VERCEL_ENV === undefined && env.NODE_ENV !== "production";
}

async function main() {
  if (!canSeed(process.env)) {
    console.error(
      `Seed bloqueado: solo corre en local o con VERCEL_ENV=preview (VERCEL_ENV=${process.env.VERCEL_ENV ?? "-"}, NODE_ENV=${process.env.NODE_ENV ?? "-"}).`,
    );
    process.exit(1);
  }

  const db = new PrismaClient();
  try {
    const passwordHash = await hashPassword(DEMO_PASSWORD);
    const tomas = await db.user.upsert({
      where: { email: "tomas@example.com" },
      update: {},
      create: { id: "seed_user_tomas", email: "tomas@example.com", name: "Tomás", passwordHash },
    });
    const lucia = await db.user.upsert({
      where: { email: "lucia@example.com" },
      update: {},
      create: { id: "seed_user_lucia", email: "lucia@example.com", name: "Lucía", passwordHash },
    });

    // Sin grupos: para tests de NOT_FOUND.
    await db.user.upsert({
      where: { email: "nora@example.com" },
      update: {},
      create: { id: "seed_user_nora", email: "nora@example.com", name: "Nora", passwordHash },
    });

    // Se recrea el grupo de ejemplo entero para que el seed sea determinista.
    // Primero los gastos: los FK a Member son Restrict (ver schema.prisma).
    await db.$transaction([
      db.expense.deleteMany({ where: { groupId: "seed_group_bariloche" } }),
      db.group.deleteMany({ where: { id: "seed_group_bariloche" } }),
    ]);
    await db.group.create({
      data: {
        id: "seed_group_bariloche",
        name: "Viaje a Bariloche",
        currency: "ARS",
        createdById: tomas.id,
        members: {
          create: [
            { id: "seed_member_a_tomas", name: "Tomás", userId: tomas.id },
            { id: "seed_member_b_lucia", name: "Lucía", userId: lucia.id },
            // Invitado sin cuenta.
            { id: "seed_member_c_martin", name: "Martín", userId: null },
          ],
        },
      },
    });

    const memberIds = ["seed_member_a_tomas", "seed_member_b_lucia", "seed_member_c_martin"];

    // Cabaña: $ 100.000,00 en partes iguales, pagó Tomás.
    const cabin = splitEqual(10_000_000, memberIds);
    await db.expense.create({
      data: {
        groupId: "seed_group_bariloche",
        description: "Cabaña (3 noches)",
        amountCents: toDbCents(10_000_000),
        currency: "ARS",
        paidByMemberId: "seed_member_a_tomas",
        splitType: "EQUAL",
        date: new Date("2026-10-10T00:00:00Z"),
        createdById: tomas.id,
        splits: {
          create: cabin.map((s) => ({ memberId: s.memberId, amountCents: toDbCents(s.amountCents) })),
        },
      },
    });

    // Cena: $ 45.000,00 por porcentaje (50 / 25 / 25), pagó Lucía.
    const shares = [
      { memberId: "seed_member_a_tomas", bps: 5000 },
      { memberId: "seed_member_b_lucia", bps: 2500 },
      { memberId: "seed_member_c_martin", bps: 2500 },
    ];
    const dinner = splitPercent(4_500_000, shares);
    await db.expense.create({
      data: {
        groupId: "seed_group_bariloche",
        description: "Cena en el centro",
        amountCents: toDbCents(4_500_000),
        currency: "ARS",
        paidByMemberId: "seed_member_b_lucia",
        splitType: "PERCENTAGE",
        date: new Date("2026-10-11T00:00:00Z"),
        createdById: lucia.id,
        splits: {
          create: dinner.map((s) => ({
            memberId: s.memberId,
            amountCents: toDbCents(s.amountCents),
            basisPoints: shares.find((x) => x.memberId === s.memberId)!.bps,
          })),
        },
      },
    });

    console.log("Seed OK: 3 usuarios (Nora sin grupos), 1 grupo, 3 integrantes (1 invitado), 2 gastos.");
  } finally {
    await db.$disconnect();
  }
}

// Solo ejecuta main() al correr el archivo directo (no al importarlo en tests).
if (process.argv[1]?.endsWith("seed.ts")) {
  main().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
