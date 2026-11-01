import { isEqual as e } from "lodash-es";
import t, { createContext as n, useCallback as r, useContext as i, useEffect as a, useLayoutEffect as o, useMemo as s, useReducer as c, useRef as l, useState as u, useSyncExternalStore as d } from "react";
import { checkTheme as f, colorModels as p, hues as m, mountTheme as h, themes as g } from "huet";
import { resolveTheme as _ } from "huet/internal";
import { createPortal as v } from "react-dom";
import { Fragment as y, jsx as b, jsxs as x } from "react/jsx-runtime";
import { Slider as S } from "@base-ui/react/slider";
import C from "chroma-js";
import { IconCheck as w, IconChevronDown as ee, IconCopyPlus as te, IconDots as ne, IconDownload as re, IconMinus as ie, IconPencil as ae, IconPlus as T, IconRestore as oe, IconSelector as se, IconTrash as ce, IconUpload as le, IconX as ue } from "@tabler/icons-react";
import { NumberField as E } from "@base-ui/react/number-field";
import de from "file-saver";
import { Menu as D } from "@base-ui/react/menu";
import { Popover as O } from "@base-ui/react/popover";
import { Select as k } from "@base-ui/react/select";
import { Switch as fe } from "@base-ui/react/switch";
import { Tabs as A } from "@base-ui/react/tabs";
// src/context.ts
var pe = t.createContext(null);
function j() {
	let e = i(pe);
	if (!e) throw Error("Only available inside ThemeConfigurator");
	return e;
}
// src/configurator.css?inline
var me = "/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */\n@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-translate-x:0;--tw-translate-y:0;--tw-translate-z:0;--tw-border-style:solid;--tw-leading:initial;--tw-font-weight:initial;--tw-ordinal:initial;--tw-slashed-zero:initial;--tw-numeric-figure:initial;--tw-numeric-spacing:initial;--tw-numeric-fraction:initial;--tw-shadow:0 0 #0000;--tw-shadow-color:initial;--tw-shadow-alpha:100%;--tw-inset-shadow:0 0 #0000;--tw-inset-shadow-color:initial;--tw-inset-shadow-alpha:100%;--tw-ring-color:initial;--tw-ring-shadow:0 0 #0000;--tw-inset-ring-color:initial;--tw-inset-ring-shadow:0 0 #0000;--tw-ring-inset:initial;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-offset-shadow:0 0 #0000;--tw-outline-style:solid;--tw-duration:initial;--tw-ease:initial}}}:root,:host{--hc-font-mono:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;--hc-spacing:.25rem;--hc-font-weight-normal:400;--hc-font-weight-medium:500;--hc-font-weight-semibold:600;--hc-font-weight-bold:700;--hc-leading-tight:1.25;--hc-radius-xs:.125rem;--hc-radius-sm:.25rem;--hc-radius-md:.375rem;--hc-radius-lg:.5rem;--hc-ease-out:cubic-bezier(0, 0, .2, 1);--hc-default-transition-duration:.15s;--hc-default-transition-timing-function:cubic-bezier(.4, 0, .2, 1);--hc-font-ui:-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Roboto\", \"Oxygen\", \"Ubuntu\", \"Cantarell\", \"Fira Sans\", \"Droid Sans\", \"Helvetica Neue\", sans-serif}[data-huet-configurator]{all:initial}[data-huet-configurator] :where(:not(svg,svg *)){all:unset;box-sizing:border-box;display:block}[data-huet-configurator][data-huet-root]{background-color:var(--huet-background);color:var(--huet-foreground);scrollbar-color:var(--huet-border) transparent}[data-huet-configurator][data-huet-color-bg],[data-huet-configurator] [data-huet-color-bg]{background-color:var(--huet-background);color:var(--huet-foreground)}[data-huet-configurator][data-huet-color-text],[data-huet-configurator] [data-huet-color-text]{color:var(--huet-relative-text,var(--huet-foreground))}[data-huet-configurator][data-huet-color-border],[data-huet-configurator] [data-huet-color-border]{border-color:var(--huet-relative-border)}[data-huet-configurator][data-huet-color-outline],[data-huet-configurator] [data-huet-color-outline]{outline-color:var(--huet-relative-outline)}@media (forced-colors:active){[data-huet-configurator][data-huet-root],[data-huet-configurator][data-huet-color-bg],[data-huet-configurator] [data-huet-color-bg]{color:canvastext;background-color:canvas}[data-huet-configurator][data-huet-color-text],[data-huet-configurator] [data-huet-color-text]{color:canvastext}[data-huet-configurator][data-huet-color-border],[data-huet-configurator] [data-huet-color-border]{border-color:buttonborder}[data-huet-configurator][data-huet-color-outline],[data-huet-configurator] [data-huet-color-outline]{outline-color:highlight}}[data-huet-configurator] :focus-visible:not([role=menu],[role=dialog],[role=listbox]){z-index:1;box-shadow:0 0 0 2px #00f5,0 0 0 2px #fff5!important}[data-huet-configurator] [data-focus-within]:has(:focus-visible){z-index:1;box-shadow:0 0 0 2px #00f5,0 0 0 2px #fff5!important}.hc\\:pointer-events-none{pointer-events:none}.hc\\:invisible{visibility:hidden}.hc\\:absolute{position:absolute}.hc\\:fixed{position:fixed}.hc\\:relative{position:relative}.hc\\:top-0{top:0}.hc\\:top-\\[\\.125em\\]{top:.125em}.hc\\:right-\\[\\.125em\\]{right:.125em}.hc\\:right-\\[1em\\]{right:1em}.hc\\:bottom-0{bottom:0}.hc\\:bottom-\\[1em\\]{bottom:1em}.hc\\:left-0{left:0}.hc\\:left-1\\/2{left:50%}.hc\\:-z-1{z-index:calc(1 * -1)}.hc\\:z-0{z-index:0}.hc\\:z-\\[999\\]{z-index:999}.hc\\:z-\\[1000\\]{z-index:1000}.hc\\:z-\\[1010\\]{z-index:1010}.hc\\:col-span-3{grid-column:span 3/span 3}.hc\\:-mx-1{margin-inline:calc(var(--hc-spacing) * -1)}.hc\\:mx-2{margin-inline:calc(var(--hc-spacing) * 2)}.hc\\:mx-\\[\\.25em\\]{margin-inline:.25em}.hc\\:my-1{margin-block:var(--hc-spacing)}.hc\\:-mt-2{margin-top:calc(var(--hc-spacing) * -2)}.hc\\:mt-1{margin-top:var(--hc-spacing)}.hc\\:mt-2{margin-top:calc(var(--hc-spacing) * 2)}.hc\\:mt-4{margin-top:calc(var(--hc-spacing) * 4)}.hc\\:mt-\\[\\.875em\\]{margin-top:.875em}.hc\\:mt-px{margin-top:1px}.hc\\:-ml-\\[\\.375em\\]{margin-left:-.375em}.hc\\:ml-1{margin-left:var(--hc-spacing)}.hc\\:ml-2{margin-left:calc(var(--hc-spacing) * 2)}.hc\\:ml-4{margin-left:calc(var(--hc-spacing) * 4)}.hc\\:block{display:block}.hc\\:flex{display:flex}.hc\\:grid{display:grid}.hc\\:inline{display:inline}.hc\\:inline-block{display:inline-block}.hc\\:inline-flex{display:inline-flex}.hc\\:size-\\[\\.5em\\]{width:.5em;height:.5em}.hc\\:size-\\[\\.625em\\]{width:.625em;height:.625em}.hc\\:size-\\[\\.875em\\]{width:.875em;height:.875em}.hc\\:size-\\[1\\.5em\\]{width:1.5em;height:1.5em}.hc\\:size-\\[1\\.25em\\]{width:1.25em;height:1.25em}.hc\\:size-\\[1\\.125em\\]{width:1.125em;height:1.125em}.hc\\:size-\\[1\\.875em\\]{width:1.875em;height:1.875em}.hc\\:size-\\[2\\.25em\\]{width:2.25em;height:2.25em}.hc\\:h-\\(--active-tab-height\\){height:var(--active-tab-height)}.hc\\:h-0{height:0}.hc\\:h-2{height:calc(var(--hc-spacing) * 2)}.hc\\:h-6{height:calc(var(--hc-spacing) * 6)}.hc\\:h-\\[\\.5em\\]{height:.5em}.hc\\:h-\\[\\.375em\\]{height:.375em}.hc\\:h-\\[\\.875em\\]{height:.875em}.hc\\:h-\\[1\\.5em\\]{height:1.5em}.hc\\:h-\\[1\\.25em\\]{height:1.25em}.hc\\:h-\\[1\\.875em\\]{height:1.875em}.hc\\:h-\\[2\\.25em\\]{height:2.25em}.hc\\:h-\\[2em\\]{height:2em}.hc\\:h-\\[3\\.25em\\]{height:3.25em}.hc\\:h-\\[11em\\]{height:11em}.hc\\:h-\\[min\\(52em\\,var\\(--available-height\\)\\)\\]{height:min(52em, var(--available-height))}.hc\\:h-\\[min\\(64em\\,100vh-2em\\)\\]{height:min(64em,100vh - 2em)}.hc\\:h-full{height:100%}.hc\\:h-px{height:1px}.hc\\:max-h-\\(--available-height\\){max-height:var(--available-height)}.hc\\:min-h-0{min-height:0}.hc\\:min-h-\\[1\\.875em\\]{min-height:1.875em}.hc\\:min-h-\\[2\\.25em\\]{min-height:2.25em}.hc\\:w-\\(--active-tab-width\\){width:var(--active-tab-width)}.hc\\:w-0{width:0}.hc\\:w-\\[1\\.625em\\]{width:1.625em}.hc\\:w-\\[1em\\]{width:1em}.hc\\:w-\\[2\\.25em\\]{width:2.25em}.hc\\:w-\\[3em\\]{width:3em}.hc\\:w-\\[6\\.5em\\]{width:6.5em}.hc\\:w-\\[19em\\]{width:19em}.hc\\:w-\\[30em\\]{width:30em}.hc\\:w-full{width:100%}.hc\\:max-w-\\(--available-width\\){max-width:var(--available-width)}.hc\\:max-w-\\[30em\\]{max-width:30em}.hc\\:min-w-\\(--anchor-width\\){min-width:var(--anchor-width)}.hc\\:min-w-0{min-width:0}.hc\\:min-w-\\[1\\.5em\\]{min-width:1.5em}.hc\\:min-w-\\[12em\\]{min-width:12em}.hc\\:flex-auto{flex:auto}.hc\\:shrink-0{flex-shrink:0}.hc\\:grow{flex-grow:1}.hc\\:basis-0{flex-basis:0}.hc\\:basis-\\[20em\\]{flex-basis:20em}.hc\\:-translate-x-1\\/2{--tw-translate-x:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-x-\\(--active-tab-left\\){--tw-translate-x:var(--active-tab-left);translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-x-\\[1em\\]{--tw-translate-x:1em;translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-y-\\(--active-tab-top\\){--tw-translate-y:var(--active-tab-top);translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-y-0{--tw-translate-y:0px;translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-y-1\\/2{--tw-translate-y:calc(1 / 2 * 100%);translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-y-\\[2em\\]{--tw-translate-y:2em;translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:rotate-180{rotate:180deg}.hc\\:cursor-crosshair{cursor:crosshair}.hc\\:cursor-default{cursor:default}.hc\\:cursor-grab{cursor:grab}.hc\\:cursor-pointer{cursor:pointer}.hc\\:cursor-text{cursor:text}.hc\\:touch-none{touch-action:none}.hc\\:grid-cols-\\[5\\.5em_1fr_auto\\]{grid-template-columns:5.5em 1fr auto}.hc\\:flex-col{flex-direction:column}.hc\\:flex-row{flex-direction:row}.hc\\:flex-wrap{flex-wrap:wrap}.hc\\:items-center{align-items:center}.hc\\:items-start{align-items:flex-start}.hc\\:justify-between{justify-content:space-between}.hc\\:justify-center{justify-content:center}.hc\\:gap-1\\.5{gap:calc(var(--hc-spacing) * 1.5)}.hc\\:gap-\\[\\.5em\\]{gap:.5em}.hc\\:gap-\\[\\.25em\\]{gap:.25em}.hc\\:gap-\\[\\.75em\\]{gap:.75em}.hc\\:gap-\\[\\.375em\\]{gap:.375em}.hc\\:gap-\\[\\.625em\\]{gap:.625em}.hc\\:gap-\\[\\.875em\\]{gap:.875em}.hc\\:gap-x-\\[\\.75em\\]{column-gap:.75em}.hc\\:gap-y-\\[\\.5em\\]{row-gap:.5em}.hc\\:truncate{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.hc\\:overflow-hidden{overflow:hidden}.hc\\:overflow-x-hidden{overflow-x:hidden}.hc\\:overflow-y-auto{overflow-y:auto}.hc\\:overflow-y-scroll{overflow-y:scroll}.hc\\:overscroll-contain{overscroll-behavior:contain}.hc\\:rounded-full{border-radius:2147483647px}.hc\\:rounded-lg{border-radius:var(--hc-radius-lg)}.hc\\:rounded-md{border-radius:var(--hc-radius-md)}.hc\\:rounded-sm{border-radius:var(--hc-radius-sm)}.hc\\:rounded-xs{border-radius:var(--hc-radius-xs)}.hc\\:rounded-t-lg{border-top-left-radius:var(--hc-radius-lg);border-top-right-radius:var(--hc-radius-lg)}.hc\\:rounded-tl-lg{border-top-left-radius:var(--hc-radius-lg)}.hc\\:rounded-tr-lg{border-top-right-radius:var(--hc-radius-lg)}.hc\\:rounded-b-lg{border-bottom-right-radius:var(--hc-radius-lg);border-bottom-left-radius:var(--hc-radius-lg)}.hc\\:border{border-style:var(--tw-border-style);border-width:1px}.hc\\:border-x-\\[\\.5em\\]{border-inline-style:var(--tw-border-style);border-inline-width:.5em}.hc\\:border-x-\\[\\.75em\\]{border-inline-style:var(--tw-border-style);border-inline-width:.75em}.hc\\:border-t{border-top-style:var(--tw-border-style);border-top-width:1px}.hc\\:border-b{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.hc\\:border-b-2{border-bottom-style:var(--tw-border-style);border-bottom-width:2px}.hc\\:border-b-\\[\\.5em\\]{border-bottom-style:var(--tw-border-style);border-bottom-width:.5em}.hc\\:border-b-\\[\\.75em\\]{border-bottom-style:var(--tw-border-style);border-bottom-width:.75em}.hc\\:border-dashed{--tw-border-style:dashed;border-style:dashed}.hc\\:border-\\(color\\:--item-border\\){border-color:var(--item-border)}.hc\\:border-transparent{border-color:#0000}.hc\\:border-x-transparent{border-inline-color:#0000}.hc\\:border-b-current{border-bottom-color:currentColor}.hc\\:bg-\\(--tab-surface\\){background-color:var(--tab-surface)}.hc\\:bg-\\(--trigger-bg\\){background-color:var(--trigger-bg)}.hc\\:tint-highlight[data-highlighted]{background-image:linear-gradient(currentColor,currentColor)}@supports (color:color-mix(in lab, red, red)){.hc\\:tint-highlight[data-highlighted]{background-image:linear-gradient(color-mix(in srgb, currentColor 10%, transparent), color-mix(in srgb, currentColor 10%, transparent))}}.hc\\:tint-hover:hover:not(:disabled,[data-disabled]){background-image:linear-gradient(currentColor,currentColor)}@supports (color:color-mix(in lab, red, red)){.hc\\:tint-hover:hover:not(:disabled,[data-disabled]){background-image:linear-gradient(color-mix(in srgb, currentColor 8%, transparent), color-mix(in srgb, currentColor 8%, transparent))}}.hc\\:p-1{padding:var(--hc-spacing)}.hc\\:p-2{padding:calc(var(--hc-spacing) * 2)}.hc\\:p-4{padding:calc(var(--hc-spacing) * 4)}.hc\\:p-\\[\\.75em\\]{padding:.75em}.hc\\:p-\\[\\.375em\\]{padding:.375em}.hc\\:p-\\[\\.1875em\\]{padding:.1875em}.hc\\:p-\\[1em\\]{padding:1em}.hc\\:px-2{padding-inline:calc(var(--hc-spacing) * 2)}.hc\\:px-4{padding-inline:calc(var(--hc-spacing) * 4)}.hc\\:px-\\[\\.5em\\]{padding-inline:.5em}.hc\\:px-\\[\\.75em\\]{padding-inline:.75em}.hc\\:px-\\[\\.625em\\]{padding-inline:.625em}.hc\\:px-\\[\\.875em\\]{padding-inline:.875em}.hc\\:px-\\[1\\.25em\\]{padding-inline:1.25em}.hc\\:py-2{padding-block:calc(var(--hc-spacing) * 2)}.hc\\:py-\\[\\.3em\\]{padding-block:.3em}.hc\\:py-\\[\\.5em\\]{padding-block:.5em}.hc\\:py-\\[\\.375em\\]{padding-block:.375em}.hc\\:py-\\[\\.625em\\]{padding-block:.625em}.hc\\:py-\\[\\.4375em\\]{padding-block:.4375em}.hc\\:py-\\[1em\\]{padding-block:1em}.hc\\:pt-\\[\\.25em\\]{padding-top:.25em}.hc\\:pt-\\[1\\.125em\\]{padding-top:1.125em}.hc\\:pr-\\[\\.25em\\]{padding-right:.25em}.hc\\:pr-\\[\\.375em\\]{padding-right:.375em}.hc\\:pb-\\[\\.5em\\]{padding-bottom:.5em}.hc\\:pb-\\[\\.25em\\]{padding-bottom:.25em}.hc\\:pl-\\[\\.5em\\]{padding-left:.5em}.hc\\:text-center{text-align:center}.hc\\:text-left{text-align:left}.hc\\:font-mono{font-family:var(--hc-font-mono)}.hc\\:font-ui{font-family:var(--hc-font-ui)}.hc\\:text-\\[\\.75em\\]{font-size:.75em}.hc\\:text-\\[\\.875em\\]{font-size:.875em}.hc\\:text-\\[\\.875rem\\]{font-size:.875rem}.hc\\:text-\\[\\.8125em\\]{font-size:.8125em}.hc\\:text-\\[\\.8125rem\\]{font-size:.8125rem}.hc\\:text-\\[\\.9375em\\]{font-size:.9375em}.hc\\:text-\\[1\\.5em\\]{font-size:1.5em}.hc\\:leading-none{--tw-leading:1;line-height:1}.hc\\:leading-tight{--tw-leading:var(--hc-leading-tight);line-height:var(--hc-leading-tight)}.hc\\:font-bold{--tw-font-weight:var(--hc-font-weight-bold);font-weight:var(--hc-font-weight-bold)}.hc\\:font-medium{--tw-font-weight:var(--hc-font-weight-medium);font-weight:var(--hc-font-weight-medium)}.hc\\:font-normal{--tw-font-weight:var(--hc-font-weight-normal);font-weight:var(--hc-font-weight-normal)}.hc\\:font-semibold{--tw-font-weight:var(--hc-font-weight-semibold);font-weight:var(--hc-font-weight-semibold)}.hc\\:whitespace-nowrap{white-space:nowrap}.hc\\:text-\\(--tab-text\\){color:var(--tab-text)}.hc\\:tabular-nums{--tw-numeric-spacing:tabular-nums;font-variant-numeric:var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,)}.hc\\:underline{text-decoration-line:underline}.hc\\:opacity-0{opacity:0}.hc\\:opacity-70{opacity:.7}.hc\\:opacity-100{opacity:1}.hc\\:shadow-\\[0_0_0_2px_white\\,0_0_0_3px_rgb\\(0_0_0\\/\\.35\\)\\,0_1px_4px_rgb\\(0_0_0\\/\\.3\\)\\]{--tw-shadow:0 0 0 2px var(--tw-shadow-color,white), 0 0 0 3px var(--tw-shadow-color,#00000059), 0 1px 4px var(--tw-shadow-color,#0000004d);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.hc\\:shadow-\\[0_1px_3px_color-mix\\(in_srgb\\,var\\(--tab-text\\)_calc\\(18\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 1px 3px var(--tw-shadow-color,var(--tab-text))}@supports (color:color-mix(in lab, red, red)){.hc\\:shadow-\\[0_1px_3px_color-mix\\(in_srgb\\,var\\(--tab-text\\)_calc\\(18\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 1px 3px var(--tw-shadow-color,color-mix(in srgb,var(--tab-text) calc(18% * var(--huet-configurator-contrast,1)),transparent))}}.hc\\:shadow-\\[0_1px_3px_color-mix\\(in_srgb\\,var\\(--tab-text\\)_calc\\(18\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,var(--huet-foreground))}@supports (color:color-mix(in lab, red, red)){.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,color-mix(in srgb,var(--huet-foreground) calc(12.5% * var(--huet-configurator-contrast,1)),transparent))}}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-relative-text\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,var(--huet-relative-text))}@supports (color:color-mix(in lab, red, red)){.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-relative-text\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,color-mix(in srgb,var(--huet-relative-text) calc(12.5% * var(--huet-configurator-contrast,1)),transparent))}}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-relative-text\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.hc\\:shadow-\\[0_6px_24px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(16\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 6px 24px var(--tw-shadow-color,var(--huet-foreground))}@supports (color:color-mix(in lab, red, red)){.hc\\:shadow-\\[0_6px_24px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(16\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 6px 24px var(--tw-shadow-color,color-mix(in srgb,var(--huet-foreground) calc(16% * var(--huet-configurator-contrast,1)),transparent))}}.hc\\:shadow-\\[0_6px_24px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(16\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.hc\\:shadow-\\[0_8px_28px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(18\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 8px 28px var(--tw-shadow-color,var(--huet-foreground))}@supports (color:color-mix(in lab, red, red)){.hc\\:shadow-\\[0_8px_28px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(18\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 8px 28px var(--tw-shadow-color,color-mix(in srgb,var(--huet-foreground) calc(18% * var(--huet-configurator-contrast,1)),transparent))}}.hc\\:shadow-\\[0_8px_28px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(18\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.hc\\:outline{outline-style:var(--tw-outline-style);outline-width:1px}.hc\\:outline-2{outline-style:var(--tw-outline-style);outline-width:2px}.hc\\:outline-offset-2{outline-offset:2px}.hc\\:transition-\\[opacity\\,translate\\,height\\]{transition-property:opacity,translate,height;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:transition-\\[outline-offset\\]{transition-property:outline-offset;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:transition-\\[translate\\,width\\]{transition-property:translate,width;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:transition-opacity{transition-property:opacity;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:transition-transform{transition-property:transform,translate,scale,rotate;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:duration-100{--tw-duration:.1s;transition-duration:.1s}.hc\\:duration-150{--tw-duration:.15s;transition-duration:.15s}.hc\\:duration-200{--tw-duration:.2s;transition-duration:.2s}.hc\\:duration-400{--tw-duration:.4s;transition-duration:.4s}.hc\\:ease-\\[ease-out\\]{--tw-ease:ease-out;transition-timing-function:ease-out}.hc\\:ease-\\[ease\\]{--tw-ease:ease;transition-timing-function:ease}.hc\\:ease-out{--tw-ease:var(--hc-ease-out);transition-timing-function:var(--hc-ease-out)}.hc\\:outline-none{--tw-outline-style:none;outline-style:none}.hc\\:select-none{-webkit-user-select:none;user-select:none}.hc\\:\\[--tab-surface\\:var\\(--huet-background\\)\\]{--tab-surface:var(--huet-background)}.hc\\:\\[--tab-text\\:var\\(--huet-foreground\\)\\]{--tab-text:var(--huet-foreground)}.hc\\:not-focus-visible\\:shadow-none\\!:not(:focus-visible){--tw-shadow:0 0 #0000!important;box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)!important}@media (hover:hover){.hc\\:group-hover\\:outline-1:is(:where(.hc\\:group):hover *){outline-style:var(--tw-outline-style);outline-width:1px}.hc\\:group-hover\\:outline-offset-1:is(:where(.hc\\:group):hover *){outline-offset:1px}.hc\\:hover\\:border-\\(color\\:--item-border-hover\\):hover{border-color:var(--item-border-hover)}.hc\\:hover\\:bg-\\(--trigger-hover\\):hover{background-color:var(--trigger-hover)}.hc\\:hover\\:opacity-80:hover{opacity:.8}}.hc\\:focus-visible\\:outline-2:focus-visible{outline-style:var(--tw-outline-style);outline-width:2px}.hc\\:focus-visible\\:outline-offset-2:focus-visible{outline-offset:2px}.hc\\:active\\:cursor-grabbing:active{cursor:grabbing}.hc\\:disabled\\:cursor-default:disabled{cursor:default}.hc\\:disabled\\:opacity-50:disabled{opacity:.5}.hc\\:has-focus-visible\\:outline-2:has(:focus-visible){outline-style:var(--tw-outline-style);outline-width:2px}.hc\\:has-focus-visible\\:outline-offset-2:has(:focus-visible){outline-offset:2px}.hc\\:data-disabled\\:cursor-default[data-disabled]{cursor:default}.hc\\:data-disabled\\:opacity-40[data-disabled]{opacity:.4}.hc\\:data-disabled\\:opacity-50[data-disabled]{opacity:.5}@property --tw-translate-x{syntax:\"*\";inherits:false;initial-value:0}@property --tw-translate-y{syntax:\"*\";inherits:false;initial-value:0}@property --tw-translate-z{syntax:\"*\";inherits:false;initial-value:0}@property --tw-border-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-leading{syntax:\"*\";inherits:false}@property --tw-font-weight{syntax:\"*\";inherits:false}@property --tw-ordinal{syntax:\"*\";inherits:false}@property --tw-slashed-zero{syntax:\"*\";inherits:false}@property --tw-numeric-figure{syntax:\"*\";inherits:false}@property --tw-numeric-spacing{syntax:\"*\";inherits:false}@property --tw-numeric-fraction{syntax:\"*\";inherits:false}@property --tw-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-shadow-color{syntax:\"*\";inherits:false}@property --tw-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-inset-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-inset-shadow-color{syntax:\"*\";inherits:false}@property --tw-inset-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-ring-color{syntax:\"*\";inherits:false}@property --tw-ring-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-inset-ring-color{syntax:\"*\";inherits:false}@property --tw-inset-ring-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-ring-inset{syntax:\"*\";inherits:false}@property --tw-ring-offset-width{syntax:\"<length>\";inherits:false;initial-value:0}@property --tw-ring-offset-color{syntax:\"*\";inherits:false;initial-value:#fff}@property --tw-ring-offset-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-outline-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-duration{syntax:\"*\";inherits:false}@property --tw-ease{syntax:\"*\";inherits:false}", he = n(null), M = () => i(he), ge = "hc:z-[1010]";
// src/private/ConfiguratorPortal.tsx
function _e() {
	if (document.head.querySelector("style[data-huet-configurator-styles]")) return;
	let e = document.createElement("style");
	e.setAttribute("data-huet-configurator-styles", ""), e.textContent = me, document.head.append(e);
}
function ve({ theme: e, background: t, children: n }) {
	let [r, i] = u(null);
	o(() => {
		_e();
		let e = document.createElement("div");
		return e.setAttribute("data-huet-configurator", ""), document.body.append(e), i(e), () => e.remove();
	}, []);
	let a = l({
		theme: e,
		background: t
	});
	a.current = {
		theme: e,
		background: t
	};
	let s = l(void 0);
	return o(() => {
		if (!r) return;
		let e = h(r, a.current.theme, a.current);
		return s.current = e, () => {
			e.destroy(), s.current = void 0;
		};
	}, [r]), o(() => s.current?.update(e, { background: t }), [e, t]), o(() => {
		r?.style.setProperty("--huet-configurator-contrast", String(e.contrast ?? 1));
	}, [r, e.contrast]), r ? v(/* @__PURE__ */ b(he.Provider, {
		value: r,
		children: n
	}), r) : null;
}
// src/private/cx.ts
function N(...e) {
	return e.filter(Boolean).join(" ");
}
// src/private/ui/slider.tsx
var ye = "hc:shadow-[0_0_0_2px_white,0_0_0_3px_rgb(0_0_0/.35),0_1px_4px_rgb(0_0_0/.3)]";
function P({ label: e, value: t, onValueChange: n, min: r = 0, max: i = 100, step: a = 1, track: o, thumbColor: s, invalid: c, className: l, children: u }) {
	return /* @__PURE__ */ b(S.Root, {
		value: t,
		onValueChange: (e) => n(e),
		min: r,
		max: i,
		step: a,
		className: N("hc:relative hc:flex hc:w-full hc:min-w-0 hc:touch-none hc:select-none", l),
		children: /* @__PURE__ */ b(S.Control, {
			className: "hc:flex hc:items-center hc:w-full hc:h-[1.5em] hc:cursor-pointer",
			children: /* @__PURE__ */ x(S.Track, {
				className: N("hc:relative hc:w-full hc:rounded-full", o ? "huet-border-10 hc:border hc:h-[.875em]" : "huet-bg-10 hc:h-[.375em]"),
				style: o ? { background: o } : void 0,
				children: [
					u,
					!o && /* @__PURE__ */ b(S.Indicator, { className: N("hc:rounded-full", c ? "huet-bg-red-100" : "huet-bg-70") }),
					/* @__PURE__ */ b(S.Thumb, {
						"aria-label": e,
						className: N("hc:block hc:size-[1.125em] hc:rounded-full hc:cursor-grab hc:active:cursor-grabbing", "hc:has-focus-visible:outline-2 hc:has-focus-visible:outline-offset-2 huet-outline-100", ye, s ? "" : c ? "huet-bg-red-100" : "huet-bg-100"),
						style: s ? { backgroundColor: s } : void 0
					})
				]
			})
		})
	});
}
// src/private/BackgroundSlider.tsx
var F = [
	0,
	.05,
	.1,
	.15,
	.2,
	.25,
	.49,
	.51,
	.75,
	.8,
	.85,
	.9,
	.95,
	1
];
function be(e) {
	let t = 0;
	return F.forEach((n, r) => {
		Math.abs(n - e) < Math.abs(F[t] - e) && (t = r);
	}), t;
}
function xe({ theme: e, background: t, onChange: n }) {
	let r = s(() => F.map((t) => _(e, { background: t }).root.hex), [e]), i = be(t), a = F.length - 1, o = `linear-gradient(to right, ${r.map((e, t) => `${e} ${t === 0 ? 0 : (t - .5) / a * 100}% ${t === a ? 100 : (t + .5) / a * 100}%`).join(", ")})`;
	return /* @__PURE__ */ x("div", {
		className: "hc:flex hc:flex-col hc:gap-[.25em]",
		children: [/* @__PURE__ */ b(P, {
			label: "Background",
			min: 0,
			max: a,
			step: 1,
			value: i,
			onValueChange: (e) => n(F[e]),
			track: o,
			thumbColor: r[i]
		}), /* @__PURE__ */ x("div", {
			"aria-hidden": !0,
			className: "hc:flex hc:justify-between hc:text-[.75em] huet-text-50",
			children: [
				/* @__PURE__ */ b("span", { children: "Dark" }),
				/* @__PURE__ */ b("span", { children: "Middle" }),
				/* @__PURE__ */ b("span", { children: "Light" })
			]
		})]
	});
}
// src/private/colorMath.ts
var I = (e) => Math.max(0, Math.min(1, e));
function Se(e, t = 0) {
	let [n, r, i] = C(e).hsv();
	return {
		h: Number.isNaN(n) ? t : n,
		s: r,
		v: i
	};
}
var L = ({ h: e, s: t, v: n }) => C.hsv(e, t, n).hex();
function Ce(e, t) {
	let n = 0, r = .4;
	for (let i = 0; i < 14; i++) {
		let i = (n + r) / 2;
		C.oklch(e, i, t).clipped() ? r = i : n = i;
	}
	return n;
}
function we(e, t = 0) {
	let [n, r, i] = C(e).oklch(), a = Number.isNaN(i) ? t : i, o = Ce(n, a);
	return {
		l: n,
		h: a,
		s: o > 0 ? I(r / o) : 0
	};
}
var R = ({ l: e, s: t, h: n }) => C.oklch(e, t * Ce(e, n), n).hex();
function z(e, t = 12) {
	return `linear-gradient(to right, ${Array.from({ length: t + 1 }, (n, r) => e(r / t)).join(", ")})`;
}
function Te(e) {
	let t = l({
		fn: e,
		value: void 0,
		frame: void 0
	});
	return t.current.fn = e, a(() => () => cancelAnimationFrame(t.current.frame ?? 0), []), (e) => {
		t.current.value = e, t.current.frame ??= requestAnimationFrame(() => {
			t.current.frame = void 0, t.current.fn(t.current.value);
		});
	};
}
function Ee(e, t, n, r) {
	let i = l(void 0);
	i.current ??= {
		value: n(e),
		prop: e,
		echoes: /* @__PURE__ */ new Set()
	};
	let a = i.current;
	e !== a.prop && (a.prop = e, a.echoes.has(e.toLowerCase()) ? a.echoes.delete(e.toLowerCase()) : a.value = n(e, a.value));
	let o = Te((e) => {
		a.echoes.add(e.toLowerCase()), a.echoes.size > 8 && a.echoes.delete(a.echoes.values().next().value), t(e);
	}), [, s] = c((e) => e + 1, 0);
	return [a.value, (e) => {
		a.value = e, s(), o(r(e));
	}];
}
// src/private/HexInput.tsx
function De({ label: e, color: t, onChange: n, className: r }) {
	let [i, a] = u(), o = i ?? C(t).hex("rgb"), s = i === void 0 || C.valid(i);
	return /* @__PURE__ */ b("input", {
		"aria-label": e,
		spellCheck: !1,
		value: o,
		onFocus: (e) => e.currentTarget.select(),
		onChange: (e) => {
			let t = e.target.value;
			a(t), C.valid(t) && n(C(t).hex());
		},
		onBlur: () => a(void 0),
		onKeyDown: (e) => {
			(e.key === "Enter" || e.key === "Escape") && (a(void 0), e.currentTarget.blur());
		},
		className: N("hc:h-[1.875em] hc:w-[6.5em] hc:px-[.5em] hc:border hc:rounded-md hc:font-mono hc:text-[.9375em] hc:cursor-text", s ? "huet-border-20" : "huet-border-red-100 huet-text-red-100", r)
	});
}
// src/private/ui/button.tsx
var Oe = {
	primary: "huet-bg-100",
	secondary: "huet-bg-10",
	outline: "huet-border-20 hc:border",
	ghost: ""
}, ke = {
	md: "hc:h-[2.25em] hc:px-[.875em] hc:gap-[.5em]",
	sm: "hc:h-[1.875em] hc:px-[.625em] hc:gap-[.375em]",
	icon: "hc:size-[2.25em]",
	"icon-sm": "hc:size-[1.875em]"
};
function B({ variant: e = "secondary", size: t = "md", className: n } = {}) {
	return N("hc:inline-flex hc:items-center hc:justify-center hc:shrink-0 hc:rounded-md hc:cursor-pointer hc:select-none hc:whitespace-nowrap hc:font-medium", "hc:tint-hover hc:disabled:opacity-50 hc:disabled:cursor-default", Oe[e], ke[t], n);
}
function Ae(e) {
	return !e || window.confirm(e === !0 ? "Are you sure?" : e);
}
var V = t.forwardRef(function({ variant: e, size: t, verify: n, className: r, onClick: i, type: a = "button", ...o }, s) {
	return /* @__PURE__ */ b("button", {
		ref: s,
		type: a,
		className: B({
			variant: e,
			size: t,
			className: r
		}),
		onClick: (e) => {
			Ae(n) && i?.(e);
		},
		...o
	});
});
function je({ children: e, className: t }) {
	return /* @__PURE__ */ b("span", {
		className: N("huet-bg-blue-100 hc:inline-flex hc:items-center hc:justify-center hc:h-[1.5em] hc:min-w-[1.5em] hc:px-[.5em] hc:rounded-full hc:text-[.75em] hc:font-semibold hc:leading-none hc:tabular-nums", t),
		children: e
	});
}
// src/private/BaseColors.tsx
var Me = z((e) => C.hsv(e * 360, 1, 1).hex());
function Ne({ hsv: e, onChange: t }) {
	let n = l(null), r = (r) => {
		let i = n.current.getBoundingClientRect();
		t({
			h: e.h,
			s: I((r.clientX - i.left) / i.width),
			v: I(1 - (r.clientY - i.top) / i.height)
		});
	};
	return /* @__PURE__ */ b("div", {
		ref: n,
		role: "slider",
		tabIndex: 0,
		"aria-label": "Saturation and brightness",
		"aria-valuetext": `Saturation ${Math.round(e.s * 100)}%, brightness ${Math.round(e.v * 100)}%`,
		onPointerDown: (e) => {
			e.currentTarget.setPointerCapture(e.pointerId), r(e);
		},
		onPointerMove: (e) => {
			e.currentTarget.hasPointerCapture(e.pointerId) && r(e);
		},
		onKeyDown: (n) => {
			let r = n.shiftKey ? .1 : .01, i = {
				ArrowLeft: [-r, 0],
				ArrowRight: [r, 0],
				ArrowUp: [0, r],
				ArrowDown: [0, -r]
			}[n.key];
			i && (n.preventDefault(), t({
				h: e.h,
				s: I(e.s + i[0]),
				v: I(e.v + i[1])
			}));
		},
		className: "huet-border-10 hc:relative hc:h-[11em] hc:border hc:rounded-lg hc:cursor-crosshair hc:touch-none",
		style: { background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${C.hsv(e.h, 1, 1).hex()})` },
		children: /* @__PURE__ */ b("div", {
			className: N("hc:absolute hc:size-[1.25em] hc:rounded-full hc:-translate-x-1/2 hc:translate-y-1/2 hc:pointer-events-none", ye),
			style: {
				left: `${e.s * 100}%`,
				bottom: `${e.v * 100}%`,
				backgroundColor: L(e)
			}
		})
	});
}
function Pe({ label: e, color: t, onChange: n, onRemove: r }) {
	let [i, a] = Ee(t, n, (e, t) => Se(e, t?.h), L);
	return /* @__PURE__ */ x("div", {
		className: "hc:flex hc:flex-col hc:gap-[.75em]",
		children: [
			/* @__PURE__ */ b(Ne, {
				hsv: i,
				onChange: a
			}),
			/* @__PURE__ */ b(P, {
				label: `${e} hue`,
				min: 0,
				max: 360,
				value: i.h,
				onValueChange: (e) => a({
					...i,
					h: e
				}),
				track: Me,
				thumbColor: C.hsv(i.h, 1, 1).hex()
			}),
			/* @__PURE__ */ x("div", {
				className: "hc:flex hc:items-center hc:gap-[.5em]",
				children: [
					/* @__PURE__ */ b(De, {
						label: `${e} hex`,
						color: L(i),
						onChange: (e) => a(Se(e, i.h))
					}),
					/* @__PURE__ */ b("span", {
						className: "huet-text-60 hc:grow",
						children: e
					}),
					r && /* @__PURE__ */ x(V, {
						variant: "ghost",
						size: "sm",
						onClick: r,
						children: [/* @__PURE__ */ b(ce, {
							size: "1em",
							stroke: 2
						}), "Remove"]
					})
				]
			})
		]
	});
}
var H = (e, t) => e === 0 ? "Darkest" : e === t - 1 ? "Lightest" : t === 3 ? "Middle" : `Middle ${e}`;
function Fe({ colors: e, colorModel: n = "oklab", onChange: r }) {
	let { resolved: i } = j(), [a, o] = u(0), s = a !== null && a < e.length ? a : null, c = (t) => {
		let i = C.mix(e[t], e[t + 1], .5, n === "oklab" ? "oklab" : "lab").hex();
		r([
			...e.slice(0, t + 1),
			i,
			...e.slice(t + 1)
		]), o(t + 1);
	}, l = (t) => {
		r(e.filter((e, n) => n !== t)), o(null);
	};
	return /* @__PURE__ */ x("div", {
		className: "hc:flex hc:flex-col hc:gap-[.75em]",
		children: [
			/* @__PURE__ */ b("div", {
				"aria-hidden": !0,
				className: "huet-border-10 hc:h-[1.5em] hc:rounded-md hc:border",
				style: { background: z(i.ramp, 24) }
			}),
			/* @__PURE__ */ b("div", {
				className: "hc:flex hc:items-start",
				children: e.map((n, r) => {
					let i = H(r, e.length), a = r === s;
					return /* @__PURE__ */ x(t.Fragment, { children: [r > 0 && /* @__PURE__ */ b("button", {
						type: "button",
						"aria-label": `Add a color between ${H(r - 1, e.length)} and ${i}`,
						title: "Add a middle color",
						onClick: () => c(r - 1),
						className: "huet-border-20 hc:flex hc:items-center hc:justify-center hc:shrink-0 hc:size-[1.5em] hc:mx-[.25em] hc:mt-[.875em] hc:rounded-full hc:border hc:border-dashed hc:cursor-pointer hc:tint-hover huet-text-70",
						children: /* @__PURE__ */ b(T, {
							size: ".875em",
							stroke: 2.5
						})
					}), /* @__PURE__ */ x("button", {
						type: "button",
						"aria-pressed": a,
						"aria-label": `Edit ${i}, ${n}`,
						onClick: () => o(a ? null : r),
						className: "hc:flex hc:flex-col hc:items-center hc:gap-[.375em] hc:grow hc:basis-0 hc:min-w-0 hc:cursor-pointer hc:group",
						children: [/* @__PURE__ */ b("span", {
							className: N("hc:block hc:w-full hc:h-[3.25em] hc:rounded-lg hc:border hc:transition-[outline-offset] hc:duration-100", a ? "huet-border-10 huet-outline-100 hc:outline-2 hc:outline-offset-2" : "huet-border-20 hc:group-hover:outline-1 hc:group-hover:outline-offset-1 huet-outline-50"),
							style: { backgroundColor: n }
						}), /* @__PURE__ */ x("span", {
							className: "hc:text-[.8125em] hc:leading-tight hc:text-center",
							children: [/* @__PURE__ */ b("span", {
								className: N("hc:block", a ? "hc:font-semibold" : "huet-text-70"),
								children: i
							}), /* @__PURE__ */ b("span", {
								className: "hc:block hc:font-mono huet-text-50",
								children: C(n).hex("rgb")
							})]
						})]
					})] }, r);
				})
			}),
			s === null ? /* @__PURE__ */ b("p", {
				className: "huet-text-60",
				children: "Click a color to edit it. Use + to add a middle color."
			}) : /* @__PURE__ */ b("div", {
				className: "huet-bg-5 hc:rounded-lg hc:p-[.75em]",
				children: /* @__PURE__ */ b(Pe, {
					label: H(s, e.length),
					color: e[s],
					onChange: (t) => r(e.map((e, n) => n === s ? t : e)),
					onRemove: s > 0 && s < e.length - 1 ? () => l(s) : void 0
				}, s)
			})
		]
	});
}
// src/private/ui/number-field.tsx
var Ie = "hc:flex hc:items-center hc:justify-center hc:w-[1.625em] hc:h-full hc:cursor-pointer hc:tint-hover hc:data-disabled:opacity-40 hc:data-disabled:cursor-default";
function Le({ label: e, value: t, onValueChange: n, min: r, max: i, step: a = 1, suffix: o, invalid: s, allowOutOfRange: c, className: l }) {
	return /* @__PURE__ */ b(E.Root, {
		value: t,
		onValueChange: (e) => {
			e !== null && Number.isFinite(e) && n(e);
		},
		min: r,
		max: i,
		step: a,
		smallStep: a / 10,
		largeStep: a * 10,
		allowOutOfRange: c,
		format: { maximumFractionDigits: 2 },
		className: N("hc:shrink-0", l),
		children: /* @__PURE__ */ x(E.Group, {
			className: N("hc:flex hc:items-center hc:h-[1.875em] hc:rounded-md hc:border hc:overflow-hidden", s ? "huet-border-red-100 huet-text-red-100" : "huet-border-20"),
			children: [
				/* @__PURE__ */ b(E.Decrement, {
					"aria-label": `Decrease ${e}`,
					className: Ie,
					children: /* @__PURE__ */ b(ie, {
						size: ".875em",
						stroke: 2
					})
				}),
				/* @__PURE__ */ x("span", {
					className: "hc:flex hc:items-center hc:h-full",
					children: [/* @__PURE__ */ b(E.Input, {
						"aria-label": e,
						className: "hc:w-[3em] hc:h-full hc:text-center hc:tabular-nums hc:cursor-text"
					}), o && /* @__PURE__ */ b("span", {
						className: "hc:-ml-[.375em] hc:pr-[.25em] huet-text-60",
						children: o
					})]
				}),
				/* @__PURE__ */ b(E.Increment, {
					"aria-label": `Increase ${e}`,
					className: Ie,
					children: /* @__PURE__ */ b(T, {
						size: ".875em",
						stroke: 2
					})
				})
			]
		})
	});
}
// src/private/Hues.tsx
var Re = g.Base.colors, ze = (e) => e[0].toUpperCase() + e.slice(1);
function Be({ hue: e, color: t, onChange: n, onClose: r }) {
	let [i, a] = Ee(t, n, (e, t) => we(e, t?.h), R), o = ze(e), s = z((e) => R({
		...i,
		h: e * 360
	})), c = z((e) => R({
		...i,
		s: e
	}), 6), l = C(t).hex() === C(Re[e]).hex();
	return /* @__PURE__ */ x("div", {
		className: "hc:grid hc:grid-cols-[5.5em_1fr_auto] hc:items-center hc:gap-x-[.75em] hc:gap-y-[.5em]",
		children: [
			/* @__PURE__ */ b("span", { children: "Hue" }),
			/* @__PURE__ */ b(P, {
				label: `${o} hue`,
				min: 0,
				max: 360,
				value: i.h,
				onValueChange: (e) => a({
					...i,
					h: e
				}),
				track: s,
				thumbColor: R(i)
			}),
			/* @__PURE__ */ b(Le, {
				label: `${o} hue`,
				min: 0,
				max: 360,
				suffix: "°",
				value: Math.round(i.h),
				onValueChange: (e) => a({
					...i,
					h: (e % 360 + 360) % 360
				})
			}),
			/* @__PURE__ */ b("span", { children: "Saturation" }),
			/* @__PURE__ */ b(P, {
				label: `${o} saturation`,
				min: 0,
				max: 1,
				step: .01,
				value: i.s,
				onValueChange: (e) => a({
					...i,
					s: e
				}),
				track: c,
				thumbColor: R(i)
			}),
			/* @__PURE__ */ b(Le, {
				label: `${o} saturation`,
				min: 0,
				max: 100,
				suffix: "%",
				value: Math.round(i.s * 100),
				onValueChange: (e) => a({
					...i,
					s: Math.max(0, Math.min(100, e)) / 100
				})
			}),
			/* @__PURE__ */ x("span", {
				className: "hc:col-span-3 hc:flex hc:items-center hc:gap-[.5em] hc:pt-[.25em]",
				children: [
					/* @__PURE__ */ b(De, {
						label: `${o} hex`,
						color: R(i),
						onChange: (e) => a(we(e, i.h))
					}),
					/* @__PURE__ */ b("span", { className: "hc:grow" }),
					!l && /* @__PURE__ */ x(V, {
						variant: "ghost",
						size: "sm",
						onClick: () => n(Re[e]),
						children: [/* @__PURE__ */ b(oe, {
							size: "1em",
							stroke: 2
						}), "Default"]
					}),
					/* @__PURE__ */ b(V, {
						variant: "ghost",
						size: "icon-sm",
						"aria-label": "Done",
						title: "Done",
						onClick: r,
						children: /* @__PURE__ */ b(ue, {
							size: "1em",
							stroke: 2
						})
					})
				]
			})
		]
	});
}
function Ve({ theme: e, onChange: t }) {
	let [n, r] = u(null), i = (t) => e.colors?.[t] ?? Re[t];
	return /* @__PURE__ */ x("div", {
		className: "hc:flex hc:flex-col",
		children: [/* @__PURE__ */ b("div", {
			className: "hc:flex hc:gap-[.5em]",
			children: m.map((e) => {
				let t = e === n;
				return /* @__PURE__ */ x("button", {
					type: "button",
					"aria-pressed": t,
					"aria-label": `Edit ${e}, ${i(e)}`,
					onClick: () => r(t ? null : e),
					className: N("hc:flex hc:flex-col hc:gap-[.375em] hc:grow hc:basis-0 hc:min-w-0 hc:cursor-pointer hc:group", t ? "huet-bg-5 hc:rounded-t-lg hc:p-[.375em] hc:pb-[.5em]" : "hc:p-[.375em]"),
					children: [/* @__PURE__ */ b("span", {
						className: N("hc:block hc:h-[2.25em] hc:rounded-md hc:border", t ? "huet-border-10 huet-outline-100 hc:outline-2 hc:outline-offset-2" : "huet-border-20 hc:group-hover:outline-1 hc:group-hover:outline-offset-1 huet-outline-50"),
						style: { backgroundColor: i(e) }
					}), /* @__PURE__ */ b("span", {
						className: N("hc:text-[.8125em] hc:text-center", t ? "hc:font-semibold" : "huet-text-70"),
						children: ze(e)
					})]
				}, e);
			})
		}), n && /* @__PURE__ */ b("div", {
			className: N("huet-bg-5 hc:rounded-b-lg hc:p-[.75em]", n === m[0] ? "" : "hc:rounded-tl-lg", n === m[m.length - 1] ? "" : "hc:rounded-tr-lg"),
			children: /* @__PURE__ */ b(Be, {
				hue: n,
				color: i(n),
				onChange: (r) => t({
					...e.colors,
					[n]: r
				}),
				onClose: () => r(null)
			}, n)
		})]
	});
}
// src/private/displayError.ts
function He(e) {
	console.error(e), alert(e);
}
// src/private/inputClass.ts
var Ue = "hc:py-[.3em] hc:px-[.5em] hc:border hc:max-w-[30em] hc:rounded-xs";
// src/private/Button.tsx
function We(e, t) {
	let n = e.name.replace(/\.json$/i, "").replace(/ Huet Theme$/, "").trim() || "Imported";
	e.type === "application/json" || e.name.toLowerCase().endsWith(".json") ? e.text().then((e) => {
		let r;
		try {
			r = JSON.parse(e), f(r);
		} catch (e) {
			He(`That file isn't a valid Huet theme. ${e.message}`);
			return;
		}
		t(r, n);
	}) : He("Only JSON files are accepted.");
}
function Ge({ children: e, className: t, onUpload: n }) {
	return /* @__PURE__ */ x(U, {
		as: "div",
		"data-focus-within": "",
		className: N("hc:relative", t),
		children: [e, /* @__PURE__ */ b("input", {
			type: "file",
			accept: ".json,application/json",
			className: "hc:absolute hc:w-full hc:h-full hc:left-0 hc:top-0 hc:opacity-0",
			onChange: (e) => {
				let t = e.target.files?.[0];
				e.target.value = "", t && We(t, n);
			}
		})]
	});
}
function Ke(e, t) {
	if (e && !t) throw Error("Need a callback, otherwise `doubleCheck(boolOrMessage, cb)` doesn't do anything.");
	return (n) => {
		(!e || window.confirm(e === !0 ? "Are you sure?" : e)) && t?.(n);
	};
}
function U({ as: e = "button", colors: t = "huet-bg-10", className: n, children: r, verify: i, onClick: a, ...o }) {
	return /* @__PURE__ */ b(e, {
		onClick: Ke(i, a),
		...o,
		className: N(Ue, "hc:w-full hc:border-transparent hc:cursor-default hc:flex hc:justify-center hc:items-center", t, n),
		children: r
	});
}
function qe({ onClick: e, className: t, verify: n, ...r }) {
	return /* @__PURE__ */ b("button", {
		...r,
		className: N("hc:underline hc:cursor-pointer", t),
		onClick: Ke(n, e)
	});
}
// src/private/ui/popup.ts
var Je = "huet-bg-0 huet-border-30 hc:border hc:rounded-lg hc:outline-none hc:font-ui hc:text-[.875rem] hc:shadow-[0_8px_28px_color-mix(in_srgb,var(--huet-foreground)_calc(18%*var(--huet-configurator-contrast,1)),transparent)]", Ye = "hc:flex hc:items-center hc:gap-[.5em] hc:px-[.625em] hc:py-[.4375em] hc:rounded-md hc:cursor-pointer hc:outline-none hc:select-none hc:tint-highlight hc:data-disabled:opacity-50 hc:data-disabled:cursor-default";
// src/private/ui/menu.tsx
function Xe({ label: e, children: t, align: n = "end" }) {
	let r = M();
	return /* @__PURE__ */ x(D.Root, { children: [/* @__PURE__ */ b(D.Trigger, {
		"aria-label": e,
		title: e,
		className: B({
			variant: "ghost",
			size: "icon-sm"
		}),
		children: /* @__PURE__ */ b(ne, {
			size: "1.125em",
			stroke: 2
		})
	}), /* @__PURE__ */ b(D.Portal, {
		container: r,
		children: /* @__PURE__ */ b(D.Positioner, {
			sideOffset: 4,
			align: n,
			className: ge,
			children: /* @__PURE__ */ b(D.Popup, {
				className: N(Je, "hc:p-1 hc:min-w-[12em]"),
				children: t
			})
		})
	})] });
}
function W({ icon: e, children: t, onClick: n, verify: r, disabled: i }) {
	return /* @__PURE__ */ x(D.Item, {
		disabled: i,
		className: Ye,
		onClick: () => {
			Ae(r) && n?.();
		},
		children: [/* @__PURE__ */ b("span", {
			className: "hc:flex hc:w-[1em] hc:justify-center huet-text-70",
			children: e
		}), t]
	});
}
function Ze() {
	return /* @__PURE__ */ b(D.Separator, { className: "huet-bg-10 hc:h-px hc:my-1 hc:-mx-1" });
}
// src/private/ThemeHeader.tsx
function Qe({ name: e, onDone: t }) {
	return /* @__PURE__ */ b("input", {
		"aria-label": "Theme name",
		autoFocus: !0,
		defaultValue: e,
		onFocus: (e) => e.currentTarget.select(),
		onBlur: (e) => t(e.currentTarget.value.trim()),
		onKeyDown: (e) => {
			e.key === "Enter" && e.currentTarget.blur(), e.key === "Escape" && t();
		},
		className: "huet-border-30 hc:min-w-0 hc:grow hc:text-[1.5em] hc:font-semibold hc:leading-tight hc:border-b-2 hc:cursor-text"
	});
}
function $e() {
	let { theme: e, setTheme: t, name: n, editedFrom: r, reset: i, list: a, themes: o } = j(), [s, c] = u(!1), d = l(null), f = n === void 0, p = n ?? r ?? "Custom", m = a && n !== void 0, h = a && n !== void 0 && Object.keys(o).length > 1, g = () => {
		let t = new Blob([JSON.stringify(e, null, 2)], { type: "application/json;charset=utf-8" });
		de(t, `${p} Huet Theme.json`);
	}, _ = (e) => We(e, (e, n) => a ? a.add(n, e) : t(e));
	return /* @__PURE__ */ x("div", {
		className: "hc:flex hc:flex-col hc:gap-[.625em] hc:px-[1.25em] hc:pt-[1.125em] hc:pb-[.25em]",
		children: [/* @__PURE__ */ x("div", {
			className: "hc:flex hc:items-center hc:gap-[.25em] hc:min-h-[2.25em]",
			children: [
				s && m ? /* @__PURE__ */ b(Qe, {
					name: n,
					onDone: (e) => {
						e && a.rename(n, e), c(!1);
					}
				}) : /* @__PURE__ */ b("h2", {
					className: "hc:text-[1.5em] hc:font-semibold hc:leading-tight hc:truncate",
					children: p
				}),
				m && !s && /* @__PURE__ */ b(V, {
					variant: "ghost",
					size: "icon-sm",
					"aria-label": "Rename theme",
					title: "Rename",
					onClick: () => c(!0),
					children: /* @__PURE__ */ b(ae, {
						size: "1em",
						stroke: 2
					})
				}),
				s && /* @__PURE__ */ b(V, {
					variant: "ghost",
					size: "icon-sm",
					"aria-label": "Save name",
					title: "Save name",
					children: /* @__PURE__ */ b(w, {
						size: "1em",
						stroke: 2
					})
				}),
				/* @__PURE__ */ b("span", { className: "hc:grow" }),
				/* @__PURE__ */ x(Xe, {
					label: "Theme actions",
					children: [
						/* @__PURE__ */ b(W, {
							icon: /* @__PURE__ */ b(le, { size: "1em" }),
							onClick: () => d.current?.click(),
							children: "Import theme…"
						}),
						/* @__PURE__ */ b(W, {
							icon: /* @__PURE__ */ b(re, { size: "1em" }),
							onClick: g,
							children: "Export theme"
						}),
						a && /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b(Ze, {}), /* @__PURE__ */ b(W, {
							icon: /* @__PURE__ */ b(te, { size: "1em" }),
							onClick: a.saveAsNew,
							children: f ? "Save as new theme" : "Duplicate"
						})] }),
						h && /* @__PURE__ */ b(W, {
							icon: /* @__PURE__ */ b(ce, { size: "1em" }),
							verify: `Remove ${n}?`,
							onClick: () => a.remove(n),
							children: "Remove"
						})
					]
				}),
				/* @__PURE__ */ b("input", {
					ref: d,
					type: "file",
					accept: ".json,application/json",
					hidden: !0,
					onChange: (e) => {
						let t = e.target.files?.[0];
						e.target.value = "", t && _(t);
					}
				})
			]
		}), f && /* @__PURE__ */ x("div", {
			className: "hc:flex hc:items-center hc:gap-[.375em] hc:flex-wrap",
			children: [
				/* @__PURE__ */ b(je, { children: "Edited" }),
				r !== void 0 && /* @__PURE__ */ x("span", {
					className: "huet-text-60",
					children: ["from ", r]
				}),
				/* @__PURE__ */ b("span", { className: "hc:grow" }),
				r !== void 0 && /* @__PURE__ */ b(V, {
					variant: "ghost",
					size: "sm",
					verify: `Discard your edits and go back to ${r}?`,
					onClick: i,
					children: "Reset"
				}),
				a && r !== void 0 && /* @__PURE__ */ b(V, {
					variant: "secondary",
					size: "sm",
					verify: `Save your edits over ${r}?`,
					onClick: () => a.update(r, e),
					children: "Save"
				}),
				a && /* @__PURE__ */ b(V, {
					variant: "primary",
					size: "sm",
					onClick: a.saveAsNew,
					children: "Save as new"
				})
			]
		})]
	});
}
// src/private/ui/popover.tsx
function et({ label: e, title: t, changed: n = 0, children: r }) {
	let i = M(), a = n ? `${e} (${n} changed)` : e;
	return /* @__PURE__ */ x(O.Root, { children: [/* @__PURE__ */ x(O.Trigger, {
		"aria-label": a,
		title: a,
		className: B({
			variant: "ghost",
			size: "icon-sm",
			className: "hc:relative"
		}),
		children: [/* @__PURE__ */ b(ne, {
			size: "1.125em",
			stroke: 2
		}), n > 0 && /* @__PURE__ */ b("span", {
			"aria-hidden": !0,
			className: "huet-bg-blue-100 hc:absolute hc:top-[.125em] hc:right-[.125em] hc:size-[.5em] hc:rounded-full"
		})]
	}), /* @__PURE__ */ b(O.Portal, {
		container: i,
		children: /* @__PURE__ */ b(O.Positioner, {
			sideOffset: 4,
			align: "end",
			collisionPadding: 8,
			className: ge,
			children: /* @__PURE__ */ x(O.Popup, {
				"aria-label": e,
				className: N(Je, "hc:w-[19em] hc:p-[1em] hc:flex hc:flex-col hc:gap-[.875em]"),
				children: [/* @__PURE__ */ b("h4", {
					className: "hc:font-semibold",
					children: t
				}), r]
			})
		})
	})] });
}
// src/private/ui/select.tsx
function tt({ label: e, value: t, onValueChange: n, options: r, describe: i }) {
	let a = M();
	return /* @__PURE__ */ x(k.Root, {
		value: t,
		onValueChange: (e) => e !== null && n(e),
		children: [/* @__PURE__ */ x(k.Trigger, {
			"aria-label": e,
			className: "huet-border-20 hc:flex hc:items-center hc:justify-between hc:gap-[.5em] hc:w-full hc:h-[2em] hc:px-[.625em] hc:border hc:rounded-md hc:cursor-pointer hc:tint-hover",
			children: [/* @__PURE__ */ b(k.Value, {}), /* @__PURE__ */ b(k.Icon, {
				className: "hc:flex huet-text-60",
				children: /* @__PURE__ */ b(se, {
					size: "1em",
					stroke: 2
				})
			})]
		}), /* @__PURE__ */ b(k.Portal, {
			container: a,
			children: /* @__PURE__ */ b(k.Positioner, {
				sideOffset: 4,
				alignItemWithTrigger: !1,
				className: ge,
				children: /* @__PURE__ */ b(k.Popup, {
					className: N(Je, "hc:p-1 hc:min-w-(--anchor-width) hc:max-h-(--available-height) hc:overflow-y-auto"),
					children: r.map((e) => /* @__PURE__ */ x(k.Item, {
						value: e,
						className: Ye,
						children: [
							/* @__PURE__ */ b("span", {
								className: "hc:flex hc:w-[1em]",
								children: /* @__PURE__ */ b(k.ItemIndicator, {
									className: "hc:flex",
									children: /* @__PURE__ */ b(w, {
										size: "1em",
										stroke: 2.5
									})
								})
							}),
							/* @__PURE__ */ b(k.ItemText, { children: e }),
							i?.(e) && /* @__PURE__ */ b("span", {
								className: "huet-text-50",
								children: i(e)
							})
						]
					}, e))
				})
			})
		})]
	});
}
// src/private/ui/switch.tsx
function nt({ label: e, checked: t, onCheckedChange: n, className: r, children: i }) {
	return /* @__PURE__ */ x("div", {
		className: N("hc:flex hc:items-center hc:gap-[.5em] hc:min-h-[1.875em]", r),
		children: [/* @__PURE__ */ x("label", {
			className: "hc:flex hc:items-center hc:gap-[.625em] hc:grow hc:cursor-pointer",
			children: [/* @__PURE__ */ b(fe.Root, {
				checked: t,
				onCheckedChange: n,
				className: N("hc:relative hc:inline-flex hc:shrink-0 hc:items-center hc:w-[2.25em] hc:h-[1.25em] hc:p-[.1875em] hc:rounded-full hc:cursor-pointer", "hc:has-focus-visible:outline-2 hc:has-focus-visible:outline-offset-2 hc:focus-visible:outline-2 hc:focus-visible:outline-offset-2 huet-outline-100", t ? "huet-bg-100" : "huet-bg-20"),
				children: /* @__PURE__ */ b(fe.Thumb, { className: N("huet-bg-100 hc:block hc:size-[.875em] hc:rounded-full hc:transition-transform hc:duration-150", t && "hc:translate-x-[1em]") })
			}), e]
		}), i]
	});
}
// src/private/EditTheme.tsx
var rt = "lab", it = {
	onLight: .49,
	onDark: .49
};
function G({ title: e, actions: t, children: n }) {
	return /* @__PURE__ */ x("section", {
		className: "huet-border-10 hc:flex hc:flex-col hc:gap-[.75em] hc:px-[1.25em] hc:py-[1em] hc:border-t",
		children: [/* @__PURE__ */ x("div", {
			className: "hc:flex hc:items-center hc:justify-between hc:min-h-[1.875em]",
			children: [/* @__PURE__ */ b("h3", {
				className: "hc:font-semibold",
				children: e
			}), /* @__PURE__ */ b("div", {
				className: "hc:flex hc:items-center hc:gap-[.25em]",
				children: t
			})]
		}), n]
	});
}
function K({ label: e, value: t, onChange: n, max: r = 1, allowOverMax: i }) {
	let a = t > r + 1e-9;
	return /* @__PURE__ */ x("div", {
		className: "hc:flex hc:flex-col hc:gap-[.25em]",
		children: [/* @__PURE__ */ b("span", {
			className: N(a && "huet-text-red-100"),
			children: e
		}), /* @__PURE__ */ x("div", {
			className: "hc:flex hc:items-center hc:gap-[.75em]",
			children: [/* @__PURE__ */ b(P, {
				label: e,
				min: 0,
				max: r * 100,
				value: Math.min(t, r) * 100,
				onValueChange: (e) => n(e / 100),
				invalid: a
			}), /* @__PURE__ */ b(Le, {
				label: e,
				min: 0,
				max: r * 100,
				suffix: "%",
				value: Math.round(t * 100),
				onValueChange: (e) => n(Math.max(0, e) / 100),
				allowOutOfRange: i,
				invalid: a
			})]
		})]
	});
}
function at({ theme: e, edit: t }) {
	let n = e.colorModel ?? "oklab", r = e.contrast ?? 1, i = Number(n !== rt) + Number(r !== 1);
	return /* @__PURE__ */ x(et, {
		label: "Blending and contrast",
		title: "Blending and contrast",
		changed: i,
		children: [
			/* @__PURE__ */ x("div", {
				className: "hc:flex hc:flex-col hc:gap-[.25em]",
				children: [/* @__PURE__ */ b("span", { children: "Blend base colors in" }), /* @__PURE__ */ b(tt, {
					label: "Blend base colors in",
					value: n,
					onValueChange: (e) => t({ colorModel: e }),
					options: p,
					describe: (e) => e === rt ? "recommended" : void 0
				})]
			}),
			/* @__PURE__ */ b(K, {
				label: "Contrast",
				value: r,
				onChange: (e) => t({ contrast: e === 1 ? void 0 : e }),
				allowOverMax: !0
			}),
			r > 1 && /* @__PURE__ */ b("p", {
				className: "huet-text-red-100 hc:text-[.875em]",
				children: "Above 100%, contrast amounts reach full strength sooner, which can look harsh."
			}),
			i > 0 && /* @__PURE__ */ b(V, {
				variant: "outline",
				size: "sm",
				onClick: () => t({
					colorModel: rt,
					contrast: void 0
				}),
				children: "Reset to defaults"
			})
		]
	});
}
function ot({ theme: e, edit: t }) {
	let n = e.signalLightness ?? it;
	return /* @__PURE__ */ x(et, {
		label: "Signal lightness",
		title: "Signal lightness",
		children: [
			/* @__PURE__ */ b("p", {
				className: "huet-text-60 hc:text-[.875em]",
				children: "Where classes such as huet-text-red-100 land on each hue’s dark → hue → light ramp."
			}),
			/* @__PURE__ */ b(K, {
				label: "On light backgrounds",
				value: n.onLight,
				onChange: (e) => t({ signalLightness: {
					...n,
					onLight: e
				} })
			}),
			/* @__PURE__ */ b(K, {
				label: "On dark backgrounds",
				value: n.onDark,
				onChange: (e) => t({ signalLightness: {
					...n,
					onDark: e
				} })
			})
		]
	});
}
function st({ label: e, value: t, onChange: n }) {
	let r = {
		strength: 1,
		tint: 1,
		...t
	}, i = r.strength > 0, a = Number(r.tint !== 1) + Number(i && r.strength !== 1);
	return /* @__PURE__ */ b(nt, {
		label: e,
		checked: i,
		onCheckedChange: (e) => n({
			...r,
			strength: +!!e
		}),
		children: i && /* @__PURE__ */ x(et, {
			label: `${e} settings`,
			title: e,
			changed: a,
			children: [/* @__PURE__ */ b(K, {
				label: "Tint",
				value: r.tint,
				onChange: (e) => n({
					...r,
					tint: e
				})
			}), /* @__PURE__ */ b(K, {
				label: "Strength",
				value: r.strength,
				onChange: (e) => n({
					...r,
					strength: e
				})
			})]
		})
	});
}
function ct() {
	let { theme: e, setTheme: t, background: n, setBackground: r } = j(), i = (n) => {
		let r = {
			...e,
			...n
		};
		for (let e of Object.keys(n)) r[e] === void 0 && delete r[e];
		t(r);
	}, [a, o] = u();
	return /* @__PURE__ */ x("div", {
		className: "hc:flex hc:flex-col hc:pb-[.5em]",
		children: [
			/* @__PURE__ */ b($e, {}),
			r && /* @__PURE__ */ b(G, {
				title: "Background",
				actions: /* @__PURE__ */ x("span", {
					className: "huet-text-60 hc:tabular-nums",
					children: [Math.round(n * 100), "%"]
				}),
				children: /* @__PURE__ */ b(xe, {
					theme: e,
					background: n,
					onChange: r
				})
			}),
			/* @__PURE__ */ x(G, {
				title: "Base colors",
				actions: /* @__PURE__ */ b(at, {
					theme: e,
					edit: i
				}),
				children: [/* @__PURE__ */ b(Fe, {
					colors: e.neutral,
					colorModel: e.colorModel,
					onChange: (t) => {
						try {
							f({
								...e,
								neutral: t
							});
						} catch {
							o(e.neutral);
							return;
						}
						o(void 0), i({ neutral: t });
					}
				}), a === e.neutral && /* @__PURE__ */ b("p", {
					role: "alert",
					className: "huet-text-red-100",
					children: "The lightest color has to be lighter than the darkest."
				})]
			}),
			/* @__PURE__ */ b(G, {
				title: "Hues",
				actions: /* @__PURE__ */ b(ot, {
					theme: e,
					edit: i
				}),
				children: /* @__PURE__ */ b(Ve, {
					theme: e,
					onChange: (e) => i({ colors: e })
				})
			}),
			/* @__PURE__ */ b(G, {
				title: "Images",
				children: /* @__PURE__ */ x("div", {
					className: "hc:flex hc:flex-col hc:gap-[.25em]",
					children: [/* @__PURE__ */ b(st, {
						label: "Theme images",
						value: e.images,
						onChange: (e) => i({ images: e })
					}), /* @__PURE__ */ b(st, {
						label: "Theme SVGs",
						value: e.svgs,
						onChange: (e) => i({ svgs: e })
					})]
				})
			})
		]
	});
}
// src/private/persistentState.ts
var q = "huet:", lt = "useBrowserState_huet_", ut = [
	"themer:showHelp",
	"theme",
	"themes"
], dt = 500, ft = (e) => typeof e == "boolean" ? e : void 0, pt = (e) => typeof e == "string" ? e : void 0;
function mt(e) {
	return (t) => e.includes(t) ? t : void 0;
}
function J() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function ht(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) {
		let r = e.key(n);
		r !== null && t.push(r);
	}
	return t;
}
function gt(e, t, n) {
	if (Y.has(e)) return n(Y.get(e)) ?? t;
	let r = J();
	if (!r) return t;
	try {
		let i = r.getItem(q + e);
		if (i === null) return t;
		let a = n(JSON.parse(i));
		if (a !== void 0) return a;
	} catch {}
	console.warn(`Huet: discarding invalid saved value for "${e}"`);
	try {
		r.removeItem(q + e);
	} catch {}
	return t;
}
var Y = /* @__PURE__ */ new Map(), _t = /* @__PURE__ */ new Set(), X;
function vt() {
	for (let e of _t) e();
}
function yt(e, t) {
	Y.set(e, t), clearTimeout(X), X = setTimeout(bt, dt), vt();
}
function bt() {
	if (clearTimeout(X), X = void 0, Y.size === 0) return;
	let e = J();
	for (let [t, n] of Y) try {
		e?.setItem(q + t, JSON.stringify(n));
	} catch (e) {
		console.warn(`Huet: couldn't save "${t}"`, e);
	}
	Y.clear(), vt();
}
function xt() {
	clearTimeout(X), X = void 0, Y.clear(), vt();
	let e = J();
	if (e) for (let t of ht(e)) (t.startsWith(q) || t.startsWith(lt)) && e.removeItem(t);
}
function St() {
	xt(), window.location.reload();
}
function Ct() {
	let e = J();
	if (e) try {
		for (let t of ht(e)) t.startsWith(lt) && e.removeItem(t);
		for (let t of ut) e.removeItem(q + t);
	} catch {}
}
typeof window < "u" && (Ct(), window.addEventListener("pagehide", bt), document.addEventListener("visibilitychange", () => {
	document.visibilityState === "hidden" && bt();
}));
function wt(e) {
	return _t.add(e), () => {
		_t.delete(e);
	};
}
function Tt() {
	return d(wt, () => Y.size > 0, () => !1);
}
function Z(e, t, n) {
	let [i, o] = u(() => gt(e, t, n)), s = l(i);
	s.current = i;
	let c = l(!1), d = l(void 0), f = l(void 0);
	return a(() => {
		c.current && i !== d.current?.value && (f.current = { raw: i }, d.current = void 0, yt(e, i));
	}, [e, i]), a(() => wt(() => {
		if (!Y.has(e)) return;
		let t = Y.get(e);
		if (t === s.current || t === f.current?.raw || t === d.current?.raw) return;
		let r = n(t);
		r !== void 0 && (f.current = void 0, d.current = {
			raw: t,
			value: r
		}, o(r));
	}), [e, n]), [i, r((e) => {
		c.current = !0, o(e);
	}, [])];
}
// src/private/Tabs.tsx
var Q = {
	THEMES: "THEMES",
	EDIT_THEME: "EDIT_THEME"
}, Et = mt(Object.values(Q)), Dt = [{
	tab: Q.THEMES,
	label: "Themes"
}, {
	tab: Q.EDIT_THEME,
	label: "Edit Theme"
}], Ot = "hc:[--tab-surface:var(--huet-background)] hc:[--tab-text:var(--huet-foreground)]";
function kt({ currentTab: e, onTabChange: t, className: n, children: r }) {
	return /* @__PURE__ */ x(A.Root, {
		value: e,
		onValueChange: (e) => t(e),
		className: N("hc:flex hc:flex-col hc:flex-auto hc:min-w-0 hc:min-h-0", Ot, n),
		children: [/* @__PURE__ */ b("div", {
			className: "huet-border-10 hc:shrink-0 hc:px-[.75em] hc:py-[.625em] hc:border-b",
			children: /* @__PURE__ */ x(A.List, {
				className: "huet-bg-10 hc:relative hc:z-0 hc:flex hc:p-[.1875em] hc:rounded-lg",
				children: [Dt.map(({ tab: t, label: n }) => /* @__PURE__ */ b(A.Tab, {
					value: t,
					className: N("hc:flex hc:grow hc:basis-0 hc:items-center hc:justify-center hc:h-[2em] hc:px-[.75em] hc:rounded-md", "hc:font-medium hc:whitespace-nowrap hc:cursor-pointer hc:select-none", e === t ? "hc:text-(--tab-text)" : "huet-text-70 hc:hover:opacity-80"),
					children: n
				}, t)), /* @__PURE__ */ b(A.Indicator, { className: N("hc:absolute hc:top-0 hc:left-0 hc:-z-1 hc:rounded-md hc:bg-(--tab-surface)", "hc:w-(--active-tab-width) hc:h-(--active-tab-height) hc:translate-x-(--active-tab-left) hc:translate-y-(--active-tab-top)", "hc:transition-[translate,width] hc:duration-200 hc:ease-out", "hc:shadow-[0_1px_3px_color-mix(in_srgb,var(--tab-text)_calc(18%*var(--huet-configurator-contrast,1)),transparent)]") })]
			})
		}), r]
	});
}
function $({ tab: e, className: t, children: n }) {
	return /* @__PURE__ */ b(A.Panel, {
		value: e,
		className: t,
		children: n
	});
}
// src/private/HuetLogo.tsx
function At({ className: e }) {
	return /* @__PURE__ */ b("svg", {
		className: e,
		viewBox: "0 0 2000 2000",
		fill: "currentColor",
		"aria-hidden": "true",
		children: /* @__PURE__ */ b("path", { d: "M318.69 0C335.904 26.5094 354.963 53.6545 376.041 81.6494C406.318 121.861 445.764 164.12 489.449 207.412C424.268 321.409 304.798 537.625 242.982 694.983C177.763 861.005 158.731 1031.39 179.104 1178.52C199.476 1325.64 253.805 1459.39 376.041 1621.74C464.192 1738.81 630.062 1873.24 752.005 2000H0V0H318.69ZM1079.82 1524.13C1303.07 1524.13 1424.43 1601.78 1507.45 1661.95C1604.74 1732.46 1714.6 1853.99 1763.07 2000H1079.82V1524.13ZM2000 2000H1841.64C1812.22 1891.56 1758.59 1784.97 1665.97 1661.95C1543.73 1499.6 1272.05 1303.89 1175.28 1141.54C1084.56 989.344 1080.04 723.786 1079.83 691.187L1079.82 687.875L1079.82 0H1588.83C1683.26 92.4031 1770.61 224.904 1785.96 374.222C1805.7 566.316 1789.81 693.249 1726.72 895.768C1680.88 1042.89 1582.49 1262.78 1582.49 1262.78L1507.45 1422.94C1507.45 1422.94 1711.3 1081.07 1799.03 857.756C1864.24 691.735 1883.28 521.348 1862.9 374.222C1845.49 248.445 1803.25 132.448 1714.99 0H2000V2000ZM495.427 213.317C627.247 343.116 795.011 481.749 866.724 602.057C957.445 754.256 961.966 1019.81 962.177 1052.41L962.186 1055.72V1759.55C738.941 1759.55 617.58 1681.91 534.555 1621.74C414.709 1534.88 275.797 1370.61 256.05 1178.52C236.303 986.423 252.195 859.49 315.292 656.972C361.111 509.91 459.436 290.145 459.521 289.955L495.427 213.317ZM962.186 219.469C738.941 219.469 617.58 141.823 534.555 81.6494C503.695 59.2833 471.57 31.7846 440.542 0H962.186V219.469Z" })
	});
}
// src/private/ThemerShell.tsx
function jt() {
	let e = Tt();
	return /* @__PURE__ */ b("span", {
		className: N("huet-bg-green-20 huet-bg/text-green-100 hc:inline hc:rounded-lg hc:px-2 hc:font-normal", "hc:transition-opacity hc:duration-400 hc:ease-[ease]", e ? "hc:opacity-0" : "hc:opacity-100"),
		children: "Saved"
	});
}
function Mt({ isExpanded: e, onClick: t }) {
	return /* @__PURE__ */ x("button", {
		onClick: t,
		"aria-expanded": e,
		title: e ? "Collapse" : "Expand",
		className: "huet-bg-100 hc:w-full hc:flex hc:justify-between hc:shrink-0 hc:select-none",
		children: [/* @__PURE__ */ x("span", {
			className: "hc:py-2 hc:px-2 hc:font-bold hc:flex hc:items-center hc:gap-1.5",
			children: [
				/* @__PURE__ */ b(At, { className: "hc:size-[1.25em] hc:shrink-0" }),
				"Huet Theme Configurator ",
				e && /* @__PURE__ */ b(jt, {})
			]
		}), /* @__PURE__ */ b("span", {
			className: "huet-bg-20 hc:flex hc:justify-center hc:items-center hc:px-4 hc:font-bold",
			children: e ? "↓" : "↑"
		})]
	});
}
var Nt = N("huet-outline-20 hc:fixed hc:right-[1em] hc:bottom-[1em] hc:z-[999]", "hc:font-ui hc:text-[.8125rem] hc:outline", "hc:transition-[opacity,translate,height] hc:duration-200 hc:ease-[ease-out]"), Pt = {
	expanded: "hc:shadow-[0_5px_30px_color-mix(in_srgb,var(--huet-foreground)_calc(12.5%*var(--huet-configurator-contrast,1)),transparent)]",
	collapsed: "hc:shadow-[0_5px_30px_color-mix(in_srgb,var(--huet-relative-text)_calc(12.5%*var(--huet-configurator-contrast,1)),transparent)]"
};
function Ft({ children: e }) {
	let [t, n] = Z("themer:isExpanded", !0, ft), [r, i] = u(!1);
	return a(() => i(!0), []), t ? /* @__PURE__ */ x("div", {
		className: N(Nt, "huet-bg-0", Pt.expanded, "hc:flex hc:flex-col hc:h-[min(64em,100vh-2em)]", r ? "hc:translate-y-0 hc:opacity-100" : "hc:translate-y-[2em] hc:opacity-0"),
		children: [/* @__PURE__ */ b(Mt, {
			isExpanded: !0,
			onClick: () => n((e) => !e)
		}), e]
	}) : /* @__PURE__ */ b("div", {
		className: N(Nt, "huet-text-100", Pt.collapsed),
		children: /* @__PURE__ */ b(Mt, { onClick: () => n((e) => !e) })
	});
}
// src/private/AllExceptFirst.tsx
var It = {
	1: "hc:ml-1",
	2: "hc:ml-2",
	3: "hc:ml-4"
}, Lt = {
	1: "hc:mt-1",
	2: "hc:mt-2",
	3: "hc:mt-4"
};
function Rt({ exceptFirst: e, each: n, children: r }) {
	return t.Children.map(r, (t, r) => /* @__PURE__ */ b("div", {
		className: N(r > 0 && e, n) || void 0,
		children: t
	}));
}
function zt({ size: e = 1, growEach: t, children: n, className: r }) {
	return /* @__PURE__ */ b("div", {
		className: N("hc:flex hc:flex-row", r),
		children: /* @__PURE__ */ b(Rt, {
			each: t ? "hc:grow" : void 0,
			exceptFirst: It[e],
			children: n
		})
	});
}
function Bt({ size: e = 1, children: t, className: n }) {
	return /* @__PURE__ */ b("div", {
		className: N("hc:flex hc:flex-col", n),
		children: /* @__PURE__ */ b(Rt, {
			exceptFirst: Lt[e],
			children: t
		})
	});
}
// src/private/Arrow.tsx
var Vt = {
	".5em": "hc:border-x-[.5em] hc:border-b-[.5em]",
	".75em": "hc:border-x-[.75em] hc:border-b-[.75em]"
};
function Ht({ size: e, className: t, style: n }) {
	return /* @__PURE__ */ b("span", {
		className: N("hc:inline-block hc:w-0 hc:h-0 hc:border-x-transparent hc:border-b-current", Vt[e], t),
		style: n
	});
}
// src/private/Themes.tsx
var Ut = [
	"gray",
	"red",
	"yellow",
	"green",
	"blue",
	"purple"
];
function Wt({ preview: e, shadowAlpha: t, isSelected: n, children: r, onClick: i }) {
	let { root: a, step: o } = e, s = "hc:w-full hc:h-full hc:border hc:rounded-sm hc:relative hc:overflow-hidden", c = {
		backgroundColor: a.hex,
		color: o(a, 100).hex,
		borderColor: o(a, n ? 100 : 12).hex,
		boxShadow: `0 2px 10px ${C(o(a, 100).hex).alpha(t).hex()}`
	};
	return /* @__PURE__ */ b("div", {
		className: "hc:flex hc:relative hc:basis-[20em] hc:shrink-0",
		children: n ? /* @__PURE__ */ x("div", {
			className: s,
			style: c,
			children: [r, /* @__PURE__ */ b(Ht, {
				size: ".75em",
				className: "hc:absolute hc:bottom-0 hc:left-1/2 hc:-translate-x-1/2"
			})]
		}) : /* @__PURE__ */ b("button", {
			onClick: i,
			className: s,
			style: c,
			children: /* @__PURE__ */ b("div", {
				className: "hc:h-full",
				children: r
			})
		})
	});
}
function Gt(e) {
	return e.length ? `linear-gradient(to right, ${e.map((t, n) => `${t} ${n / e.length * 100}% ${(n + 1) / e.length * 100}%`).join(", ")})` : "none";
}
function Kt({ theme: e }) {
	let t = [...e.neutral, ...Object.values(e.colors ?? {})];
	return /* @__PURE__ */ b("div", {
		"aria-hidden": "true",
		className: "hc:h-[.5em]",
		style: { background: Gt(t) }
	});
}
function qt({ children: e }) {
	return /* @__PURE__ */ b("h3", {
		className: "hc:mx-2 hc:py-2 hc:flex hc:items-center hc:justify-between",
		children: e
	});
}
function Jt({ preview: e, bg: t }) {
	return /* @__PURE__ */ b("div", {
		className: "hc:-mt-2 hc:h-2",
		style: { background: `linear-gradient(${t.hex}, ${e.step(t, 12).hex})` }
	});
}
function Yt({ preview: e, bg: t }) {
	return Ut.map((n) => /* @__PURE__ */ b("div", {
		"aria-hidden": "true",
		className: N("hc:mt-px", n === "gray" ? "hc:h-6" : "hc:h-2"),
		style: { background: Gt([
			100,
			75,
			50,
			25
		].map((r) => e.step(t, r, n).hex)) }
	}, n));
}
function Xt({ children: e }) {
	return /* @__PURE__ */ b("div", {
		className: "hc:flex",
		children: /* @__PURE__ */ b("div", {
			className: "hc:p-2 hc:w-full hc:flex hc:flex-col",
			children: e
		})
	});
}
function Zt({ name: e, theme: t, isSelected: n, onClick: r }) {
	let { background: i, editedFrom: a, reset: s, list: c, themes: u } = j(), d = r === void 0 && !(e in u), f = c && n && !d && Object.keys(u).length > 1, p = _(t, { background: i }), m = l(null);
	return o(() => {
		n && m.current && m.current.scrollIntoView({ block: "center" });
	}, []), /* @__PURE__ */ b("div", {
		ref: m,
		children: /* @__PURE__ */ x(Wt, {
			preview: p,
			shadowAlpha: .2 * (t.contrast ?? 1),
			isSelected: n,
			onClick: r,
			children: [
				/* @__PURE__ */ b(Kt, { theme: t }),
				/* @__PURE__ */ x(qt, { children: [e, /* @__PURE__ */ x("span", {
					className: "hc:flex hc:gap-[.75em]",
					children: [
						d && c && /* @__PURE__ */ b(qe, {
							onClick: c.saveAsNew,
							children: "Save as new"
						}),
						d && a !== void 0 && /* @__PURE__ */ x(qe, {
							verify: `Discard your edits and go back to ${a}?`,
							onClick: s,
							children: ["Reset to ", a]
						}),
						f && /* @__PURE__ */ b(qe, {
							verify: `Remove ${e}?`,
							onClick: () => c.remove(e),
							children: "Remove"
						})
					]
				})] }),
				/* @__PURE__ */ b(Jt, {
					preview: p,
					bg: p.root
				}),
				/* @__PURE__ */ b(Xt, { children: /* @__PURE__ */ b(Yt, {
					preview: p,
					bg: p.root
				}) })
			]
		})
	});
}
function Qt({ onCreate: t }) {
	let { theme: n, setTheme: r, themes: i, name: a, list: o } = j(), s = Object.entries(i);
	return /* @__PURE__ */ x(Bt, {
		size: 3,
		className: "hc:p-4",
		children: [
			o && /* @__PURE__ */ x(V, {
				variant: "outline",
				className: "hc:w-full hc:border-dashed",
				onClick: () => {
					o.create(), t?.();
				},
				children: [/* @__PURE__ */ b(T, {
					size: "1em",
					stroke: 2
				}), "New theme"]
			}),
			a === void 0 && /* @__PURE__ */ b(Zt, {
				name: "Custom",
				theme: n,
				isSelected: !0
			}),
			s.map(([t, i]) => {
				let a = e(i, n);
				return /* @__PURE__ */ b(Zt, {
					name: t,
					theme: i,
					isSelected: a,
					onClick: () => r(i)
				}, t);
			})
		]
	});
}
// src/Themer.tsx
function $t({ children: e }) {
	return /* @__PURE__ */ b("div", {
		className: "hc:overflow-y-scroll hc:overflow-x-hidden hc:w-[30em] hc:overscroll-contain hc:flex-auto hc:min-w-0 hc:min-h-0",
		children: e
	});
}
function en() {
	let { theme: e, background: t } = j(), [n, r] = Z("themer:shouldThemeSelf", !0, ft), [i, a] = Z("themer:currentTab", Q.THEMES, Et);
	return /* @__PURE__ */ b(ve, {
		theme: n ? e : g.Base,
		background: t,
		children: /* @__PURE__ */ b(Ft, { children: /* @__PURE__ */ x("div", {
			className: "hc:flex hc:flex-col hc:flex-auto hc:min-w-0 hc:min-h-0 hc:overflow-hidden",
			children: [/* @__PURE__ */ b(kt, {
				currentTab: i,
				onTabChange: a,
				children: /* @__PURE__ */ x($t, { children: [/* @__PURE__ */ b($, {
					tab: Q.THEMES,
					children: /* @__PURE__ */ b(Qt, { onCreate: () => a(Q.EDIT_THEME) })
				}), /* @__PURE__ */ b($, {
					tab: Q.EDIT_THEME,
					children: /* @__PURE__ */ b(ct, {})
				})] })
			}), /* @__PURE__ */ b("div", {
				className: "huet-bg-5 huet-border-10 hc:border-t hc:px-[1.25em] hc:py-[.5em]",
				children: /* @__PURE__ */ b(nt, {
					label: "Theme the themer",
					checked: n,
					onCheckedChange: r
				})
			})]
		}) })
	});
}
// src/private/ErrorBoundary.tsx
var tn = class extends t.Component {
	constructor(...e) {
		super(...e), this.state = { hasError: !1 };
	}
	static getDerivedStateFromError() {
		return { hasError: !0 };
	}
	componentDidCatch(e, t) {
		console.error(e, t);
	}
	render() {
		return this.state.hasError ? /* @__PURE__ */ x("div", {
			style: {
				fontFamily: "sans-serif",
				textAlign: "center",
				padding: "1em",
				background: "white",
				color: "black"
			},
			children: [/* @__PURE__ */ x("h1", {
				style: {
					color: "red",
					fontSize: "1em",
					margin: "0"
				},
				children: [this.props.componentName && this.props.componentName + ": ", "Something went wrong"]
			}), /* @__PURE__ */ x("p", {
				style: { margin: ".5em 0" },
				children: [
					"Try clearing local storage:",
					" ",
					/* @__PURE__ */ b("button", {
						onClick: St,
						children: "Reset this Page"
					})
				]
			})]
		}) : this.props.children;
	}
};
// src/ThemeConfigurator.tsx
function nn(e, t) {
	let n = t;
	for (let r = 2; n in e; r++) n = `${t} ${r}`;
	return n;
}
function rn({ value: t, onChange: n, themes: r = g, onThemesChange: i, background: o = 1, onBackgroundChange: c, children: u }) {
	let d = l(n);
	d.current = n;
	let f = l({
		onThemesChange: i,
		onBackgroundChange: c
	});
	f.current = {
		onThemesChange: i,
		onBackgroundChange: c
	};
	let p = i !== void 0, m = c !== void 0, h = s(() => Object.entries(r).find(([, n]) => e(n, t))?.[0], [r, t]), [v, y] = Z("themer:editedFrom", "", pt);
	a(() => {
		h !== void 0 && y(h);
	}, [h, y]);
	let x = h === void 0 && v in r ? v : void 0, S = s(() => ({
		theme: t,
		resolved: _(t, { background: o }),
		setTheme: (e) => d.current(e),
		themes: r,
		background: o,
		name: h,
		editedFrom: x,
		reset: () => {
			x !== void 0 && d.current(r[x]);
		},
		setBackground: m ? (e) => f.current.onBackgroundChange?.(e) : void 0,
		list: p ? {
			saveAsNew: () => {
				let e = nn(r, `${x ?? "Custom"} Copy`);
				f.current.onThemesChange?.({
					[e]: t,
					...r
				}), y(e);
			},
			create: () => {
				let e = nn(r, "New Theme");
				f.current.onThemesChange?.({
					[e]: t,
					...r
				}), y(e);
			},
			update: (e, t) => {
				f.current.onThemesChange?.({
					...r,
					[e]: t
				}), y(e);
			},
			remove: (e) => {
				let { [e]: t, ...n } = r;
				f.current.onThemesChange?.(n);
				let [i] = Object.values(n);
				e === h && i && d.current(i);
			},
			rename: (e, t) => {
				!t || t === e || t in r || (f.current.onThemesChange?.(Object.fromEntries(Object.entries(r).map(([n, r]) => [n === e ? t : n, r]))), y(t));
			},
			add: (e, t) => {
				let n = nn(r, e);
				f.current.onThemesChange?.({
					[n]: t,
					...r
				}), d.current(t);
			}
		} : void 0
	}), [
		t,
		r,
		o,
		h,
		x,
		p,
		m,
		y
	]);
	return /* @__PURE__ */ b(pe.Provider, {
		value: S,
		children: u
	});
}
function an(e) {
	return /* @__PURE__ */ b(tn, {
		componentName: "Theme Configurator",
		children: /* @__PURE__ */ b(rn, {
			...e,
			children: /* @__PURE__ */ b(en, {})
		})
	});
}
// src/private/ThemeMiniMap.tsx
var on = [
	100,
	87.5,
	75,
	62.5,
	50,
	37.5,
	25,
	12.5,
	0
], sn = [
	"red",
	"yellow",
	"green",
	"blue",
	"purple"
];
function cn(e, t) {
	let n = (e) => C(e).get("lab.l");
	return sn.map((r) => {
		let i = e.step(t, 100, r).hex;
		return {
			hue: r,
			color: i,
			distance: Math.abs(n(i) - n(t.hex))
		};
	}).sort((e, t) => t.distance - e.distance);
}
function ln(e, t) {
	return `linear-gradient(to right, ${on.map((n) => e.step(t, n).hex).join(", ")})`;
}
function un({ theme: e, bg: t }) {
	return /* @__PURE__ */ x("span", {
		"aria-hidden": !0,
		className: "hc:flex hc:flex-col hc:gap-[.25em] hc:shrink-0",
		children: [/* @__PURE__ */ b("span", {
			className: "hc:flex hc:gap-[.25em]",
			children: cn(e, t).map(({ hue: e, color: t }) => /* @__PURE__ */ b("span", {
				title: e,
				className: "hc:size-[.625em] hc:rounded-full",
				style: { backgroundColor: t }
			}, e))
		}), /* @__PURE__ */ b("span", {
			className: "hc:h-[.375em] hc:rounded-full",
			style: { backgroundImage: ln(e, t) }
		})]
	});
}
// src/EmbeddedThemeConfigurator.tsx
var dn = "hc:not-focus-visible:shadow-none!";
function fn({ name: e, theme: t, isSelected: n, isEdited: r, onSelect: i }) {
	let { background: a } = j(), o = _(t, { background: a }), { root: s, step: c } = o, l = c(s, 100), u = n ? l.hex : c(s, 15).hex, d = n ? l.hex : c(s, 40).hex;
	return /* @__PURE__ */ x("button", {
		type: "button",
		"aria-pressed": n,
		onClick: i,
		className: N("hc:flex hc:items-center hc:gap-[.75em] hc:w-full hc:py-[.5em] hc:px-[.625em]", "hc:rounded-md hc:border hc:cursor-pointer hc:text-left", dn, "hc:border-(color:--item-border) hc:hover:border-(color:--item-border-hover)"),
		style: {
			backgroundColor: s.hex,
			color: l.hex,
			"--item-border": u,
			"--item-border-hover": d
		},
		children: [
			/* @__PURE__ */ b(un, {
				theme: o,
				bg: s
			}),
			/* @__PURE__ */ b("span", {
				className: "hc:grow",
				children: e
			}),
			r && /* @__PURE__ */ b("span", {
				className: "hc:opacity-70",
				children: "Edited"
			}),
			/* @__PURE__ */ b(w, {
				size: "1em",
				stroke: 2.5,
				className: N("hc:shrink-0", !n && "hc:invisible")
			})
		]
	});
}
function pn({ onCreate: e }) {
	let { theme: t, setTheme: n, themes: r, name: i, editedFrom: a, reset: o, list: s } = j(), c = i !== void 0, l = s && c && Object.keys(r).length > 1;
	return /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ x("div", {
		className: "hc:flex hc:flex-col hc:gap-[.375em] hc:p-2 hc:flex-auto hc:min-h-0 hc:overflow-y-auto hc:overscroll-contain",
		children: [
			!c && /* @__PURE__ */ b(fn, {
				name: a ?? "Custom",
				theme: t,
				isSelected: !0,
				isEdited: !0,
				onSelect: () => {}
			}),
			Object.entries(r).map(([e, t]) => {
				let r = e === i;
				return !c && e === a ? null : /* @__PURE__ */ b(fn, {
					name: e,
					theme: t,
					isSelected: r,
					onSelect: () => !r && n(t)
				}, e);
			}),
			s && /* @__PURE__ */ x("button", {
				type: "button",
				onClick: () => {
					s.create(), e();
				},
				className: N("huet-border-30 hc:flex hc:items-center hc:justify-center hc:gap-[.5em] hc:w-full hc:py-[.625em]", "hc:rounded-md hc:border hc:border-dashed hc:cursor-pointer hc:tint-hover huet-text-70", dn),
				children: [/* @__PURE__ */ b(T, {
					size: "1em",
					stroke: 2
				}), "New theme"]
			})
		]
	}), /* @__PURE__ */ b(zt, {
		growEach: !0,
		className: "hc:p-2 hc:border-t",
		children: [
			/* @__PURE__ */ b(Ge, {
				onUpload: (e, t) => s ? s.add(t, e) : n(e),
				children: "Import"
			}, "import"),
			!c && s && /* @__PURE__ */ b(U, {
				onClick: s.saveAsNew,
				children: "Save as New"
			}, "save"),
			a !== void 0 && /* @__PURE__ */ b(U, {
				verify: `Discard your edits and go back to ${a}?`,
				onClick: o,
				children: "Reset"
			}, "reset"),
			l && /* @__PURE__ */ b(U, {
				verify: `Remove ${i}?`,
				onClick: () => s.remove(i),
				children: "Remove"
			}, "remove")
		].filter(Boolean)
	})] });
}
function mn({ shouldThemeSelf: e, onShouldThemeSelfChange: t }) {
	let [n, r] = Z("embedded:currentTab", Q.THEMES, Et);
	return /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ x(kt, {
		currentTab: n,
		onTabChange: r,
		children: [/* @__PURE__ */ b($, {
			tab: Q.THEMES,
			className: "hc:flex hc:flex-col hc:flex-auto hc:min-h-0",
			children: /* @__PURE__ */ b(pn, { onCreate: () => r(Q.EDIT_THEME) })
		}), /* @__PURE__ */ b($, {
			tab: Q.EDIT_THEME,
			className: "hc:flex-auto hc:min-h-0 hc:overflow-y-auto hc:overscroll-contain",
			children: /* @__PURE__ */ b(ct, {})
		})]
	}), /* @__PURE__ */ b("div", {
		className: "huet-bg-5 huet-border-10 hc:border-t hc:px-[1.25em] hc:py-[.5em]",
		children: /* @__PURE__ */ b(nt, {
			label: "Theme the themer",
			checked: e,
			onCheckedChange: t
		})
	})] });
}
function hn({ children: e }) {
	let t = M();
	return /* @__PURE__ */ b(O.Portal, {
		container: t,
		children: e
	});
}
function gn({ mode: e = "contrast", side: t = "bottom", align: n = "end", style: r }) {
	let { theme: i, resolved: a, background: s, name: c = "Custom" } = j(), [l, d] = u(!1), [f, p] = Z("themer:shouldThemeSelf", !0, ft);
	o(_e, []);
	let { root: m, step: h } = a, _ = h(m, 100), v = e === "contrast" ? _ : m, y = {
		color: h(v, 100).hex,
		borderColor: e === "outlined" || e === "blended" && l ? _.hex : "transparent",
		"--trigger-bg": e === "contrast" ? v.hex : "transparent",
		"--trigger-hover": e === "contrast" ? h(v, 6).hex : `color-mix(in srgb, ${_.hex} 8%, transparent)`
	};
	return /* @__PURE__ */ x(O.Root, {
		open: l,
		onOpenChange: d,
		children: [/* @__PURE__ */ b("span", {
			"data-huet-configurator": "",
			style: {
				fontSize: "inherit",
				...r
			},
			children: /* @__PURE__ */ x(O.Trigger, {
				"aria-label": `Theme: ${c}`,
				title: c,
				className: N("hc:inline-flex hc:items-center hc:gap-[.5em] hc:py-[.375em] hc:pl-[.5em] hc:pr-[.375em]", "hc:rounded-md hc:border hc:cursor-pointer", dn, "hc:bg-(--trigger-bg) hc:hover:bg-(--trigger-hover)"),
				style: y,
				children: [/* @__PURE__ */ b(un, {
					theme: a,
					bg: v
				}), /* @__PURE__ */ b(ee, {
					size: "1em",
					stroke: 2,
					className: N("hc:shrink-0 hc:transition-transform hc:duration-150", l && "hc:rotate-180")
				})]
			})
		}), /* @__PURE__ */ b(ve, {
			theme: f ? i : g.Base,
			background: s,
			children: /* @__PURE__ */ b(hn, { children: /* @__PURE__ */ b(O.Positioner, {
				side: t,
				align: n,
				sideOffset: 6,
				collisionPadding: 8,
				className: "hc:z-[1000]",
				children: /* @__PURE__ */ b(O.Popup, {
					"aria-label": "Theme Configurator",
					className: N("huet-bg-0 huet-border-100 hc:border hc:rounded-lg hc:outline-none hc:font-ui hc:text-[.875rem]", "hc:shadow-[0_6px_24px_color-mix(in_srgb,var(--huet-foreground)_calc(16%*var(--huet-configurator-contrast,1)),transparent)]", "hc:overflow-hidden hc:flex hc:flex-col hc:w-[30em] hc:max-w-(--available-width)", "hc:h-[min(52em,var(--available-height))]"),
					children: /* @__PURE__ */ b(mn, {
						shouldThemeSelf: f,
						onShouldThemeSelfChange: p
					})
				})
			}) })
		})]
	});
}
function _n({ mode: e, side: t, align: n, style: r, ...i }) {
	return /* @__PURE__ */ b(tn, {
		componentName: "Embedded Theme Configurator",
		children: /* @__PURE__ */ b(rn, {
			...i,
			children: /* @__PURE__ */ b(gn, {
				mode: e,
				side: t,
				align: n,
				style: r
			})
		})
	});
}
export { _n as EmbeddedThemeConfigurator, an as ThemeConfigurator };

//# sourceMappingURL=index.js.map