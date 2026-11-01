import { createContext, useContext } from "react";

/**
 * The configurator's own `<div data-huet-configurator>`. Menus, selects and
 * popovers portal into it rather than into `document.body`, so the panel's
 * scoped styles and Huet colors still reach them.
 */
export const PortalContainerContext = createContext<HTMLElement | null>(null);

export const usePortalContainer = () => useContext(PortalContainerContext);

/** Above the popover (1000) and the floating panel (999). */
export const popupLayer = "hc:z-[1010]";
