import { ApiError, kindFromStatus, messageFor } from '@/src/api/errors';

describe('error mapping', () => {
  it('maps HTTP statuses to error kinds', () => {
    expect(kindFromStatus(400)).toBe('validation');
    expect(kindFromStatus(401)).toBe('unauthorized');
    expect(kindFromStatus(403)).toBe('forbidden');
    expect(kindFromStatus(429)).toBe('rate_limited');
    expect(kindFromStatus(503)).toBe('server');
  });
  it('prefers server text for validation and rate-limit messages', () => {
    expect(messageFor('validation', 'OTP expired')).toBe('OTP expired');
    expect(messageFor('rate_limited', 'AI usage limit reached, please try again later')).toMatch(/AI usage/);
  });
  it('uses friendly text for server errors instead of leaking details', () => {
    expect(messageFor('server', 'MongoError: connection refused')).not.toMatch(/Mongo/);
  });
  it('only retry-able kinds allow a retry button', () => {
    expect(new ApiError('network', 'x').retryable).toBe(true);
    expect(new ApiError('validation', 'x').retryable).toBe(false);
  });
});
