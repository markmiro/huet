import { Dispatch, SetStateAction } from 'react';
/** Turns a stored JSON value into `T`, or returns `undefined` if it's invalid. */
export type Parse<T> = (stored: unknown) => T | undefined;
export declare const asBoolean: Parse<boolean>;
export declare const asNumber: Parse<number>;
export declare const asString: Parse<string>;
export declare function asOneOf<T extends string>(values: readonly T[]): Parse<T>;
export declare function readStored<T>(key: string, fallback: T, parse: Parse<T>): T;
export declare function writeStored(key: string, value: unknown): void;
export declare function flushStored(): void;
/** Removes everything Huet has saved, leaving the host page's storage alone. */
export declare function clearStored(): void;
export declare function reset(): void;
/** True while there are changes that haven't been written to storage yet. */
export declare function useIsSaving(): boolean;
/**
 * Like `useState`, but the value survives reloads.
 * `key` must be unique and stable across renders.
 */
export default function usePersistentState<T>(key: string, defaultValue: T, parse: Parse<T>): [T, Dispatch<SetStateAction<T>>];
