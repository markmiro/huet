import chroma from "chroma-js";
import { isEqual } from "lodash-es";
import React, { useLayoutEffect, useRef } from "react";
import type { Theme } from "huet";
import { resolveTheme, type ResolvedTheme, type Surface } from "huet/internal";

import { useThemeConfigurator } from "../context";
import { VSpace } from "./AllExceptFirst";
import Arrow from "./Arrow";
import { TextButton } from "./Button";
import { Button } from "./ui/button";
import { IconPlus } from "@tabler/icons-react";
import cx from "./cx";

/*
  Each preview card shows a different theme. Huet classes resolve against the
  panel's own theme, and Huet roots can't nest, so the cards work out their
  colors with the theme's solver and set them inline.
*/

/** The ramps each card previews, as rows of steps. */
const rows = ["gray", "red", "yellow", "green", "blue", "purple"] as const;

function ThemeFrame({
  preview,
  shadowAlpha,
  isSelected,
  children,
  onClick,
}: {
  preview: ResolvedTheme;
  /** The shadow's opacity, which follows the theme's contrast */
  shadowAlpha: number;
  isSelected?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  const { root, step } = preview;
  const className =
    "hc:w-full hc:h-full hc:border hc:rounded-sm hc:relative hc:overflow-hidden";
  const style = {
    backgroundColor: root.hex,
    color: step(root, 100).hex,
    borderColor: step(root, isSelected ? 100 : 12).hex,
    boxShadow: `0 2px 10px ${chroma(step(root, 100).hex).alpha(shadowAlpha).hex()}`,
  };

  return (
    <div className="hc:flex hc:relative hc:basis-[20em] hc:shrink-0">
      {isSelected ? (
        <div className={className} style={style}>
          {children}
          <Arrow
            size=".75em"
            className="hc:absolute hc:bottom-0 hc:left-1/2 hc:-translate-x-1/2"
          />
        </div>
      ) : (
        <button onClick={onClick} className={className} style={style}>
          <div className="hc:h-full">{children}</div>
        </button>
      )}
    </div>
  );
}

// Hard stops paint equal-width swatches without an element for every color.
function swatchGradient(colors: string[]) {
  if (!colors.length) return "none";
  return `linear-gradient(to right, ${colors
    .map((color, i) => `${color} ${(i / colors.length) * 100}% ${((i + 1) / colors.length) * 100}%`)
    .join(", ")})`;
}

/** The theme's own colors: its neutral ramp, then its hues. */
function Swatches({ theme }: { theme: Theme }) {
  const colors = [...theme.neutral, ...Object.values(theme.colors ?? {})];
  return <div aria-hidden="true" className="hc:h-[.5em]" style={{ background: swatchGradient(colors) }} />;
}

function Title({ children }: { children?: React.ReactNode }) {
  return (
    <h3 className="hc:mx-2 hc:py-2 hc:flex hc:items-center hc:justify-between">
      {children}
    </h3>
  );
}

function Shadow({ preview, bg }: { preview: ResolvedTheme; bg: Surface }) {
  return (
    <div
      className="hc:-mt-2 hc:h-2"
      style={{ background: `linear-gradient(${bg.hex}, ${preview.step(bg, 12).hex})` }}
    />
  );
}

function ColorMatrix({ preview, bg }: { preview: ResolvedTheme; bg: Surface }) {
  return rows.map((ramp) => (
    <div
      key={ramp}
      aria-hidden="true"
      className={cx("hc:mt-px", ramp === "gray" ? "hc:h-6" : "hc:h-2")}
      style={{ background: swatchGradient([100, 75, 50, 25].map((amount) => preview.step(bg, amount, ramp).hex)) }}
    />
  ));
}

function Section({ children }: { children?: React.ReactNode }) {
  return (
    <div className="hc:flex">
      <div className="hc:p-2 hc:w-full hc:flex hc:flex-col">{children}</div>
    </div>
  );
}

function ThemePreview({
  name,
  theme,
  isSelected,
  onClick,
}: {
  name: string;
  theme: Theme;
  isSelected: boolean;
  onClick?: () => void;
}) {
  const { background, editedFrom, reset, list, themes } = useThemeConfigurator();
  // Only the edited theme's card has a name that isn't in the list
  const isEdited = onClick === undefined && !(name in themes);
  // The page decides whether its list can change; keep at least one theme
  const canRemove = list && isSelected && !isEdited && Object.keys(themes).length > 1;
  const preview = resolveTheme(theme, { background });
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(
    () => {
      // FIX: scrolls parent and the parent of the parent
      if (isSelected && ref.current) ref.current.scrollIntoView({ block: "center" });
    },
    // Run on mount, but not after that
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return (
    <div ref={ref}>
      <ThemeFrame
        preview={preview}
        shadowAlpha={0.2 * (theme.contrast ?? 1)}
        isSelected={isSelected}
        onClick={onClick}
      >
        <Swatches theme={theme} />
        <Title>
          {name}
          <span className="hc:flex hc:gap-[.75em]">
            {isEdited && list && <TextButton onClick={list.saveAsNew}>Save as new</TextButton>}
            {isEdited && editedFrom !== undefined && (
              <TextButton verify={`Discard your edits and go back to ${editedFrom}?`} onClick={reset}>
                Reset to {editedFrom}
              </TextButton>
            )}
            {canRemove && (
              <TextButton verify={`Remove ${name}?`} onClick={() => list.remove(name)}>
                Remove
              </TextButton>
            )}
          </span>
        </Title>
        <Shadow preview={preview} bg={preview.root} />
        <Section>
          <ColorMatrix preview={preview} bg={preview.root} />
        </Section>
      </ThemeFrame>
    </div>
  );
}

/**
 * The themes passed to the configurator. Picking one replaces the edited
 * theme. An edited theme that matches none of them shows first, as "Custom".
 */
export default function Themes({ onCreate }: { onCreate?: () => void }) {
  const { theme, setTheme, themes, name, list } = useThemeConfigurator();
  const entries = Object.entries(themes);
  return (
    <VSpace size={3} className="hc:p-4">
      {list && (
        <Button
          variant="outline"
          className="hc:w-full hc:border-dashed"
          onClick={() => {
            list.create();
            onCreate?.();
          }}
        >
          <IconPlus size="1em" stroke={2} />
          New theme
        </Button>
      )}
      {name === undefined && <ThemePreview name="Custom" theme={theme} isSelected />}
      {entries.map(([name, listed]) => {
        const isSelected = isEqual(listed, theme);
        return (
          <ThemePreview
            key={name}
            name={name}
            theme={listed}
            isSelected={isSelected}
            onClick={() => setTheme(listed)}
          />
        );
      })}
    </VSpace>
  );
}
