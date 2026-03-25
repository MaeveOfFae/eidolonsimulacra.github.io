import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma, Prisma } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";

const router: Router = Router();
router.use(authenticateToken);

const savedSeedSchema = z.object({
  seed: z.string().trim().min(1),
  addedAt: z.coerce.date(),
  lastUsedAt: z.coerce.date().optional(),
});

type SavedSeedPayload = z.infer<typeof savedSeedSchema>;

interface SavedSeedRow {
  seed: string;
  addedAt: Date;
  lastUsedAt: Date | null;
}

function dedupeSeeds(seeds: SavedSeedPayload[]) {
  const uniqueSeeds = new Map<string, SavedSeedPayload>();

  for (const seed of seeds) {
    uniqueSeeds.set(seed.seed, seed);
  }

  return Array.from(uniqueSeeds.values());
}

async function listSeeds(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const seeds = await prisma.$queryRaw<SavedSeedRow[]>(Prisma.sql`
    SELECT "seed", "addedAt", "lastUsedAt"
    FROM "saved_seeds"
    WHERE "userId" = ${userId}
    ORDER BY "lastUsedAt" DESC NULLS LAST, "addedAt" DESC
  `);

  res.json({
    seeds: seeds.map((seed: SavedSeedRow) => ({
      seed: seed.seed,
      addedAt: seed.addedAt,
      lastUsedAt: seed.lastUsedAt ?? undefined,
    })),
  });
}

router.get("/", listSeeds);
router.get("/list", listSeeds);
router.get("/pull", listSeeds);

router.post(
  "/push",
  validateBody(z.object({
    seeds: z.array(savedSeedSchema),
  })),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { seeds } = req.body as { seeds: SavedSeedPayload[] };
    const nextSeeds = dedupeSeeds(seeds);

    await prisma.$transaction(async (transaction) => {
      await transaction.$executeRaw(Prisma.sql`
        DELETE FROM "saved_seeds"
        WHERE "userId" = ${userId}
      `);

      if (nextSeeds.length === 0) {
        return;
      }

      const rows = Prisma.join(
        nextSeeds.map((seed) => Prisma.sql`(
          ${crypto.randomUUID()},
          ${userId},
          ${seed.seed},
          ${seed.addedAt},
          ${seed.lastUsedAt ?? null},
          NOW(),
          NOW()
        )`)
      );

      await transaction.$executeRaw(Prisma.sql`
        INSERT INTO "saved_seeds" (
          "id",
          "userId",
          "seed",
          "addedAt",
          "lastUsedAt",
          "createdAt",
          "updatedAt"
        )
        VALUES ${rows}
      `);
    });

    res.json({
      results: nextSeeds.map((seed) => ({
        seed: seed.seed,
        status: "saved",
      })),
    });
  }
);

export default router;
