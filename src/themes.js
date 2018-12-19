/*
  Maybe we can allow the pallet to be generated:
  - Pick min and max lightness
  - Pick base color
*/

const shared = {
  pallet: {
    black: "#000000",
    white: "#ffffff",
    red: "#f73748",
    green: "#3c962a",
    blue: "#3087d6",
    gold: "#c86c00",
    purple: "#a46ad3"
  },
  ramps: {
    gray: {
      isNeutral: true
    },
    white: {
      colors: ["white", "black"],
      classes: [0, 0.7, 1],
      mode: "direct",
      isNeutral: true
    },
    red: {
      colors: ["black", "red", "white"]
    },
    green: {
      colors: ["black", "green", "white"]
    },
    blue: {
      colors: ["black", "blue", "white"]
    },
    gold: {
      colors: ["black", "gold", "white"]
    },
    purple: {
      colors: ["black", "purple", "white"]
    }
  },
  bgScaleValue: 0,
  minColorLightness: 20,
  maxColorLightness: 80,
  contrastMultiplier: 1,
  saturationContrastMultiplier: 1,
  rescaleContrastToGrayRange: true,
  normalizeContrastToContext: true,
  contrastDirection: "zigzag"
};

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
    bgScaleValue: 1
  },
  beige: {
    ...shared,
    name: "Beige",
    pallet: {
      ...shared.pallet,
      black: "#5b4128",
      white: "#fff9f3"
    },
    bgScaleValue: 0
  },
  teal: {
    ...shared,
    name: "Subtle Teal",
    pallet: {
      ...shared.pallet,
      black: "#004a43",
      white: "#9a8e84"
    },
    bgScaleValue: 0,
    minColorLightness: 30,
    maxColorLightness: 60
  }
};

export default themes;
