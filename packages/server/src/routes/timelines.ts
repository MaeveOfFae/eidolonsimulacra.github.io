// Timelines CRUD routes
import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma, Prisma } from "../db.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validation.js";

const router: Router = Router();

// Validation Schemas
const createTimelineSchema = z.object({
  worldId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const updateTimelineSchema = createTimelineSchema.partial().omit({ worldId: true });

const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  eventDate: z.string().optional(),
  sortOrder: z.number().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const updateEventSchema = createEventSchema.partial();

const timelineParamsSchema = z.object({ id: z.string().uuid() });
const eventParamsSchema = z.object({ timelineId: z.string().uuid(), eventId: z.string().uuid() });

const timelineQuerySchema = z.object({
  worldId: z.string().uuid().optional(),
  search: z.string().optional(),
  tags: z.string().optional(),
});

const pushTimelineSchema = z.object({
  id: z.string().uuid().optional(),
  worldId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET / - List timelines
router.get(
  "/",
  optionalAuth,
  validateQuery(timelineQuerySchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const q = req.query as z.infer<typeof timelineQuerySchema>;

    const where: Prisma.TimelineWhereInput = {};

    if (q.worldId) {
      // Check world access
      const world = await prisma.world.findUnique({ where: { id: q.worldId } });
      if (!world) {
        res.status(404).json({ error: "World not found" });
        return;
      }
      if (!world.isPublic && world.userId !== userId) {
        res.status(403).json({ error: "Access denied" });
        return;
      }
      where.worldId = q.worldId;
    } else if (userId) {
      where.userId = userId;
    } else {
      res.json({ timelines: [] });
      return;
    }

    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: "insensitive" } },
        { description: { contains: q.search, mode: "insensitive" } },
      ];
    }

    if (q.tags) {
      where.tags = { hasEvery: q.tags.split(",") };
    }

    const timelines = await prisma.timeline.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { events: true } },
        world: { select: { id: true, name: true } },
      },
    });

    res.json({ timelines });
  }
);

// GET /:id - Get timeline by ID with events
router.get(
  "/:id",
  optionalAuth,
  validateParams(timelineParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const params = req.params as z.infer<typeof timelineParamsSchema>;

    const timeline = await prisma.timeline.findUnique({
      where: { id: params.id },
      include: {
        events: { orderBy: { sortOrder: "asc" } },
        world: { select: { id: true, name: true, userId: true, isPublic: true } },
      },
    });

    if (!timeline) {
      res.status(404).json({ error: "Timeline not found" });
      return;
    }

    if (!timeline.world.isPublic && timeline.world.userId !== userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    res.json({ timeline });
  }
);

// POST / - Create timeline
router.post(
  "/",
  authenticateToken,
  validateBody(createTimelineSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const data = req.body;

    // Check world ownership
    const world = await prisma.world.findUnique({ where: { id: data.worldId } });
    if (!world) {
      res.status(404).json({ error: "World not found" });
      return;
    }

    if (world.userId !== userId) {
      res.status(403).json({ error: "Cannot create timeline in this world" });
      return;
    }

    const existing = await prisma.timeline.findFirst({
      where: { worldId: data.worldId, name: data.name },
    });
    if (existing) {
      res.status(409).json({ error: "Timeline with this name already exists in world" });
      return;
    }

    const timeline = await prisma.timeline.create({
      data: {
        worldId: data.worldId,
        userId,
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        tags: data.tags || [],
      },
    });
    res.status(201).json({ timeline });
  }
);

// PUT /:id - Update timeline
router.put(
  "/:id",
  authenticateToken,
  validateParams(timelineParamsSchema),
  validateBody(createTimelineSchema.omit({ worldId: true })),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof timelineParamsSchema>;
    const data = req.body;

    const existing = await prisma.timeline.findUnique({ where: { id: params.id } });
    if (!existing) {
      res.status(404).json({ error: "Timeline not found" });
      return;
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: "Cannot modify this timeline" });
      return;
    }

    const timeline = await prisma.timeline.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        tags: data.tags || existing.tags,
      },
    });
    res.json({ timeline });
  }
);

// PATCH /:id - Partial update timeline
router.patch(
  "/:id",
  authenticateToken,
  validateParams(timelineParamsSchema),
  validateBody(updateTimelineSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof timelineParamsSchema>;
    const data = req.body;

    const existing = await prisma.timeline.findUnique({ where: { id: params.id } });
    if (!existing) {
      res.status(404).json({ error: "Timeline not found" });
      return;
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: "Cannot modify this timeline" });
      return;
    }

    const timeline = await prisma.timeline.update({
      where: { id: params.id },
      data,
    });
    res.json({ timeline });
  }
);

// DELETE /:id - Delete timeline
router.delete(
  "/:id",
  authenticateToken,
  validateParams(timelineParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof timelineParamsSchema>;

    const existing = await prisma.timeline.findUnique({ where: { id: params.id } });
    if (!existing) {
      res.status(404).json({ error: "Timeline not found" });
      return;
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: "Cannot delete this timeline" });
      return;
    }

    await prisma.timeline.delete({ where: { id: params.id } });
    res.json({ message: "Timeline deleted successfully" });
  }
);

// =============================================================================
// Timeline Events
// =============================================================================

// GET /:id/events - List events in timeline
router.get(
  "/:id/events",
  optionalAuth,
  validateParams(timelineParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const params = req.params as z.infer<typeof timelineParamsSchema>;

    const timeline = await prisma.timeline.findUnique({
      where: { id: params.id },
      include: { world: { select: { userId: true, isPublic: true } } },
    });
    if (!timeline) {
      res.status(404).json({ error: "Timeline not found" });
      return;
    }

    if (!timeline.world.isPublic && timeline.world.userId !== userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const events = await prisma.timelineEvent.findMany({
      where: { timelineId: params.id },
      orderBy: { sortOrder: "asc" },
    });

    res.json({ events });
  }
);

// POST /:id/events - Add event to timeline
router.post(
  "/:id/events",
  authenticateToken,
  validateParams(timelineParamsSchema),
  validateBody(createEventSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof timelineParamsSchema>;
    const data = req.body;

    const timeline = await prisma.timeline.findUnique({ where: { id: params.id } });
    if (!timeline) {
      res.status(404).json({ error: "Timeline not found" });
      return;
    }

    if (timeline.userId !== userId) {
      res.status(403).json({ error: "Cannot modify this timeline" });
      return;
    }

    // Get max sort order if not provided
    let sortOrder = data.sortOrder;
    if (sortOrder === undefined) {
      const maxEvent = await prisma.timelineEvent.findFirst({
        where: { timelineId: params.id },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      sortOrder = (maxEvent?.sortOrder ?? -1) + 1;
    }

    const event = await prisma.timelineEvent.create({
      data: {
        timelineId: params.id,
        title: data.title,
        description: data.description,
        eventDate: data.eventDate,
        sortOrder,
        tags: data.tags || [],
        metadata: data.metadata || {},
      },
    });
    res.status(201).json({ event });
  }
);

// PATCH /:id/events/:eventId - Update event
router.patch(
  "/:id/events/:eventId",
  authenticateToken,
  validateParams(eventParamsSchema),
  validateBody(updateEventSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof eventParamsSchema>;
    const data = req.body;

    const timeline = await prisma.timeline.findUnique({ where: { id: params.timelineId } });
    if (!timeline) {
      res.status(404).json({ error: "Timeline not found" });
      return;
    }

    if (timeline.userId !== userId) {
      res.status(403).json({ error: "Cannot modify this timeline" });
      return;
    }

    const event = await prisma.timelineEvent.update({
      where: { id: params.eventId },
      data,
    });
    res.json({ event });
  }
);

// DELETE /:id/events/:eventId - Delete event
router.delete(
  "/:id/events/:eventId",
  authenticateToken,
  validateParams(eventParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof eventParamsSchema>;

    const timeline = await prisma.timeline.findUnique({ where: { id: params.timelineId } });
    if (!timeline) {
      res.status(404).json({ error: "Timeline not found" });
      return;
    }

    if (timeline.userId !== userId) {
      res.status(403).json({ error: "Cannot modify this timeline" });
      return;
    }

    await prisma.timelineEvent.delete({ where: { id: params.eventId } });
    res.json({ message: "Event deleted" });
  }
);

// POST /:id/events/reorder - Reorder events
router.post(
  "/:id/events/reorder",
  authenticateToken,
  validateParams(timelineParamsSchema),
  validateBody(z.object({
    eventIds: z.array(z.string().uuid()),
  })),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const params = req.params as z.infer<typeof timelineParamsSchema>;
    const { eventIds } = req.body;

    const timeline = await prisma.timeline.findUnique({ where: { id: params.id } });
    if (!timeline) {
      res.status(404).json({ error: "Timeline not found" });
      return;
    }

    if (timeline.userId !== userId) {
      res.status(403).json({ error: "Cannot modify this timeline" });
      return;
    }

    // Update sort orders in transaction
    await prisma.$transaction(
      eventIds.map((eventId: string, index: number) =>
        prisma.timelineEvent.update({
          where: { id: eventId },
          data: { sortOrder: index },
        })
      )
    );

    res.json({ message: "Events reordered" });
  }
);

// =============================================================================
// Sync Endpoints
// =============================================================================

// GET /pull - Pull all timelines for sync
router.get(
  "/pull",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    const timelines = await prisma.timeline.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { events: true },
    });

    res.json({ timelines });
  }
);

// POST /push - Push timelines to server
router.post(
  "/push",
  authenticateToken,
  validateBody(z.object({
    timelines: z.array(pushTimelineSchema),
  })),
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { timelines } = req.body as { timelines: Array<z.infer<typeof pushTimelineSchema>> };
    const results: Array<{ id?: string; name: string; status: string }> = [];

    for (const timelineData of timelines) {
      try {
        const id = timelineData.id;
        const name = timelineData.name;

        const world = await prisma.world.findFirst({
          where: { id: timelineData.worldId, userId },
          select: { id: true },
        });
        if (!world) {
          results.push({ id, name, status: "error" });
          continue;
        }

        const timelineWriteData = {
          worldId: timelineData.worldId,
          name: timelineData.name,
          description: timelineData.description,
          startDate: timelineData.startDate,
          endDate: timelineData.endDate,
          tags: timelineData.tags ?? [],
        };

        if (id) {
          const existing = await prisma.timeline.findFirst({
            where: { id, userId },
          });
          if (existing) {
            await prisma.timeline.update({
              where: { id },
              data: {
                worldId: timelineWriteData.worldId,
                name: timelineWriteData.name,
                description: timelineWriteData.description,
                startDate: timelineWriteData.startDate,
                endDate: timelineWriteData.endDate,
                tags: timelineWriteData.tags,
              },
            });
            results.push({ id, name, status: "updated" });
            continue;
          }
        }

        const created = await prisma.timeline.create({
          data: { ...timelineWriteData, userId },
        });
        results.push({ id: created.id, name, status: "created" });
      } catch {
        results.push({ name: timelineData.name ?? "unknown", status: "error" });
      }
    }

    res.json({ results });
  }
);

export default router;
