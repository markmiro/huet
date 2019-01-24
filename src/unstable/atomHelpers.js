/**
 * Creates atoms
 * EX:
 * make('f', 'fontSize', [0, '1rem', '2rem'])
 * // returns { f0: { fontSize: 0 }, f1: { fontSize: '1rem' }, ... }
 * @param {String} atomPrefix Usually a single letter or a couple letters
 * @param {String|Array} cssPropertyOrProperties CSS property or properties that you
 * want to map the atom prefix to
 * @param {Array} scale The scale that has the values we'll be using for each generated atom
 */
export function make(atomPrefix, cssPropertyOrProperties, scale) {
  let atoms = {};

  if (Array.isArray(cssPropertyOrProperties)) {
    const properties = val => {
      let style = {};
      const cssProperties = cssPropertyOrProperties;
      cssProperties.forEach(cssProperty => {
        style[cssProperty] = val;
      });
      return style;
    };
    scale.forEach((val, i) => {
      atoms[atomPrefix + i] = properties(val);
    });
  } else {
    const cssProperty = cssPropertyOrProperties;
    scale.forEach((val, i) => {
      atoms[atomPrefix + i] = { [cssProperty]: val };
    });
  }

  return atoms;
}

/**
 * See `make`. The only difference is we generate atoms
 * for setting different combinations of sides.
 * @param {String} atomPrefix
 * @param {String} cssProperty
 * @param {Array} scale
 */
export function makeSides(atomPrefix, cssProperty, scale) {
  // Used to create CSS properties like `marginTop`
  const directionsMap = {
    t: ["Top"],
    r: ["Right"],
    b: ["Bottom"],
    l: ["Left"],
    v: ["Top", "Bottom"],
    h: ["Left", "Right"],
    a: ["Top", "Right", "Bottom", "Left"]
  };

  let atoms = {};
  Object.keys(directionsMap).forEach(dirKey => {
    return Object.assign(
      atoms,
      make(
        atomPrefix + dirKey,
        directionsMap[dirKey].map(suffix => cssProperty + suffix),
        scale
      )
    );
  });
  return atoms;
}

/**
 * Take an object of KV pairs and then allow picking which V's get
 * included by specifying a chain of K's.
 * EX:
 * const obj = {
 *   a: { A: 'A', extra: 'balbla' },
 *   b: { B: 'B' },
 *   c: { C: 'C' },
 *   ...
 * }
 * const chained = chain(obj).c.a.t;
 * // returns { C: 'C', A: 'A', extra: 'blabla',  T: 'T' }
 * @param {*} obj
 */
export function chainable(obj) {
  // Adopted from: https://github.com/streamich/nano-css/blob/aedbc419eb7f62a72dbf01f3420951e570aee8b9/addon/snake.js
  let chained = {};
  Object.keys(obj).map(key =>
    Object.defineProperty(chained, key, {
      get() {
        let thing = Object.keys(this).length ? this : Object.create(this);
        Object.assign(thing, obj[key]);
        return thing;
      }
    })
  );
  return chained;
}
