/*
  Maybe we can allow the pallet to be generated:
  - Pick min and max lightness
  - Pick base color
*/

export default {
  name: "Default",
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
  bgRamp: "gray",
  bgRampValue: 1,
  minColorLightness: 45,
  maxColorLightness: 65,
  contrastMultiplier: 1,
  saturationContrastMultiplier: 1,
  rescaleContrastToGrayRange: true
};
