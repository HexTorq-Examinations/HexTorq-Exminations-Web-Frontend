export const enqueueUnique = (ids: string[], id: string): string[] => ids.includes(id) ? ids : [...ids, id];
export const acknowledge = (ids: string[], id: string): string[] => ids.filter((queuedId) => queuedId !== id);
export const serverRemainingSeconds = (expiresAt: number, serverOffsetMs: number, localNow = Date.now()): number =>
  Math.max(0, Math.ceil((expiresAt - (localNow + serverOffsetMs)) / 1000));

export type SyncFailureKind = 'network' | 'retryable' | 'reconcile' | 'auth' | 'permanent';
export const classifySyncFailure = (error: unknown): SyncFailureKind => {
  const candidate = error as { httpStatus?: number; isNetworkError?: boolean } | null;
  if (!candidate || candidate.isNetworkError) return 'network';
  const status = candidate.httpStatus;
  if (status === undefined) return 'network';
  if (status === 401) return 'auth';
  if (status === 429 || status >= 500) return 'retryable';
  if ([404, 409, 410].includes(status)) return 'reconcile';
  return 'permanent';
};
