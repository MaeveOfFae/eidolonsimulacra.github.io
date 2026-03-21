// OAuth routes for Google and GitHub authentication
import { Router, Request, Response } from "express";
import { randomBytes } from "crypto";
import { prisma } from "../db.js";
import { env } from "../env.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../middleware/auth.js";
import {
  getGoogleAuthUrl,
  getGitHubAuthUrl,
  exchangeGoogleCode,
  exchangeGitHubCode,
  OAuthUserInfo,
} from "../services/oauth.js";

const router: Router = Router();

// OAuth redirect URI base (should be configured based on environment)
const getRedirectUri = (provider: string): string => {
  const baseUrl = env.NODE_ENV === "production"
    ? process.env.OAUTH_REDIRECT_BASE || "https://your-domain.com"
    : "http://localhost:3001";
  return `${baseUrl}/api/auth/oauth/${provider}/callback`;
};

// =============================================================================
// OAuth State Store Interface
// Can be replaced with Redis or other distributed store for production
// =============================================================================

interface StateEntry {
  createdAt: number;
  provider: string;
}

interface OAuthStateStore {
  set(state: string, entry: StateEntry): void;
  get(state: string): StateEntry | undefined;
  delete(state: string): boolean;
  cleanup(): void;
}

/**
 * In-memory OAuth state store (default implementation)
 * For production with multiple server instances, replace with Redis implementation
 */
class InMemoryStateStore implements OAuthStateStore {
  private store = new Map<string, StateEntry>();
  private readonly expiryMs: number;

  constructor(expiryMs: number = 10 * 60 * 1000) {
    this.expiryMs = expiryMs;
  }

  set(state: string, entry: StateEntry): void {
    this.store.set(state, entry);
  }

  get(state: string): StateEntry | undefined {
    return this.store.get(state);
  }

  delete(state: string): boolean {
    return this.store.delete(state);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now - value.createdAt > this.expiryMs) {
        this.store.delete(key);
      }
    }
  }
}

// Configurable state store instance
// In production, this can be replaced with a Redis-backed implementation
const stateStore: OAuthStateStore = new InMemoryStateStore(10 * 60 * 1000);

// Valid state token pattern (alphanumeric, 20-60 chars)
const STATE_TOKEN_PATTERN = /^[a-zA-Z0-9]{20,60}$/;

/**
 * Sanitize state token to prevent injection attacks
 */
function sanitizeStateToken(state: unknown): string | null {
  if (typeof state !== 'string') {
    return null;
  }

  // Trim and validate length
  const trimmed = state.trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    return null;
  }

  // Only allow alphanumeric characters
  if (!STATE_TOKEN_PATTERN.test(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Generate a cryptographically secure state token
 */
function generateState(provider: string): string {
  // Generate 32 bytes of random data, convert to hex (64 chars), take first 40
  const state = randomBytes(32).toString('hex').substring(0, 40);
  stateStore.set(state, { createdAt: Date.now(), provider });

  // Periodically clean up expired states
  stateStore.cleanup();

  return state;
}

/**
 * Validate and consume a state token (one-time use)
 */
function validateAndConsumeState(state: string, expectedProvider: string): boolean {
  const sanitizedState = sanitizeStateToken(state);
  if (!sanitizedState) {
    return false;
  }

  const entry = stateStore.get(sanitizedState);
  if (!entry) {
    return false;
  }

  // Delete immediately (one-time use)
  stateStore.delete(sanitizedState);

  // Verify provider matches
  if (entry.provider !== expectedProvider) {
    return false;
  }

  // Check expiry (10 minutes)
  const STATE_EXPIRY_MS = 10 * 60 * 1000;
  return Date.now() - entry.createdAt <= STATE_EXPIRY_MS;
}

interface HandleOAuthResult {
  user: { id: string; email: string; displayName: string | null; avatarUrl: string | null };
  accessToken: string;
}

async function handleOAuthLogin(
  userInfo: OAuthUserInfo,
  req: Request,
  res: Response
): Promise<HandleOAuthResult> {
  // Check if OAuth connection exists
  const oauthConnection = await prisma.oAuthConnection.findUnique({
    where: {
      provider_providerUserId: {
        provider: userInfo.provider,
        providerUserId: userInfo.providerUserId,
      },
    },
    include: { user: true },
  });

  let user;

  if (oauthConnection) {
    // Existing user - update info
    user = await prisma.user.update({
      where: { id: oauthConnection.userId },
      data: {
        lastLoginAt: new Date(),
        ...(userInfo.displayName && { displayName: userInfo.displayName }),
        ...(userInfo.avatarUrl && { avatarUrl: userInfo.avatarUrl }),
      },
    });
  } else {
    // Check if user with this email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (existingUser) {
      // Link OAuth to existing account
      await prisma.oAuthConnection.create({
        data: {
          userId: existingUser.id,
          provider: userInfo.provider,
          providerUserId: userInfo.providerUserId,
        },
      });
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: { lastLoginAt: new Date() },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          displayName: userInfo.displayName || userInfo.email.split("@")[0],
          avatarUrl: userInfo.avatarUrl,
          isEmailVerified: true, // OAuth providers verify emails
        },
      });

      // Create OAuth connection
      await prisma.oAuthConnection.create({
        data: {
          userId: user.id,
          provider: userInfo.provider,
          providerUserId: userInfo.providerUserId,
        },
      });
    }
  }

  // Create session
  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
  });
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash,
      deviceInfo: req.headers["user-agent"] as unknown as object,
      ipAddress: req.ip,
      expiresAt,
    },
  });

  // Generate access token
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  // Set refresh token cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
    accessToken,
  };
}

/**
 * GET /api/auth/oauth/:provider
 * Initiate OAuth flow
 */
router.get("/:provider", (req: Request, res: Response): void => {
  const { provider } = req.params;

  if (provider !== "google" && provider !== "github") {
    res.status(400).json({ error: "Invalid OAuth provider" });
    return;
  }

  const state = generateState(provider);
  const redirectUri = getRedirectUri(provider);

  let authUrl: string;
  try {
    if (provider === "google") {
      authUrl = getGoogleAuthUrl(redirectUri, state);
    } else {
      authUrl = getGitHubAuthUrl(redirectUri, state);
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
    return;
  }

  res.redirect(authUrl);
});

/**
 * GET /api/auth/oauth/:provider/callback
 * OAuth callback endpoint
 */
router.get("/:provider/callback", async (req: Request, res: Response): Promise<void> => {
  const provider = req.params.provider as string;
  const { code, state, error } = req.query;

  if (error) {
    res.redirect(`/login?error=${encodeURIComponent(error as string)}`);
    return;
  }

  // Validate and sanitize inputs
  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: "Missing authorization code" });
    return;
  }

  if (!state || !validateAndConsumeState(state as string, provider)) {
    res.status(400).json({ error: "Invalid or expired OAuth state" });
    return;
  }

  const redirectUri = getRedirectUri(provider);

  try {
    let userInfo;
    if (provider === "google") {
      userInfo = await exchangeGoogleCode(code, redirectUri);
    } else if (provider === "github") {
      userInfo = await exchangeGitHubCode(code, redirectUri);
    } else {
      res.status(400).json({ error: "Invalid OAuth provider" });
      return;
    }

    const result = await handleOAuthLogin(userInfo, req, res);

    // Redirect to frontend with token (frontend should handle storing it)
    const frontendUrl = env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL || "/"
      : "http://localhost:3000";

    // In production, you might want to use a more secure method
    // like passing the token via a secure, one-time-use code
    res.redirect(
      `${frontendUrl}/auth/callback?token=${encodeURIComponent(result.accessToken)}`
    );
  } catch (err) {
    console.error("OAuth error:", err);
    res.redirect(`/login?error=${encodeURIComponent("Authentication failed")}`);
  }
});

export default router;
