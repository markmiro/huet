import { default as React } from 'react';
import { ThemeConfig } from 'huet/config';
/** One shared stylesheet, so consumers don't import any CSS. */
export declare function injectStyles(): void;
/**
 * Renders the panel into its own `<div data-huet-configurator>` on
 * document.body. The scoped styles in configurator.css only apply there, and
 * the host's transforms or overflow can't break the panel's `position: fixed`.
 * The container is a Huet root, so `huet-*` classes inside it resolve against
 * `themeConfig`.
 */
export default function ConfiguratorPortal({ themeConfig, children, }: {
    themeConfig: ThemeConfig;
    children?: React.ReactNode;
}): React.ReactPortal | null;
