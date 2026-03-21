// Authentication routes
import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../db.js";
import { env } from "../env.js";
import {
  authenticateToken,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  validateSession,
} from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";

const router: Router = Router();

// =============================================================================
// Validation Schemas
// =============================================================================

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  preferences: z.record(z.unknown()).optional(),
});

// =============================================================================
// Helper Functions
// =============================================================================

const SALT_ROUNDS = 12;

async function createSession(userId: string, deviceInfo?: unknown, ipAddress?: string) {
  const payload = { userId, email: "" }; // Email fetched separately
  const refreshToken = generateRefreshToken(payload);
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  await prisma.session.create({
    data: {
      userId,
      refreshTokenHash,
      deviceInfo: deviceInfo as object,
      ipAddress,
      expiresAt,
    },
  });

  return refreshToken;
}

function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/api/auth",
  });
}

// =============================================================================
// Routes
// =============================================================================

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
router.post(
  "/register",
  validateBody(registerSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { email, password, displayName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: displayName || email.split("@")[0],
      },
    });

    // Create session
    const refreshToken = await createSession(
      user.id,
      req.headers["user-agent"],
      req.ip
    );

    // Generate access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      accessToken,
    });
  }
);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post(
  "/login",
  validateBody(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session
    const refreshToken = await createSession(
      user.id,
      req.headers["user-agent"],
      req.ip
    );

    // Generate access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    setRefreshTokenCookie(res, refreshToken);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      accessToken,
    });
  }
);

/**
 * POST /api/auth/logout
 * Invalidate current session
 */
router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    const tokenHash = hashRefreshToken(refreshToken);
    await prisma.session.deleteMany({
      where: { refreshTokenHash: tokenHash },
    });
  }

  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.json({ message: "Logged out successfully" });
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ error: "Refresh token required" });
    return;
  }

  const payload = await validateSession(refreshToken);
  if (!payload) {
    res.status(403).json({ error: "Invalid or expired session" });
    return;
  }

  // Get fresh user data
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    res.status(403).json({ error: "User not found" });
    return;
  }

  // Generate new access token
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  res.json({ accessToken });
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get("/me", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      createdAt: true,
      lastLoginAt: true,
      isEmailVerified: true,
      preferences: true,
    },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user });
});

/**
 * PATCH /api/auth/me
 * Update current user profile
 */
router.patch(
  "/me",
  authenticateToken,
  validateBody(updateProfileSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { displayName, avatarUrl, preferences } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(preferences !== undefined && { preferences }),
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
        preferences: true,
      },
    });

    res.json({ user });
  }
);

/**
 * DELETE /api/auth/me
 * Delete current user account
 */
router.delete("/me", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  await prisma.user.delete({
    where: { id: req.user!.userId },
  });

  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.json({ message: "Account deleted successfully" });
});

export default router;
