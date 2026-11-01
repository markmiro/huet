/**
 * The configurator's own `<div data-huet-configurator>`. Menus, selects and
 * popovers portal into it rather than into `document.body`, so the panel's
 * scoped styles and Huet colors still reach them.
 */
export declare const PortalContainerContext: import('react').Context<HTMLElement | null>;
export declare const usePortalContainer: () => HTMLElement | null;
/** Above the popover (1000) and the floating panel (999). */
export declare const popupLayer = "hc:z-[1010]";
