import { apiRequest, configureApiClient } from '@/src/api/client';
import { ApiError } from '@/src/api/errors';

describe('apiRequest', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
    jest.restoreAllMocks();
  });

  function mockFetch(status: number, body: unknown) {
    const fn = jest.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(body),
    });
    global.fetch = fn as unknown as typeof fetch;
    return fn;
  }

  it('sends a Bearer token when signed in and returns parsed JSON', async () => {
    configureApiClient({ getToken: () => 'tok123', onUnauthorized: () => {} });
    const fetchMock = mockFetch(200, { ok: true });
    await expect(apiRequest('/food/get-all', { query: { page: 1, limit: 5 } })).resolves.toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/food/get-all?page=1&limit=5');
    expect((init as RequestInit).headers).toMatchObject({ Authorization: 'Bearer tok123' });
  });

  it('never sends a token on anonymous calls', async () => {
    configureApiClient({ getToken: () => 'tok123', onUnauthorized: () => {} });
    const fetchMock = mockFetch(200, {});
    await apiRequest('/auth/login', { method: 'POST', body: { a: 1 }, anonymous: true });
    expect((fetchMock.mock.calls[0][1] as RequestInit).headers).not.toHaveProperty('Authorization');
  });

  it('calls the unauthorized handler on 401 and throws a typed error', async () => {
    const onUnauthorized = jest.fn();
    configureApiClient({ getToken: () => 'expired', onUnauthorized });
    mockFetch(401, { message: 'Invalid or expired token' });
    await expect(apiRequest('/notifications')).rejects.toMatchObject({ kind: 'unauthorized', status: 401 });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('does not treat a failed login (401 on anonymous call) as an expired session', async () => {
    const onUnauthorized = jest.fn();
    configureApiClient({ getToken: () => null, onUnauthorized });
    mockFetch(401, { message: 'Invalid credentials' });
    const err = (await apiRequest('/auth/login', { method: 'POST', body: {}, anonymous: true }).catch((e: unknown) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe('Invalid credentials');
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('maps network failures to a friendly network error', async () => {
    configureApiClient({ getToken: () => null, onUnauthorized: () => {} });
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed')) as unknown as typeof fetch;
    await expect(apiRequest('/food/get-all')).rejects.toMatchObject({ kind: 'network' });
  });
});
