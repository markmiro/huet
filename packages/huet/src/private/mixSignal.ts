import { lightness, mix } from "../core/color";

/**
 * Travel along the same OKLab path, spacing strengths by equal CIE L* steps.
 * Raw OKLab interpolation crushes small steps near black, because OKLab's
 * lightness is steep there. L* is linear in luminance near black, so equal
 * strength steps look about equally far apart on either polarity:
 * L*(amount) = L*(background) + (L*(target) − L*(background)) × amount.
 * The full-strength anchor is unchanged; this does not impose a contrast target.
 */
export function mixSignal(background: string, target: string, amount: number) {
  if (amount === 0) return background;
  if (amount === 1) return target;
  const bgL = lightness(background), endL = lightness(target);
  if (Math.abs(endL - bgL) < 1e-10) return mix(background, target, amount);
  const lighter = endL > bgL;
  const desired = bgL + (endL - bgL) * amount;
  let low = 0, high = 1, best = background;
  let error = Math.abs(desired - bgL);
  // Select on the actual rounded sRGB path, retaining its hue/chroma scaling.
  for (let i = 0; i < 18; i++) {
    const middle = (low + high) / 2;
    const color = mix(background, target, middle);
    const value = lightness(color);
    const distance = Math.abs(value - desired);
    if (distance < error) { best = color; error = distance; }
    if (lighter ? value < desired : value > desired) low = middle;
    else high = middle;
  }
  return best;
}
