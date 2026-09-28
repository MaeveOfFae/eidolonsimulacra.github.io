// Environment configuration with validation
import { config } from 'dotenv';
import { z } from 'zod';

// Load .env file
config();

// Boolean() coercion would treat the string "false" as true, which silently
// inverts operator intent, so parse the common boolean spellings explicitly.
const booleanFromEnv = (defaultValue: boolean) =>
  z
    .enum(['true', 'false', '1', '0'])
    .default(defaultValue ? 'true' : 'false')
    .transform((value) => value === 'true' || value === '1');

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  // Encryption (32 bytes hex string for AES-256)
  ENCRYPTION_KEY: z
    .string()
    .length(64)
    .regex(/^[0-9a-f]+$/),

  // OAuth - Google
  OAUTH_GOOGLE_CLIENT_ID: z.string().optional(),
  OAUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),

  // OAuth - GitHub
  OAUTH_GITHUB_CLIENT_ID: z.string().optional(),
  OAUTH_GITHUB_CLIENT_SECRET: z.string().optional(),

  // Email (optional, for password reset)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  // CORS
  CORS_ORIGIN: z.string().default('*'),

  // Rate limiting (enabled by default so a public deployment is not unprotected)
  RATE_LIMIT_ENABLED: booleanFromEnv(true),
  RATE_LIMIT_AUTH_ENABLED: booleanFromEnv(true),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(1000),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().int().positive().default(40),

  // Proxy handling for accurate client IP detection behind reverse proxies
  TRUST_PROXY: z.union([z.coerce.number().int().nonnegative(), z.string()]).default(1),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Invalid environment configuration:');
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }

  return result.data;
}

export const env = loadEnv();
