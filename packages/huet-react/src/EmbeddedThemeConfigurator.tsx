import * as Popover from "@radix-ui/react-popover";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import React, { useLayoutEffect, useState } from "react";
import { baseThemeConfig, Color, Theme, type ThemeConfig } from "huet/config";

import { useThemeConfigurator } from "./context";
import { ConfiguratorRoot, type ThemeConfiguratorProps } from "./ThemeConfigurator";
import { HSpace } from "./private/AllExceptFirst";
import Button, { JsonUploadButton } from "./private/Button";
import ConfiguratorPortal, { injectStyles } from "./private/ConfiguratorPortal";
import EditTheme from "./private/EditTheme";
import Tabs, { asTab, tabEnum, type Tab } from "./private/Tabs";
import ThemeMiniMap from "./private/ThemeMiniMap";
import { useSavedThemes } from "./private/Themes";
import cx from "./private/cx";
import usePersistentState from "./private/persistentState";

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
  its colors come from the legacy Color API and are set inline. Hover colors
  can't be inline, so they go through variables.
*/
function ThemeOption({
  config,
  isSelected,
  isModified,
  onSelect,
}: {
  config: ThemeConfig;
  isSelected: boolean;
  isModified: boolean;
  onSelect: () => void;
}) {
  const bg = Color.fromTheme(new Theme(config));
  const fg = bg.contrast(100);
  // A subtle edge keeps the list calm; only the selected theme gets a strong one
  const border = isSelected ? fg.hex : bg.contrast(15).hex;
  const hoverBorder = isSelected ? fg.hex : bg.contrast(40).hex;

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
      <ThemeMiniMap bg={bg} />
      <span className="hc:grow">{config.name}</span>
      {isModified && <span className="hc:opacity-70">Edited</span>}
      <IconCheck
        size="1em"
        stroke={2.5}
        className={cx("hc:shrink-0", !isSelected && "hc:invisible")}
      />
    </button>
  );
}

// Mounts each time the popover opens, so themes saved elsewhere show up
function ThemeList() {
  const themes = useSavedThemes();
  const { selected, saved, isModified } = themes;
  const isRemovable = saved !== undefined && saved.id !== baseThemeConfig.id;
  return (
    <>
      <div className="hc:flex hc:flex-col hc:gap-[.375em] hc:p-2 hc:flex-auto hc:min-h-0 hc:overflow-y-auto hc:overscroll-contain">
        {themes.configs.map((config) => {
          const isSelected = config.id === selected.id;
          return (
            <ThemeOption
              key={config.id}
              // Show unsaved edits to the current theme
              config={isSelected ? selected : config}
              isSelected={isSelected}
              isModified={isSelected && isModified}
              // Reselecting would discard those edits
              onSelect={() => !isSelected && themes.select(config)}
            />
          );
        })}
      </div>
      {/* HSpace gives every child a slot, so hidden actions are left out rather than `false` */}
      <HSpace growEach className="hc:p-2 hc:border-t">
        {[
          <JsonUploadButton key="import" onUpload={themes.importTheme}>
            Import
          </JsonUploadButton>,
          (isModified || !saved) && (
            <Button key="save" onClick={themes.saveAsNew}>
              Save as New
            </Button>
          ),
          isModified && (
            <Button key="reset" verify onClick={themes.reset}>
              Reset
            </Button>
          ),
          !isModified && isRemovable && (
            <Button key="remove" verify onClick={() => themes.remove(saved)}>
              Remove
            </Button>
          ),
        ].filter(Boolean)}
      </HSpace>
    </>
  );
}

function Configurator() {
  const [theme, setConfig] = useThemeConfigurator();
  const [currentTab, setCurrentTab] = usePersistentState<Tab>(
    "embedded:currentTab",
    tabEnum.THEMES,
    asTab,
  );
  return (
    <>
      <Tabs
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        buttonClassName={keyboardFocusOnly}
      />
      {currentTab === tabEnum.EDIT_THEME ? (
        <div className="hc:flex-auto hc:min-h-0 hc:overflow-y-auto hc:overscroll-contain">
          <EditTheme theme={theme} themerTheme={theme} onThemeConfigChange={setConfig} />
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
}: EmbeddedThemeConfiguratorProps) {
  const [theme] = useThemeConfigurator();
  const [isOpen, setIsOpen] = useState(false);
  useLayoutEffect(injectStyles, []);

  const page = Color.fromTheme(theme);
  const fg = page.contrast(100);
  // In contrast mode the button is its own inverted surface
  const surface = mode === "contrast" ? fg : page;
  const buttonStyle = {
    color: surface.contrast(100).hex,
    // Contrast mode's fill shows through a transparent border, so its hover
    // color reaches the edge
    borderColor:
      mode === "outlined" || (mode === "blended" && isOpen) ? fg.hex : "transparent",
    // Other modes don't know the exact surface they sit on, so they tint it
    "--trigger-bg": mode === "contrast" ? surface.hex : "transparent",
    "--trigger-hover":
      mode === "contrast"
        ? surface.contrast(6).hex
        : `color-mix(in srgb, ${fg.hex} 8%, transparent)`,
  } as React.CSSProperties;

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      {/* Its own scoped container, so the host page's CSS can't restyle it */}
      <span data-huet-configurator="" style={{ fontSize: "inherit", ...style }}>
        <Popover.Trigger asChild>
          <button
            type="button"
            aria-label={`Theme: ${theme.name}`}
            title={theme.name}
            className={cx(
              "hc:inline-flex hc:items-center hc:gap-[.5em] hc:py-[.375em] hc:pl-[.5em] hc:pr-[.375em]",
              "hc:rounded-md hc:border hc:cursor-pointer",
              keyboardFocusOnly,
              "hc:bg-(--trigger-bg) hc:hover:bg-(--trigger-hover)",
            )}
            style={buttonStyle}
          >
            <ThemeMiniMap bg={surface} />
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
      <ConfiguratorPortal themeConfig={theme.config}>
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
 * ramp. Clicking it opens the configurator in a popover: a Themes tab with the
 * saved themes, and an Edit Theme tab. It shares saved themes with
 * ThemeConfigurator, so the two stay in sync on one page.
 */
export default function EmbeddedThemeConfigurator({
  mode,
  side,
  align,
  style,
  ...props
}: EmbeddedThemeConfiguratorProps) {
  return (
    <ConfiguratorRoot componentName="Embedded Theme Configurator" {...props}>
      <Picker mode={mode} side={side} align={align} style={style} />
    </ConfiguratorRoot>
  );
}
