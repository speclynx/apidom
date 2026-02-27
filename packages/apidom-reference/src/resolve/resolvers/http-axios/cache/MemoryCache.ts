import type { CacheOptions } from '../../HTTPResolver.ts';

interface CacheEntry<T> {
  value: T;
  createdAt: number;
}

/**
 * @public
 */
class MemoryCache<T> {
  protected readonly cleanupInterval: number | false;

  protected readonly maxEntries: number | false;

  protected readonly maxStaleAge: number | false;

  protected readonly store: Map<string, CacheEntry<T>> = new Map();

  protected cleanupTimer: ReturnType<typeof setInterval> | undefined;

  constructor(options: CacheOptions = {}) {
    const { cleanupInterval = 300_000, maxEntries = 1024, maxStaleAge = 3_600_000 } = options;

    this.cleanupInterval = cleanupInterval;
    this.maxEntries = maxEntries;
    this.maxStaleAge = maxStaleAge;

    if (this.maxStaleAge !== false && this.cleanupInterval !== false && this.cleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => this.evictStale(), this.cleanupInterval);
      // allow the process to exit even if the timer is running
      if (typeof this.cleanupTimer === 'object' && 'unref' in this.cleanupTimer) {
        this.cleanupTimer.unref();
      }
    }
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (entry === undefined) return undefined;

    // evict if entry has exceeded maxStaleAge
    if (this.maxStaleAge !== false && Date.now() - entry.createdAt > this.maxStaleAge) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, createdAt: Date.now() });

    // evict oldest entries if maxEntries exceeded
    if (this.maxEntries !== false && this.store.size > this.maxEntries) {
      const firstKey = this.store.keys().next().value as string;
      this.store.delete(firstKey);
    }
  }

  dispose(): void {
    if (this.cleanupTimer !== undefined) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.store.clear();
  }

  protected evictStale(): void {
    if (this.maxStaleAge === false) return;

    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now - entry.createdAt > this.maxStaleAge) {
        this.store.delete(key);
      }
    }
  }
}

export default MemoryCache;
