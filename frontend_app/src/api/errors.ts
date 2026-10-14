export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'validation'
  | 'rate_limited'
  | 'server'
  | 'not_found'
  | 'unknown';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;

  constructor(kind: ApiErrorKind, message: string, status: number | null = null) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }

  /** Whether a manual retry button makes sense for this error. */
  get retryable(): boolean {
    return this.kind === 'network' || this.kind === 'timeout' || this.kind === 'server' || this.kind === 'rate_limited';
  }
}

const FRIENDLY: Record<ApiErrorKind, string> = {
  network: 'No connection. Check your internet and try again.',
  timeout: 'The request took too long. Please try again.',
  unauthorized: 'Your session has expired. Please log in again.',
  forbidden: 'You do not have permission to do that.',
  validation: 'Please check the highlighted fields.',
  rate_limited: 'Too many requests. Please wait a while before trying again.',
  server: 'Something went wrong on our side. Please try again.',
  not_found: 'We could not find that item.',
  unknown: 'Something unexpected happened. Please try again.',
};

export function kindFromStatus(status: number): ApiErrorKind {
  if (status === 400 || status === 422) return 'validation';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'server';
  return 'unknown';
}

/** Message to show: prefer the backend's own message for validation/auth, otherwise a friendly default. */
export function messageFor(kind: ApiErrorKind, serverMessage?: string): string {
  if (serverMessage && (kind === 'validation' || kind === 'unauthorized' || kind === 'forbidden' || kind === 'rate_limited' || kind === 'not_found')) {
    return serverMessage;
  }
  return FRIENDLY[kind];
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  return new ApiError('unknown', FRIENDLY.unknown);
}
