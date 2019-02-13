import { useState, useCallback, useEffect } from "react";
import _ from "lodash";

let counter = 0;
function increment() {
  return "useBrowserState_huet_" + counter++;
}

export function reset() {
  localStorage.clear();
  window.location.reload();
}

export default function useBrowserState(defaultValue, { at } = {}) {
  const [defaultKey] = useState(
    // Need to slice since keys can get really big
    () => increment() + "_" + btoa(JSON.stringify(defaultValue).slice(500))
  );
  // if (!at) {
  //   throw new Error("Need to store somewhere! 'at' param is missing.");
  //   try {
  //     throw new Error("");
  //   } catch (error) {
  //     const stackDepth = 2;
  //     at = error.stack
  //       .replace(/^Error:\s+/, "") // Remove prefix
  //       .replace(/\(.*\)/g, "") // Remove urls in between parens
  //       .replace(/\n\s+/g, "\n") // Remove spaces before each "at"
  //       .match(/at \w+/g) // Get array of things that start with "at"
  //       .map(instance => instance.replace("at ", ""))
  //       .slice(0, stackDepth)
  //       .join(".");
  //   }
  // }
  const key = at || defaultKey;

  const [value, setValue] = useState(() => {
    const storedString = localStorage.getItem(key);
    const storedValue = JSON.parse(
      storedString === "undefined" ? null : storedString
    );
    // Allow reference equality check to work by returning the default value rather than localStorage stuff
    if (storedString === JSON.stringify(defaultValue)) return defaultValue;
    return storedValue !== null ? storedValue : defaultValue;
  });

  const debounceSaveToLocalStorage = useCallback(
    _.debounce((key, value) => {
      localStorage.setItem(key, JSON.stringify(value));
    }, 500),
    []
  );

  useEffect(() => {
    debounceSaveToLocalStorage(key, value);
  }, [value]);

  function setValueAndStorage(newValueOrFunc) {
    setValue(newValueOrFunc);
  }

  return [value, setValueAndStorage];
}
