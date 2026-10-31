import { themeFromConfig, ThemeConfig } from 'huet/config';
type HuetTheme = ReturnType<typeof themeFromConfig>;
/**
 * `themeFromConfig`, built once per config object. A configurator's page
 * target and its own panel mount the same config, and each change creates a
 * new config rather than editing one in place.
 */
export default function themeFor(config: ThemeConfig): HuetTheme;
export {};
