import type { CacheOptions } from '../../HTTPResolver.ts';

interface CacheEntry<T> {
  value: T;
  createdAt: number;
}

/**
 * @public
 */
class MemoryCache<T> {
  protected readonly cloneData: boolean | 'double';

  protected readonly cleanupInterval: number | false;

  protected readonly maxEntries: number | false;

  protected readonly maxStaleAge: number | false;

  protected readonly store: Map<string, CacheEntry<T>> = new Map();

  protected cleanupTimer: ReturnType<typeof setInterval> | undefined;

  constructor(options: CacheOptions = {}) {
    const {
      cloneData = false,
      cleanupInterval = 300_000,
      maxEntries = 1024,
      maxStaleAge = 3_600_000,
    } = options;

    this.cloneData = cloneData;
    this.cleanupInterval = cleanupInterval;
    this.maxEntries = maxEntries;
    this.maxStaleAge = maxStaleAge;

    if (this.cleanupInterval !== false && this.cleanupInterval > 0) {
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

    // check if entry has exceeded maxStaleAge
    if (this.maxStaleAge !== false && Date.now() - entry.createdAt > this.maxStaleAge) {
      this.store.delete(key);
      return undefined;
    }

    return this.cloneOnRead(entry.value);
  }

  set(key: string, value: T): void {
    const storedValue = this.cloneOnWrite(value);

    this.store.set(key, { value: storedValue, createdAt: Date.now() });

    // evict oldest entries if maxEntries exceeded
    if (this.maxEntries !== false && this.store.size > this.maxEntries) {
      const firstKey = this.store.keys().next().value as string;
      this.store.delete(firstKey);
    }
  }

  clear(): void {
    this.store.clear();
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

  protected cloneOnRead(value: T): T {
    if (this.cloneData === false) return value;
    return this.clone(value);
  }

  protected cloneOnWrite(value: T): T {
    if (this.cloneData !== 'double') return value;
    return this.clone(value);
  }

  protected clone(value: T): T {
    if (value instanceof ArrayBuffer) {
      return value.slice(0) as T;
    }
    if (ArrayBuffer.isView(value)) {
      const buffer = value.buffer.slice(
        value.byteOffset,
        value.byteOffset + value.byteLength,
      ) as ArrayBuffer;
      const TypedArrayConstructor = value.constructor as new (buffer: ArrayBuffer) => T;
      return new TypedArrayConstructor(buffer);
    }
    // fallback: structuredClone for other types
    return structuredClone(value);
  }
}

export default MemoryCache;
