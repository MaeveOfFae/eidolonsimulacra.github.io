// Themes CRUD routes
import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { Prisma } from "@prisma/client";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validation.js";

const router: Router = Router();;

// Validation Schemas
const themeColorsSchema = z.object({
  background: z.string(),
  text: z.string(),
  accent: z.string(),
  button: z.string(),
  button_text: z.string(),
  border: z.string(),
  highlight: z.string(),
  window: z.string(),
  tok_brackets: z.string(),
  tok_asterisk: z.string(),
  tok_parentheses: z.string(),
  tok_double_brackets: z.string(),
  tok_curly_braces: z.string(),
  tok_pipes: z.string(),
  tok_at_sign: z.string(),
  muted_text: z.string(),
  surface: z.string(),
  success_bg: z.string(),
  danger_bg: z.string(),
  accent_bg: z.string(),
  accent_title: z.string(),
  success_text: z.string(),
  error_text: z.string(),
  warning_text: z.string(),
});

const createThemeSchema = z.object({
  name: z.string().min(1).max(255),
  displayName: z.string().optional(),
  description: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  basedOn: z.string().optional(),
  colors: themeColorsSchema,
});

const themeParamsSchema = z.object({ name: z.string() });

const themeQuerySchema = z.object({
  includeBuiltin: z.enum(["true", "false"]).optional(),
  search: z.string().optional(),
  tags: z.string().optional(),
});

// GET / - List themes
router.get(
  "/",
  optionalAuth,
  validateQuery(themeQuerySchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const q = req.query as { includeBuiltin?: string; search?: string; tags?: string };

    const where: Prisma.ThemeWhereInput = {
      OR: [
        { isBuiltin: q.includeBuiltin !== "false" },
        ...(userId ? [{ userId }] : []),
      ],
    };

    if (q.search) {
      where.OR = (where.OR as Prisma.ThemeWhereInput[]).map((cond) => ({
        ...cond,
        OR: [
          { name: { contains: q.search, mode: "insensitive" } },
          { displayName: { contains: q.search, mode: "insensitive" } },
        ],
      }));
    }

    if (q.tags) {
      where.tags = { hasEvery: q.tags.split(",") };
    }

    const themes = await prisma.theme.findMany({
      where,
      orderBy: [{ isBuiltin: "desc" }, { name: "asc" }],
    });
    res.json({ themes });
  }
);

// =============================================================================
// Sync Endpoints (MUST come before /:name routes)
// =============================================================================

// GET /list - List all themes for sync
router.get(
  "/list",
  optionalAuth,
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    const where: Prisma.ThemeWhereInput = {
      OR: [
        { isBuiltin: true },
        ...(userId ? [{ userId }] : []),
      ],
    };

    const themes = await prisma.theme.findMany({
      where,
      orderBy: [{ isBuiltin: "desc" }, { name: "asc" }],
    });

    res.json({ themes });
  }
);

// GET /pull - Pull all themes for sync
router.get(
  "/pull",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    const themes = await prisma.theme.findMany({
      where: {
        OR: [
          { isBuiltin: true },
          { userId },
        ],
      },
      orderBy: [{ isBuiltin: "desc" }, { name: "asc" }],
    });

    res.json({ themes });
  }
);

// POST /push - Push themes to server
router.post(
  "/push",
  authenticateToken,
  validateBody(z.object({
    themes: z.array(z.object({
      name: z.string(),
      displayName: z.string().optional(),
      description: z.string().optional(),
      author: z.string().optional(),
      tags: z.array(z.string()).optional(),
      basedOn: z.string().optional(),
      colors: themeColorsSchema,
    })),
  })),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { themes } = req.body as { themes: Array<{
      name: string;
      displayName?: string;
      description?: string;
      author?: string;
      tags?: string[];
      basedOn?: string;
      colors: z.infer<typeof themeColorsSchema>;
    }> };

    const results: Array<{ name: string; status: string; theme?: unknown }> = [];

    for (const themeData of themes) {
      try {
        const existing = await prisma.theme.findUnique({ where: { name: themeData.name } });

        if (existing) {
          if (existing.isBuiltin) {
            results.push({ name: themeData.name, status: "skipped_builtin" });
            continue;
          }
          if (existing.userId !== userId) {
            results.push({ name: themeData.name, status: "skipped_not_owner" });
            continue;
          }

          const updated = await prisma.theme.update({
            where: { name: themeData.name },
            data: {
              displayName: themeData.displayName,
              description: themeData.description,
              author: themeData.author,
              tags: themeData.tags || [],
              basedOn: themeData.basedOn,
              colors: themeData.colors,
            },
          });
          results.push({ name: themeData.name, status: "updated", theme: updated });
        } else {
          const created = await prisma.theme.create({
            data: {
              name: themeData.name,
              displayName: themeData.displayName || themeData.name,
              description: themeData.description,
              author: themeData.author,
              tags: themeData.tags || [],
              basedOn: themeData.basedOn,
              colors: themeData.colors,
              userId,
              isBuiltin: false,
            },
          });
          results.push({ name: themeData.name, status: "created", theme: created });
        }
      } catch {
        results.push({ name: themeData.name, status: "error" });
      }
    }

    res.json({ results });
  }
);

// =============================================================================
// Individual Theme Routes (with :name parameter)
// =============================================================================

// GET /:name - Get theme by name
router.get(
  "/:name",
  validateParams(themeParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const name = req.params.name as string;
    const theme = await prisma.theme.findUnique({ where: { name } });
    if (!theme) {
      res.status(404).json({ error: "Theme not found" });
      return;
    }
    res.json({ theme });
  }
);

// POST / - Create theme
router.post(
  "/",
  authenticateToken,
  validateBody(createThemeSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const data = req.body;

    const existing = await prisma.theme.findUnique({ where: { name: data.name } });
    if (existing) {
      res.status(409).json({ error: "Theme with this name already exists" });
      return;
    }

    const theme = await prisma.theme.create({
      data: {
        name: data.name,
        displayName: data.displayName || data.name,
        description: data.description,
        author: data.author,
        tags: data.tags || [],
        basedOn: data.basedOn,
        colors: data.colors,
        userId,
      },
    });
    res.status(201).json({ theme });
  }
);

// PUT /:name - Update theme
router.put(
  "/:name",
  authenticateToken,
  validateParams(themeParamsSchema),
  validateBody(createThemeSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const name = req.params.name as string;
    const data = req.body;

    const existing = await prisma.theme.findUnique({ where: { name } });
    if (!existing) {
      res.status(404).json({ error: "Theme not found" });
      return;
    }

    if (existing.isBuiltin || existing.userId !== userId) {
      res.status(403).json({ error: "Cannot modify this theme" });
      return;
    }

    const theme = await prisma.theme.update({
      where: { name },
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        author: data.author,
        tags: data.tags || existing.tags,
        basedOn: data.basedOn,
        colors: data.colors,
      },
    });
    res.json({ theme });
  }
);

// DELETE /:name - Delete theme
router.delete(
  "/:name",
  authenticateToken,
  validateParams(themeParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const name = req.params.name as string;

    const existing = await prisma.theme.findUnique({ where: { name } });
    if (!existing) {
      res.status(404).json({ error: "Theme not found" });
      return;
    }

    if (existing.isBuiltin || existing.userId !== userId) {
      res.status(403).json({ error: "Cannot delete this theme" });
      return;
    }

    await prisma.theme.delete({ where: { name } });
    res.json({ message: "Theme deleted successfully" });
  }
);

// POST /:name/duplicate - Duplicate theme
router.post(
  "/:name/duplicate",
  authenticateToken,
  validateParams(themeParamsSchema),
  validateBody(z.object({ newName: z.string().optional() })),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const name = req.params.name as string;
    const { newName } = req.body;

    const existing = await prisma.theme.findUnique({ where: { name } });
    if (!existing) {
      res.status(404).json({ error: "Theme not found" });
      return;
    }

    const duplicateName = newName || `${name}-copy`;
    const conflict = await prisma.theme.findUnique({ where: { name: duplicateName } });
    if (conflict) {
      res.status(409).json({ error: "Theme with this name already exists" });
      return;
    }

    const theme = await prisma.theme.create({
      data: {
        name: duplicateName,
        displayName: existing.displayName ? `${existing.displayName} (Copy)` : duplicateName,
        description: existing.description,
        author: existing.author,
        tags: existing.tags,
        basedOn: name,
        colors: existing.colors as Prisma.InputJsonValue,
        userId,
        isBuiltin: false,
      },
    });
    res.status(201).json({ theme });
  }
);

export default router;
