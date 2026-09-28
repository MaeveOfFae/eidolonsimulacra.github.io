// User configuration routes with encrypted API key storage
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { encryptApiKeys, decryptApiKeys } from '../services/encryption.js';

const router: Router = Router();

// All config routes require authentication
router.use(authenticateToken);

// =============================================================================
// Validation Schemas
// =============================================================================

const configSchema = z.object({
  engine: z.string().optional(),
  engine_mode: z.string().optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().positive().optional(),
  base_url: z.string().optional(),
  api_proxy_key: z.string().optional(),
  api_base_url: z.string().optional(),
  batch: z
    .object({
      max_concurrent: z.number().int().positive().optional(),
      rate_limit_delay: z.number().int().nonnegative().optional(),
    })
    .optional(),
  theme_name: z.string().optional(),
  theme: z.record(z.string(), z.unknown()).optional(),
  feature_blueprints: z.record(z.string(), z.string()).optional(),
  help: z
    .object({
      first_run_completed: z.boolean().optional(),
      show_inline_tips: z.boolean().optional(),
      completed_guides: z.array(z.string()).optional(),
      dismissed_tips: z.array(z.string()).optional(),
      completed_tours: z.array(z.string()).optional(),
    })
    .optional(),
});

const updateConfigSchema = configSchema;

const apiKeysSchema = z.object({}).passthrough(); // Allow any string keys

// =============================================================================
// Routes
// =============================================================================

/**
 * GET /api/sync/config
 * Get user's configuration (without API keys)
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const userConfig = await prisma.userConfig.findUnique({
    where: { userId },
  });

  if (!userConfig) {
    // Return default config
    res.json({ config: {} });
    return;
  }

  res.json({ config: userConfig.config });
});

/**
 * PUT /api/sync/config
 * Update user's configuration (without API keys)
 */
router.put('/', validateBody(updateConfigSchema), async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const config = req.body;

  const userConfig = await prisma.userConfig.upsert({
    where: { userId },
    create: {
      userId,
      config,
    },
    update: {
      config,
    },
  });

  res.json({ config: userConfig.config });
});

/**
 * GET /api/sync/config/api-keys
 * Get user's API keys (decrypted)
 */
router.get('/api-keys', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const userConfig = await prisma.userConfig.findUnique({
    where: { userId },
  });

  if (!userConfig || !userConfig.encryptedApiKeys || !userConfig.apiKeysNonce) {
    res.json({ apiKeys: {} });
    return;
  }

  try {
    const apiKeys = decryptApiKeys(Buffer.from(userConfig.encryptedApiKeys), Buffer.from(userConfig.apiKeysNonce));
    res.json({ apiKeys });
  } catch (error) {
    console.error('Failed to decrypt API keys:', error);
    res.status(500).json({ error: 'Failed to decrypt API keys' });
  }
});

/**
 * PUT /api/sync/config/api-keys
 * Update user's API keys (encrypted)
 */
router.put('/api-keys', validateBody(apiKeysSchema), async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const apiKeys = req.body as Record<string, string>;

  // Encrypt API keys
  const { encrypted, nonce } = encryptApiKeys(apiKeys);

  // Prisma types the Bytes columns as `Uint8Array<ArrayBuffer>`, while a Buffer
  // is backed by the wider `ArrayBufferLike`, so copy into plain views first.
  const encryptedApiKeys = new Uint8Array(encrypted);
  const apiKeysNonce = new Uint8Array(nonce);

  // Get or create user config
  const existing = await prisma.userConfig.findUnique({
    where: { userId },
  });

  if (existing) {
    await prisma.userConfig.update({
      where: { userId },
      data: {
        encryptedApiKeys,
        apiKeysNonce,
      },
    });
  } else {
    await prisma.userConfig.create({
      data: {
        userId,
        config: {},
        encryptedApiKeys,
        apiKeysNonce,
      },
    });
  }

  res.json({ message: 'API keys saved successfully' });
});

/**
 * DELETE /api/sync/config/api-keys
 * Clear user's API keys
 */
router.delete('/api-keys', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  await prisma.userConfig.updateMany({
    where: { userId },
    data: {
      encryptedApiKeys: null,
      apiKeysNonce: null,
    },
  });

  res.json({ message: 'API keys cleared successfully' });
});

/**
 * DELETE /api/sync/config
 * Delete user's entire configuration
 */
router.delete('/', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  await prisma.userConfig.deleteMany({
    where: { userId },
  });

  res.json({ message: 'Configuration deleted successfully' });
});

export default router;
