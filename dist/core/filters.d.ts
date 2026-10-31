import { Transform } from './recolor';
/** Whether a computed `filter` value changes colors, rather than only blurring, shadowing, or fading. */
export declare const changesColor: (filter: string) => boolean;
/**
 * Split a computed CSS `filter` value into its color functions (`grayscale()`,
 * `sepia()`, `saturate()`, `hue-rotate()`, `invert()`, `brightness()`, and
 * `contrast()`), as one transform of sRGB channels (0–1), and the rest
 * (`blur()`, `drop-shadow()`, `opacity()`, and `url()` references), which
 * don't recolor what's painted and can stay on the element. `apply` is null
 * when there are no color functions.
 */
export declare function colorFilter(filter: string): {
    apply: Transform | null;
    rest: string;
};
/** One element's computed filter, as the page sets it, with any override lifted. */
export declare function pageFilter(el: Element): string;
/**
 * The color filters that paint over `media`: its own and its ancestors', in
 * the order they apply. An ancestor's filter can only be folded in when the
 * ancestor is recolored media itself (`isMedia`) or wraps nothing else, since
 * lifting it would also change whatever else it paints. Those that can't are
 * in `stuck`.
 */
export declare function filtersOver(media: Element, isMedia: (el: Element) => boolean): {
    folded: {
        el: Element;
        filter: string;
    }[];
    stuck: {
        el: Element;
        filter: string;
    }[];
    key: string;
};
/**
 * Replace an element's filter with what's left once its color functions are
 * folded into recoloring, until every holder lets go.
 */
export declare function liftFilter(el: Element, holder: object, filter: string): void;
/** Let go of an element's filter, putting the page's back when no one else holds it. */
export declare function dropFilter(el: Element, holder: object): void;
/** Describe an element for an error message: its tag, id, and classes. */
export declare function describe(el: Element): string;
/**
 * Raise an error for a color filter that Huet can't fold in, once per pair of
 * media and filtered ancestor, without stopping the rest of the recoloring.
 */
export declare function reportStuck(reported: WeakMap<Element, Set<Element>>, media: Element, stuck: {
    el: Element;
    filter: string;
}[]): void;
