import { createTheme, defaultTheme, type Theme } from "../src/index.ts";

/** The legacy demo themes, translated to the new format. */
export const themes: Record<string, Theme> = {
  Base: defaultTheme,
  "Base Inverted": createTheme({ bg: 0 }),
  "Mid Gray": createTheme({ bg: 0.5 }),
  Radioactive: createTheme({
    dark: "#69707f",
    light: "#c1ff00",
    bg: 0,
    hues: { red: "#ff88a4", yellow: "#b1bd2d", green: "#59c866", blue: "#83beff", purple: "#d2a8ff" },
  }),
  Blueprint: createTheme({
    dark: "#384cd2",
    light: "#ffffff",
    bg: 0,
    hues: { red: "#ff0030", yellow: "#988753", green: "#009700", blue: "#00a3ff", purple: "#af60ff" },
  }),
  Terminal: createTheme({
    dark: "#0d171d",
    light: "#7fff8b",
    bg: 0,
    hues: { red: "#f54f75", yellow: "#b1bd2d", green: "#13a624", blue: "#558cff", purple: "#d75eff" },
  }),
  Paperback: createTheme({
    dark: "#3d3531",
    light: "#e2c1b1",
    bg: 1,
    hues: { red: "#e13639", yellow: "#c89455", green: "#238e5d", blue: "#366caa", purple: "#8e65bf" },
  }),
  "Deep Dive": createTheme({
    dark: "#001b4f",
    light: "#b6e8e8",
    bg: 0,
    hues: { red: "#ff6669", yellow: "#a09c5c", green: "#319647", blue: "#496eff", purple: "#af5bff" },
  }),
  "Royal Purple": createTheme({
    dark: "#37233b",
    light: "#f0c9e7",
    bg: 0,
    hues: { red: "#e13639", yellow: "#bd7f33", green: "#00878e", blue: "#3865da", purple: "#7630c8" },
  }),
  "Orange Boost": createTheme({
    dark: "#474b56",
    light: "#ff7c49",
    bg: 0,
    hues: { red: "#e32850", yellow: "#af7000", green: "#00974c", blue: "#2292cb", purple: "#d961d6" },
  }),
  "Faded Future": createTheme({
    dark: "#3c3d43",
    light: "#b2bdff",
    bg: 0,
    hues: { red: "#ff3200", yellow: "#987a1d", green: "#459700", blue: "#0073ff", purple: "#aa5dff" },
  }),
  "A Box of Macaroni": createTheme({
    dark: "#0d0086",
    light: "#ffc900",
    bg: 1,
    contrast: 1.5,
    hues: { red: "#ff0034", yellow: "#8a6420", green: "#26b047", blue: "#6599ff", purple: "#d400ff" },
  }),
  Sunset: createTheme({
    dark: "#242744",
    light: "#ffe173",
    bg: 0,
    hues: { red: "#f20031", yellow: "#c16000", green: "#008d29", blue: "#12889d", purple: "#b555c8" },
  }),
};
