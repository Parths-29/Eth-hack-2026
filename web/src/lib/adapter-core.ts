/** Testable cancellation/fallback policy. Never fall back on a cancelled request. */
export async function withFallback<T>(
  live: () => Promise<T>,
  mock: () => T,
  notify: () => void,
  signal?: AbortSignal,
): Promise<T> {
  signal?.throwIfAborted();
  try {
    const value = await live();
    signal?.throwIfAborted();
    return value;
  } catch (error) {
    if (signal?.aborted || (error as Error).name === "AbortError") throw error;
    notify();
    return mock();
  }
}
