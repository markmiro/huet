import { default as React } from 'react';
/**
 * The themes passed to the configurator. Picking one replaces the edited
 * theme. An edited theme that matches none of them shows first, as "Custom".
 */
export default function Themes({ onCreate }: {
    onCreate?: () => void;
}): React.JSX.Element;
