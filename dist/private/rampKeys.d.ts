import { Ramp } from '../colorModel';
/**
 * Ramps with equal keys have the same colors and settings, so they sample the
 * same. Each theme still gets its own ramp objects, but they share samples.
 */
export declare const rampKeys: WeakMap<Ramp, string>;
