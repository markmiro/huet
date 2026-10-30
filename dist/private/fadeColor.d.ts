/**
 * A common linear-light fade preserves luminance ordering:
 * Y(result) = (1 - amount) * Y(origin) + amount * Y(enabled).
 * Applying it to both parent and child cannot reverse their contrast polarity.
 */
export declare function fadeColor(origin: string, enabled: string, amount: number): string;
