import { useState, useEffect, Dispatch, SetStateAction } from "react";

/**
 * A custom hook that provides a stateful value and a function to update it,
 * automatically persisting changes to localStorage.
 * 
 * @param key The localStorage key to store the state under
 * @param defaultValue The initial fallback value if no value exists in localStorage
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item);
      }
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}
