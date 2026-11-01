import { Popover as BasePopover } from "@base-ui/react/popover";
import { IconDots } from "@tabler/icons-react";
import React from "react";

import cx from "../cx";
import { buttonClass } from "./button";
import { popupClass } from "./popup";
import { popupLayer, usePortalContainer } from "./portal";

/**
 * A "⋯" button that opens advanced settings in a popover. A blue dot on the
 * button, and the count in its name, say how many of them differ from their
 * defaults.
 */
export function SettingsPopover({
  label,
  title,
  changed = 0,
  children,
}: {
  /** The trigger's accessible name */
  label: string;
  /** The popover's heading */
  title: string;
  /** How many settings inside differ from their defaults */
  changed?: number;
  children?: React.ReactNode;
}) {
  const container = usePortalContainer();
  const name = changed ? `${label} (${changed} changed)` : label;
  return (
    <BasePopover.Root>
      <BasePopover.Trigger
        aria-label={name}
        title={name}
        className={buttonClass({ variant: "ghost", size: "icon-sm", className: "hc:relative" })}
      >
        <IconDots size="1.125em" stroke={2} />
        {changed > 0 && (
          <span
            aria-hidden
            className="huet-bg-blue-100 hc:absolute hc:top-[.125em] hc:right-[.125em] hc:size-[.5em] hc:rounded-full"
          />
        )}
      </BasePopover.Trigger>
      <BasePopover.Portal container={container}>
        <BasePopover.Positioner sideOffset={4} align="end" collisionPadding={8} className={popupLayer}>
          <BasePopover.Popup aria-label={label} className={cx(popupClass, "hc:w-[19em] hc:p-[1em] hc:flex hc:flex-col hc:gap-[.875em]")}>
            {/* Not Popover.Title, whose labelledby would replace the name above */}
            <h4 className="hc:font-semibold">{title}</h4>
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
