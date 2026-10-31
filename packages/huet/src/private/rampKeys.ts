import type { Ramp } from "../colorModel";

/**
 * Ramps with equal keys have the same colors and settings, so they sample the
 * same. Each theme still gets its own ramp objects, but they share samples.
 */
export const rampKeys = new WeakMap<Ramp, string>();
