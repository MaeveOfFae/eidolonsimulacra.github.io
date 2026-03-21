// Blueprints CRUD routes
import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma, Prisma } from "../db.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validation.js";

const router: Router = Router();

// Validation Schemas
const createBlueprintSchema = z.object({
  path: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  invokable: z.boolean().optional(),
  version: z.string().optional(),
  category: z.enum(["core", "system", "template", "example", "custom"]).optional(),
  content: z.string().min(1),
});

const updateBlueprintSchema = createBlueprintSchema.partial().omit({ path: true });

const blueprintParamsSchema = z.object({ path: z.string() });

const blueprintQuerySchema = z.object({
  search: z.string().optional(),
  category: z.enum(["core", "system", "template", "example", "custom"]).optional(),
  includeBuiltin: z.enum(["true", "false"]).optional(),
  invokable: z.enum(["true", "false"]).optional(),
});

// GET / - List blueprints
router.get(
  "/",
  optionalAuth,
  validateQuery(blueprintQuerySchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const q = req.query as z.infer<typeof blueprintQuerySchema>;

    const where: Prisma.BlueprintWhereInput = {
      OR: [
        { isBuiltin: q.includeBuiltin !== "false" },
        ...(userId ? [{ userId }] : []),
      ],
    };

    if (q.search) {
      where.AND = [
        {
          OR: [
            { name: { contains: q.search, mode: "insensitive" } },
            { description: { contains: q.search, mode: "insensitive" } },
            { path: { contains: q.search, mode: "insensitive" } },
          ],
        },
      ];
    }

    if (q.category) {
      where.category = q.category;
    }

    if (q.invokable !== undefined) {
      where.invokable = q.invokable === "true";
    }

    const blueprints = await prisma.blueprint.findMany({
      where,
      orderBy: [{ isBuiltin: "desc" }, { name: "asc" }],
    });

    res.json({ blueprints });
  }
);

// =============================================================================
// Sync Endpoints (MUST come before /:path routes)
// =============================================================================

// GET /list - List all blueprints for sync
router.get(
  "/list",
  optionalAuth,
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    const where: Prisma.BlueprintWhereInput = {
      OR: [
        { isBuiltin: true },
        ...(userId ? [{ userId }] : []),
      ],
    };

    const blueprints = await prisma.blueprint.findMany({
      where,
      orderBy: [{ isBuiltin: "desc" }, { name: "asc" }],
    });

    res.json({ blueprints });
  }
);

// GET /pull - Pull all blueprints for sync
router.get(
  "/pull",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    const blueprints = await prisma.blueprint.findMany({
      where: {
        OR: [
          { isBuiltin: true },
          { userId },
        ],
      },
      orderBy: [{ isBuiltin: "desc" }, { name: "asc" }],
    });

    res.json({ blueprints });
  }
);

// POST /push - Push blueprints to server
router.post(
  "/push",
  authenticateToken,
  validateBody(z.object({
    blueprints: z.array(z.object({
      path: z.string(),
      name: z.string(),
      description: z.string().optional(),
      invokable: z.boolean().optional(),
      version: z.string().optional(),
      category: z.enum(["core", "system", "template", "example", "custom"]).optional(),
      content: z.string(),
    })),
  })),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { blueprints } = req.body as { blueprints: Array<{
      path: string;
      name: string;
      description?: string;
      invokable?: boolean;
      version?: string;
      category?: string;
      content: string;
    }> };

    const results: Array<{ path: string; status: string; blueprint?: unknown }> = [];

    for (const bpData of blueprints) {
      try {
        const existing = await prisma.blueprint.findUnique({ where: { path: bpData.path } });

        if (existing) {
          if (existing.isBuiltin) {
            // Create an override as a custom blueprint
            const overridePath = `blueprints/overrides/${bpData.path.replace(/^blueprints\//, "")}`;
            const override = await prisma.blueprint.upsert({
              where: { path: overridePath },
              create: {
                path: overridePath,
                name: bpData.name,
                description: bpData.description,
                invokable: bpData.invokable ?? true,
                version: bpData.version ?? "1.0",
                category: "custom",
                content: bpData.content,
                userId,
                isBuiltin: false,
              },
              update: {
                name: bpData.name,
                description: bpData.description,
                invokable: bpData.invokable,
                version: bpData.version,
                content: bpData.content,
              },
            });
            results.push({ path: bpData.path, status: "override_created", blueprint: override });
          } else if (existing.userId !== userId) {
            results.push({ path: bpData.path, status: "skipped_not_owner" });
          } else {
            const updated = await prisma.blueprint.update({
              where: { path: bpData.path },
              data: {
                name: bpData.name,
                description: bpData.description,
                invokable: bpData.invokable,
                version: bpData.version,
                category: bpData.category,
                content: bpData.content,
              },
            });
            results.push({ path: bpData.path, status: "updated", blueprint: updated });
          }
        } else {
          const created = await prisma.blueprint.create({
            data: {
              path: bpData.path,
              name: bpData.name,
              description: bpData.description,
              invokable: bpData.invokable ?? true,
              version: bpData.version ?? "1.0",
              category: bpData.category ?? "custom",
              content: bpData.content,
              userId,
              isBuiltin: false,
            },
          });
          results.push({ path: bpData.path, status: "created", blueprint: created });
        }
      } catch (err) {
        console.error(`Failed to sync blueprint ${bpData.path}:`, err);
        results.push({ path: bpData.path, status: "error" });
      }
    }

    res.json({ results });
  }
);

// =============================================================================
// Individual Blueprint Routes (with :path parameter)
// =============================================================================

// GET /:path - Get blueprint by path
router.get(
  "/:path",
  validateParams(blueprintParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const params = req.params as z.infer<typeof blueprintParamsSchema>;
    const path = decodeURIComponent(params.path);
    const blueprint = await prisma.blueprint.findUnique({ where: { path } });
    if (!blueprint) {
      res.status(404).json({ error: "Blueprint not found" });
      return;
    }
    res.json({ blueprint });
  }
);

// POST / - Create blueprint
router.post(
  "/",
  authenticateToken,
  validateBody(createBlueprintSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const data = req.body;

    const existing = await prisma.blueprint.findUnique({ where: { path: data.path } });
    if (existing) {
      res.status(409).json({ error: "Blueprint with this path already exists" });
      return;
    }

    const blueprint = await prisma.blueprint.create({
      data: {
        path: data.path,
        name: data.name,
        description: data.description,
        invokable: data.invokable ?? true,
        version: data.version ?? "1.0",
        category: data.category ?? "custom",
        content: data.content,
        userId,
      },
    });
    res.status(201).json({ blueprint });
  }
);

// PUT /:path - Update blueprint
router.put(
  "/:path",
  authenticateToken,
  validateParams(blueprintParamsSchema),
  validateBody(createBlueprintSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof blueprintParamsSchema>;
    const path = decodeURIComponent(params.path);
    const data = req.body;

    const existing = await prisma.blueprint.findUnique({ where: { path } });
    if (!existing) {
      res.status(404).json({ error: "Blueprint not found" });
      return;
    }

    if (existing.isBuiltin || existing.userId !== userId) {
      res.status(403).json({ error: "Cannot modify this blueprint" });
      return;
    }

    const blueprint = await prisma.blueprint.update({
      where: { path },
      data: {
        name: data.name,
        description: data.description,
        invokable: data.invokable,
        version: data.version,
        category: data.category,
        content: data.content,
      },
    });
    res.json({ blueprint });
  }
);

// PATCH /:path - Partial update blueprint
router.patch(
  "/:path",
  authenticateToken,
  validateParams(blueprintParamsSchema),
  validateBody(updateBlueprintSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof blueprintParamsSchema>;
    const path = decodeURIComponent(params.path);
    const data = req.body;

    const existing = await prisma.blueprint.findUnique({ where: { path } });
    if (!existing) {
      res.status(404).json({ error: "Blueprint not found" });
      return;
    }

    if (existing.isBuiltin || existing.userId !== userId) {
      res.status(403).json({ error: "Cannot modify this blueprint" });
      return;
    }

    const blueprint = await prisma.blueprint.update({
      where: { path },
      data,
    });
    res.json({ blueprint });
  }
);

// DELETE /:path - Delete blueprint
router.delete(
  "/:path",
  authenticateToken,
  validateParams(blueprintParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof blueprintParamsSchema>;
    const path = decodeURIComponent(params.path);

    const existing = await prisma.blueprint.findUnique({ where: { path } });
    if (!existing) {
      res.status(404).json({ error: "Blueprint not found" });
      return;
    }

    if (existing.isBuiltin || existing.userId !== userId) {
      res.status(403).json({ error: "Cannot delete this blueprint" });
      return;
    }

    await prisma.blueprint.delete({ where: { path } });
    res.json({ message: "Blueprint deleted successfully" });
  }
);

// POST /:path/duplicate - Duplicate blueprint
router.post(
  "/:path/duplicate",
  authenticateToken,
  validateParams(blueprintParamsSchema),
  validateBody(z.object({ newPath: z.string().optional(), newName: z.string().optional() })),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof blueprintParamsSchema>;
    const path = decodeURIComponent(params.path);
    const { newPath, newName } = req.body;

    const existing = await prisma.blueprint.findUnique({ where: { path } });
    if (!existing) {
      res.status(404).json({ error: "Blueprint not found" });
      return;
    }

    const targetPath = newPath || `blueprints/custom/${existing.name.toLowerCase().replace(/\s+/g, '_')}_copy.md`;
    const conflict = await prisma.blueprint.findUnique({ where: { path: targetPath } });
    if (conflict) {
      res.status(409).json({ error: "Blueprint with this path already exists" });
      return;
    }

    const blueprint = await prisma.blueprint.create({
      data: {
        path: targetPath,
        name: newName || `${existing.name} Copy`,
        description: existing.description,
        invokable: existing.invokable,
        version: "1.0",
        category: "custom",
        content: existing.content,
        userId,
        isBuiltin: false,
      },
    });
    res.status(201).json({ blueprint });
  }
);

// POST /:path/reset - Reset blueprint to original (delete override)
router.post(
  "/:path/reset",
  authenticateToken,
  validateParams(blueprintParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof blueprintParamsSchema>;
    const path = decodeURIComponent(params.path);

    const existing = await prisma.blueprint.findUnique({ where: { path } });
    if (!existing) {
      res.status(404).json({ error: "Blueprint not found" });
      return;
    }

    if (existing.isBuiltin) {
      res.status(400).json({ error: "Cannot reset a built-in blueprint" });
      return;
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: "Cannot reset this blueprint" });
      return;
    }

    await prisma.blueprint.delete({ where: { path } });
    res.json({ message: "Blueprint reset successfully" });
  }
);

export default router;
