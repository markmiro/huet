import { Ramp, ThemeConfig, rampModes } from './colorModel';
export { rampModes };
export type { RampMode } from './colorModel';
export default class Theme {
    config: ThemeConfig;
    id?: number;
    name?: string;
    pallet: Record<string, string>;
    ramps: Record<string, Ramp>;
    bgRamp: string;
    bgRampValue: number;
    startSignalLightness: number;
    endSignalLightness: number;
    contrastMultiplier: number;
    rescaleContrastToGrayRange: boolean;
    /**
     * Creates a theme instance from a themeConfig
     */
    constructor(config?: ThemeConfig);
}
