// lib/cache-manager.ts
// POC stub for CacheManager singleton

type Getter<T> = () => Promise<T>;

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, any> = new Map();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async getOrSet<T>(key: string, getter: Getter<T>): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const value = await getter();
    this.cache.set(key, value);
    return value;
  }
}
