import { HuetTheme } from './theme';
/** Mount once per independent tree. Only background surfaces receive inline variables. */
export declare function mountTheme(root: HTMLElement, initialTheme: HuetTheme): {
    update(next: HuetTheme): void;
    destroy(): void;
};
