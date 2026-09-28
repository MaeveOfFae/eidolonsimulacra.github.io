import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma, Prisma } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';

const router: Router = Router();
router.use(authenticateToken);

const archivedSeedRunSchema = z.object({
  id: z.string().trim().min(1),
  createdAt: z.coerce.date(),
  archivedAt: z.coerce.date(),
  request: z.object({
    genreLines: z.string(),
    count: z.number().int().positive(),
    coverageMode: z.enum(['per-genre', 'blended']),
    surpriseMode: z.boolean(),
    presetId: z.string().optional(),
  }),
  seeds: z.array(z.string().trim().min(1)),
});

async function listRuns(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const runs = await prisma.archivedSeedRun.findMany({
    where: { userId },
    orderBy: { archivedAt: 'desc' },
  });

  res.json({
    runs: runs.map(
      (run: { id: string; createdAt: Date; archivedAt: Date; request: Prisma.JsonValue; seeds: string[] }) => ({
        id: run.id,
        createdAt: run.createdAt,
        archivedAt: run.archivedAt,
        request: run.request,
        seeds: run.seeds,
      }),
    ),
  });
}

router.get('/', listRuns);
router.get('/list', listRuns);
router.get('/pull', listRuns);

router.post(
  '/push',
  validateBody(
    z.object({
      runs: z.array(archivedSeedRunSchema),
    }),
  ),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { runs } = req.body as { runs: Array<z.infer<typeof archivedSeedRunSchema>> };

    await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      await transaction.archivedSeedRun.deleteMany({
        where: { userId },
      });

      if (runs.length === 0) {
        return;
      }

      await transaction.archivedSeedRun.createMany({
        data: runs.map((run) => ({
          id: run.id,
          userId,
          createdAt: run.createdAt,
          archivedAt: run.archivedAt,
          request: run.request as Prisma.InputJsonValue,
          seeds: run.seeds,
        })),
      });
    });

    res.json({
      results: runs.map((run) => ({
        id: run.id,
        status: 'saved',
      })),
    });
  },
);

export default router;
