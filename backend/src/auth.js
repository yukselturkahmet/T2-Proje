import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { config } from './config.js';
import { AppError, forbidden, unauthenticated } from './errors.js';

const scryptAsync = promisify(scrypt);

/* ---------- Passwords ---------- */

export const PASSWORD_MIN_LENGTH = 8;

// Stored as scrypt$<salt hex>$<hash hex>
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt$${salt}$${hash.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') return false;
  const [scheme, salt, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scryptAsync(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}

export function checkPasswordStrength(password) {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH
    || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new AppError('WEAK_PASSWORD', { minLength: PASSWORD_MIN_LENGTH });
  }
}

/* ---------- Tokens (HMAC-SHA256 signed, JWT format) ---------- */

const b64 = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const sign = (data) => createHmac('sha256', config.tokenSecret).update(data).digest('base64url');

export function createToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const body = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({
    sub: user.id,
    role: user.role,
    iat: now,
    exp: now + config.tokenTtlHours * 3600,
  })}`;
  return `${body}.${sign(body)}`;
}

/** Returns the token payload, or null when the token is missing or invalid. */
export function readToken(token) {
  if (!token) return null;
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return null;
  const expected = Buffer.from(sign(`${header}.${payload}`));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() / 1000 ? data : null;
  } catch {
    return null;
  }
}

/* ---------- Guards used by resolvers ---------- */

export function requireUser(ctx) {
  if (!ctx.user) throw unauthenticated();
  return ctx.user;
}

export function requireAdmin(ctx) {
  const user = requireUser(ctx);
  if (user.role !== 'ADMIN') throw forbidden();
  return user;
}

/* ---------- Sign-in throttling ---------- */

// After 5 failed attempts a username is locked for 5 minutes.
const MAX_ATTEMPTS = 5;
const LOCK_MS = 5 * 60_000;
const attempts = new Map();

export function assertNotLocked(username) {
  const entry = attempts.get(username);
  if (entry && entry.lockedUntil > Date.now()) {
    throw new AppError('TOO_MANY_ATTEMPTS', { retryAfterSeconds: Math.ceil((entry.lockedUntil - Date.now()) / 1000) });
  }
}

export function recordFailedLogin(username) {
  const entry = attempts.get(username) || { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.count = 0;
    entry.lockedUntil = Date.now() + LOCK_MS;
  }
  attempts.set(username, entry);
}

export function clearFailedLogins(username) {
  attempts.delete(username);
}
