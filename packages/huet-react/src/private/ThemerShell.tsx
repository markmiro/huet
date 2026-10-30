import React, { useEffect, useState } from "react";

import cx from "./cx";
import HuetLogo from "./HuetLogo";
import usePersistentState, { asBoolean, useIsSaving } from "./persistentState";

function BrowserStateActivity() {
  const isSaving = useIsSaving();
  return (
    <span
      className={cx(
        "huet-bg-green-25 huet-bg/text-green-100 hc:inline hc:rounded-lg hc:px-2 hc:font-normal",
        "hc:transition-opacity hc:duration-400 hc:ease-[ease]",
        isSaving ? "hc:opacity-0" : "hc:opacity-100",
      )}
    >
      Saved
    </span>
  );
}

function TitleBar({
  isExpanded,
  onClick,
}: {
  isExpanded?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-expanded={isExpanded}
      title={isExpanded ? "Collapse" : "Expand"}
      className="huet-bg-100 hc:w-full hc:flex hc:justify-between hc:shrink-0 hc:select-none"
    >
      <span className="hc:py-2 hc:px-2 hc:font-bold hc:flex hc:items-center hc:gap-1.5">
        <HuetLogo className="hc:size-[1.25em] hc:shrink-0" />
        Huet Theme Configurator {isExpanded && <BrowserStateActivity />}
      </span>
      {/* Docked at the bottom: collapse down into the corner, expand up out of it */}
      <span className="huet-bg-25 hc:flex hc:justify-center hc:items-center hc:px-4 hc:font-bold">
        {isExpanded ? "↓" : "↑"}
      </span>
    </button>
  );
}

// Docked 1em (12px) from the viewport's bottom-right corner. The 1px outline
// is the parent's 25% contrast. The shadow is 12.5% of the foreground, scaled
// by the theme's contrast like the old `Color.alpha()`.
const panelClass = cx(
  "huet-outline-25 hc:fixed hc:right-[1em] hc:bottom-[1em] hc:z-[999]",
  "hc:font-ui hc:text-[.75rem] hc:outline",
  "hc:transition-[opacity,translate,height] hc:duration-200 hc:ease-[ease-out]",
);
const shadow = {
  // Has a background, so its own foreground is set
  expanded:
    "hc:shadow-[0_5px_30px_color-mix(in_srgb,var(--huet-foreground)_calc(12.5%*var(--huet-configurator-contrast,1)),transparent)]",
  // No background: `huet-text-100` sets the same color as --huet-relative-text
  collapsed:
    "hc:shadow-[0_5px_30px_color-mix(in_srgb,var(--huet-relative-text)_calc(12.5%*var(--huet-configurator-contrast,1)),transparent)]",
};

export default function ThemerShell({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = usePersistentState(
    "themer:isExpanded",
    true,
    asBoolean
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isExpanded) {
    return (
      <div className={cx(panelClass, "huet-text-100", shadow.collapsed)}>
        <TitleBar onClick={() => setIsExpanded((value) => !value)} />
      </div>
    );
  }

  return (
    <div
      className={cx(
        panelClass,
        "huet-bg-0",
        shadow.expanded,
        // Fixed so the panel doesn't jump when switching tabs; tab content scrolls
        "hc:flex hc:flex-col hc:h-[min(64em,100vh-2em)]",
        isMounted ? "hc:translate-y-0 hc:opacity-100" : "hc:translate-y-[2em] hc:opacity-0",
      )}
    >
      <TitleBar isExpanded onClick={() => setIsExpanded((value) => !value)} />
      {children}
    </div>
  );
}
