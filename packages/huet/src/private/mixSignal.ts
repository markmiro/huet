import { contrastRatio, luminance, mix } from "../core/color";

/**
 * Travel along the same OKLab path, spacing strengths by relative contrast.
 * Raw OKLab interpolation crushes small steps near black. A geometric ratio
 * scale gives the same proportional contrast growth on either polarity:
 * ratio(amount) = ratio(full-strength) ** amount.
 * The full-strength anchor is unchanged; this does not impose a WCAG target.
 */
export function mixSignal(background: string, target: string, amount: number) {
  if (amount === 0) return background;
  if (amount === 1) return target;
  const bgY = luminance(background), endY = luminance(target);
  if (Math.abs(endY - bgY) < 1e-10) return mix(background, target, amount);
  const lighter = endY > bgY;
  const ratio = contrastRatio(background, target) ** amount;
  const desiredY = lighter
    ? (bgY + 0.05) * ratio - 0.05
    : (bgY + 0.05) / ratio - 0.05;
  let low = 0, high = 1, best = background;
  let error = Math.abs(desiredY - bgY);
  // Select on the actual rounded sRGB path, retaining its hue/chroma scaling.
  for (let i = 0; i < 18; i++) {
    const middle = (low + high) / 2;
    const color = mix(background, target, middle);
    const value = luminance(color);
    const distance = Math.abs(value - desiredY);
    if (distance < error) { best = color; error = distance; }
    if (lighter ? value < desiredY : value > desiredY) low = middle;
    else high = middle;
  }
  return best;
}
