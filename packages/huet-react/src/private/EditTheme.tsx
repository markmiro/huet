import React, { useState } from "react";
import { checkTheme, colorModels, type ColorModel, type RecolorSettings, type Theme } from "huet";

import { useThemeConfigurator } from "../context";
import BackgroundSlider from "./BackgroundSlider";
import BaseColors from "./BaseColors";
import cx from "./cx";
import Hues from "./Hues";
import PageColors from "./PageColors";
import ThemeHeader from "./ThemeHeader";
import { Button } from "./ui/button";
import { NumberField } from "./ui/number-field";
import { SettingsPopover } from "./ui/popover";
import { Select } from "./ui/select";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";

// What the badge and "Reset to defaults" treat as normal. Most presets blend in
// lab; the library's own default, for themes that leave it out, is oklab.
const usualColorModel: ColorModel = "lab";
const defaultSignalLightness = { onLight: 0.49, onDark: 0.49 };

function Section({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="huet-border-10 hc:flex hc:flex-col hc:gap-[.75em] hc:px-[1.25em] hc:py-[1em] hc:border-t">
      <div className="hc:flex hc:items-center hc:justify-between hc:min-h-[1.875em]">
        <h3 className="hc:font-semibold">{title}</h3>
        <div className="hc:flex hc:items-center hc:gap-[.25em]">{actions}</div>
      </div>
      {children}
    </section>
  );
}

/** A labeled slider with a number field beside it, for a 0–1 setting shown as a percentage. */
function PercentSetting({
  label,
  value,
  onChange,
  max = 1,
  allowOverMax,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  /** Lets typed values go over `max`, shown in red */
  allowOverMax?: boolean;
}) {
  const isOver = value > max + 1e-9;
  return (
    <div className="hc:flex hc:flex-col hc:gap-[.25em]">
      <span className={cx(isOver && "huet-text-red-100")}>{label}</span>
      <div className="hc:flex hc:items-center hc:gap-[.75em]">
        <Slider
          label={label}
          min={0}
          max={max * 100}
          value={Math.min(value, max) * 100}
          onValueChange={(percent) => onChange(percent / 100)}
          invalid={isOver}
        />
        <NumberField
          label={label}
          min={0}
          max={max * 100}
          suffix="%"
          value={Math.round(value * 100)}
          onValueChange={(percent) => onChange(Math.max(0, percent) / 100)}
          allowOutOfRange={allowOverMax}
          invalid={isOver}
        />
      </div>
    </div>
  );
}

/**
 * How the neutral ramp blends, and the theme's contrast. Both are easy to get
 * wrong, so they're tucked away, with a dot when either isn't the default.
 * Contrast goes up to 100% here; a theme already above that shows in red.
 */
function BaseColorSettings({ theme, edit }: { theme: Theme; edit: (changes: Partial<Theme>) => void }) {
  const colorModel = theme.colorModel ?? "oklab";
  const contrast = theme.contrast ?? 1;
  const changed = Number(colorModel !== usualColorModel) + Number(contrast !== 1);
  return (
    <SettingsPopover label="Blending and contrast" title="Blending and contrast" changed={changed}>
      <div className="hc:flex hc:flex-col hc:gap-[.25em]">
        <span>Blend base colors in</span>
        <Select
          label="Blend base colors in"
          value={colorModel}
          onValueChange={(colorModel) => edit({ colorModel })}
          options={colorModels}
          describe={(option) => (option === usualColorModel ? "recommended" : undefined)}
        />
      </div>
      <PercentSetting
        label="Contrast"
        value={contrast}
        onChange={(next) => edit({ contrast: next === 1 ? undefined : next })}
        allowOverMax
      />
      {contrast > 1 && (
        <p className="huet-text-red-100 hc:text-[.875em]">
          Above 100%, contrast amounts reach full strength sooner, which can look harsh.
        </p>
      )}
      {changed > 0 && (
        <Button variant="outline" size="sm" onClick={() => edit({ colorModel: usualColorModel, contrast: undefined })}>
          Reset to defaults
        </Button>
      )}
    </SettingsPopover>
  );
}

function SignalSettings({ theme, edit }: { theme: Theme; edit: (changes: Partial<Theme>) => void }) {
  const signal = theme.signalLightness ?? defaultSignalLightness;
  // No badge: nearly every preset sets its own
  return (
    <SettingsPopover label="Signal lightness" title="Signal lightness">
      <p className="huet-text-60 hc:text-[.875em]">
        Where classes such as huet-text-red-100 land on each hue’s dark → hue → light ramp.
      </p>
      <PercentSetting
        label="On light backgrounds"
        value={signal.onLight}
        onChange={(onLight) => edit({ signalLightness: { ...signal, onLight } })}
      />
      <PercentSetting
        label="On dark backgrounds"
        value={signal.onDark}
        onChange={(onDark) => edit({ signalLightness: { ...signal, onDark } })}
      />
    </SettingsPopover>
  );
}

/** A switch for theming images or SVGs, with tint and strength behind "⋯". Off is strength 0. */
function Recoloring({
  label,
  value,
  onChange,
}: {
  label: string;
  value: RecolorSettings | undefined;
  onChange: (settings: RecolorSettings) => void;
}) {
  const settings = { strength: 1, tint: 1, ...value };
  const isOn = settings.strength > 0;
  const changed = Number(settings.tint !== 1) + Number(isOn && settings.strength !== 1);
  return (
    <Switch
      label={label}
      checked={isOn}
      onCheckedChange={(on) => onChange({ ...settings, strength: on ? 1 : 0 })}
    >
      {isOn && (
        <SettingsPopover label={`${label} settings`} title={label} changed={changed}>
          <PercentSetting label="Tint" value={settings.tint} onChange={(tint) => onChange({ ...settings, tint })} />
          <PercentSetting
            label="Strength"
            value={settings.strength}
            onChange={(strength) => onChange({ ...settings, strength })}
          />
        </SettingsPopover>
      )}
    </Switch>
  );
}

/** Edits every part of the theme, and the page's background when the page allows it. */
export default function EditTheme() {
  const { theme, setTheme, background, setBackground, pageColors } = useThemeConfigurator();
  const edit = (changes: Partial<Theme>) => {
    const next = { ...theme, ...changes };
    // Settings back at their defaults are left out, so the theme still matches its preset
    for (const key of Object.keys(changes) as (keyof Theme)[]) if (next[key] === undefined) delete next[key];
    setTheme(next);
  };
  // The base colors last refused for running backwards. The message stays
  // until the theme's base colors change, by a valid pick or another theme.
  const [refusedOn, setRefusedOn] = useState<readonly string[]>();
  const editNeutral = (neutral: string[]) => {
    try {
      checkTheme({ ...theme, neutral });
    } catch {
      // A lightest color darker than the darkest has no ramp. Keep the last
      // valid theme, so the page and the panel keep rendering.
      setRefusedOn(theme.neutral);
      return;
    }
    setRefusedOn(undefined);
    edit({ neutral });
  };

  return (
    <div className="hc:flex hc:flex-col hc:pb-[.5em]">
      <ThemeHeader />
      {setBackground && (
        <Section
          title="Background"
          actions={<span className="huet-text-60 hc:tabular-nums">{Math.round(background * 100)}%</span>}
        >
          <BackgroundSlider theme={theme} background={background} onChange={setBackground} />
        </Section>
      )}
      <Section title="Base colors" actions={<BaseColorSettings theme={theme} edit={edit} />}>
        <BaseColors colors={theme.neutral} colorModel={theme.colorModel} onChange={editNeutral} />
        {refusedOn === theme.neutral && (
          <p role="alert" className="huet-text-red-100">
            The lightest color has to be lighter than the darkest.
          </p>
        )}
      </Section>
      <Section title="Hues" actions={<SignalSettings theme={theme} edit={edit} />}>
        <Hues theme={theme} onChange={(colors) => edit({ colors })} />
      </Section>
      {Object.keys(pageColors).length > 0 && (
        <Section title="Page colors">
          <PageColors />
        </Section>
      )}
      <Section title="Images">
        <div className="hc:flex hc:flex-col hc:gap-[.25em]">
          <Recoloring label="Theme images" value={theme.images} onChange={(images) => edit({ images })} />
          <Recoloring label="Theme SVGs" value={theme.svgs} onChange={(svgs) => edit({ svgs })} />
        </div>
      </Section>
    </div>
  );
}
