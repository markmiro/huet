import type { ThemeConfig } from "../colorModel";
import Theme from "../Theme";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Settings older versions saved. Dropped on load so saved themes and exported
// files that still have them keep working.
const removedKeys = ["rescaleSaturationToGrayRange"];

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/**
 * Checks that untrusted data (saved state, imported files) is a usable theme
 * config. Beyond the shape, it has to actually build a `Theme`, which catches
 * things like ramps that reference missing pallet colors.
 */
export default function isThemeConfig(value: unknown): value is ThemeConfig {
  if (!isRecord(value)) return false;
  const { id, name, pallet, ramps, bgRamp } = value;
  const isValidShape =
    (id === undefined || isNumber(id)) &&
    (name === undefined || typeof name === "string") &&
    isRecord(pallet) &&
    Object.values(pallet).every((color) => typeof color === "string") &&
    isRecord(ramps) &&
    Object.values(ramps).every(isRecord) &&
    typeof bgRamp === "string" &&
    bgRamp in ramps &&
    isNumber(value.bgRampValue) &&
    isNumber(value.startSignalLightness) &&
    isNumber(value.endSignalLightness) &&
    isNumber(value.contrastMultiplier) &&
    typeof value.rescaleContrastToGrayRange === "boolean";
  if (!isValidShape) return false;
  if (value.images !== undefined) {
    const images = value.images;
    if (!isRecord(images) || typeof images.enabled !== "boolean" ||
        !isNumber(images.tint) || images.tint < 0 || images.tint > 1 ||
        !isNumber(images.strength) || images.strength < 0 || images.strength > 1)
      return false;
  }

  try {
    new Theme(value as unknown as ThemeConfig);
    return true;
  } catch {
    return false;
  }
}

/**
 * Like `isThemeConfig`, but first drops settings that no longer exist.
 * Use it wherever theme configs come from saved state or imported files.
 */
export function parseThemeConfig(value: unknown): ThemeConfig | undefined {
  if (!isRecord(value)) return undefined;
  const config = Object.fromEntries(
    Object.entries(value).filter(([key]) => !removedKeys.includes(key))
  );
  return isThemeConfig(config) ? config : undefined;
}
