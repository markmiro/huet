import { ThemeConfig } from '../colorModel';
/**
 * Checks that untrusted data (saved state, imported files) is a usable theme
 * config. Beyond the shape, it has to actually build a `Theme`, which catches
 * things like ramps that reference missing pallet colors.
 */
export default function isThemeConfig(value: unknown): value is ThemeConfig;
/**
 * Like `isThemeConfig`, but first drops settings that no longer exist.
 * Use it wherever theme configs come from saved state or imported files.
 */
export declare function parseThemeConfig(value: unknown): ThemeConfig | undefined;
