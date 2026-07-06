import { describe, expect, it } from 'vitest';
import { acknowledge, classifySyncFailure, enqueueUnique, serverRemainingSeconds } from './examSync';

describe('offline answer synchronization', () => {
  it('queues a question only once across repeated offline edits', () => {
    expect(enqueueUnique(enqueueUnique([], 'q1'), 'q1')).toEqual(['q1']);
  });

  it('removes only the answer acknowledged by the server', () => {
    expect(acknowledge(['q1', 'q2'], 'q1')).toEqual(['q2']);
  });
});

describe('sync failure classification', () => {
  it('distinguishes connectivity, retryable, reconciliation and permanent failures', () => {
    expect(classifySyncFailure({ isNetworkError: true })).toBe('network');
    expect(classifySyncFailure({ httpStatus: 503 })).toBe('retryable');
    expect(classifySyncFailure({ httpStatus: 429 })).toBe('retryable');
    expect(classifySyncFailure({ httpStatus: 409 })).toBe('reconcile');
    expect(classifySyncFailure({ httpStatus: 400 })).toBe('permanent');
    expect(classifySyncFailure({ httpStatus: 401 })).toBe('permanent');
  });
});

describe('server deadline countdown', () => {
  it('uses server offset and reaches zero independently of interval frequency', () => {
    expect(serverRemainingSeconds(20_000, 5_000, 10_000)).toBe(5);
    expect(serverRemainingSeconds(20_000, 5_000, 21_000)).toBe(0);
  });
});
