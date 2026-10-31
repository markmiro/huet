import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from "react";

/*
  Persists small pieces of UI state to localStorage.

  Every value lives under an explicit, namespaced key (`huet:<key>`) and is run
  through a parser when read. Anything missing, unparseable, or the wrong shape
  falls back to the default instead of reaching components. Writes are batched
  and flushed when the page is hidden so nothing is lost on reload.
*/

const PREFIX = "huet:";
// Keys written by the old order-based `useBrowserState` hook.
const LEGACY_PREFIX = "useBrowserState_huet_";
// Settings the configurator no longer has
const REMOVED_KEYS = ["themer:showHelp"];
const SAVE_DELAY = 500;

/** Turns a stored JSON value into `T`, or returns `undefined` if it's invalid. */
export type Parse<T> = (stored: unknown) => T | undefined;

export const asBoolean: Parse<boolean> = (stored) =>
  typeof stored === "boolean" ? stored : undefined;

export const asNumber: Parse<number> = (stored) =>
  typeof stored === "number" && Number.isFinite(stored) ? stored : undefined;

export const asString: Parse<string> = (stored) =>
  typeof stored === "string" ? stored : undefined;

export function asOneOf<T extends string>(values: readonly T[]): Parse<T> {
  return (stored) =>
    values.includes(stored as T) ? (stored as T) : undefined;
}

function getStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    // Access can throw when storage is disabled (privacy settings, sandboxed iframes)
    return null;
  }
}

function storageKeys(storage: Storage) {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key !== null) keys.push(key);
  }
  return keys;
}

export function readStored<T>(key: string, fallback: T, parse: Parse<T>): T {
  // A value written moments ago may not have been flushed yet
  if (pending.has(key)) return parse(pending.get(key)) ?? fallback;
  const storage = getStorage();
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    const parsed = parse(JSON.parse(raw));
    if (parsed !== undefined) return parsed;
  } catch {
    // Fall through: treat unreadable JSON the same as an invalid value
  }
  console.warn(`Huet: discarding invalid saved value for "${key}"`);
  try {
    storage.removeItem(PREFIX + key);
  } catch {
    // Ignore
  }
  return fallback;
}

const pending = new Map<string, unknown>();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;

function notify() {
  for (const listener of listeners) listener();
}

export function writeStored(key: string, value: unknown) {
  pending.set(key, value);
  clearTimeout(timer);
  timer = setTimeout(flushStored, SAVE_DELAY);
  notify();
}

export function flushStored() {
  clearTimeout(timer);
  timer = undefined;
  if (pending.size === 0) return;
  const storage = getStorage();
  for (const [key, value] of pending) {
    try {
      storage?.setItem(PREFIX + key, JSON.stringify(value));
    } catch (error) {
      // Quota exceeded, etc. Keep the in-memory state and move on.
      console.warn(`Huet: couldn't save "${key}"`, error);
    }
  }
  pending.clear();
  notify();
}

/** Removes everything Huet has saved, leaving the host page's storage alone. */
export function clearStored() {
  clearTimeout(timer);
  timer = undefined;
  pending.clear();
  notify();
  const storage = getStorage();
  if (!storage) return;
  for (const key of storageKeys(storage)) {
    if (key.startsWith(PREFIX) || key.startsWith(LEGACY_PREFIX)) {
      storage.removeItem(key);
    }
  }
}

export function reset() {
  clearStored();
  window.location.reload();
}

function removeLegacyKeys() {
  const storage = getStorage();
  if (!storage) return;
  try {
    for (const key of storageKeys(storage)) {
      if (key.startsWith(LEGACY_PREFIX)) storage.removeItem(key);
    }
    for (const key of REMOVED_KEYS) storage.removeItem(PREFIX + key);
  } catch {
    // Ignore
  }
}

if (typeof window !== "undefined") {
  removeLegacyKeys();
  window.addEventListener("pagehide", flushStored);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushStored();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** True while there are changes that haven't been written to storage yet. */
export function useIsSaving() {
  return useSyncExternalStore(
    subscribe,
    () => pending.size > 0,
    () => false
  );
}

/**
 * Like `useState`, but the value survives reloads. Hooks with the same `key`
 * share the value, so two configurators on one page stay in sync.
 * `key` must be stable across renders.
 */
export default function usePersistentState<T>(
  key: string,
  defaultValue: T,
  parse: Parse<T>
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(() =>
    readStored(key, defaultValue, parse)
  );
  const latest = useRef(value);
  latest.current = value;
  // Only write after the user changes something, so loading never touches storage.
  const hasChanged = useRef(false);
  // The last value taken from another hook. It isn't written back, which
  // would bounce it between the two forever.
  const received = useRef<{ raw: unknown; value: T }>(undefined);
  // Our last write, while it's still the newest. A write to another key
  // notifies every hook before this one's next write lands, so without this
  // the hook would take its own older value for another hook's.
  const written = useRef<{ raw: unknown }>(undefined);

  useEffect(() => {
    if (hasChanged.current && value !== received.current?.value) {
      written.current = { raw: value };
      // Changed here since, so setting it back to that value is a new write
      received.current = undefined;
      writeStored(key, value);
    }
  }, [key, value]);

  useEffect(
    () =>
      subscribe(() => {
        if (!pending.has(key)) return;
        const raw = pending.get(key);
        // Our own write, or one we already took
        if (
          raw === latest.current ||
          raw === written.current?.raw ||
          raw === received.current?.raw
        )
          return;
        const next = parse(raw);
        if (next === undefined) return;
        written.current = undefined;
        received.current = { raw, value: next };
        setValue(next);
      }),
    [key, parse]
  );

  const set = useCallback<Dispatch<SetStateAction<T>>>((action) => {
    hasChanged.current = true;
    setValue(action);
  }, []);

  return [value, set];
}
