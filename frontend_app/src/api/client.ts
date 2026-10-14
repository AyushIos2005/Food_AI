import { API_BASE_URL, AI_REQUEST_TIMEOUT_MS, REQUEST_TIMEOUT_MS } from '@/src/config/env';
import { ApiError, kindFromStatus, messageFor } from './errors';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  timeoutMs?: number;
  /** Skip the Authorization header (login/register/public calls). */
  anonymous?: boolean;
}

type TokenProvider = () => string | null;
type UnauthorizedHandler = () => void;

let tokenProvider: TokenProvider = () => null;
let unauthorizedHandler: UnauthorizedHandler = () => {};

/** Wired once from the session store. Keeps the client free of React and storage imports. */
export function configureApiClient(opts: { getToken: TokenProvider; onUnauthorized: UnauthorizedHandler }) {
  tokenProvider = opts.getToken;
  unauthorizedHandler = opts.onUnauthorized;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;
  const parts = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `${url}?${parts.join('&')}` : url;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, timeoutMs = REQUEST_TIMEOUT_MS, anonymous = false } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = anonymous ? null : tokenProvider();
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      // Native cookie jar: lets the existing cookie-based session work in-app until bearer tokens are enabled.
      credentials: 'include',
      signal: controller.signal,
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    throw new ApiError(aborted ? 'timeout' : 'network', messageFor(aborted ? 'timeout' : 'network'));
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const kind = kindFromStatus(response.status);
    const serverMessage = typeof (data as { message?: unknown })?.message === 'string'
      ? (data as { message: string }).message
      : undefined;
    if (kind === 'unauthorized' && !anonymous) unauthorizedHandler();
    throw new ApiError(kind, messageFor(kind, serverMessage), response.status);
  }

  return data as T;
}

export const AI_TIMEOUT = AI_REQUEST_TIMEOUT_MS;
