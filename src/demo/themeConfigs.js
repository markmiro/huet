import shared from "../private/baseThemeConfig.js";

const themes = {
  basic: {
    ...shared,
    name: "Basic"
  },
  tintedBlue: {
    ...shared,
    name: "Tinted Blue",
    pallet: {
      ...shared.pallet,
      black: "#414753"
    }
  },
  crazy: {
    ...shared,
    name: "RGB / CMYK Boundaries",
    pallet: {
      ...shared.pallet,
      red: "#ff0000",
      green: "#00ff00",
      blue: "#0000ff",
      cyan: "#00ffff",
      gold: "#ffff00",
      purple: "#ff00ff"
    }
  },
  youtube: {
    ...shared,
    name: "YouTube",
    pallet: {
      ...shared.pallet,
      black: "#121212",
      red: "#ff0000",
      lightRed: "#ff9999",
      lightBlue: "#73b0ff",
      blue: "#065fd4",
      darkBlue: "#104892"
    },
    ramps: {
      ...shared.ramps,
      red: {
        colors: ["red", "lightRed", "red"],
        mode: "direct"
      },
      blue: {
        colors: ["darkBlue", "blue", "lightBlue"]
      }
    },
    bgRampValue: 1
  },
  beige: {
    ...shared,
    name: "Beige",
    pallet: {
      ...shared.pallet,
      black: "#5b4128",
      white: "#fff9f3"
    },
    bgRampValue: 0
  },
  teal: {
    ...shared,
    name: "Subtle Teal",
    pallet: {
      ...shared.pallet,
      black: "#004a43",
      white: "#9a8e84"
    },
    bgRampValue: 0,
    minColorLightness: 30,
    maxColorLightness: 60
  }
};

export default themes;
