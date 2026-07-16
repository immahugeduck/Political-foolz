/**
 * Cache Layer (Build 4)
 * Simple, effective, and easy to upgrade.
 */

interface CacheEntry {
  value: any;
  expiresAt: number;
}

class CacheLayer {
  private store: Map<string, CacheEntry> = new Map();

  set(key: string, value: any, ttlSeconds: number = 3600) {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.store.set(key, { value, expiresAt });
  }

  get(key: string): any | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  clear() {
    this.store.clear();
  }
}

export const cache = new CacheLayer();
