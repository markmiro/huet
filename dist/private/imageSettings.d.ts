import { ThemeConfig } from 'huet/config';
type ImageSettings = NonNullable<ThemeConfig["images"]>;
/**
 * A theme's image settings. Themes saved without them recolor images at full
 * strength: only images marked `data-huet-recolor` are affected, so pages
 * opt in per image rather than per theme.
 */
export default function imageSettings(config: ThemeConfig): ImageSettings;
export {};
