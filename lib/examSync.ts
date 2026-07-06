export const enqueueUnique = (ids: string[], id: string): string[] => ids.includes(id) ? ids : [...ids, id];
export const acknowledge = (ids: string[], id: string): string[] => ids.filter((queuedId) => queuedId !== id);
export const serverRemainingSeconds = (expiresAt: number, serverOffsetMs: number, localNow = Date.now()): number =>
  Math.max(0, Math.ceil((expiresAt - (localNow + serverOffsetMs)) / 1000));
