import type { Theme } from "./theme";

/**
 * Huet's preset themes, by name. Each one renders on any background, so
 * there's no separate dark variant: pass `background: 0` for dark mode.
 */
export const themes = {
  "Base": {
    neutral: ["#000000", "#ffffff"],
    colorModel: "lab",
    colors: { red: "#d14457", yellow: "#9d6f00", green: "#298830", blue: "#0082dc", purple: "#a359b9" },
  },
  "Radioactive": {
    neutral: ["#69707f", "#c1ff00"],
    colorModel: "lab",
    colors: { red: "#ff88a4", yellow: "#b1bd2d", green: "#59c866", blue: "#83beff", purple: "#d2a8ff" },
    signalLightness: { onLight: 0.46, onDark: 0.61 },
  },
  "Blueprint": {
    neutral: ["#384cd2", "#ffffff"],
    colorModel: "lrgb",
    colors: { red: "#ff0030", yellow: "#988753", green: "#009700", blue: "#00a3ff", purple: "#af60ff" },
    signalLightness: { onLight: 0.26, onDark: 0.47 },
  },
  "Terminal": {
    neutral: ["#0d171d", "#7fff8b"],
    colorModel: "lab",
    colors: { red: "#f54f75", yellow: "#b1bd2d", green: "#13a624", blue: "#558cff", purple: "#d75eff" },
    signalLightness: { onLight: 0.5, onDark: 0.63 },
  },
  "Paperback": {
    neutral: ["#3d3531", "#e2c1b1"],
    colorModel: "lab",
    colors: { red: "#e13639", yellow: "#c89455", green: "#238e5d", blue: "#366caa", purple: "#8e65bf" },
    signalLightness: { onLight: 0.36, onDark: 0.55 },
  },
  "Deep Dive": {
    neutral: ["#001b4f", "#b6e8e8"],
    colorModel: "lab",
    colors: { red: "#ff6669", yellow: "#a09c5c", green: "#319647", blue: "#496eff", purple: "#af5bff" },
    signalLightness: { onLight: 0.44, onDark: 0.63 },
  },
  "Royal Purple": {
    neutral: ["#37233b", "#f0c9e7"],
    colorModel: "lab",
    colors: { red: "#e13639", yellow: "#bd7f33", green: "#00878e", blue: "#3865da", purple: "#7630c8" },
    signalLightness: { onLight: 0.5, onDark: 0.5 },
  },
  "Orange Boost": {
    neutral: ["#474b56", "#ff7c49"],
    colorModel: "lab",
    colors: { red: "#e32850", yellow: "#af7000", green: "#00974c", blue: "#2292cb", purple: "#d961d6" },
    signalLightness: { onLight: 0.27, onDark: 0.76 },
  },
  "Faded Future": {
    neutral: ["#3c3d43", "#b2bdff"],
    colorModel: "lab",
    colors: { red: "#ff3200", yellow: "#987a1d", green: "#459700", blue: "#0073ff", purple: "#aa5dff" },
    signalLightness: { onLight: 0.36, onDark: 0.72 },
  },
  "A Box of Macaroni": {
    neutral: ["#0d0086", "#ffc900"],
    colorModel: "lab",
    colors: { red: "#ff0034", yellow: "#8a6420", green: "#26b047", blue: "#6599ff", purple: "#d400ff" },
    contrast: 1.5,
    signalLightness: { onLight: 0.6, onDark: 0.6 },
  },
  "Sunset": {
    neutral: ["#242744", "#ffe173"],
    colorModel: "hcl",
    colors: { red: "#f20031", yellow: "#c16000", green: "#008d29", blue: "#12889d", purple: "#b555c8" },
    signalLightness: { onLight: 0.42, onDark: 0.58 },
  },
  "Astro": {
    neutral: ["#040816", "#ffb980", "#ffffff"],
    colorModel: "hcl",
    colors: { red: "#cb1c00", yellow: "#bd8f5a", green: "#02b984", blue: "#4f81a7", purple: "#b982d5" },
    signalLightness: { onLight: 0.42, onDark: 0.58 },
  },
} satisfies Record<string, Theme>;
