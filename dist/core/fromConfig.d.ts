import { ThemeConfig } from '../colorModel';
import { HuetTheme } from './theme';
/**
 * Builds a core theme from a configurator theme config.
 * Relative classes (`huet-bg-10`, `huet-text-red-100`, ...) resolve with the
 * full config, so they match `<Block contrast="...">` exactly. Role tokens
 * (`huet-text`, `huet-muted`, ...) come from the config's background ramp,
 * palette hues and background position.
 */
export declare function themeFromConfig(config: ThemeConfig): HuetTheme;
