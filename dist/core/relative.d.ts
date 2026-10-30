import { default as Color } from '../Color';
import { ColorModel } from '../colorModel';
/** Use the same solver as the original API, without importing React. */
export declare function relativeRoot(background: string, colors: Record<string, string>, neutral: {
    colors: readonly string[];
    colorModel: ColorModel;
}, contrastMultiplier?: number, custom?: boolean): Color;
