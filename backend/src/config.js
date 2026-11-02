import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Load backend/.env when it exists; real environment variables win.
try {
  process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));
} catch {
  // No .env file.
}

const env = process.env;
const isProduction = env.NODE_ENV === 'production';

const hasSecret = Boolean(env.TOKEN_SECRET && env.TOKEN_SECRET.length >= 32);
if (!hasSecret && isProduction) {
  throw new Error('TOKEN_SECRET must be set to at least 32 characters in production.');
}

export const config = {
  isProduction,
  port: Number(env.PORT) || 4000,
  corsOrigins: (env.CORS_ORIGIN || 'http://localhost:5180').split(',').map((s) => s.trim()),
  db: {
    host: env.DB_HOST || 'localhost',
    port: Number(env.DB_PORT) || 5432,
    name: env.DB_NAME || 'postgres',
    user: env.DB_USER || 'postgres',
    password: env.DB_PASSWORD,
  },
  // Without a configured secret a random one is used, so sign-ins end
  // whenever the server restarts.
  tokenSecret: hasSecret ? env.TOKEN_SECRET : randomBytes(32).toString('hex'),
  tokenSecretIsRandom: !hasSecret,
  tokenTtlHours: Number(env.TOKEN_TTL_HOURS) || 8,
};
