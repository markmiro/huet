import * as Popover from "@radix-ui/react-popover";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import React, { useLayoutEffect, useState } from "react";
import type { Theme } from "huet";
import { resolveTheme } from "huet/internal";

import { useThemeConfigurator } from "./context";
import { ConfiguratorRoot, type ThemeConfiguratorProps } from "./ThemeConfigurator";
import { HSpace } from "./private/AllExceptFirst";
import Button, { JsonUploadButton } from "./private/Button";
import ConfiguratorPortal, { injectStyles } from "./private/ConfiguratorPortal";
import EditTheme from "./private/EditTheme";
import Tabs, { asTab, tabEnum, type Tab } from "./private/Tabs";
import usePersistentState from "./private/persistentState";
import ErrorBoundary from "./private/ErrorBoundary";
import ThemeMiniMap from "./private/ThemeMiniMap";
import cx from "./private/cx";

/**
 * How the button sits on the page:
 * - `contrast`: inverted, so it's dark on light themes and light on dark ones
 * - `outlined`: a full-contrast border on the page background
 * - `blended`: no border until it's open, so it blends into the background
 */
export type EmbeddedThemeConfiguratorMode = "contrast" | "outlined" | "blended";

export interface EmbeddedThemeConfiguratorProps extends ThemeConfiguratorProps {
  mode?: EmbeddedThemeConfiguratorMode;
  side?: Popover.PopoverContentProps["side"];
  align?: Popover.PopoverContentProps["align"];
  /** Inline styles for the wrapper, such as margins */
  style?: React.CSSProperties;
}

// The panel's focus ring shows on any focus. Here, only for the keyboard, so
// opening the popover with a click doesn't ring the first theme.
const keyboardFocusOnly = "hc:not-focus-visible:shadow-none!";

/*
  Like the theme cards in the panel, each option shows a different theme, so
  its colors come from the theme's solver and are set inline. Hover colors
  can't be inline, so they go through variables.
*/
function ThemeOption({
  name,
  theme,
  isSelected,
  isEdited,
  onSelect,
}: {
  name: string;
  theme: Theme;
  isSelected: boolean;
  /** Shows "Edited" beside the name */
  isEdited?: boolean;
  onSelect: () => void;
}) {
  const { background } = useThemeConfigurator();
  const preview = resolveTheme(theme, { background });
  const { root: bg, step } = preview;
  const fg = step(bg, 100);
  // A subtle edge keeps the list calm; only the selected theme gets a strong one
  const border = isSelected ? fg.hex : step(bg, 15).hex;
  const hoverBorder = isSelected ? fg.hex : step(bg, 40).hex;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
      className={cx(
        "hc:flex hc:items-center hc:gap-[.75em] hc:w-full hc:py-[.5em] hc:px-[.625em]",
        "hc:rounded-md hc:border hc:cursor-pointer hc:text-left",
        keyboardFocusOnly,
        "hc:border-(color:--item-border) hc:hover:border-(color:--item-border-hover)",
      )}
      style={
        {
          backgroundColor: bg.hex,
          color: fg.hex,
          "--item-border": border,
          "--item-border-hover": hoverBorder,
        } as React.CSSProperties
      }
    >
      <ThemeMiniMap theme={preview} bg={bg} />
      <span className="hc:grow">{name}</span>
      {isEdited && <span className="hc:opacity-70">Edited</span>}
      <IconCheck
        size="1em"
        stroke={2.5}
        className={cx("hc:shrink-0", !isSelected && "hc:invisible")}
      />
    </button>
  );
}

/** The `themes` to pick from, and what can be done with the picked one. */
function ThemeList() {
  const { theme, setTheme, themes, name, editedFrom, reset, list } = useThemeConfigurator();
  const isListed = name !== undefined;
  const canRemove = list && isListed && Object.keys(themes).length > 1;
  return (
    <>
      <div className="hc:flex hc:flex-col hc:gap-[.375em] hc:p-2 hc:flex-auto hc:min-h-0 hc:overflow-y-auto hc:overscroll-contain">
        {!isListed && (
          <ThemeOption name={editedFrom ?? "Custom"} theme={theme} isSelected isEdited onSelect={() => {}} />
        )}
        {Object.entries(themes).map(([listedName, listed]) => {
          const isSelected = listedName === name;
          // The edited theme stands in for the one it came from
          if (!isListed && listedName === editedFrom) return null;
          return (
            <ThemeOption
              key={listedName}
              name={listedName}
              theme={listed}
              isSelected={isSelected}
              onSelect={() => !isSelected && setTheme(listed)}
            />
          );
        })}
      </div>
      {/* HSpace gives every child a slot, so hidden actions are left out rather than `false` */}
      <HSpace growEach className="hc:p-2 hc:border-t">
        {[
          <JsonUploadButton key="import" onUpload={(imported, fileName) => (list ? list.add(fileName, imported) : setTheme(imported))}>
            Import
          </JsonUploadButton>,
          !isListed && list && (
            <Button key="save" onClick={list.saveAsNew}>
              Save as New
            </Button>
          ),
          editedFrom !== undefined && (
            <Button key="reset" verify={`Discard your edits and go back to ${editedFrom}?`} onClick={reset}>
              Reset
            </Button>
          ),
          canRemove && (
            <Button key="remove" verify={`Remove ${name}?`} onClick={() => list.remove(name)}>
              Remove
            </Button>
          ),
        ].filter(Boolean)}
      </HSpace>
    </>
  );
}

/** The popover's Themes and Edit Theme tabs. */
function Configurator() {
  const [currentTab, setCurrentTab] = usePersistentState<Tab>("embedded:currentTab", tabEnum.THEMES, asTab);
  return (
    <>
      <Tabs currentTab={currentTab} onTabChange={setCurrentTab} buttonClassName={keyboardFocusOnly} />
      {currentTab === tabEnum.EDIT_THEME ? (
        <div className="hc:flex-auto hc:min-h-0 hc:overflow-y-auto hc:overscroll-contain">
          <EditTheme />
        </div>
      ) : (
        <ThemeList />
      )}
    </>
  );
}

function Picker({
  mode = "contrast",
  side = "bottom",
  align = "end",
  style,
}: Pick<EmbeddedThemeConfiguratorProps, "mode" | "side" | "align" | "style">) {
  const { theme, resolved, background, name = "Custom" } = useThemeConfigurator();
  const [isOpen, setIsOpen] = useState(false);
  useLayoutEffect(injectStyles, []);

  const { root: page, step } = resolved;
  const fg = step(page, 100);
  // In contrast mode the button is its own inverted surface
  const surface = mode === "contrast" ? fg : page;
  const buttonStyle = {
    color: step(surface, 100).hex,
    // Contrast mode's fill shows through a transparent border, so its hover
    // color reaches the edge
    borderColor:
      mode === "outlined" || (mode === "blended" && isOpen) ? fg.hex : "transparent",
    // Other modes don't know the exact surface they sit on, so they tint it
    "--trigger-bg": mode === "contrast" ? surface.hex : "transparent",
    "--trigger-hover":
      mode === "contrast"
        ? step(surface, 6).hex
        : `color-mix(in srgb, ${fg.hex} 8%, transparent)`,
  } as React.CSSProperties;

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      {/* Its own scoped container, so the host page's CSS can't restyle it */}
      <span data-huet-configurator="" style={{ fontSize: "inherit", ...style }}>
        <Popover.Trigger asChild>
          <button
            type="button"
            aria-label={`Theme: ${name}`}
            title={name}
            className={cx(
              "hc:inline-flex hc:items-center hc:gap-[.5em] hc:py-[.375em] hc:pl-[.5em] hc:pr-[.375em]",
              "hc:rounded-md hc:border hc:cursor-pointer",
              keyboardFocusOnly,
              "hc:bg-(--trigger-bg) hc:hover:bg-(--trigger-hover)",
            )}
            style={buttonStyle}
          >
            <ThemeMiniMap theme={resolved} bg={surface} />
            <IconChevronDown
              size="1em"
              stroke={2}
              className={cx(
                "hc:shrink-0 hc:transition-transform hc:duration-150",
                isOpen && "hc:rotate-180",
              )}
            />
          </button>
        </Popover.Trigger>
      </span>
      <ConfiguratorPortal theme={theme} background={background}>
        <Popover.Content
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={8}
          aria-label="Theme Configurator"
          className={cx(
            "huet-bg-0 huet-border-100 hc:border hc:rounded-lg hc:z-[1000] hc:overflow-hidden",
            "hc:font-ui hc:text-[.8125rem] hc:flex hc:flex-col hc:w-[28em]",
            // The same size on both tabs, so switching doesn't move the edges
            "hc:h-[min(40em,var(--radix-popover-content-available-height))]",
            // As the panel's: 16% of the foreground, scaled by the theme's contrast
            "hc:shadow-[0_6px_24px_color-mix(in_srgb,var(--huet-foreground)_calc(16%*var(--huet-configurator-contrast,1)),transparent)]",
          )}
        >
          <Configurator />
        </Popover.Content>
      </ConfiguratorPortal>
    </Popover.Root>
  );
}

/**
 * A compact theme picker to place anywhere on the page. It shows a mini map of
 * the current theme: its colors from highest to lowest contrast, over its gray
 * ramp. Clicking it opens the configurator in a popover: a Themes tab with
 * `themes`, and an Edit Theme tab. It takes the same props as
 * ThemeConfigurator, so the two stay in sync when given the same `value`.
 */
export default function EmbeddedThemeConfigurator({
  mode,
  side,
  align,
  style,
  ...props
}: EmbeddedThemeConfiguratorProps) {
  return (
    <ErrorBoundary componentName="Embedded Theme Configurator">
      <ConfiguratorRoot {...props}>
        <Picker mode={mode} side={side} align={align} style={style} />
      </ConfiguratorRoot>
    </ErrorBoundary>
  );
}
