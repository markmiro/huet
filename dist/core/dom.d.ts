import { HuetTheme } from './theme';
/** Mount once per independent tree. Elements with Huet classes receive inline variables. */
export declare function mountTheme(root: HTMLElement, initialTheme: HuetTheme): {
    update(next: HuetTheme): void;
    destroy(): void;
};
