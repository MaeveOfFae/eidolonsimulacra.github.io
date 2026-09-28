// Templates CRUD routes
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma, Prisma } from '../db.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.js';

const router: Router = Router();

// Type for template data received from client during push
interface TemplatePushData {
  name: string;
  version?: string;
  description?: string | null;
  isDefault?: boolean;
  isOfficial?: boolean;
  assets: Prisma.JsonValue;
  blueprintContent?: Prisma.JsonValue;
}
router.use(authenticateToken);

// Validation Schemas
const assetDefinitionSchema = z.object({
  name: z.string(),
  required: z.boolean(),
  depends_on: z.array(z.string()),
  description: z.string(),
  blueprint_file: z.string().optional(),
  import_aliases: z.array(z.string()).optional(),
});

const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  version: z.string().default('1.0.0'),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  assets: z.array(assetDefinitionSchema),
  blueprintContent: z.record(z.string()).optional(),
});

const templateParamsSchema = z.object({ name: z.string() });

const templateQuerySchema = z.object({
  includeOfficial: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
});

// GET / - List templates
router.get(
  '/',
  optionalAuth,
  validateQuery(templateQuerySchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const q = req.query as { includeOfficial?: string; search?: string };

    const where: Prisma.TemplateWhereInput = {
      OR: [{ isOfficial: q.includeOfficial !== 'false' }, ...(userId ? [{ userId }] : [])],
    };

    if (q.search) {
      where.OR = (where.OR as Prisma.TemplateWhereInput[]).map((cond) => ({
        ...cond,
        OR: [
          { name: { contains: q.search, mode: 'insensitive' } },
          { description: { contains: q.search, mode: 'insensitive' } },
        ],
      }));
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy: [{ isOfficial: 'desc' }, { isDefault: 'desc' }, { name: 'asc' }],
    });
    res.json({ templates });
  },
);

// GET /:name - Get template by name
router.get('/:name', validateParams(templateParamsSchema), async (req: Request, res: Response): Promise<void> => {
  const name = req.params.name as string;
  const template = await prisma.template.findUnique({ where: { name } });
  if (!template) {
    res.status(404).json({ error: 'Template not found' });
    return;
  }
  res.json({ template });
});

// POST / - Create template
router.post(
  '/',
  authenticateToken,
  validateBody(createTemplateSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const data = req.body;

    const existing = await prisma.template.findUnique({ where: { name: data.name } });
    if (existing) {
      res.status(409).json({ error: 'Template with this name already exists' });
      return;
    }

    const template = await prisma.template.create({
      data: {
        name: data.name,
        version: data.version || '1.0.0',
        description: data.description,
        isDefault: data.isDefault || false,
        assets: data.assets,
        blueprintContent: data.blueprintContent || {},
        userId,
      },
    });
    res.status(201).json({ template });
  },
);

// PUT /:name - Update template
router.put(
  '/:name',
  authenticateToken,
  validateParams(templateParamsSchema),
  validateBody(createTemplateSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const name = req.params.name as string;
    const data = req.body;

    const existing = await prisma.template.findUnique({ where: { name } });
    if (!existing) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    if (existing.isOfficial || existing.userId !== userId) {
      res.status(403).json({ error: 'Cannot modify this template' });
      return;
    }

    const template = await prisma.template.update({
      where: { name },
      data: {
        name: data.name,
        version: data.version,
        description: data.description,
        isDefault: data.isDefault,
        assets: data.assets,
        blueprintContent: data.blueprintContent || existing.blueprintContent,
      },
    });
    res.json({ template });
  },
);

// DELETE /:name - Delete template
router.delete(
  '/:name',
  authenticateToken,
  validateParams(templateParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const name = req.params.name as string;

    const existing = await prisma.template.findUnique({ where: { name } });
    if (!existing) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    if (existing.isOfficial || existing.userId !== userId) {
      res.status(403).json({ error: 'Cannot delete this template' });
      return;
    }

    await prisma.template.delete({ where: { name } });
    res.json({ message: 'Template deleted successfully' });
  },
);

// =============================================================================
// Sync Endpoints (for client sync functionality)
// =============================================================================

// GET /list - List all templates for sync
router.get('/list', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  const where: Prisma.TemplateWhereInput = {
    OR: [{ isOfficial: true }, ...(userId ? [{ userId }] : [])],
  };

  const templates = await prisma.template.findMany({
    where,
    orderBy: [{ isOfficial: 'desc' }, { name: 'asc' }],
  });

  res.json({ templates });
});

// GET /pull - Pull all templates for sync
router.get('/pull', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const templates = await prisma.template.findMany({
    where: {
      OR: [{ isOfficial: true }, { userId }],
    },
    orderBy: [{ isOfficial: 'desc' }, { name: 'asc' }],
  });

  res.json({ templates });
});

// POST /push - Push templates to server
router.post(
  '/push',
  authenticateToken,
  validateBody(
    z.object({
      templates: z.array(z.record(z.unknown())),
    }),
  ),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { templates } = req.body as { templates: TemplatePushData[] };
    const results: Array<{ name: string; status: string }> = [];

    for (const templateData of templates) {
      try {
        const name = templateData.name;
        const existing = await prisma.template.findUnique({ where: { name } });

        if (existing) {
          if (existing.isOfficial) {
            results.push({ name, status: 'skipped_official' });
            continue;
          }
          if (existing.userId !== userId) {
            results.push({ name, status: 'skipped_not_owner' });
            continue;
          }

          await prisma.template.update({
            where: { name },
            data: {
              name: templateData.name,
              version: templateData.version ?? existing.version,
              description: templateData.description,
              isDefault: templateData.isDefault ?? existing.isDefault,
              assets: templateData.assets as Prisma.InputJsonValue,
              blueprintContent: (templateData.blueprintContent ?? existing.blueprintContent) as Prisma.InputJsonValue,
            },
          });
          results.push({ name, status: 'updated' });
        } else {
          await prisma.template.create({
            data: {
              name: templateData.name,
              version: templateData.version ?? '1.0.0',
              description: templateData.description,
              isDefault: templateData.isDefault ?? false,
              isOfficial: false,
              assets: templateData.assets as Prisma.InputJsonValue,
              blueprintContent: (templateData.blueprintContent ?? {}) as Prisma.InputJsonValue,
              userId,
            },
          });
          results.push({ name, status: 'created' });
        }
      } catch {
        results.push({ name: templateData.name, status: 'error' });
      }
    }

    res.json({ results });
  },
);

export default router;
