
export interface CacheProvider<T = any> {
  get(key: string): T | undefined | Promise<T | undefined>;
  set(key: string, value: T, ttlMs?: number): void | Promise<void>;
}

export class MemoryCache<T = any> implements CacheProvider<T> {
  private map = new Map<string, { value: T; expires?: number }>();
  get(key: string): T | undefined {
    const item = this.map.get(key);
    if (!item) return undefined;
    if (item.expires && item.expires < Date.now()) {
      this.map.delete(key);
      return undefined;
    }
    return item.value;
  }
  set(key: string, value: T, ttlMs?: number) {
    const expires = ttlMs ? Date.now() + ttlMs : undefined;
    this.map.set(key, { value, expires });
  }
}

export class FSCache<T = any> implements CacheProvider<T> {
  constructor(private dir: string) {}
  private path(key: string) { 
    const safe = key.replace(/[^\w\-\.]/g, "_");
    return `${this.dir}/${safe}.json`; 
  }
  get(key: string): T | undefined {
    try {
      const p = this.path(key);
      const raw = require("node:fs").readFileSync(p, "utf8");
      const obj = JSON.parse(raw);
      if (obj?.expires && obj.expires < Date.now()) return undefined;
      return obj?.value as T;
    } catch { return undefined; }
  }
  set(key: string, value: T, ttlMs?: number) {
    const fs = require("node:fs");
    const path = require("node:path");
    fs.mkdirSync(this.dir, { recursive: true });
    const payload = JSON.stringify({ value, expires: ttlMs ? Date.now()+ttlMs : undefined });
    fs.writeFileSync(this.path(key), payload, "utf8");
  }
}
