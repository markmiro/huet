import type { ThemeConfig } from "../colorModel";
import Theme from "../Theme";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const isNumber = (value: unknown) =>
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
    typeof value.rescaleSaturationToGrayRange === "boolean" &&
    typeof value.rescaleContrastToGrayRange === "boolean";
  if (!isValidShape) return false;

  try {
    new Theme(value as unknown as ThemeConfig);
    return true;
  } catch {
    return false;
  }
}
