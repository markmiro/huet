const MISS = "MISS";

function setAtPath(
  map: Map<unknown, unknown>,
  path: readonly unknown[],
  value: unknown
) {
  let running = map;
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    if (i === path.length - 1) {
      running.set(key, value);
    } else {
      if (!running.has(key)) running.set(key, new Map());
      running = running.get(key) as Map<unknown, unknown>;
    }
  }
}

function getAtPath(map: Map<unknown, unknown>, path: readonly unknown[]) {
  let running: unknown = map;
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    if (!(running instanceof Map) || !running.has(key)) return MISS;
    running = running.get(key);
  }
  return running;
}

export default class Cache {
  resetAtItemCount: number;
  cached: Map<unknown, unknown>;
  itemCount: number;
  tries: number;
  hits: number;

  constructor(resetAtItemCount = 500) {
    this.resetAtItemCount = resetAtItemCount;
    this.cached = new Map();
    this.itemCount = 0;
    this.tries = 0;
    this.hits = 0;
  }

  set(path: readonly unknown[], value: unknown) {
    if (this.itemCount > this.resetAtItemCount) {
      this.reset();
    }
    setAtPath(this.cached, path, value);
    this.itemCount++;
  }

  get(path: readonly unknown[]) {
    const response = getAtPath(this.cached, path);
    this.tries++;
    if (response === MISS) {
      return null;
    }
    this.hits++;

    return response;
  }

  at<T>(path: readonly unknown[], func: () => T): T {
    const cachedValue = this.get(path);
    if (cachedValue) return cachedValue as T;
    const value = func();
    this.set(path, value);
    return value;
  }

  log() {
    console.log(
      `Size: ${this.itemCount}
Percent hits: ${Math.round((this.hits / this.tries) * 100)}%
Hits: ${this.hits}
Misses: ${this.tries - this.hits}
Tries: ${this.tries}`
    );
  }

  reset() {
    this.cached = new Map();
    this.itemCount = 0;
    this.tries = 0;
    this.hits = 0;
  }
}
