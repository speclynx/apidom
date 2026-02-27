import type { CacheOptions } from '../../HTTPResolver.ts';

interface CacheEntry<T> {
  value: T;
  createdAt: number;
}

/**
 * @public
 */
class MemoryCache<T> {
  protected readonly maxEntries: number | false;

  protected readonly maxStaleAge: number | false;

  protected readonly store: Map<string, CacheEntry<T>> = new Map();

  constructor(options: CacheOptions = {}) {
    const { maxEntries = 1024, maxStaleAge = 3_600_000 } = options;

    this.maxEntries = maxEntries;
    this.maxStaleAge = maxStaleAge;
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
}

export default MemoryCache;
