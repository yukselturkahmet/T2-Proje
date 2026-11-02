import { storage } from '../utils/storage';

const API_URL = import.meta.env.VITE_API_URL || '/graphql';

export class ApiError extends Error {
  constructor(code, params = {}) {
    super(code);
    this.code = code;
    this.params = params;
  }
}

export const session = {
  get token() {
    return storage.get('token');
  },
  set token(value) {
    storage.set('token', value);
  },
  // Demo mode answers requests in the browser instead of calling the API.
  get demo() {
    return storage.get('demo') === '1';
  },
  set demo(on) {
    storage.set('demo', on ? '1' : null);
  },
};

const operationName = (query) => /(?:query|mutation)\s+(\w+)/.exec(query)?.[1];

async function callServer(query, variables) {
  let response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session.token && { Authorization: `Bearer ${session.token}` }),
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    throw new ApiError('NETWORK');
  }
  if (!response.ok) throw new ApiError(response.status >= 500 ? 'NETWORK' : 'BAD_REQUEST');

  const body = await response.json();
  if (body.errors?.length) {
    const { code = 'INTERNAL', params } = body.errors[0].extensions || {};
    throw new ApiError(code, params);
  }
  return body.data;
}

async function callDemo(query, variables) {
  const { handle } = await import('./demo.js');
  return handle(operationName(query), variables, session.token);
}

/** Sends a GraphQL operation; throws ApiError with a translatable code. */
export async function request(query, variables = {}) {
  try {
    return await (session.demo ? callDemo(query, variables) : callServer(query, variables));
  } catch (error) {
    const apiError = error instanceof ApiError ? error : new ApiError(error.code || 'INTERNAL', error.params);
    if (apiError.code === 'UNAUTHENTICATED') window.dispatchEvent(new Event('auth:expired'));
    throw apiError;
  }
}
