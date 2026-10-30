import { rgb } from "../core/color";

/**
 * A common linear-light fade preserves luminance ordering:
 * Y(result) = (1 - amount) * Y(origin) + amount * Y(enabled).
 * Applying it to both parent and child cannot reverse their contrast polarity.
 */
export function fadeColor(origin: string, enabled: string, amount: number) {
  if (amount === 0) return origin;
  if (amount === 1) return enabled;
  const linear = (v: number) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
  const gamma = (v: number) => v <= .0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - .055;
  const a = rgb(origin).map(linear), b = rgb(enabled).map(linear);
  return "#" + a.map((v, i) => Math.round(Math.max(0, Math.min(1,
    gamma(v + (b[i] - v) * amount))) * 255).toString(16).padStart(2, "0")).join("");
}
