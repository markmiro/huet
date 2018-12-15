import { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";

let counter = 0;
function increment() {
  return "useBrowserState_" + counter++;
}

export function reset() {
  localStorage.clear();
  window.location.reload();
}

export default function useBrowserState(defaultValue, { at } = {}) {
  const [defaultKey] = useState(
    () => increment() + "_" + btoa(JSON.stringify(defaultValue))
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
    return storedValue !== null ? storedValue : defaultValue;
  });

  const debounceSaveToLocalStorage = useCallback(
    debounce((key, value) => {
      localStorage.setItem(key, JSON.stringify(value));
    }, 500),
    []
  );

  useEffect(
    () => {
      debounceSaveToLocalStorage(key, value);
    },
    [value]
  );

  function setValueAndStorage(newValueOrFunc) {
    setValue(newValueOrFunc);
  }

  return [value, setValueAndStorage];
}
