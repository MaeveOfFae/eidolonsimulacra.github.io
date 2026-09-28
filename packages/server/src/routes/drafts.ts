// Drafts CRUD routes
import { MAX_CONNECTED_DRAFT_REFERENCES } from '@char-gen/shared/types';
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma, Prisma } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validation.js';

const router: Router = Router();
router.use(authenticateToken);

const connectedDraftIdsSchema = z.array(z.string().trim().min(1)).max(MAX_CONNECTED_DRAFT_REFERENCES);
const relatedLorebookSchema = z.object({
  id: z.number().optional(),
  book: z.string().nullable().optional(),
  path: z.string().optional(),
  version: z.string().optional(),
  commit_ref: z.string().optional(),
});
const cardMetadataSchema = z.object({
  avatar: z.string().optional(),
  creator: z.string().optional(),
  character_version: z.string().optional(),
  depth_prompt: z
    .object({
      depth: z.number(),
      prompt: z.string(),
    })
    .optional(),
  chub: z
    .object({
      id: z.number().optional(),
      preset: z.string().nullable().optional(),
      full_path: z.string().optional(),
      custom_css: z.string().nullable().optional(),
      extensions: z.array(z.unknown()).optional(),
      expressions: z.unknown().optional(),
      alt_expressions: z.record(z.string(), z.unknown()).optional(),
      background_image: z.string().optional(),
      related_lorebooks: z.array(relatedLorebookSchema).optional(),
    })
    .optional(),
});

// Validation Schemas
const createDraftSchema = z.object({
  reviewId: z.string(),
  seed: z.string(),
  mode: z.enum(['SFW', 'NSFW', 'Platform-Safe', 'Auto']).optional(),
  model: z.string().optional(),
  archivedAt: z.string().optional(),
  characterName: z.string().optional(),
  templateName: z.string().optional(),
  genre: z.string().optional(),
  notes: z.string().optional(),
  favorite: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  offspringType: z.string().optional(),
  customInstructions: z.string().optional(),
  componentSendOrder: z.array(z.string()).optional(),
  assets: z.record(z.string()),
  parentDraftIds: z.array(z.string()).optional(),
  connectedDraftIds: connectedDraftIdsSchema.optional(),
  cardMetadata: cardMetadataSchema.optional(),
});

const updateDraftSchema = createDraftSchema.partial();

const pushDraftSchema = z.object({
  reviewId: z.string(),
  seed: z.string(),
  mode: z.enum(['SFW', 'NSFW', 'Platform-Safe', 'Auto']).optional(),
  model: z.string().optional(),
  archivedAt: z.string().optional(),
  characterName: z.string().optional(),
  templateName: z.string().optional(),
  genre: z.string().optional(),
  notes: z.string().optional(),
  favorite: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  offspringType: z.string().optional(),
  customInstructions: z.string().optional(),
  componentSendOrder: z.array(z.string()).optional(),
  assets: z.record(z.string()),
  parentDraftIds: z.array(z.string()).optional(),
  connectedDraftIds: connectedDraftIdsSchema.optional(),
  cardMetadata: cardMetadataSchema.optional(),
});

function normalizeConnectedDraftIds(reviewId: string, draftIds?: string[]): string[] {
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const draftId of draftIds ?? []) {
    const trimmedDraftId = draftId.trim();
    if (!trimmedDraftId || trimmedDraftId === reviewId || seen.has(trimmedDraftId)) {
      continue;
    }

    seen.add(trimmedDraftId);
    normalized.push(trimmedDraftId);

    if (normalized.length >= MAX_CONNECTED_DRAFT_REFERENCES) {
      break;
    }
  }

  return normalized;
}

function toPrismaJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function buildDraftWriteData(
  userId: string,
  draftData: z.infer<typeof createDraftSchema> | z.infer<typeof pushDraftSchema>,
): Prisma.DraftUncheckedCreateInput {
  return {
    userId,
    reviewId: draftData.reviewId,
    seed: draftData.seed,
    mode: draftData.mode ?? 'Auto',
    model: draftData.model,
    archivedAt: draftData.archivedAt ? new Date(draftData.archivedAt) : null,
    characterName: draftData.characterName,
    templateName: draftData.templateName,
    genre: draftData.genre,
    notes: draftData.notes,
    favorite: draftData.favorite ?? false,
    tags: draftData.tags ?? [],
    offspringType: draftData.offspringType,
    customInstructions: draftData.customInstructions,
    componentSendOrder: draftData.componentSendOrder ?? [],
    connectedDraftIds: normalizeConnectedDraftIds(draftData.reviewId, draftData.connectedDraftIds),
    cardMetadata: toPrismaJsonValue(draftData.cardMetadata),
    assets: draftData.assets,
  };
}

function buildDraftUpdateData(
  draftData: Partial<z.infer<typeof createDraftSchema>>,
  currentReviewId: string,
  options: { preserveArchivedAtWhenMissing?: boolean } = {},
): Prisma.DraftUncheckedUpdateInput {
  const reviewId = draftData.reviewId ?? currentReviewId;

  return {
    reviewId: draftData.reviewId,
    seed: draftData.seed,
    mode: draftData.mode,
    model: draftData.model,
    archivedAt:
      draftData.archivedAt === undefined && options.preserveArchivedAtWhenMissing
        ? undefined
        : draftData.archivedAt
          ? new Date(draftData.archivedAt)
          : draftData.archivedAt === undefined
            ? null
            : null,
    characterName: draftData.characterName,
    templateName: draftData.templateName,
    genre: draftData.genre,
    notes: draftData.notes,
    favorite: draftData.favorite,
    tags: draftData.tags,
    offspringType: draftData.offspringType,
    customInstructions: draftData.customInstructions,
    componentSendOrder: draftData.componentSendOrder,
    connectedDraftIds:
      draftData.connectedDraftIds === undefined
        ? undefined
        : normalizeConnectedDraftIds(reviewId, draftData.connectedDraftIds),
    cardMetadata: toPrismaJsonValue(draftData.cardMetadata),
    assets: draftData.assets,
  };
}

const draftQuerySchema = z.object({
  search: z.string().optional(),
  tags: z.string().optional(),
  favorite: z.enum(['true', 'false']).optional(),
  archived: z.enum(['true', 'false']).optional(),
  includeArchived: z.enum(['true', 'false']).optional(),
  genre: z.string().optional(),
  template: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'characterName']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
});

const draftParamsSchema = z.object({ id: z.string().uuid() });

// GET / - List drafts
router.get('/', validateQuery(draftQuerySchema), async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const q = req.query as z.infer<typeof draftQuerySchema>;

  const where: Prisma.DraftWhereInput = { userId };

  if (q.includeArchived !== 'true') {
    where.archivedAt = q.archived === 'true' ? { not: null } : null;
  } else if (q.archived === 'true') {
    where.archivedAt = { not: null };
  } else if (q.archived === 'false') {
    where.archivedAt = null;
  }

  if (q.search) {
    where.OR = [
      { characterName: { contains: q.search, mode: 'insensitive' } },
      { notes: { contains: q.search, mode: 'insensitive' } },
    ];
  }
  if (q.tags) where.tags = { hasEvery: q.tags.split(',') };
  if (q.favorite !== undefined) where.favorite = q.favorite === 'true';
  if (q.genre) where.genre = q.genre;
  if (q.template) where.templateName = q.template;

  const [drafts, total] = await Promise.all([
    prisma.draft.findMany({
      where,
      orderBy: { [q.sortBy || 'updatedAt']: q.sortOrder || 'desc' },
      take: q.limit || 50,
      skip: q.offset || 0,
    }),
    prisma.draft.count({ where }),
  ]);

  res.json({
    drafts,
    pagination: {
      total,
      limit: q.limit || 50,
      offset: q.offset || 0,
      hasMore: (q.offset || 0) + (q.limit || 50) < total,
    },
  });
});

// GET /stats - Get draft statistics
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const [total, archived, favorites] = await Promise.all([
    prisma.draft.count({ where: { userId, archivedAt: null } }),
    prisma.draft.count({ where: { userId, archivedAt: { not: null } } }),
    prisma.draft.count({ where: { userId, favorite: true, archivedAt: null } }),
  ]);
  res.json({ total, archived, favorites });
});

// GET /tags - Get all unique tags
router.get('/tags', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const drafts = await prisma.draft.findMany({ where: { userId, archivedAt: null }, select: { tags: true } });
  const uniqueTags = [...new Set(drafts.flatMap((d) => d.tags))].sort();
  res.json({ tags: uniqueTags });
});

// =============================================================================
// Sync Endpoints (for client sync functionality)
// =============================================================================

// GET /list - List all drafts for sync
router.get('/list', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const drafts = await prisma.draft.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
  res.json({ drafts });
});

// GET /pull - Pull all drafts for sync
router.get('/pull', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const drafts = await prisma.draft.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
  res.json({ drafts });
});

// POST /push - Push drafts to server
router.post(
  '/push',
  authenticateToken,
  validateBody(
    z.object({
      drafts: z.array(pushDraftSchema),
    }),
  ),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { drafts } = req.body as { drafts: Array<z.infer<typeof pushDraftSchema>> };
    const results: Array<{ reviewId: string; status: string; error?: string }> = [];

    for (const draftData of drafts) {
      try {
        const reviewId = draftData.reviewId;
        const draftWriteData: Prisma.DraftUncheckedCreateInput = {
          ...buildDraftWriteData(userId, draftData),
        };

        const existing = await prisma.draft.findFirst({
          where: { userId, reviewId },
        });

        if (existing) {
          await prisma.draft.update({
            where: { id: existing.id },
            data: {
              seed: draftWriteData.seed,
              mode: draftWriteData.mode,
              model: draftWriteData.model,
              archivedAt: draftWriteData.archivedAt,
              characterName: draftWriteData.characterName,
              templateName: draftWriteData.templateName,
              genre: draftWriteData.genre,
              notes: draftWriteData.notes,
              favorite: draftWriteData.favorite,
              tags: draftWriteData.tags,
              offspringType: draftWriteData.offspringType,
              customInstructions: draftWriteData.customInstructions,
              componentSendOrder: draftWriteData.componentSendOrder,
              connectedDraftIds: draftWriteData.connectedDraftIds,
              cardMetadata: draftWriteData.cardMetadata,
              assets: draftWriteData.assets,
            },
          });
          results.push({ reviewId, status: 'updated' });
        } else {
          await prisma.draft.create({
            data: draftWriteData,
          });
          results.push({ reviewId, status: 'created' });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown draft sync error';
        console.error(`Draft sync failed for ${draftData.reviewId}:`, error);
        results.push({ reviewId: draftData.reviewId as string, status: 'error', error: message });
      }
    }

    res.json({ results });
  },
);

// GET /:id - Get draft by ID
router.get('/:id', validateParams(draftParamsSchema), async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const id = req.params.id as string;

  const draft = await prisma.draft.findFirst({ where: { id, userId } });
  if (!draft) {
    res.status(404).json({ error: 'Draft not found' });
    return;
  }
  res.json({ draft });
});

// POST / - Create draft
router.post('/', validateBody(createDraftSchema), async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const data = req.body;

  const existing = await prisma.draft.findUnique({
    where: { userId_reviewId: { userId, reviewId: data.reviewId } },
  });
  if (existing) {
    res.status(409).json({ error: 'Draft already exists' });
    return;
  }

  const draft = await prisma.draft.create({
    data: {
      ...buildDraftWriteData(userId, data),
    },
  });
  res.status(201).json({ draft });
});

// PUT /:id - Update draft
router.put(
  '/:id',
  validateParams(draftParamsSchema),
  validateBody(createDraftSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const data = req.body;

    const existing = await prisma.draft.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ error: 'Draft not found' });
      return;
    }

    const draft = await prisma.draft.update({
      where: { id },
      data: buildDraftUpdateData(data, existing.reviewId),
    });
    res.json({ draft });
  },
);

// PATCH /:id - Update draft metadata
router.patch(
  '/:id',
  validateParams(draftParamsSchema),
  validateBody(updateDraftSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const data = req.body;

    const existing = await prisma.draft.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ error: 'Draft not found' });
      return;
    }

    const draft = await prisma.draft.update({
      where: { id },
      data: buildDraftUpdateData(data, existing.reviewId, { preserveArchivedAtWhenMissing: true }),
    });
    res.json({ draft });
  },
);

// DELETE /:id - Delete draft
router.delete('/:id', validateParams(draftParamsSchema), async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const id = req.params.id as string;

  const existing = await prisma.draft.findFirst({ where: { id, userId } });
  if (!existing) {
    res.status(404).json({ error: 'Draft not found' });
    return;
  }

  await prisma.draft.delete({ where: { id } });
  res.json({ message: 'Draft deleted' });
});

export default router;
