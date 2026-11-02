import { createServer } from 'node:http';
import { readToken } from './auth.js';
import { config } from './config.js';
import { User } from './db.js';
import { execute } from './graphql.js';

const MAX_BODY_BYTES = 100_000;

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify(body));
}

function corsHeaders(req) {
  const origin = req.headers.origin;
  if (!origin || !config.corsOrigins.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('Body too large'), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('Body must be JSON'), { status: 400 });
  }
}

// The signed-in user for this request (null when signed out).
// The user is reloaded every time so deactivated accounts lose access at once.
async function userFromRequest(req) {
  const header = req.headers.authorization || '';
  const payload = readToken(header.startsWith('Bearer ') ? header.slice(7) : null);
  if (!payload) return null;
  const user = await User.findByPk(payload.sub);
  return user && user.active ? user : null;
}

export function createApp() {
  return createServer(async (req, res) => {
    const cors = corsHeaders(req);
    try {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, cors);
        return res.end();
      }
      if (req.url === '/health' && req.method === 'GET') return send(res, 200, { ok: true }, cors);
      if (req.url !== '/graphql') return send(res, 404, { error: 'Not found' }, cors);
      if (req.method !== 'POST') return send(res, 405, { error: 'Use POST' }, { ...cors, Allow: 'POST' });

      const body = await readJson(req);
      if (typeof body.query !== 'string') return send(res, 400, { error: 'Missing "query"' }, cors);

      const context = { user: await userFromRequest(req), userCache: new Map() };
      return send(res, 200, await execute(body, context), cors);
    } catch (error) {
      if (error.status) return send(res, error.status, { error: error.message }, cors);
      console.error(error);
      return send(res, 500, { error: 'Internal server error' }, cors);
    }
  });
}
