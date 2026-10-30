/**
 * Travel along the same OKLab path, spacing strengths by equal CIE L* steps.
 * Raw OKLab interpolation crushes small steps near black, because OKLab's
 * lightness is steep there. L* is linear in luminance near black, so equal
 * strength steps look about equally far apart on either polarity:
 * L*(amount) = L*(background) + (L*(target) − L*(background)) × amount.
 * The full-strength anchor is unchanged; this does not impose a contrast target.
 */
export declare function mixSignal(background: string, target: string, amount: number): string;
