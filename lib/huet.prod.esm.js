import chroma from 'chroma-js';
import _ from 'lodash';
import React, { useContext, useState } from 'react';
import saveAs from 'file-saver';
import styled from 'styled-components/dist/styled-components.cjs';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _taggedTemplateLiteral(strings, raw) {
  if (!raw) {
    raw = strings.slice(0);
  }

  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

/*
  Rationale:
  We want colors to context-dependent. This means there's really no such thing
  as "red" with a specific hex value. Instead, we want to be able to say we want
  a red that *stands out* from the background color by a certain amount. The properties
  of how to make a red stand out, and what "red" really means is defined by the theme.

  In the theme, the "red" would be defined as a "ramp" that specifies the boundaries
  of what's allowed for the color. However, this doesn't mean we'll always pick one of these
  colors. We'll pick a color that's on the plane between the ramp of the color you want and the
  ramp of the parent color.
*/
// ---

var BaseColor =
/*#__PURE__*/
function () {
  function BaseColor(hex) {
    _classCallCheck(this, BaseColor);

    if (!hex) {
      throw new Error("`hex` is required");
    }

    this.hex = hex;
  }

  _createClass(BaseColor, [{
    key: "alpha",
    value: function alpha(a) {
      return chroma(this.hex).alpha(a).hex();
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.hex;
    }
  }]);

  return BaseColor;
}();

var Color =
/*#__PURE__*/
function (_BaseColor) {
  _inherits(Color, _BaseColor);

  function Color(_ref) {
    var _this;

    var theme = _ref.theme,
        _ref$bgColor = _ref.bgColor,
        bgColor = _ref$bgColor === void 0 ? null : _ref$bgColor,
        hex = _ref.hex,
        _ref$ramp = _ref.ramp,
        ramp = _ref$ramp === void 0 ? null : _ref$ramp,
        _ref$baseRamp = _ref.baseRamp,
        baseRamp = _ref$baseRamp === void 0 ? null : _ref$baseRamp;

    _classCallCheck(this, Color);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Color).call(this, hex));

    if (!theme) {
      throw new Error("`theme` is required");
    }

    if (baseRamp && (!"startL" in baseRamp || !"endL" in baseRamp)) {
      throw new Error("`baseRamp` can't be a direct ramp");
    } else if (!baseRamp && !(bgColor && !bgColor.baseRamp) && !theme.ramps.gray) {
      throw new Error("No baseRamp");
    } // TODO: consider making this private so there aren't two ways of getting a theme:
    // 1) From a color
    // 2) From a useContext(ThemeContext)
    // Also consider making `ThemeContext` only available internally to Huet


    _this.theme = theme;
    _this.bgColor = bgColor;
    _this.ramp = ramp;
    _this.baseRamp = baseRamp || bgColor && bgColor.baseRamp || theme.ramps.gray;
    _this.lightness = getLightness(hex);
    return _this;
  } // TODO: consider removing `bgRamp` and `bgRampValue from theme


  _createClass(Color, [{
    key: "contrast",
    value: function contrast() {
      var contrastAmount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;
      var ramp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.baseRamp;

      if (ramp.config.mode === "direct") {
        console.warn('You should be using the "direct" method instead since the "contrast" parameter won\'t do anything here');
        return this.direct(ramp);
      }

      var theme = this.theme;
      var baseRamp = this.bgColor ? this.bgColor.baseRamp : theme.ramps.gray;

      var _this$_getMinMax = this._getMinMax(ramp),
          _this$_getMinMax2 = _slicedToArray(_this$_getMinMax, 2),
          min = _this$_getMinMax2[0],
          max = _this$_getMinMax2[1];

      var _this$_getMinMax3 = this._getMinMax(this.ramp),
          _this$_getMinMax4 = _slicedToArray(_this$_getMinMax3, 2),
          bgMin = _this$_getMinMax4[0],
          bgMax = _this$_getMinMax4[1]; // __0 _.5 __1


      var normalizedLightness = (this.lightness - bgMin) / (bgMax - bgMin); // __1 _.5 __1

      var contrastNormalizer = theme.rescaleContrastToGrayRange || ramp !== baseRamp ? Math.abs(0.5 - normalizedLightness) + 0.5 : 1;
      var contrastRescale = (max - min) / 100;
      var midpoint = (min + max) / 2;
      var direction = this.lightness < midpoint ? 1 : -1;
      var colorContrastMinMax = ramp === baseRamp ? 1 : this.lightness < midpoint ? theme.maxColorLightness / 100 : 1 - theme.minColorLightness / 100;
      var contrastMultiplier = ramp === baseRamp || theme.contrastMultiplier < 1 ? theme.contrastMultiplier : 1;
      var targetLightness = this.lightness + contrastAmount * direction * contrastMultiplier * contrastNormalizer * colorContrastMinMax * contrastRescale; // Rescale targetLightness from ramp range to 0-1

      var scaleValue = (targetLightness - ramp.startL) / (ramp.endL - ramp.startL);
      var hex = ramp(scaleValue).hex;
      /*
      TODO:
      The problem with abContrast is that sometimes the starting differenence between fgAB and bgAB
      is small and sometimes it's large. What we'd like to do is to adjust by just the amount where there is
      a difference. The problem, though is figuring this out what the maxiumum possible AB difference could be
      and normalize to that.
       Most ramps start at the gray dark value, then shoot out to their "perfect" color value before
      coming back into the gray light values.
       The "middle" where there is the most contrast between the "gray" and the colored ramp is based on
      where that "perfect" color is in it's own ramp. It might be 50% between the dark gray and light gray.
      It might be 90% between dark gray and light gray.
       So to figure this out, we'd need to get the scale value of the "perfect" color. This would be our midpoint.
      We'd probably want to calculate this value as part of the startL, endL calculations.
       This also means we'd probably want to limit ramps to just 3 colors unless they're direct ramps. We might even
      want to forget about the concept of ramps altogether too. Or, we'd want to allow a user's theme to range from
      just using ramps directly to being completely "managed". Managed mode will effectively only allow you to set the hues
      you want to use and the min and max lightness of the colors.
       Maybe we can compare the distance between the AB of both fg and bg and compare the L between them too.
      We want to do our fancy math when the difference between the AB stuff is bigger than that of the L value since
      this would mean that the the AB difference is too high for the desired contrast
       We might want to keep the min and max color lightness set to the same value and be the average or mean
      lightness of all "perfect" color lightnesses.
      */

      var _chroma$lab = chroma(this.hex).lab(),
          _chroma$lab2 = _slicedToArray(_chroma$lab, 3),
          bgL = _chroma$lab2[0],
          bgA = _chroma$lab2[1],
          bgB = _chroma$lab2[2];

      var _chroma$lab3 = chroma(hex).lab(),
          _chroma$lab4 = _slicedToArray(_chroma$lab3, 3),
          fgL = _chroma$lab4[0],
          fgA = _chroma$lab4[1],
          fgB = _chroma$lab4[2]; // const abDelta = Math.sqrt(Math.pow(bgA - fgA, 2) + Math.pow(bgB - fgB, 2));
      // const lDelta = Math.abs(bgL - fgL);


      var colorContrastNormalizer = Math.abs(0.5 - normalizedLightness) * 2; // `ab` in abContrast refers to the A and B axes of the LAB color space

      var abContrast = theme.contrastMultiplier < 1 ? theme.contrastMultiplier : (colorContrastNormalizer + contrastAmount) / 100;
      hex = chroma.lab(bgL + (fgL - bgL) * 1, // Read this as just `fgL`
      bgA + (fgA - bgA) * abContrast, bgB + (fgB - bgB) * abContrast).hex();
      return new Color({
        theme: theme,
        bgColor: this,
        hex: hex,
        ramp: ramp
      });
    }
  }, {
    key: "direct",
    value: function direct(ramp) {
      if (ramp.config.mode !== "direct") throw new Error("Not allowed");
      var theme = this.theme,
          baseRamp = this.baseRamp;
      var hex = ramp((this.lightness - baseRamp.startL) / (baseRamp.endL - baseRamp.startL)).hex;
      hex = chroma.mix(this.hex, hex, Math.min(theme.contrastMultiplier, 1), "lab").hex();
      return new Color({
        theme: theme,
        bgColor: this,
        hex: hex,
        ramp: ramp
      });
    }
  }, {
    key: "base",
    value: function base(ramp) {
      return new Color({
        theme: this.theme,
        bgColor: this.bgColor,
        hex: this.hex,
        ramp: this.ramp,
        baseRamp: ramp
      });
    }
  }, {
    key: "alpha",
    value: function alpha(amount) {
      return chroma(this.hex).alpha(amount * this.theme.contrastMultiplier).hex();
    }
  }, {
    key: "_getMinMax",
    value: function _getMinMax(ramp) {
      var baseRamp = this.baseRamp; // We're not requiring a ramp because we want the `contrast` method to work
      // even if the parent Color instance has just a hex and a theme. This allows us to
      // use our ramps on top of any background color.

      if (!ramp || ramp.config.mode === "direct") {
        return [baseRamp.startL, baseRamp.endL];
      }

      if (ramp.config.isNeutral) {
        return [ramp.startL, ramp.endL];
      }

      var min = Math.max(ramp.startL, baseRamp.startL);
      var max = Math.min(ramp.endL, baseRamp.endL);
      return [min, max];
    }
  }], [{
    key: "fromTheme",
    value: function fromTheme(theme) {
      if (!(theme instanceof Theme)) {
        throw new Error('Need to give me a Theme instance, not a "theme config"');
      }

      var ramp = theme.ramps[theme.bgRamp];
      var hex = ramp(theme.bgRampValue).hex;
      return new Color({
        theme: theme,
        bgColor: null,
        hex: hex,
        ramp: ramp,
        baseRamp: ramp
      });
    }
  }]);

  return Color;
}(BaseColor);
function getLightness(color) {
  // Sometimes we get small negative numbers, so we clamp with Math.max
  return Math.max(0, chroma(color).get("lab.l"));
}

var Theme =
/**
 * Creates a theme instance from a themeConfig
 * @param {Object} config
 */
function Theme(config) {
  _classCallCheck(this, Theme);

  this.pallet = config.pallet;
  this.bgRamp = config.bgRamp;
  this.bgRampValue = config.bgRampValue;
  this.minColorLightness = config.minColorLightness;
  this.maxColorLightness = config.maxColorLightness;
  this.contrastMultiplier = config.contrastMultiplier;
  this.saturationContrastMultiplier = config.saturationContrastMultiplier;
  this.rescaleContrastToGrayRange = config.rescaleContrastToGrayRange;

  var ramps = _.mapValues(config.ramps, function (ramp) {
    return createRamp(config, ramp);
  });

  this.ramps = ramps;
}; // ---

function createRamp(themeConfig, rampConfig) {
  var config = _objectSpread({}, defaultRampConfig, rampConfig);

  var hexColors = config.colors.map(function (colorName) {
    return themeConfig.pallet[colorName];
  });
  var scale = chroma.scale(hexColors);
  if (config.colorModel) scale.mode(config.colorModel);
  if (config.classes) scale.classes(config.classes);
  var ramp;

  switch (config.mode) {
    case "direct":
      ramp = createDirectRampWithScale(scale);
      break;

    case "colored":
    default:
      if (config.correctLightness) scale.correctLightness();
      ramp = createRampWithScale(scale);
      break;
  }

  ramp.config = config;
  return ramp;
}

function wrapScaleFunc(scale) {
  return function (n) {
    return new BaseColor(scale(n).hex());
  };
}

function createRampWithScale(scale) {
  var scaleFunc = wrapScaleFunc(scale);
  scaleFunc.startL = getLightness(scale(0));
  scaleFunc.endL = getLightness(scale(1));
  return scaleFunc;
}

function createDirectRampWithScale(scale) {
  return wrapScaleFunc(scale);
}

var defaultRampConfig = {
  colors: ["black", "white"],
  colorModel: "lab",
  // lrgb, lab
  correctLightness: true,
  mode: "colored"
};

var ThemeContext = React.createContext();
var BackgroundContext = React.createContext();

// when also dealing with the option of setting the BackgroundContext via the style or `colors` props

function Bla(_ref) {
  var parentTheme = _ref.parentTheme,
      parentBg = _ref.parentBg,
      _ref$as = _ref.as,
      as = _ref$as === void 0 ? "div" : _ref$as,
      theme = _ref.theme,
      debug = _ref.debug,
      style = _ref.style,
      colors = _ref.colors,
      _ref$base = _ref.base,
      base = _ref$base === void 0 ? "gray" : _ref$base,
      children = _ref.children,
      rest = _objectWithoutProperties(_ref, ["parentTheme", "parentBg", "as", "theme", "debug", "style", "colors", "base", "children"]);

  if (debug) {
    debugger;
  }

  var finalTheme;
  var relativeToColor;

  if (theme) {
    finalTheme = theme;
    relativeToColor = Color.fromTheme(theme);
  } else {
    finalTheme = parentTheme;
    relativeToColor = parentBg;
  }

  if (base) {
    relativeToColor = relativeToColor.base(finalTheme.ramps[base]);
  }

  if (!finalTheme) {
    throw new Error("Need to set a theme before using a Block");
  }

  var returnStyle;

  if (_.isPlainObject(style)) {
    returnStyle = style;
  } else if (_.isFunction(style)) {
    returnStyle = style(relativeToColor);
  } else {
    returnStyle = null;
  }

  if (colors) {
    // TODO: consider making "colors" prop values depend on the value of stuff set in style?
    returnStyle = _objectSpread({}, returnStyle, parseColorsToStyle(relativeToColor, colors, base));
  }

  var props = _objectSpread({
    style: returnStyle
  }, rest); // Wrap children with context


  var returnChildren = children;

  if (theme) {
    returnChildren = children ? React.createElement(ThemeContext.Provider, {
      value: finalTheme
    }, children) : null;
  }

  if (returnStyle && returnStyle.backgroundColor) {
    if (!returnStyle.backgroundColor instanceof Color) {
      throw new Error("Use a Huet Color instance here.");
    }

    returnChildren = children ? React.createElement(BackgroundContext.Provider, {
      value: returnStyle.backgroundColor
    }, returnChildren) : null;
  } else if (theme) {
    if (!children) {
      throw new Error("Add children to the <Block> in order to see something on screen.");
    }

    returnChildren = React.createElement(BackgroundContext.Provider, {
      value: relativeToColor
    }, returnChildren);
  } // Return element with props and children from above


  return React.createElement(as, props, returnChildren);
}

function Block(props) {
  return React.createElement(ThemeContext.Consumer, null, function (parentTheme) {
    return React.createElement(BackgroundContext.Consumer, null, function (parentBg) {
      return React.createElement(Bla, _extends({
        parentTheme: parentTheme,
        parentBg: parentBg
      }, props));
    });
  });
} // ---

var keyToCss = {
  bg: "backgroundColor",
  fg: "color",
  b: "borderColor",
  o: "outlineColor"
};

function parseColorsToStyle(relativeToColor, str, base) {
  var theme = relativeToColor.theme;
  var things = str.split(" ");
  var returnStyle = {};
  var colors = {
    parent: relativeToColor
  };
  things.forEach(function (thing) {
    // thing: 'bg/fg:10-red'
    // key: 'bg' value: '10-red'
    var _thing$split = thing.split(":"),
        _thing$split2 = _slicedToArray(_thing$split, 2),
        key = _thing$split2[0],
        value = _thing$split2[1]; // contrast: '10' rampKey: 'red'


    var _ref2 = function () {
      // 10-red || 10 || red
      var _value$split = value.split("-"),
          _value$split2 = _slicedToArray(_value$split, 2),
          first = _value$split2[0],
          second = _value$split2[1];

      if (first && second) {
        return [parseInt(first, 10), second];
      } // TODO: verify that a zero (0) should get ignored here


      var firstAsInt = parseInt(first, 10);

      if (Number.isInteger(firstAsInt)) {
        return [firstAsInt];
      } else {
        return [, first];
      }
    }(),
        _ref3 = _slicedToArray(_ref2, 2),
        contrast = _ref3[0],
        _ref3$ = _ref3[1],
        rampKey = _ref3$ === void 0 ? base : _ref3$; // keys: ['bg', 'fg']


    var keys = key.split("/"); // parentKey: 'bg' childKey: 'fg'

    var _ref4 = keys.length > 1 ? keys : ["parent", keys[0]],
        _ref5 = _slicedToArray(_ref4, 2),
        parentKey = _ref5[0],
        childKey = _ref5[1];

    if (parentKey === "fg") {
      throw new Error("Can't use \"fg\" as the parent as in \"fg/bg:100\". This limitation exists to prevent accidental mistakes assuming you meant \"bg/fg:100\". However, if you think you have a legitimate use case, please create an issue on Github.");
    }

    var parentColor = colors[parentKey];
    var ramp = theme.ramps[rampKey];
    var color;

    if (ramp.config.mode === "direct") {
      color = parentColor.direct(ramp);
    } else {
      color = parentColor.contrast(contrast, ramp);
    }

    colors[childKey] = color;
    returnStyle[keyToCss[childKey]] = color;
  });
  return returnStyle;
}

var Contrast = function Contrast(props) {
  var _as$bg$border$outline = _objectSpread({
    as: "div",
    bg: null,
    border: null,
    outline: null
  }, props),
      as = _as$bg$border$outline.as,
      bg = _as$bg$border$outline.bg,
      bgRamp = _as$bg$border$outline.bgRamp,
      text = _as$bg$border$outline.text,
      textRamp = _as$bg$border$outline.textRamp,
      border = _as$bg$border$outline.border,
      borderRamp = _as$bg$border$outline.borderRamp,
      outline = _as$bg$border$outline.outline,
      outlineRamp = _as$bg$border$outline.outlineRamp,
      children = _as$bg$border$outline.children,
      style = _as$bg$border$outline.style,
      debug = _as$bg$border$outline.debug,
      rest = _objectWithoutProperties(_as$bg$border$outline, ["as", "bg", "bgRamp", "text", "textRamp", "border", "borderRamp", "outline", "outlineRamp", "children", "style", "debug"]);

  if (debug) {
    debugger;
  }

  var theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error("Need to set a theme before using a Contrast component");
  }

  var parentBg = useContext(BackgroundContext) || Color.fromTheme(theme);

  function contrast(parentColor, contrastAmount, rampKey) {
    var ramp = rampKey ? theme.ramps[rampKey] : theme.ramps.gray;

    if (ramp.config.mode === "direct") {
      return parentColor.direct(ramp);
    } else {
      return parentColor.contrast(contrastAmount, ramp);
    }
  } // ---


  var finalChildren = children;
  var backgroundColor = null;
  var textColor = null;

  if (bg !== null) {
    backgroundColor = contrast(parentBg, bg, bgRamp);
    textColor = contrast(backgroundColor, text, textRamp);
    finalChildren = children ? React.createElement(BackgroundContext.Provider, {
      value: backgroundColor
    }, children) : null;
  } else {
    textColor = contrast(parentBg, text, textRamp);
  }

  var coloredStyle = {
    backgroundColor: backgroundColor,
    color: textColor,
    borderColor: border !== null ? contrast(parentBg, border, borderRamp) : null,
    outlineColor: outline !== null ? contrast(parentBg, outline, outlineRamp) : null
  };

  var returnProps = _objectSpread({
    style: _objectSpread({}, coloredStyle, style)
  }, rest);

  return React.createElement(as, returnProps, finalChildren);
};

var Range = function Range(_ref) {
  var label = _ref.label,
      _ref$min = _ref.min,
      min = _ref$min === void 0 ? 0 : _ref$min,
      _ref$max = _ref.max,
      max = _ref$max === void 0 ? 100 : _ref$max,
      _ref$decimals = _ref.decimals,
      decimals = _ref$decimals === void 0 ? 0 : _ref$decimals,
      value = _ref.value,
      _onChange = _ref.onChange,
      _ref$className = _ref.className,
      className = _ref$className === void 0 ? "" : _ref$className,
      style = _ref.style,
      _ref$hideInput = _ref.hideInput,
      hideInput = _ref$hideInput === void 0 ? false : _ref$hideInput;
  var step = 1 / Math.pow(10, decimals);
  var parentBg = useContext(BackgroundContext);
  var rangeBg = parentBg.contrast(10);
  return React.createElement("div", {
    className: "flex flex-column max-input ".concat(className),
    style: {
      style: style
    }
  }, label && React.createElement(Contrast, {
    text: 100,
    className: "mb1 flex justify-between"
  }, label, React.createElement(Contrast, {
    className: "di",
    text: 30
  }, "(", min.toFixed(decimals), "-", max.toFixed(decimals), ")")), React.createElement("div", {
    className: "flex items-center"
  }, !hideInput && React.createElement(Contrast, {
    bg: 10,
    text: 50,
    as: "input",
    type: "number",
    className: "mr1",
    style: {
      width: "5em",
      fontSize: "inherit"
    },
    value: value.toFixed(decimals),
    step: step,
    onChange: function onChange(e) {
      return _onChange(parseFloat(e.target.value));
    }
  }), React.createElement("input", {
    type: "range",
    className: "self-stretch",
    style: {
      backgroundColor: rangeBg,
      color: rangeBg.contrast(100)
    },
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: function onChange(e) {
      return _onChange && _onChange(parseFloat(e.target.value));
    }
  })));
};

var Select = function Select(_ref) {
  var value = _ref.value,
      _onChange = _ref.onChange,
      label = _ref.label,
      children = _ref.children,
      className = _ref.className;
  var selectedChild = children && React.Children.toArray(children).find(function (child) {
    return child.props.value === value;
  });
  var text = selectedChild ? selectedChild.props.children : "None";
  var finalValue = selectedChild ? value : "";
  return React.createElement("div", {
    className: className
  }, React.createElement(Contrast, {
    className: "db mb1"
  }, label), React.createElement(Contrast, {
    bg: 10,
    text: 50,
    className: "relative dib w-100 flex justify-between input"
  }, React.createElement("select", {
    value: finalValue,
    className: "o-0 absolute w-100 h-100 top-0 left-0",
    onChange: function onChange(e) {
      return _onChange && _onChange(e.target.value);
    }
  }, children, !selectedChild && React.createElement("option", {
    value: ""
  }, "None")), text, React.createElement("div", {
    className: "ml2"
  }, "\u25BF")));
};

function ButtonGroup(_ref) {
  var children = _ref.children,
      className = _ref.className,
      style = _ref.style;
  var items = React.Children.map(children, function (child, i) {
    var isFirst = i === 0;
    return React.createElement("div", {
      className: "".concat(isFirst ? "" : "ml1")
    }, child);
  });
  return React.createElement("div", {
    className: "flex ".concat(className),
    style: _objectSpread({
      marginRight: 1
    }, style)
  }, items);
}
function Button(_ref2) {
  var className = _ref2.className,
      style = _ref2.style,
      children = _ref2.children,
      isActive = _ref2.isActive,
      verify = _ref2.verify,
      _onClick = _ref2.onClick,
      rest = _objectWithoutProperties(_ref2, ["className", "style", "children", "isActive", "verify", "onClick"]);

  return React.createElement(Contrast, _extends({
    as: "button",
    bgRamp: isActive ? "blue" : "gray",
    bg: 10,
    text: 50,
    onClick: function onClick(e) {
      if (verify) {
        var didAccept = window.confirm(verify === true ? "Are you sure?" : verify);
        if (!didAccept) return;
      }

      _onClick && _onClick(e);
    }
  }, rest, {
    className: "flex justify-center ".concat(className),
    style: style
  }), children);
}

var Checkbox = function Checkbox(_ref) {
  var label = _ref.label,
      isChecked = _ref.isChecked,
      _onChange = _ref.onChange,
      style = _ref.style,
      className = _ref.className,
      contrast = _ref.contrast;
  return React.createElement(Contrast, {
    as: "label",
    style: style,
    className: "inline-flex items-center ".concat(className),
    text: contrast
  }, React.createElement("input", {
    type: "checkbox",
    checked: isChecked,
    onChange: function onChange(e) {
      return _onChange && _onChange(e.target.checked);
    }
  }), React.createElement("span", {
    className: "mr1",
    style: {
      fontSize: "1.25em"
    }
  }, isChecked ? "☒" : "☐"), label);
};

function _templateObject2() {
  var data = _taggedTemplateLiteral(["\n  --size: 1em;\n  background-color: ", ";\n  outline-width: 1px;\n  outline-offset: -2px;\n  outline-style: solid;\n  width: var(--size);\n  height: var(--size);\n  top: 50%;\n  left: ", ";\n  transform: translateY(-50%);\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  position: absolute;\n  height: 100%;\n  top: 0;\n  left: ", "%;\n  width: ", "%;\n  background-color: ", ";\n  opacity: 0.5;\n\n  &:hover {\n    opacity: 0;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}
var ScreenElement = styled.div(_templateObject(), function (_ref2) {
  var from = _ref2.from;
  return from;
}, function (_ref3) {
  var to = _ref3.to;
  return to;
}, function (_ref4) {
  var color = _ref4.color;
  return color;
});
var RampColorMarkerElement = styled.div(_templateObject2(), function (_ref6) {
  var color = _ref6.color;
  return color || "transparent";
}, function (_ref7) {
  var color = _ref7.color,
      grayRamp = _ref7.grayRamp;
  var l = (getLightness(color) - grayRamp.startL) / (grayRamp.endL - grayRamp.startL);
  return "calc(".concat(l * 100, "% - (var(--size)) * ").concat(l, ")");
});

function RampColorMarker(_ref8) {
  var color = _ref8.color,
      grayRamp = _ref8.grayRamp;
  return React.createElement(Block, {
    as: RampColorMarkerElement,
    color: color,
    grayRamp: grayRamp,
    style: function style(parentBg) {
      return {
        borderColor: parentBg.contrast(0).alpha(0.3),
        outlineColor: parentBg.contrast(100).alpha(0.3)
      };
    },
    className: "absolute ba w1"
  });
}

function duplicate(n) {
  return [n, n];
}

function pairs(ramp) {
  var classes = ramp.config.classes;
  var classesArr = Array.isArray(classes) ? classes : [].concat(_toConsumableArray(_.range(0, 1, 1 / classes)), [1]);

  var first = _.first(classesArr);

  var last = _.last(classesArr);

  var middle = _.initial(_.tail(classesArr));

  return _.chunk([first].concat(_toConsumableArray(_.flatMap(middle, duplicate)), [last]), 2);
}

function InnerRamp(_ref10) {
  var ramp = _ref10.ramp;
  if (!ramp) return null;
  var type = ramp.config.classes ? "classes" : "normal";

  switch (type) {
    case "classes":
      return React.createElement("div", {
        className: "h-100 w-100 flex"
      }, pairs(ramp).map(function (_ref11, i) {
        var _ref12 = _slicedToArray(_ref11, 2),
            first = _ref12[0],
            second = _ref12[1];

        return React.createElement("div", {
          key: i,
          className: "h-100",
          style: {
            backgroundColor: ramp((first + second) / 2),
            width: "".concat((second - first) * 100, "%")
          }
        });
      }));

    case "normal":
    default:
      return React.createElement("div", {
        className: "h-100 w-100",
        style: {
          background: "linear-gradient(to right, ".concat(_.range(0, 1.2, 0.2).map(function (i) {
            return ramp(i);
          }).join(","), ")")
        }
      });
  }
}

var ColorRamp = function ColorRamp(_ref13) {
  var ramp = _ref13.ramp,
      theme = _ref13.theme;
  return React.createElement("div", {
    className: "flex w-100 flex-row h1 mb2",
    style: {
      marginLeft: "".concat(ramp.startL, "%"),
      width: "".concat(ramp.endL - ramp.startL, "%")
    }
  }, React.createElement("div", {
    className: "w-100 relative flex"
  }, React.createElement(InnerRamp, {
    ramp: ramp
  }), ramp.config.colors.map(function (color, i) {
    return React.createElement(RampColorMarker, {
      key: i,
      color: theme.pallet[color],
      grayRamp: theme.ramps.gray
    });
  })));
};

function _templateObject$1() {
  var data = _taggedTemplateLiteral(["\n  background-color: ", ";\n  padding: 0;\n"]);

  _templateObject$1 = function _templateObject() {
    return data;
  };

  return data;
}
var ColorPickerElement = styled.input(_templateObject$1(), function (_ref) {
  var color = _ref.color;
  return color || "transparent";
});

function ColorPicker(_ref2) {
  var color = _ref2.color,
      _onChange = _ref2.onChange;
  return React.createElement(ColorPickerElement, {
    type: "color",
    value: color,
    color: color,
    onChange: function onChange(e) {
      return _onChange(e.target.value);
    },
    className: "w-100 h1"
  });
}

function Pallet(_ref3) {
  var colors = _ref3.colors,
      onColorsChange = _ref3.onColorsChange;
  return React.createElement(Block, {
    className: "flex ba",
    colors: "b:20"
  }, _.map(colors, function (color, key) {
    return React.createElement(ColorPicker, {
      key: key,
      color: color,
      onChange: function onChange(c) {
        return onColorsChange(_objectSpread({}, colors, _defineProperty({}, key, c)));
      }
    });
  }));
}

function getReact() {
  return React;
}
function Themer(_ref) {
  var themeConfigs = _ref.themeConfigs,
      themeConfig = _ref.themeConfig,
      onChangeThemeConfig = _ref.onChangeThemeConfig;

  var _useState = useState(false),
      _useState2 = _slicedToArray(_useState, 2),
      isExpanded = _useState2[0],
      setIsExpanded = _useState2[1];

  var _useState3 = useState(false),
      _useState4 = _slicedToArray(_useState3, 2),
      shouldThemeSelf = _useState4[0],
      setShouldThemeSelf = _useState4[1];

  var theme = new Theme(themeConfig);

  function modify(key) {
    return function (newValue) {
      onChangeThemeConfig(_objectSpread({}, themeConfig, _defineProperty({
        rescaleContrastToGrayRange: themeConfig.rescaleContrastToGrayRange
      }, key, newValue)));
    };
  }

  var setBgRampValue = modify("bgRampValue");
  var setContrastMultiplier = modify("contrastMultiplier");
  var setSaturationContrastMultiplier = modify("saturationContrastMultiplier");
  var setPallet = modify("pallet");
  var setMinColorLightness = modify("minColorLightness");
  var setMaxColorLightness = modify("maxColorLightness");
  var setRescaleContrastToGrayRange = modify("rescaleContrastToGrayRange"); // TODO: find a better way?

  var themeKey = Object.keys(themeConfigs).find(function (themeKey) {
    return themeConfigs[themeKey].name === themeConfig.name;
  });
  var isThemeModified = themeConfig !== themeConfigs[themeKey];

  function setThemeKey(themeKey) {
    onChangeThemeConfig(themeConfigs[themeKey]); // setRamps(theme.ramps);
    // // setBgRampValue(theme.bgRampValue);
    // // setContrastMultiplier(theme.contrastMultiplier);
    // // setSaturationContrastMultiplier(theme.saturationContrastMultiplier);
    // setMinColorLightness(theme.minColorLightness);
    // setMaxColorLightness(theme.maxColorLightness);
  }

  function exportTheme() {
    var str = JSON.stringify(themeConfig, null, "  ");
    var blob = new Blob([str], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, themeConfigs[themeKey].name + "Huet Theme.json");
  }

  function importTheme() {}

  function resetTheme() {
    onChangeThemeConfig(themeConfigs[themeKey]);
  }

  var themerTheme = new Theme(shouldThemeSelf ? _objectSpread({}, themeConfig, {
    isPicking: false
  }) : _objectSpread({}, themeConfigs.basic, {
    bgRampValue: 1
  }));
  return React.createElement(ThemeContext.Provider, {
    value: themerTheme
  }, React.createElement(Contrast, {
    className: "Themer f7 flex flex-column",
    outline: 20,
    bg: 0,
    style: {
      outlineWidth: 1,
      outlineStyle: "solid",
      boxShadow: "0 5px 30px ".concat(themerTheme.ramps.gray(0)),
      position: "fixed",
      bottom: 0,
      right: 0,
      maxHeight: isExpanded ? "100vh" : "20vh",
      zIndex: 9999999,
      width: "30em"
    }
  }, React.createElement(Contrast, {
    bg: 100,
    className: "db flex justify-between",
    style: {
      flexShrink: 0,
      userSelect: "none"
    },
    onClick: function onClick() {
      return setIsExpanded(function (v) {
        return !v;
      });
    }
  }, React.createElement("div", {
    className: "pv2 ph2 b"
  }, "Huet Themer (alpha)"), React.createElement(Contrast, {
    bg: 20,
    className: "flex justify-center items-center ph3 b"
  }, isExpanded ? "↓" : "↑")), React.createElement("div", {
    className: "overflow-y-scroll overflow-x-hidden"
  }, React.createElement(Contrast, {
    bg: 10,
    className: "pa2"
  }, React.createElement("div", {
    className: "flex justify-end items-end flex-wrap"
  }, React.createElement(Select, {
    label: "Theme",
    value: themeKey,
    onChange: setThemeKey,
    className: "flex-auto"
  }, Object.keys(themeConfigs).map(function (key) {
    return React.createElement("option", {
      key: key,
      value: key
    }, themeConfigs[key].name);
  })), React.createElement(ButtonGroup, {
    className: "mt1 ml1"
  }, isThemeModified && React.createElement(Button, {
    onClick: resetTheme
  }, "Reset"), React.createElement(Button, {
    onClick: exportTheme
  }, "Export"), React.createElement(Button, {
    onClick: importTheme
  }, "Import"))), React.createElement(Contrast, {
    border: 20,
    className: "bb mv2"
  }), React.createElement(Range, {
    label: "Page background lightness",
    min: 0,
    max: 1,
    decimals: 2,
    value: themeConfig.bgRampValue,
    onChange: setBgRampValue
  })), React.createElement("div", {
    className: "pa2"
  }, React.createElement("div", {
    className: "mb1"
  }, "Pallet"), React.createElement(Pallet, {
    colors: themeConfig.pallet,
    onColorsChange: setPallet
  }), React.createElement("div", {
    className: "mt2 mb1"
  }, "Color ramps"), React.createElement("div", {
    className: "flex flex-wrap mt1"
  }, React.createElement("div", {
    className: "w-100"
  }, React.createElement(Contrast, {
    border: 10,
    className: "w-100",
    style: {
      height: "4px",
      marginBottom: 6,
      background: "linear-gradient(to right, black, white)"
    }
  }), Object.keys(theme.ramps).map(function (key) {
    return React.createElement(ColorRamp, {
      key: key,
      ramp: theme.ramps[key],
      theme: theme
    });
  })), React.createElement(Contrast, {
    className: "w-100",
    border: 20
  }, React.createElement(Range, {
    label: "Dark color min lightness",
    min: 0,
    max: 100,
    value: themeConfig.minColorLightness,
    onChange: setMinColorLightness,
    className: "mt2"
  }), React.createElement(Range, {
    label: "Light color max lightness",
    min: 0,
    max: 100,
    value: themeConfig.maxColorLightness,
    onChange: setMaxColorLightness,
    className: "mt2"
  }), React.createElement(Range, {
    label: "Lightness contrast multiplier",
    min: 0,
    max: 2,
    decimals: 2,
    value: themeConfig.contrastMultiplier,
    onChange: setContrastMultiplier,
    className: "mt2"
  }), React.createElement(Range, {
    label: "Saturation multiplier",
    min: 0,
    max: 2,
    decimals: 2,
    value: themeConfig.saturationContrastMultiplier,
    onChange: setSaturationContrastMultiplier,
    className: "mt2"
  }), React.createElement(Checkbox, {
    label: "Rescale gray contrast to gray range",
    isChecked: themeConfig.rescaleContrastToGrayRange,
    onChange: setRescaleContrastToGrayRange,
    className: "mt2"
  })))), React.createElement(Contrast, {
    className: "bt pa2 flex justify-between",
    border: 10
  }, React.createElement(Checkbox, {
    label: "Theme the themer",
    isChecked: shouldThemeSelf,
    onChange: setShouldThemeSelf
  })))));
}

var bla = "bla2";

export { bla, Theme, Color, getLightness, ThemeContext, BackgroundContext, Block, Contrast, Themer, getReact };
