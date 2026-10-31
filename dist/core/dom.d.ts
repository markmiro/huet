import { BackgroundOptions, Theme } from './theme';
/**
 * Color `root` and the Huet classes under it with a theme, and keep them
 * colored as elements change. `background` places the root on the theme's
 * neutral ramp: 0 is dark, 1 (the default) is light. Mount once per independent
 * tree. Elements with Huet classes receive inline variables.
 */
export declare function mountTheme(root: HTMLElement, initialTheme: Theme, options?: BackgroundOptions): {
    /** Recolor with another theme. `background` stays as it was unless given. */
    update(next: Theme, options?: BackgroundOptions): void;
    destroy(): void;
};
