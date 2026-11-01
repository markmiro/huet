import { Menu } from "@base-ui/react/menu";
import { IconDots } from "@tabler/icons-react";
import React from "react";

import cx from "../cx";
import { buttonClass, confirmed } from "./button";
import { itemClass, popupClass } from "./popup";
import { popupLayer, usePortalContainer } from "./portal";

/** shadcn's DropdownMenu on Base UI, behind a "⋯" button. */
export function DropdownMenu({
  label,
  children,
  align = "end",
}: {
  /** The trigger's accessible name */
  label: string;
  children?: React.ReactNode;
  align?: "start" | "center" | "end";
}) {
  const container = usePortalContainer();
  return (
    <Menu.Root>
      <Menu.Trigger aria-label={label} title={label} className={buttonClass({ variant: "ghost", size: "icon-sm" })}>
        <IconDots size="1.125em" stroke={2} />
      </Menu.Trigger>
      <Menu.Portal container={container}>
        <Menu.Positioner sideOffset={4} align={align} className={popupLayer}>
          <Menu.Popup className={cx(popupClass, "hc:p-1 hc:min-w-[12em]")}>{children}</Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export function DropdownMenuItem({
  icon,
  children,
  onClick,
  verify,
  disabled,
}: {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  /** Asks before running `onClick` */
  verify?: boolean | string;
  disabled?: boolean;
}) {
  return (
    <Menu.Item
      disabled={disabled}
      className={itemClass}
      onClick={() => {
        if (confirmed(verify)) onClick?.();
      }}
    >
      <span className="hc:flex hc:w-[1em] hc:justify-center huet-text-70">{icon}</span>
      {children}
    </Menu.Item>
  );
}

export function DropdownMenuSeparator() {
  return <Menu.Separator className="huet-bg-10 hc:h-px hc:my-1 hc:-mx-1" />;
}
