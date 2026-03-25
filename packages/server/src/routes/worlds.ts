// Worlds CRUD routes
import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma, Prisma } from "../db.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validation.js";

const router: Router = Router();

// Validation Schemas
const createWorldSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  genre: z.string().optional(),
  setting: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

const updateWorldSchema = createWorldSchema.partial();

const createCharacterSchema = z.object({
  draftId: z.string().optional(),
  characterName: z.string().min(1),
  role: z.string().optional(),
  notes: z.string().optional(),
});

const updateCharacterSchema = createCharacterSchema.partial();

const worldParamsSchema = z.object({ id: z.string().uuid() });
const characterParamsSchema = z.object({ worldId: z.string().uuid(), characterId: z.string().uuid() });

const worldQuerySchema = z.object({
  search: z.string().optional(),
  genre: z.string().optional(),
  tags: z.string().optional(),
  isPublic: z.enum(["true", "false"]).optional(),
  includePublic: z.enum(["true", "false"]).optional(),
});

const pushWorldSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  genre: z.string().optional(),
  setting: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

// GET / - List worlds
router.get(
  "/",
  optionalAuth,
  validateQuery(worldQuerySchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const q = req.query as z.infer<typeof worldQuerySchema>;

    const where: Prisma.WorldWhereInput = {};

    if (userId) {
      where.OR = [
        { userId },
        ...(q.includePublic !== "false" ? [{ isPublic: true }] : []),
      ];
    } else if (q.includePublic !== "false") {
      where.isPublic = true;
    } else {
      res.json({ worlds: [] });
      return;
    }

    if (q.search) {
      where.AND = [
        {
          OR: [
            { name: { contains: q.search, mode: "insensitive" } },
            { description: { contains: q.search, mode: "insensitive" } },
            { notes: { contains: q.search, mode: "insensitive" } },
          ],
        },
      ];
    }

    if (q.genre) {
      where.genre = { contains: q.genre, mode: "insensitive" };
    }

    if (q.tags) {
      where.tags = { hasEvery: q.tags.split(",") };
    }

    if (q.isPublic !== undefined) {
      where.isPublic = q.isPublic === "true";
    }

    const worlds = await prisma.world.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { characters: true, timelines: true } },
      },
    });

    res.json({ worlds });
  }
);

// GET /:id - Get world by ID
router.get(
  "/:id",
  optionalAuth,
  validateParams(worldParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const params = req.params as z.infer<typeof worldParamsSchema>;

    const world = await prisma.world.findUnique({
      where: { id: params.id },
      include: {
        characters: true,
        timelines: {
          include: { _count: { select: { events: true } } },
        },
      },
    });

    if (!world) {
      res.status(404).json({ error: "World not found" });
      return;
    }

    if (!world.isPublic && world.userId !== userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    res.json({ world });
  }
);

// POST / - Create world
router.post(
  "/",
  authenticateToken,
  validateBody(createWorldSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const data = req.body;

    const existing = await prisma.world.findFirst({
      where: { userId, name: data.name },
    });
    if (existing) {
      res.status(409).json({ error: "World with this name already exists" });
      return;
    }

    const world = await prisma.world.create({
      data: {
        name: data.name,
        description: data.description,
        genre: data.genre,
        setting: data.setting,
        notes: data.notes,
        tags: data.tags || [],
        isPublic: data.isPublic ?? false,
        userId,
      },
    });
    res.status(201).json({ world });
  }
);

// PUT /:id - Update world
router.put(
  "/:id",
  authenticateToken,
  validateParams(worldParamsSchema),
  validateBody(createWorldSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof worldParamsSchema>;
    const data = req.body;

    const existing = await prisma.world.findUnique({ where: { id: params.id } });
    if (!existing) {
      res.status(404).json({ error: "World not found" });
      return;
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: "Cannot modify this world" });
      return;
    }

    const world = await prisma.world.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        genre: data.genre,
        setting: data.setting,
        notes: data.notes,
        tags: data.tags || existing.tags,
        isPublic: data.isPublic,
      },
    });
    res.json({ world });
  }
);

// PATCH /:id - Partial update world
router.patch(
  "/:id",
  authenticateToken,
  validateParams(worldParamsSchema),
  validateBody(updateWorldSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof worldParamsSchema>;
    const data = req.body;

    const existing = await prisma.world.findUnique({ where: { id: params.id } });
    if (!existing) {
      res.status(404).json({ error: "World not found" });
      return;
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: "Cannot modify this world" });
      return;
    }

    const world = await prisma.world.update({
      where: { id: params.id },
      data,
    });
    res.json({ world });
  }
);

// DELETE /:id - Delete world
router.delete(
  "/:id",
  authenticateToken,
  validateParams(worldParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof worldParamsSchema>;

    const existing = await prisma.world.findUnique({ where: { id: params.id } });
    if (!existing) {
      res.status(404).json({ error: "World not found" });
      return;
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: "Cannot delete this world" });
      return;
    }

    await prisma.world.delete({ where: { id: params.id } });
    res.json({ message: "World deleted successfully" });
  }
);

// =============================================================================
// World Characters
// =============================================================================

// GET /:id/characters - List characters in world
router.get(
  "/:id/characters",
  optionalAuth,
  validateParams(worldParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const params = req.params as z.infer<typeof worldParamsSchema>;

    const world = await prisma.world.findUnique({ where: { id: params.id } });
    if (!world) {
      res.status(404).json({ error: "World not found" });
      return;
    }

    if (!world.isPublic && world.userId !== userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const characters = await prisma.worldCharacter.findMany({
      where: { worldId: params.id },
      orderBy: { characterName: "asc" },
    });

    res.json({ characters });
  }
);

// POST /:id/characters - Add character to world
router.post(
  "/:id/characters",
  authenticateToken,
  validateParams(worldParamsSchema),
  validateBody(createCharacterSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof worldParamsSchema>;
    const data = req.body;

    const world = await prisma.world.findUnique({ where: { id: params.id } });
    if (!world) {
      res.status(404).json({ error: "World not found" });
      return;
    }

    if (world.userId !== userId) {
      res.status(403).json({ error: "Cannot modify this world" });
      return;
    }

    const existing = await prisma.worldCharacter.findFirst({
      where: { worldId: params.id, characterName: data.characterName },
    });
    if (existing) {
      res.status(409).json({ error: "Character with this name already exists in world" });
      return;
    }

    const character = await prisma.worldCharacter.create({
      data: {
        worldId: params.id,
        draftId: data.draftId,
        characterName: data.characterName,
        role: data.role,
        notes: data.notes,
      },
    });
    res.status(201).json({ character });
  }
);

// PATCH /:id/characters/:characterId - Update character
router.patch(
  "/:id/characters/:characterId",
  authenticateToken,
  validateParams(characterParamsSchema),
  validateBody(updateCharacterSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof characterParamsSchema>;
    const data = req.body;

    const world = await prisma.world.findUnique({ where: { id: params.worldId } });
    if (!world) {
      res.status(404).json({ error: "World not found" });
      return;
    }

    if (world.userId !== userId) {
      res.status(403).json({ error: "Cannot modify this world" });
      return;
    }

    const character = await prisma.worldCharacter.update({
      where: { id: params.characterId },
      data,
    });
    res.json({ character });
  }
);

// DELETE /:id/characters/:characterId - Remove character from world
router.delete(
  "/:id/characters/:characterId",
  authenticateToken,
  validateParams(characterParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof characterParamsSchema>;

    const world = await prisma.world.findUnique({ where: { id: params.worldId } });
    if (!world) {
      res.status(404).json({ error: "World not found" });
      return;
    }

    if (world.userId !== userId) {
      res.status(403).json({ error: "Cannot modify this world" });
      return;
    }

    await prisma.worldCharacter.delete({ where: { id: params.characterId } });
    res.json({ message: "Character removed from world" });
  }
);

// =============================================================================
// Sync Endpoints
// =============================================================================

// GET /pull - Pull all worlds for sync
router.get(
  "/pull",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    const worlds = await prisma.world.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        characters: true,
        timelines: { include: { events: true } },
      },
    });

    res.json({ worlds });
  }
);

// POST /push - Push worlds to server
router.post(
  "/push",
  authenticateToken,
  validateBody(z.object({
    worlds: z.array(pushWorldSchema),
  })),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { worlds } = req.body as { worlds: Array<z.infer<typeof pushWorldSchema>> };
    const results: Array<{ id?: string; name: string; status: string }> = [];

    for (const worldData of worlds) {
      try {
        const name = worldData.name;
        const existing = await prisma.world.findFirst({
          where: { userId, name },
        });

        const worldWriteData = {
          name: worldData.name,
          description: worldData.description,
          genre: worldData.genre,
          setting: worldData.setting,
          notes: worldData.notes,
          tags: worldData.tags ?? [],
          isPublic: worldData.isPublic ?? false,
        };

        if (existing) {
          await prisma.world.update({
            where: { id: existing.id },
            data: {
              description: worldWriteData.description,
              genre: worldWriteData.genre,
              setting: worldWriteData.setting,
              notes: worldWriteData.notes,
              tags: worldWriteData.tags,
              isPublic: worldWriteData.isPublic,
            },
          });
          results.push({ id: existing.id, name, status: "updated" });
        } else {
          const created = await prisma.world.create({
            data: { ...worldWriteData, userId },
          });
          results.push({ id: created.id, name, status: "created" });
        }
      } catch {
        results.push({ name: worldData.name, status: "error" });
      }
    }

    res.json({ results });
  }
);

export default router;
