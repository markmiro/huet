import _ from "lodash";
import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

let counter = 0;
function increment() {
  return `useBrowserState_huet_${counter++}`;
}

export function reset() {
  localStorage.clear();
  window.location.reload();
}

let incrementUnsaved: (key: unknown) => void = () => {};
let decrementUnsaved: (key: unknown) => void = () => {};

export function useIsBrowserStateSaving() {
  const [keys, setKeys] = useState<unknown[]>([]);
  const isSaving = keys.length > 0;

  useEffect(() => {
    incrementUnsaved = (key) =>
      setKeys((current) => (current.includes(key) ? current : [...current, key]));
    decrementUnsaved = (key) =>
      setKeys((current) => current.filter((k) => k !== key));
  }, []);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (isSaving) {
        event.preventDefault();
        return "We're still saving...";
      }
      return undefined;
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isSaving]);

  return isSaving;
}

function countedDebounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number
) {
  const debounced = _.debounce((...args: Args) => {
    decrementUnsaved(fn);
    fn(...args);
  }, delay);

  return (...args: Args) => {
    incrementUnsaved(fn);
    debounced(...args);
  };
}

export default function useBrowserState<T>(
  defaultValue: T,
  { at }: { at?: string } = {}
): [T, Dispatch<SetStateAction<T>>] {
  const [defaultKey] = useState(
    // Need to slice since keys can get really big
    () => `${increment()}_${btoa(JSON.stringify(defaultValue).slice(500))}`
  );

  const key = at || defaultKey;

  const [value, setValue] = useState<T>(() => {
    const storedString = localStorage.getItem(key);
    const storedValue = JSON.parse(
      storedString === "undefined" || storedString === null ? "null" : storedString
    ) as T | null;
    // Allow reference equality check to work by returning the default value rather than localStorage stuff
    if (storedString === JSON.stringify(defaultValue)) return defaultValue;
    return storedValue !== null ? storedValue : defaultValue;
  });

  const debounceSaveToLocalStorage = useCallback(
    countedDebounce((storageKey: string, storageValue: T) => {
      localStorage.setItem(storageKey, JSON.stringify(storageValue));
    }, 1000),
    []
  );

  useEffect(() => {
    debounceSaveToLocalStorage(key, value);
  }, [debounceSaveToLocalStorage, key, value]);

  return [value, setValue];
}
