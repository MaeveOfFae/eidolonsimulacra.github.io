// OAuth service for Google and GitHub
import { env } from '../env.js';

export interface OAuthUserInfo {
  provider: 'google' | 'github';
  providerUserId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

// =============================================================================
// Google OAuth
// =============================================================================

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name?: string;
  picture?: string;
}

export function getGoogleAuthUrl(redirectUri: string, state: string): string {
  if (!env.OAUTH_GOOGLE_CLIENT_ID) {
    throw new Error('Google OAuth not configured');
  }

  const params = new URLSearchParams({
    client_id: env.OAUTH_GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email profile',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(code: string, redirectUri: string): Promise<OAuthUserInfo> {
  if (!env.OAUTH_GOOGLE_CLIENT_ID || !env.OAUTH_GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth not configured');
  }

  // Exchange code for token
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.OAUTH_GOOGLE_CLIENT_ID,
      client_secret: env.OAUTH_GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange Google auth code');
  }

  const tokens = (await tokenResponse.json()) as GoogleTokenResponse;

  // Get user info
  const userResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userResponse.ok) {
    throw new Error('Failed to get Google user info');
  }

  const userInfo = (await userResponse.json()) as GoogleUserInfo;

  return {
    provider: 'google',
    providerUserId: userInfo.id,
    email: userInfo.email,
    displayName: userInfo.name,
    avatarUrl: userInfo.picture,
  };
}

// =============================================================================
// GitHub OAuth
// =============================================================================

const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';
const GITHUB_EMAIL_URL = 'https://api.github.com/user/emails';

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
}

interface GitHubUserInfo {
  id: number;
  login: string;
  name?: string;
  avatar_url?: string;
  email?: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

export function getGitHubAuthUrl(redirectUri: string, state: string): string {
  if (!env.OAUTH_GITHUB_CLIENT_ID) {
    throw new Error('GitHub OAuth not configured');
  }

  const params = new URLSearchParams({
    client_id: env.OAUTH_GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'user:email',
    state,
  });

  return `https://github.com/login/oauth/authorize?${params}`;
}

export async function exchangeGitHubCode(code: string, redirectUri: string): Promise<OAuthUserInfo> {
  if (!env.OAUTH_GITHUB_CLIENT_ID || !env.OAUTH_GITHUB_CLIENT_SECRET) {
    throw new Error('GitHub OAuth not configured');
  }

  // Exchange code for token
  const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      code,
      client_id: env.OAUTH_GITHUB_CLIENT_ID,
      client_secret: env.OAUTH_GITHUB_CLIENT_SECRET,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange GitHub auth code');
  }

  const tokens = (await tokenResponse.json()) as GitHubTokenResponse;

  // Get user info
  const userResponse = await fetch(GITHUB_USER_URL, {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Eidolon-Character-Generator',
    },
  });

  if (!userResponse.ok) {
    throw new Error('Failed to get GitHub user info');
  }

  const userInfo = (await userResponse.json()) as GitHubUserInfo;

  // Get primary email if not in user info
  let email = userInfo.email;
  if (!email) {
    const emailResponse = await fetch(GITHUB_EMAIL_URL, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Eidolon-Character-Generator',
      },
    });

    if (emailResponse.ok) {
      const emails = (await emailResponse.json()) as GitHubEmail[];
      const primaryEmail = emails.find((e) => e.primary);
      email = primaryEmail?.email;
    }
  }

  if (!email) {
    throw new Error('Could not get email from GitHub');
  }

  return {
    provider: 'github',
    providerUserId: String(userInfo.id),
    email,
    displayName: userInfo.name || userInfo.login,
    avatarUrl: userInfo.avatar_url,
  };
}
