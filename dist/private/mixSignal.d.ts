/**
 * Travel along the same OKLab path, spacing strengths by relative contrast.
 * Raw OKLab interpolation crushes small steps near black. A geometric ratio
 * scale gives the same proportional contrast growth on either polarity:
 * ratio(amount) = ratio(full-strength) ** amount.
 * The full-strength anchor is unchanged; this does not impose a WCAG target.
 */
export declare function mixSignal(background: string, target: string, amount: number): string;
