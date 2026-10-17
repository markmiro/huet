export type AtomStyle = Record<string, string | number>;

// `flex` is both a CSS property and an atom name, so this bag cannot extend
// CSSProperties or the atom getters collapse into CSS value types.
export type ChainableAtoms = {
  [key: string]: any;
};

/**
 * Creates atoms
 * EX:
 * make('f', 'fontSize', [0, '1rem', '2rem'])
 * // returns { f0: { fontSize: 0 }, f1: { fontSize: '1rem' }, ... }
 */
export function make(
  atomPrefix: string,
  cssPropertyOrProperties: string | string[],
  scale: ReadonlyArray<string | number>
): Record<string, AtomStyle> {
  const atoms: Record<string, AtomStyle> = {};

  if (Array.isArray(cssPropertyOrProperties)) {
    const properties = (val: string | number): AtomStyle => {
      const style: AtomStyle = {};
      for (const cssProperty of cssPropertyOrProperties) {
        style[cssProperty] = val;
      }
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
 */
export function makeSides(
  atomPrefix: string,
  cssProperty: string,
  scale: ReadonlyArray<string | number>
) {
  const directionsMap: Record<string, string[]> = {
    t: ["Top"],
    r: ["Right"],
    b: ["Bottom"],
    l: ["Left"],
    v: ["Top", "Bottom"],
    h: ["Left", "Right"],
    a: ["Top", "Right", "Bottom", "Left"],
  };

  const atoms: Record<string, AtomStyle> = {};
  for (const dirKey of Object.keys(directionsMap)) {
    Object.assign(
      atoms,
      make(
        atomPrefix + dirKey,
        directionsMap[dirKey].map((suffix) => cssProperty + suffix),
        scale
      )
    );
  }
  return atoms;
}

/**
 * Take an object of KV pairs and then allow picking which V's get
 * included by specifying a chain of K's.
 */
export function chainable(obj: Record<string, AtomStyle>): ChainableAtoms {
  const chained: ChainableAtoms = {};
  for (const key of Object.keys(obj)) {
    Object.defineProperty(chained, key, {
      get(this: AtomStyle) {
        const thing: AtomStyle =
          Object.keys(this).length > 0 ? this : Object.create(this);
        Object.assign(thing, obj[key]);
        return thing;
      },
    });
  }
  return chained;
}
