const MISS = "MISS";

function setAtPath(map, path, value) {
  let running = map;
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    if (i === path.length - 1) {
      running.set(key, value);
    } else {
      if (!running.has(key)) running.set(key, new Map());
      running = running.get(key);
    }
  }
}

function getAtPath(map, path) {
  let running = map;
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    if (!running.has(key)) return MISS;
    running = running.get(key);
  }
  return running;
}

// ---

export default class Cache {
  constructor(resetAtItemCount = 2000) {
    this.resetAtItemCount = resetAtItemCount;
    this.reset();
  }

  set(path, value) {
    if (this.itemCount > this.resetAtItemCount) {
      this.reset();
    }
    setAtPath(this.cached, path, value);
    this.itemCount++;
  }

  get(path) {
    const response = getAtPath(this.cached, path);
    this.tries++;
    if (response === MISS) {
      return null;
    } else {
      this.hits++;
    }
    return response;
  }

  at(path, func) {
    // return func();
    const cachedValue = this.get(path);
    if (cachedValue) return cachedValue;
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

// const cache = new Cache();
// export function memo(func) {
//   return (...params) => cache.at(params, () => func(...params));
// }
