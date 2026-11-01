import { isEqual as e } from "lodash-es";
import t, { useCallback as n, useContext as r, useEffect as i, useLayoutEffect as a, useMemo as o, useRef as s, useState as c, useSyncExternalStore as l } from "react";
import { checkTheme as u, colorModels as d, hues as f, mountTheme as p, themes as m } from "huet";
import { resolveTheme as h } from "huet/internal";
import { Fragment as g, jsx as _, jsxs as v } from "react/jsx-runtime";
import { createPortal as y } from "react-dom";
import b from "chroma-js";
import x from "file-saver";
import { IconCheck as S, IconChevronDown as C } from "@tabler/icons-react";
import * as w from "@radix-ui/react-popover";
// src/context.ts
var T = t.createContext(null);
function E() {
	let e = r(T);
	if (!e) throw Error("Only available inside ThemeConfigurator");
	return e;
}
// src/private/cx.ts
function D(...e) {
	return e.filter(Boolean).join(" ");
}
// src/private/AllExceptFirst.tsx
var ee = {
	1: "hc:ml-1",
	2: "hc:ml-2",
	3: "hc:ml-4"
}, te = {
	1: "hc:mt-1",
	2: "hc:mt-2",
	3: "hc:mt-4"
};
function ne({ exceptFirst: e, each: n, children: r }) {
	return t.Children.map(r, (t, r) => /* @__PURE__ */ _("div", {
		className: D(r > 0 && e, n) || void 0,
		children: t
	}));
}
function O({ size: e = 1, growEach: t, children: n, className: r }) {
	return /* @__PURE__ */ _("div", {
		className: D("hc:flex hc:flex-row", r),
		children: /* @__PURE__ */ _(ne, {
			each: t ? "hc:grow" : void 0,
			exceptFirst: ee[e],
			children: n
		})
	});
}
function k({ size: e = 1, children: t, className: n }) {
	return /* @__PURE__ */ _("div", {
		className: D("hc:flex hc:flex-col", n),
		children: /* @__PURE__ */ _(ne, {
			exceptFirst: te[e],
			children: t
		})
	});
}
// src/private/Checkbox.tsx
function A({ label: e, value: t, onChange: n, className: r }) {
	return /* @__PURE__ */ v("label", {
		className: D("huet-text-100 hc:inline-flex hc:relative hc:cursor-default", r),
		children: [
			/* @__PURE__ */ _("input", {
				"aria-label": e,
				type: "checkbox",
				checked: t,
				onChange: (e) => n?.(e.target.checked),
				className: "hc:absolute hc:top-0 hc:left-0 hc:w-full hc:h-full"
			}),
			/* @__PURE__ */ _("span", {
				className: "hc:mr-1 hc:text-[1.25em] hc:leading-none",
				children: t ? "☒" : "☐"
			}),
			/* @__PURE__ */ _("span", { children: e })
		]
	});
}
// src/configurator.css?inline
var re = "/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */\n@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-translate-x:0;--tw-translate-y:0;--tw-translate-z:0;--tw-border-style:solid;--tw-leading:initial;--tw-font-weight:initial;--tw-shadow:0 0 #0000;--tw-shadow-color:initial;--tw-shadow-alpha:100%;--tw-inset-shadow:0 0 #0000;--tw-inset-shadow-color:initial;--tw-inset-shadow-alpha:100%;--tw-ring-color:initial;--tw-ring-shadow:0 0 #0000;--tw-inset-ring-color:initial;--tw-inset-ring-shadow:0 0 #0000;--tw-ring-inset:initial;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-offset-shadow:0 0 #0000;--tw-outline-style:solid;--tw-duration:initial;--tw-ease:initial}}}:root,:host{--hc-spacing:.25rem;--hc-font-weight-normal:400;--hc-font-weight-bold:700;--hc-radius-xs:.125rem;--hc-radius-sm:.25rem;--hc-radius-md:.375rem;--hc-radius-lg:.5rem;--hc-default-transition-duration:.15s;--hc-default-transition-timing-function:cubic-bezier(.4, 0, .2, 1);--hc-font-ui:-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Roboto\", \"Oxygen\", \"Ubuntu\", \"Cantarell\", \"Fira Sans\", \"Droid Sans\", \"Helvetica Neue\", sans-serif}[data-huet-configurator]{all:initial}[data-huet-configurator] :where(:not(svg,svg *)){all:unset;box-sizing:border-box;display:block}[data-huet-configurator][data-huet-root]{background-color:var(--huet-background);color:var(--huet-foreground);scrollbar-color:var(--huet-border) transparent}[data-huet-configurator][data-huet-color-bg],[data-huet-configurator] [data-huet-color-bg]{background-color:var(--huet-background);color:var(--huet-foreground)}[data-huet-configurator][data-huet-color-text],[data-huet-configurator] [data-huet-color-text]{color:var(--huet-relative-text,var(--huet-foreground))}[data-huet-configurator][data-huet-color-border],[data-huet-configurator] [data-huet-color-border]{border-color:var(--huet-relative-border)}[data-huet-configurator][data-huet-color-outline],[data-huet-configurator] [data-huet-color-outline]{outline-color:var(--huet-relative-outline)}@media (forced-colors:active){[data-huet-configurator][data-huet-root],[data-huet-configurator][data-huet-color-bg],[data-huet-configurator] [data-huet-color-bg]{color:canvastext;background-color:canvas}[data-huet-configurator][data-huet-color-text],[data-huet-configurator] [data-huet-color-text]{color:canvastext}[data-huet-configurator][data-huet-color-border],[data-huet-configurator] [data-huet-color-border]{border-color:buttonborder}[data-huet-configurator][data-huet-color-outline],[data-huet-configurator] [data-huet-color-outline]{outline-color:highlight}}[data-huet-configurator] :focus,[data-huet-configurator] [data-focus-within]:focus-within{z-index:1;box-shadow:0 0 0 2px #00f5,0 0 0 2px #fff5!important}[data-huet-configurator] input[type=range]{appearance:none;background:0 0;width:100%!important}[data-huet-configurator] input[type=range]::-webkit-slider-thumb{-webkit-appearance:none!important;background:currentColor!important;width:1px!important;height:1em!important}[data-huet-configurator] input[type=range]::-moz-range-thumb{background:currentColor;border:none;border-radius:0;width:1px;height:1em}[data-huet-configurator] input[type=range]::-moz-range-track{background:0 0}[data-huet-configurator] input[type=number]{-moz-appearance:textfield}[data-huet-configurator] input[type=number]::-webkit-inner-spin-button{background:var(--huet-muted,currentColor);cursor:pointer;opacity:1;width:1em;height:1.25em;margin:0 0 0 .25em;-webkit-mask:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 30' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m7 11 5-5 5 5M7 19l5 5 5-5'/%3E%3C/svg%3E\") 50%/contain no-repeat;mask:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 30' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m7 11 5-5 5 5M7 19l5 5 5-5'/%3E%3C/svg%3E\") 50%/contain no-repeat;-webkit-appearance:none!important}[data-huet-configurator] input[type=number]::-webkit-inner-spin-button:hover{background:currentColor}[data-huet-configurator] input[type=number]::-webkit-outer-spin-button{margin:0;-webkit-appearance:none!important}@supports (appearance:base-select){[data-huet-configurator] select{appearance:base-select}[data-huet-configurator] select::picker(select){appearance:base-select}[data-huet-configurator] select::picker-icon{display:none}[data-huet-configurator] select::picker(select){border:1px solid var(--huet-border);background-color:var(--huet-background);color:var(--huet-foreground);font:inherit;border-radius:.25em;margin-block:.25em;padding:.25em;box-shadow:0 .5em 1.5em #00000026}[data-huet-configurator] select option{cursor:pointer;border-radius:.125em;padding:.3em .5em}[data-huet-configurator] select option:is(:hover,:focus){background-color:currentColor}@supports (color:color-mix(in lab, red, red)){[data-huet-configurator] select option:is(:hover,:focus){background-color:color-mix(in srgb, currentColor 12%, transparent)}}[data-huet-configurator] select option:is(:hover,:focus){box-shadow:none!important}[data-huet-configurator] select option::checkmark{margin-right:.375em}}[data-huet-configurator] input[type=color]::-webkit-color-swatch-wrapper{padding:0;-webkit-appearance:none!important}[data-huet-configurator] input[type=color]::-webkit-color-swatch{border:none;padding:0}[data-huet-configurator] input[type=color]::-moz-color-swatch{border:none}.hc\\:pointer-events-none{pointer-events:none}.hc\\:invisible{visibility:hidden}.hc\\:absolute{position:absolute}.hc\\:fixed{position:fixed}.hc\\:relative{position:relative}.hc\\:top-0{top:0}.hc\\:top-1\\/2{top:50%}.hc\\:right-\\[\\.5em\\]{right:.5em}.hc\\:right-\\[1em\\]{right:1em}.hc\\:bottom-0{bottom:0}.hc\\:bottom-\\[1em\\]{bottom:1em}.hc\\:left-0{left:0}.hc\\:left-1\\/2{left:50%}.hc\\:z-\\[999\\]{z-index:999}.hc\\:z-\\[1000\\]{z-index:1000}.hc\\:mx-2{margin-inline:calc(var(--hc-spacing) * 2)}.hc\\:-mt-2{margin-top:calc(var(--hc-spacing) * -2)}.hc\\:mt-1{margin-top:var(--hc-spacing)}.hc\\:mt-2{margin-top:calc(var(--hc-spacing) * 2)}.hc\\:mt-4{margin-top:calc(var(--hc-spacing) * 4)}.hc\\:mt-px{margin-top:1px}.hc\\:mr-1{margin-right:var(--hc-spacing)}.hc\\:mr-2{margin-right:calc(var(--hc-spacing) * 2)}.hc\\:mb-1{margin-bottom:var(--hc-spacing)}.hc\\:mb-2{margin-bottom:calc(var(--hc-spacing) * 2)}.hc\\:mb-\\[6px\\]{margin-bottom:6px}.hc\\:ml-1{margin-left:var(--hc-spacing)}.hc\\:ml-2{margin-left:calc(var(--hc-spacing) * 2)}.hc\\:ml-4{margin-left:calc(var(--hc-spacing) * 4)}.hc\\:block{display:block}.hc\\:flex{display:flex}.hc\\:inline{display:inline}.hc\\:inline-block{display:inline-block}.hc\\:inline-flex{display:inline-flex}.hc\\:size-\\[\\.625em\\]{width:.625em;height:.625em}.hc\\:size-\\[1\\.25em\\]{width:1.25em;height:1.25em}.hc\\:h-0{height:0}.hc\\:h-2{height:calc(var(--hc-spacing) * 2)}.hc\\:h-4{height:calc(var(--hc-spacing) * 4)}.hc\\:h-6{height:calc(var(--hc-spacing) * 6)}.hc\\:h-8{height:calc(var(--hc-spacing) * 8)}.hc\\:h-\\[\\.5em\\]{height:.5em}.hc\\:h-\\[\\.375em\\]{height:.375em}.hc\\:h-\\[4px\\]{height:4px}.hc\\:h-\\[min\\(40em\\,var\\(--radix-popover-content-available-height\\)\\)\\]{height:min(40em, var(--radix-popover-content-available-height))}.hc\\:h-\\[min\\(64em\\,100vh-2em\\)\\]{height:min(64em,100vh - 2em)}.hc\\:h-full{height:100%}.hc\\:min-h-0{min-height:0}.hc\\:w-0{width:0}.hc\\:w-\\[5em\\]{width:5em}.hc\\:w-\\[28em\\]{width:28em}.hc\\:w-\\[30em\\]{width:30em}.hc\\:w-full{width:100%}.hc\\:max-w-\\[30em\\]{max-width:30em}.hc\\:min-w-0{min-width:0}.hc\\:flex-auto{flex:auto}.hc\\:shrink-0{flex-shrink:0}.hc\\:grow{flex-grow:1}.hc\\:basis-\\[20em\\]{flex-basis:20em}.hc\\:-translate-x-1\\/2{--tw-translate-x:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:-translate-y-1\\/2{--tw-translate-y:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-y-0{--tw-translate-y:0px;translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-y-\\[2em\\]{--tw-translate-y:2em;translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-y-px{--tw-translate-y:1px;translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:rotate-180{rotate:180deg}.hc\\:cursor-auto{cursor:auto}.hc\\:cursor-default{cursor:default}.hc\\:cursor-pointer{cursor:pointer}.hc\\:flex-col{flex-direction:column}.hc\\:flex-row{flex-direction:row}.hc\\:items-center{align-items:center}.hc\\:justify-between{justify-content:space-between}.hc\\:justify-center{justify-content:center}.hc\\:gap-1\\.5{gap:calc(var(--hc-spacing) * 1.5)}.hc\\:gap-\\[\\.5em\\]{gap:.5em}.hc\\:gap-\\[\\.25em\\]{gap:.25em}.hc\\:gap-\\[\\.75em\\]{gap:.75em}.hc\\:gap-\\[\\.375em\\]{gap:.375em}.hc\\:self-stretch{align-self:stretch}.hc\\:overflow-hidden{overflow:hidden}.hc\\:overflow-x-hidden{overflow-x:hidden}.hc\\:overflow-y-auto{overflow-y:auto}.hc\\:overflow-y-scroll{overflow-y:scroll}.hc\\:overscroll-contain{overscroll-behavior:contain}.hc\\:rounded-full{border-radius:2147483647px}.hc\\:rounded-lg{border-radius:var(--hc-radius-lg)}.hc\\:rounded-md{border-radius:var(--hc-radius-md)}.hc\\:rounded-sm{border-radius:var(--hc-radius-sm)}.hc\\:rounded-xs{border-radius:var(--hc-radius-xs)}.hc\\:border{border-style:var(--tw-border-style);border-width:1px}.hc\\:border-x-\\[\\.5em\\]{border-inline-style:var(--tw-border-style);border-inline-width:.5em}.hc\\:border-x-\\[\\.75em\\]{border-inline-style:var(--tw-border-style);border-inline-width:.75em}.hc\\:border-t{border-top-style:var(--tw-border-style);border-top-width:1px}.hc\\:border-b{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.hc\\:border-b-\\[\\.5em\\]{border-bottom-style:var(--tw-border-style);border-bottom-width:.5em}.hc\\:border-b-\\[\\.75em\\]{border-bottom-style:var(--tw-border-style);border-bottom-width:.75em}.hc\\:border-\\(color\\:--item-border\\){border-color:var(--item-border)}.hc\\:border-\\[color-mix\\(in_srgb\\,var\\(--huet-background\\)_calc\\(30\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{border-color:var(--huet-background)}@supports (color:color-mix(in lab, red, red)){.hc\\:border-\\[color-mix\\(in_srgb\\,var\\(--huet-background\\)_calc\\(30\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{border-color:color-mix(in srgb,var(--huet-background) calc(30% * var(--huet-configurator-contrast,1)),transparent)}}.hc\\:border-transparent{border-color:#0000}.hc\\:border-x-transparent{border-inline-color:#0000}.hc\\:border-b-current{border-bottom-color:currentColor}.hc\\:bg-\\(--trigger-bg\\){background-color:var(--trigger-bg)}.hc\\:bg-\\[linear-gradient\\(to_right\\,black\\,white\\)\\]{background-image:linear-gradient(90deg,#000,#fff)}.hc\\:p-0{padding:0}.hc\\:p-2{padding:calc(var(--hc-spacing) * 2)}.hc\\:p-4{padding:calc(var(--hc-spacing) * 4)}.hc\\:px-2{padding-inline:calc(var(--hc-spacing) * 2)}.hc\\:px-4{padding-inline:calc(var(--hc-spacing) * 4)}.hc\\:px-\\[\\.5em\\]{padding-inline:.5em}.hc\\:px-\\[\\.625em\\]{padding-inline:.625em}.hc\\:py-2{padding-block:calc(var(--hc-spacing) * 2)}.hc\\:py-\\[\\.3em\\]{padding-block:.3em}.hc\\:py-\\[\\.5em\\]{padding-block:.5em}.hc\\:py-\\[\\.375em\\]{padding-block:.375em}.hc\\:pt-2{padding-top:calc(var(--hc-spacing) * 2)}.hc\\:pr-\\[\\.375em\\]{padding-right:.375em}.hc\\:pr-\\[2em\\]{padding-right:2em}.hc\\:pl-\\[\\.5em\\]{padding-left:.5em}.hc\\:text-left{text-align:left}.hc\\:font-ui{font-family:var(--hc-font-ui)}.hc\\:text-\\[\\.75rem\\]{font-size:.75rem}.hc\\:text-\\[\\.8125rem\\]{font-size:.8125rem}.hc\\:text-\\[1\\.25em\\]{font-size:1.25em}.hc\\:leading-none{--tw-leading:1;line-height:1}.hc\\:font-bold{--tw-font-weight:var(--hc-font-weight-bold);font-weight:var(--hc-font-weight-bold)}.hc\\:font-normal{--tw-font-weight:var(--hc-font-weight-normal);font-weight:var(--hc-font-weight-normal)}.hc\\:underline{text-decoration-line:underline}.hc\\:opacity-0{opacity:0}.hc\\:opacity-70{opacity:.7}.hc\\:opacity-100{opacity:1}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,var(--huet-foreground))}@supports (color:color-mix(in lab, red, red)){.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,color-mix(in srgb,var(--huet-foreground) calc(12.5% * var(--huet-configurator-contrast,1)),transparent))}}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-relative-text\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,var(--huet-relative-text))}@supports (color:color-mix(in lab, red, red)){.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-relative-text\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,color-mix(in srgb,var(--huet-relative-text) calc(12.5% * var(--huet-configurator-contrast,1)),transparent))}}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-relative-text\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.hc\\:shadow-\\[0_6px_24px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(16\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 6px 24px var(--tw-shadow-color,var(--huet-foreground))}@supports (color:color-mix(in lab, red, red)){.hc\\:shadow-\\[0_6px_24px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(16\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 6px 24px var(--tw-shadow-color,color-mix(in srgb,var(--huet-foreground) calc(16% * var(--huet-configurator-contrast,1)),transparent))}}.hc\\:shadow-\\[0_6px_24px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(16\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.hc\\:outline{outline-style:var(--tw-outline-style);outline-width:1px}.hc\\:-outline-offset-2{outline-offset:calc(2px * -1)}.hc\\:outline-\\[color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(30\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{outline-color:var(--huet-foreground)}@supports (color:color-mix(in lab, red, red)){.hc\\:outline-\\[color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(30\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{outline-color:color-mix(in srgb,var(--huet-foreground) calc(30% * var(--huet-configurator-contrast,1)),transparent)}}.hc\\:transition-\\[opacity\\,translate\\,height\\]{transition-property:opacity,translate,height;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:transition-opacity{transition-property:opacity;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:transition-transform{transition-property:transform,translate,scale,rotate;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:duration-150{--tw-duration:.15s;transition-duration:.15s}.hc\\:duration-200{--tw-duration:.2s;transition-duration:.2s}.hc\\:duration-400{--tw-duration:.4s;transition-duration:.4s}.hc\\:ease-\\[ease-out\\]{--tw-ease:ease-out;transition-timing-function:ease-out}.hc\\:ease-\\[ease\\]{--tw-ease:ease;transition-timing-function:ease}.hc\\:select-none{-webkit-user-select:none;user-select:none}.hc\\:not-focus-visible\\:shadow-none\\!:not(:focus-visible){--tw-shadow:0 0 #0000!important;box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)!important}@media (hover:hover){.hc\\:hover\\:border-\\(color\\:--item-border-hover\\):hover{border-color:var(--item-border-hover)}.hc\\:hover\\:bg-\\(--trigger-hover\\):hover{background-color:var(--trigger-hover)}}@property --tw-translate-x{syntax:\"*\";inherits:false;initial-value:0}@property --tw-translate-y{syntax:\"*\";inherits:false;initial-value:0}@property --tw-translate-z{syntax:\"*\";inherits:false;initial-value:0}@property --tw-border-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-leading{syntax:\"*\";inherits:false}@property --tw-font-weight{syntax:\"*\";inherits:false}@property --tw-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-shadow-color{syntax:\"*\";inherits:false}@property --tw-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-inset-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-inset-shadow-color{syntax:\"*\";inherits:false}@property --tw-inset-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-ring-color{syntax:\"*\";inherits:false}@property --tw-ring-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-inset-ring-color{syntax:\"*\";inherits:false}@property --tw-inset-ring-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-ring-inset{syntax:\"*\";inherits:false}@property --tw-ring-offset-width{syntax:\"<length>\";inherits:false;initial-value:0}@property --tw-ring-offset-color{syntax:\"*\";inherits:false;initial-value:#fff}@property --tw-ring-offset-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-outline-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-duration{syntax:\"*\";inherits:false}@property --tw-ease{syntax:\"*\";inherits:false}";
// src/private/ConfiguratorPortal.tsx
function ie() {
	if (document.head.querySelector("style[data-huet-configurator-styles]")) return;
	let e = document.createElement("style");
	e.setAttribute("data-huet-configurator-styles", ""), e.textContent = re, document.head.append(e);
}
function ae({ theme: e, background: t, children: n }) {
	let [r, i] = c(null);
	a(() => {
		ie();
		let e = document.createElement("div");
		return e.setAttribute("data-huet-configurator", ""), document.body.append(e), i(e), () => e.remove();
	}, []);
	let o = s({
		theme: e,
		background: t
	});
	o.current = {
		theme: e,
		background: t
	};
	let l = s(void 0);
	return a(() => {
		if (!r) return;
		let e = p(r, o.current.theme, o.current);
		return l.current = e, () => {
			e.destroy(), l.current = void 0;
		};
	}, [r]), a(() => l.current?.update(e, { background: t }), [e, t]), a(() => {
		r?.style.setProperty("--huet-configurator-contrast", String(e.contrast ?? 1));
	}, [r, e.contrast]), r ? y(n, r) : null;
}
// src/private/Arrow.tsx
var oe = {
	".5em": "hc:border-x-[.5em] hc:border-b-[.5em]",
	".75em": "hc:border-x-[.75em] hc:border-b-[.75em]"
};
function se({ size: e, className: t, style: n }) {
	return /* @__PURE__ */ _("span", {
		className: D("hc:inline-block hc:w-0 hc:h-0 hc:border-x-transparent hc:border-b-current", oe[e], t),
		style: n
	});
}
// src/private/displayError.ts
function ce(e) {
	console.error(e), alert(e);
}
// src/private/inputClass.ts
var j = "hc:py-[.3em] hc:px-[.5em] hc:border hc:max-w-[30em] hc:rounded-xs";
// src/private/Button.tsx
function le({ children: e, className: t, onUpload: n }) {
	return /* @__PURE__ */ v(M, {
		as: "div",
		"data-focus-within": "",
		className: D("hc:relative", t),
		children: [e, /* @__PURE__ */ _("input", {
			type: "file",
			className: "hc:absolute hc:w-full hc:h-full hc:left-0 hc:top-0 hc:opacity-0",
			onChange: (e) => {
				let t = new FileReader(), r = () => {
					if (t.removeEventListener("load", r), typeof t.result != "string") return;
					let e;
					try {
						e = JSON.parse(t.result), u(e);
					} catch (e) {
						ce(`That file isn't a valid Huet theme. ${e.message}`);
						return;
					}
					n(e, a);
				};
				t.addEventListener("load", r);
				let i = e.target.files?.[0], a = (i?.name ?? "").replace(/\.json$/i, "").replace(/ Huet Theme$/, "").trim() || "Imported";
				e.target.value = "", i && (i.type === "application/json" || i.name.toLowerCase().endsWith(".json") ? t.readAsText(i) : ce("Only JSON files are accepted."));
			}
		})]
	});
}
function ue(e, t) {
	if (e && !t) throw Error("Need a callback, otherwise `doubleCheck(boolOrMessage, cb)` doesn't do anything.");
	return (n) => {
		(!e || window.confirm(e === !0 ? "Are you sure?" : e)) && t?.(n);
	};
}
function M({ as: e = "button", colors: t = "huet-bg-10", className: n, children: r, verify: i, onClick: a, ...o }) {
	return /* @__PURE__ */ _(e, {
		onClick: ue(i, a),
		...o,
		className: D(j, "hc:w-full hc:border-transparent hc:cursor-default hc:flex hc:justify-center hc:items-center", t, n),
		children: r
	});
}
function N({ onClick: e, className: t, verify: n, ...r }) {
	return /* @__PURE__ */ _("button", {
		...r,
		className: D("hc:underline hc:cursor-pointer", t),
		onClick: ue(n, e)
	});
}
// src/private/BgColors.tsx
var de = [
	0,
	.25,
	.75,
	1
];
function fe({ theme: e, background: t, onChange: n }) {
	return /* @__PURE__ */ _(O, {
		growEach: !0,
		size: 2,
		children: de.map((r) => {
			let { root: i, step: a } = h(e, { background: r }), o = r === t;
			return /* @__PURE__ */ v(M, {
				colors: "",
				"aria-pressed": o,
				className: "hc:relative hc:h-8",
				style: {
					backgroundColor: i.hex,
					borderColor: a(i, o ? 100 : 10).hex,
					color: a(i, 80).hex
				},
				onClick: () => n(r),
				children: [
					r * 100,
					"%",
					o && /* @__PURE__ */ _(se, {
						size: ".5em",
						className: "hc:absolute hc:bottom-0 hc:left-1/2 hc:-translate-x-1/2 hc:translate-y-px",
						style: { color: a(i, 100).hex }
					})
				]
			}, r);
		})
	});
}
// src/private/ColorRamps.tsx
var P = (e) => Math.max(0, b(e).get("lab.l")) / 100, pe = Array.from({ length: 9 }, (e, t) => t / 8);
function me({ color: e, at: t }) {
	return /* @__PURE__ */ _("div", {
		className: "hc:absolute hc:border hc:border-[color-mix(in_srgb,var(--huet-background)_calc(30%*var(--huet-configurator-contrast,1)),transparent)] hc:outline hc:outline-[color-mix(in_srgb,var(--huet-foreground)_calc(30%*var(--huet-configurator-contrast,1)),transparent)] hc:-outline-offset-2 hc:top-1/2 hc:-translate-y-1/2",
		style: {
			backgroundColor: e,
			width: "1em",
			height: "1em",
			left: `calc(${t * 100}% - 1em * ${t})`
		}
	});
}
function F({ sample: e, markers: t }) {
	let [n, r] = [P(e(0)), P(e(1))], i = r - n || 1;
	return /* @__PURE__ */ _("div", {
		className: "hc:flex hc:h-4 hc:mb-2",
		style: {
			marginLeft: `${n * 100}%`,
			width: `${Math.abs(i) * 100}%`
		},
		children: /* @__PURE__ */ v("div", {
			className: "hc:w-full hc:relative hc:flex",
			children: [/* @__PURE__ */ _("div", {
				className: "hc:rounded-xs hc:h-full hc:w-full",
				style: { background: `linear-gradient(to right, ${pe.map(e).join(",")})` }
			}), t.map((e, t) => /* @__PURE__ */ _(me, {
				color: e,
				at: (P(e) - n) / i
			}, t))]
		})
	});
}
function he() {
	let { theme: e, resolved: t } = E(), [n, r] = [t.dark, t.light];
	return /* @__PURE__ */ v("div", {
		className: "hc:w-full",
		children: [
			/* @__PURE__ */ _("div", { className: "huet-border-10 hc:h-[4px] hc:mb-[6px] hc:w-full hc:bg-[linear-gradient(to_right,black,white)]" }),
			/* @__PURE__ */ _(F, {
				sample: t.ramp,
				markers: [...e.neutral]
			}),
			f.map((e) => {
				let i = t.colors[e], a = b.scale([
					n,
					i,
					r
				]).mode("lab").correctLightness();
				return /* @__PURE__ */ _(F, {
					sample: (e) => a(e).hex(),
					markers: [
						n,
						i,
						r
					]
				}, e);
			})
		]
	});
}
// src/private/Labeled.tsx
function I({ label: e, children: t, className: n, ...r }) {
	return e ? /* @__PURE__ */ v("label", {
		className: n,
		...r,
		children: [/* @__PURE__ */ _("span", {
			className: "hc:mb-1 hc:cursor-default",
			children: e
		}), t]
	}) : /* @__PURE__ */ _("div", {
		className: n,
		...r,
		children: t
	});
}
// src/private/Input.tsx
function ge({ label: e, value: t, onChange: n, className: r, ...i }) {
	return /* @__PURE__ */ _(I, {
		label: e,
		className: "hc:flex hc:flex-col hc:flex-auto hc:min-w-0 hc:min-h-0 hc:max-w-[30em]",
		children: /* @__PURE__ */ _("input", {
			"aria-label": e,
			className: D("huet-border-20", j, "hc:w-full hc:cursor-auto", r),
			value: t,
			onChange: (e) => n?.(e.target.value),
			...i
		})
	});
}
// src/private/Pallet.tsx
function L({ label: e, color: t, onChange: n }) {
	let [r, a] = c(), o = s({
		picked: t,
		onChange: n
	});
	o.current.onChange = n;
	let l = s(void 0);
	i(() => () => cancelAnimationFrame(l.current ?? 0), []);
	let u = r ?? t;
	return /* @__PURE__ */ _("input", {
		type: "color",
		"aria-label": e,
		title: e,
		value: b(u).hex("rgb"),
		onChange: (e) => {
			o.current.picked = e.target.value, a(e.target.value), l.current ??= requestAnimationFrame(() => {
				l.current = void 0, a(void 0), o.current.onChange(o.current.picked);
			});
		},
		className: "huet-border-10 hc:w-full hc:h-4 hc:p-0 hc:border hc:rounded-xs hc:overflow-hidden",
		style: { backgroundColor: u }
	});
}
// src/private/Range.tsx
function R({ label: e, min: t = 0, max: n = 100, decimals: r = 0, value: a, onChange: s, className: l, hideInput: u = !1 }) {
	let d = 1 / 10 ** r, [f, p] = c(!1), [m, h] = c(a.toFixed(r)), g = a < t || a > n;
	i(() => {
		f || h(a.toFixed(r));
	}, [
		r,
		f,
		a
	]);
	let y = (e) => {
		h(e.target.value);
		let t = Number.parseFloat(e.target.value);
		Number.isFinite(t) && s?.(t);
	}, b = (e) => {
		let t = Number.parseFloat(e.target.value);
		s?.(t);
	}, x = (e) => {
		let t = null;
		if (e.key === "ArrowUp" && (t = 1), e.key === "ArrowDown" && (t = -1), t) {
			let n = e.shiftKey ? a + d * 10 * t : a + d * t;
			h(n.toFixed(r)), s?.(n), e.preventDefault();
		}
	}, S = o(() => /* @__PURE__ */ v("span", {
		className: "hc:flex hc:justify-between",
		children: [e, /* @__PURE__ */ v("span", {
			className: g ? "huet-text-red-100" : "huet-text-50",
			children: [
				"(",
				t.toFixed(r),
				"-",
				n.toFixed(r),
				")"
			]
		})]
	}), [
		e,
		g,
		r,
		t,
		n
	]);
	return /* @__PURE__ */ _(I, {
		label: e && S,
		className: D("hc:flex hc:flex-col hc:max-w-[30em]", l),
		onKeyDown: x,
		children: /* @__PURE__ */ v("span", {
			className: "hc:flex hc:items-center",
			children: [!u && /* @__PURE__ */ _("input", {
				"aria-hidden": !0,
				type: "number",
				className: D(g ? "huet-border-red-100 huet-bg-red-10 huet-bg/text-red-100" : "huet-border-20", "hc:py-[.3em] hc:px-[.5em] hc:border hc:max-w-[30em] hc:rounded-xs", "hc:w-[5em] hc:mr-2 hc:cursor-auto"),
				value: m,
				step: d,
				onFocus: () => p(!0),
				onBlur: () => p(!1),
				onChange: y
			}), /* @__PURE__ */ _("input", {
				"aria-label": typeof e == "string" ? e : void 0,
				type: "range",
				className: D("huet-border-20", j, "hc:w-full hc:self-stretch hc:cursor-default"),
				min: t,
				max: n,
				step: d,
				value: a,
				onChange: b
			})]
		})
	});
}
// src/private/Select.tsx
function _e({ value: e, onChange: t, options: n, label: r }) {
	return /* @__PURE__ */ v("span", {
		className: "hc:relative hc:flex hc:w-full",
		children: [/* @__PURE__ */ _("select", {
			"aria-label": r,
			className: D("huet-border-20", j, "hc:w-full hc:pr-[2em] hc:cursor-pointer"),
			value: e,
			onChange: (e) => t(e.target.value),
			children: n.map((e) => /* @__PURE__ */ _("option", {
				value: e,
				children: e
			}, e))
		}), /* @__PURE__ */ _(C, {
			"aria-hidden": !0,
			size: "1em",
			stroke: 2,
			className: "hc:absolute hc:right-[.5em] hc:top-1/2 hc:-translate-y-1/2 hc:pointer-events-none"
		})]
	});
}
// src/private/EditTheme.tsx
var ve = m.Base.colors, ye = {
	onLight: .49,
	onDark: .49
};
function be({ colors: e, onChange: t }) {
	return /* @__PURE__ */ v(k, {
		size: 1,
		children: [/* @__PURE__ */ _(O, {
			growEach: !0,
			children: e.map((n, r) => /* @__PURE__ */ _(L, {
				label: r === 0 ? "Darkest" : r === e.length - 1 ? "Lightest" : `Middle ${r}`,
				color: n,
				onChange: (n) => t(e.map((e, t) => t === r ? n : e))
			}, r))
		}), /* @__PURE__ */ v(O, { children: [/* @__PURE__ */ _(N, {
			onClick: () => {
				let n = Math.ceil(e.length / 2), r = b.mix(e[n - 1], e[n], .5, "lab").hex();
				t([
					...e.slice(0, n),
					r,
					...e.slice(n)
				]);
			},
			children: "Add a middle color"
		}), e.length > 2 && /* @__PURE__ */ _(N, {
			onClick: () => t([...e.slice(0, -2), e[e.length - 1]]),
			children: "Remove the last middle color"
		})] })]
	});
}
function z({ label: e, value: t, onChange: n }) {
	return /* @__PURE__ */ _(R, {
		label: e,
		value: Math.round(t * 100),
		onChange: (e) => n(Math.max(0, Math.min(100, e)) / 100)
	});
}
function B({ label: e, noun: t, value: n, onChange: r }) {
	let i = {
		strength: 1,
		tint: 1,
		...n
	};
	return /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _(A, {
		label: e,
		value: i.strength > 0,
		onChange: (e) => r({
			...i,
			strength: +!!e
		})
	}), i.strength > 0 && /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _(z, {
		label: `${t} tint`,
		value: i.tint,
		onChange: (e) => r({
			...i,
			tint: e
		})
	}), /* @__PURE__ */ _(z, {
		label: `${t} strength`,
		value: i.strength,
		onChange: (e) => r({
			...i,
			strength: e
		})
	})] })] });
}
function V() {
	let { theme: e, setTheme: t, name: r, editedFrom: i, reset: a, background: o, setBackground: s, list: l } = E(), p = (n) => t({
		...e,
		...n
	}), m = e.signalLightness ?? ye, [h, g] = c(), y = (t) => {
		try {
			u({
				...e,
				neutral: t
			});
		} catch {
			g(e.neutral);
			return;
		}
		g(void 0), p({ neutral: t });
	}, b = n(() => {
		let t = new Blob([JSON.stringify(e, null, 2)], { type: "application/json;charset=utf-8" });
		x(t, `${r ?? "Custom"} Huet Theme.json`);
	}, [e, r]);
	return /* @__PURE__ */ v(k, {
		size: 2,
		className: "hc:p-4",
		children: [
			l && r !== void 0 && /* @__PURE__ */ _(ge, {
				label: "Theme Name",
				defaultValue: r,
				onBlur: (e) => l.rename(r, e.currentTarget.value.trim()),
				onKeyDown: (e) => {
					e.key === "Enter" && l.rename(r, e.currentTarget.value.trim());
				}
			}, r),
			/* @__PURE__ */ v(O, {
				growEach: !0,
				children: [/* @__PURE__ */ _(le, {
					onUpload: (e, n) => l ? l.add(n, e) : t(e),
					children: "Import Theme"
				}), /* @__PURE__ */ _(M, {
					onClick: b,
					children: "Export Theme"
				})]
			}),
			i !== void 0 && /* @__PURE__ */ v("p", {
				className: "hc:flex hc:gap-[.5em]",
				children: [
					"Edited from ",
					i,
					".",
					/* @__PURE__ */ _(N, {
						verify: `Discard your edits and go back to ${i}?`,
						onClick: a,
						children: "Reset"
					}),
					l && /* @__PURE__ */ _(N, {
						onClick: l.saveAsNew,
						children: "Save as new"
					})
				]
			}),
			s && /* @__PURE__ */ v("div", {
				role: "group",
				"aria-labelledby": "huet-configurator-background",
				children: [/* @__PURE__ */ _("span", {
					id: "huet-configurator-background",
					className: "hc:block hc:mb-1",
					children: "Background"
				}), /* @__PURE__ */ _(fe, {
					theme: e,
					background: o,
					onChange: s
				})]
			}),
			/* @__PURE__ */ _(I, {
				label: "Neutral colors",
				children: /* @__PURE__ */ _(be, {
					colors: e.neutral,
					onChange: y
				})
			}),
			h === e.neutral && /* @__PURE__ */ _("p", {
				role: "alert",
				className: "huet-text-red-100",
				children: "The lightest color has to be lighter than the darkest."
			}),
			/* @__PURE__ */ _(I, {
				label: "Blend the neutral colors in",
				children: /* @__PURE__ */ _(_e, {
					value: e.colorModel ?? "oklab",
					onChange: (e) => p({ colorModel: e }),
					options: d
				})
			}),
			/* @__PURE__ */ _(I, {
				label: "Hues",
				children: /* @__PURE__ */ _(O, {
					growEach: !0,
					children: f.map((t) => /* @__PURE__ */ _(L, {
						label: t,
						color: e.colors?.[t] ?? ve[t],
						onChange: (n) => p({ colors: {
							...e.colors,
							[t]: n
						} })
					}, t))
				})
			}),
			/* @__PURE__ */ _(R, {
				label: "Contrast",
				min: 0,
				max: 2,
				decimals: 2,
				value: e.contrast ?? 1,
				onChange: (e) => p({ contrast: e })
			}),
			/* @__PURE__ */ _(I, {
				label: "Color ramps",
				children: /* @__PURE__ */ _(he, {})
			}),
			/* @__PURE__ */ _(R, {
				label: "Signal lightness on light backgrounds",
				min: 0,
				max: 1,
				decimals: 2,
				value: m.onLight,
				onChange: (e) => p({ signalLightness: {
					...m,
					onLight: e
				} })
			}),
			/* @__PURE__ */ _(R, {
				label: "Signal lightness on dark backgrounds",
				min: 0,
				max: 1,
				decimals: 2,
				value: m.onDark,
				onChange: (e) => p({ signalLightness: {
					...m,
					onDark: e
				} })
			}),
			/* @__PURE__ */ _(B, {
				label: "Theme images",
				noun: "Image",
				value: e.images,
				onChange: (e) => p({ images: e })
			}),
			/* @__PURE__ */ _(B, {
				label: "Theme SVGs",
				noun: "SVG",
				value: e.svgs,
				onChange: (e) => p({ svgs: e })
			})
		]
	});
}
// src/private/persistentState.ts
var H = "huet:", U = "useBrowserState_huet_", xe = [
	"themer:showHelp",
	"theme",
	"themes"
], Se = 500, Ce = (e) => typeof e == "boolean" ? e : void 0, we = (e) => typeof e == "string" ? e : void 0;
function Te(e) {
	return (t) => e.includes(t) ? t : void 0;
}
function W() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function Ee(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) {
		let r = e.key(n);
		r !== null && t.push(r);
	}
	return t;
}
function De(e, t, n) {
	if (G.has(e)) return n(G.get(e)) ?? t;
	let r = W();
	if (!r) return t;
	try {
		let i = r.getItem(H + e);
		if (i === null) return t;
		let a = n(JSON.parse(i));
		if (a !== void 0) return a;
	} catch {}
	console.warn(`Huet: discarding invalid saved value for "${e}"`);
	try {
		r.removeItem(H + e);
	} catch {}
	return t;
}
var G = /* @__PURE__ */ new Map(), K = /* @__PURE__ */ new Set(), q;
function J() {
	for (let e of K) e();
}
function Oe(e, t) {
	G.set(e, t), clearTimeout(q), q = setTimeout(Y, Se), J();
}
function Y() {
	if (clearTimeout(q), q = void 0, G.size === 0) return;
	let e = W();
	for (let [t, n] of G) try {
		e?.setItem(H + t, JSON.stringify(n));
	} catch (e) {
		console.warn(`Huet: couldn't save "${t}"`, e);
	}
	G.clear(), J();
}
function ke() {
	clearTimeout(q), q = void 0, G.clear(), J();
	let e = W();
	if (e) for (let t of Ee(e)) (t.startsWith(H) || t.startsWith(U)) && e.removeItem(t);
}
function Ae() {
	ke(), window.location.reload();
}
function je() {
	let e = W();
	if (e) try {
		for (let t of Ee(e)) t.startsWith(U) && e.removeItem(t);
		for (let t of xe) e.removeItem(H + t);
	} catch {}
}
typeof window < "u" && (je(), window.addEventListener("pagehide", Y), document.addEventListener("visibilitychange", () => {
	document.visibilityState === "hidden" && Y();
}));
function Me(e) {
	return K.add(e), () => {
		K.delete(e);
	};
}
function Ne() {
	return l(Me, () => G.size > 0, () => !1);
}
function X(e, t, r) {
	let [a, o] = c(() => De(e, t, r)), l = s(a);
	l.current = a;
	let u = s(!1), d = s(void 0), f = s(void 0);
	return i(() => {
		u.current && a !== d.current?.value && (f.current = { raw: a }, d.current = void 0, Oe(e, a));
	}, [e, a]), i(() => Me(() => {
		if (!G.has(e)) return;
		let t = G.get(e);
		if (t === l.current || t === f.current?.raw || t === d.current?.raw) return;
		let n = r(t);
		n !== void 0 && (f.current = void 0, d.current = {
			raw: t,
			value: n
		}, o(n));
	}), [e, r]), [a, n((e) => {
		u.current = !0, o(e);
	}, [])];
}
// src/private/Tabs.tsx
var Z = {
	THEMES: "THEMES",
	EDIT_THEME: "EDIT_THEME"
}, Pe = Te(Object.values(Z)), Fe = [{
	tab: Z.THEMES,
	label: "Themes"
}, {
	tab: Z.EDIT_THEME,
	label: "Edit Theme"
}];
function Ie({ currentTab: e, onTabChange: t, className: n, buttonClassName: r }) {
	return /* @__PURE__ */ _("div", {
		className: D("hc:px-2 hc:pt-2 hc:border-b", n),
		children: /* @__PURE__ */ _(O, {
			growEach: !0,
			children: Fe.map(({ tab: n, label: i }) => /* @__PURE__ */ _(M, {
				"aria-pressed": e === n,
				colors: e === n ? "huet-bg-100" : "huet-text-100",
				className: r,
				onClick: () => t(n),
				children: i
			}, n))
		})
	});
}
// src/private/HuetLogo.tsx
function Le({ className: e }) {
	return /* @__PURE__ */ _("svg", {
		className: e,
		viewBox: "0 0 2000 2000",
		fill: "currentColor",
		"aria-hidden": "true",
		children: /* @__PURE__ */ _("path", { d: "M318.69 0C335.904 26.5094 354.963 53.6545 376.041 81.6494C406.318 121.861 445.764 164.12 489.449 207.412C424.268 321.409 304.798 537.625 242.982 694.983C177.763 861.005 158.731 1031.39 179.104 1178.52C199.476 1325.64 253.805 1459.39 376.041 1621.74C464.192 1738.81 630.062 1873.24 752.005 2000H0V0H318.69ZM1079.82 1524.13C1303.07 1524.13 1424.43 1601.78 1507.45 1661.95C1604.74 1732.46 1714.6 1853.99 1763.07 2000H1079.82V1524.13ZM2000 2000H1841.64C1812.22 1891.56 1758.59 1784.97 1665.97 1661.95C1543.73 1499.6 1272.05 1303.89 1175.28 1141.54C1084.56 989.344 1080.04 723.786 1079.83 691.187L1079.82 687.875L1079.82 0H1588.83C1683.26 92.4031 1770.61 224.904 1785.96 374.222C1805.7 566.316 1789.81 693.249 1726.72 895.768C1680.88 1042.89 1582.49 1262.78 1582.49 1262.78L1507.45 1422.94C1507.45 1422.94 1711.3 1081.07 1799.03 857.756C1864.24 691.735 1883.28 521.348 1862.9 374.222C1845.49 248.445 1803.25 132.448 1714.99 0H2000V2000ZM495.427 213.317C627.247 343.116 795.011 481.749 866.724 602.057C957.445 754.256 961.966 1019.81 962.177 1052.41L962.186 1055.72V1759.55C738.941 1759.55 617.58 1681.91 534.555 1621.74C414.709 1534.88 275.797 1370.61 256.05 1178.52C236.303 986.423 252.195 859.49 315.292 656.972C361.111 509.91 459.436 290.145 459.521 289.955L495.427 213.317ZM962.186 219.469C738.941 219.469 617.58 141.823 534.555 81.6494C503.695 59.2833 471.57 31.7846 440.542 0H962.186V219.469Z" })
	});
}
// src/private/ThemerShell.tsx
function Re() {
	let e = Ne();
	return /* @__PURE__ */ _("span", {
		className: D("huet-bg-green-20 huet-bg/text-green-100 hc:inline hc:rounded-lg hc:px-2 hc:font-normal", "hc:transition-opacity hc:duration-400 hc:ease-[ease]", e ? "hc:opacity-0" : "hc:opacity-100"),
		children: "Saved"
	});
}
function ze({ isExpanded: e, onClick: t }) {
	return /* @__PURE__ */ v("button", {
		onClick: t,
		"aria-expanded": e,
		title: e ? "Collapse" : "Expand",
		className: "huet-bg-100 hc:w-full hc:flex hc:justify-between hc:shrink-0 hc:select-none",
		children: [/* @__PURE__ */ v("span", {
			className: "hc:py-2 hc:px-2 hc:font-bold hc:flex hc:items-center hc:gap-1.5",
			children: [
				/* @__PURE__ */ _(Le, { className: "hc:size-[1.25em] hc:shrink-0" }),
				"Huet Theme Configurator ",
				e && /* @__PURE__ */ _(Re, {})
			]
		}), /* @__PURE__ */ _("span", {
			className: "huet-bg-20 hc:flex hc:justify-center hc:items-center hc:px-4 hc:font-bold",
			children: e ? "↓" : "↑"
		})]
	});
}
var Be = D("huet-outline-20 hc:fixed hc:right-[1em] hc:bottom-[1em] hc:z-[999]", "hc:font-ui hc:text-[.75rem] hc:outline", "hc:transition-[opacity,translate,height] hc:duration-200 hc:ease-[ease-out]"), Ve = {
	expanded: "hc:shadow-[0_5px_30px_color-mix(in_srgb,var(--huet-foreground)_calc(12.5%*var(--huet-configurator-contrast,1)),transparent)]",
	collapsed: "hc:shadow-[0_5px_30px_color-mix(in_srgb,var(--huet-relative-text)_calc(12.5%*var(--huet-configurator-contrast,1)),transparent)]"
};
function He({ children: e }) {
	let [t, n] = X("themer:isExpanded", !0, Ce), [r, a] = c(!1);
	return i(() => a(!0), []), t ? /* @__PURE__ */ v("div", {
		className: D(Be, "huet-bg-0", Ve.expanded, "hc:flex hc:flex-col hc:h-[min(64em,100vh-2em)]", r ? "hc:translate-y-0 hc:opacity-100" : "hc:translate-y-[2em] hc:opacity-0"),
		children: [/* @__PURE__ */ _(ze, {
			isExpanded: !0,
			onClick: () => n((e) => !e)
		}), e]
	}) : /* @__PURE__ */ _("div", {
		className: D(Be, "huet-text-100", Ve.collapsed),
		children: /* @__PURE__ */ _(ze, { onClick: () => n((e) => !e) })
	});
}
// src/private/Themes.tsx
var Ue = [
	"gray",
	"red",
	"yellow",
	"green",
	"blue",
	"purple"
];
function We({ preview: e, shadowAlpha: t, isSelected: n, children: r, onClick: i }) {
	let { root: a, step: o } = e, s = "hc:w-full hc:h-full hc:border hc:rounded-sm hc:relative hc:overflow-hidden", c = {
		backgroundColor: a.hex,
		color: o(a, 100).hex,
		borderColor: o(a, n ? 100 : 12).hex,
		boxShadow: `0 2px 10px ${b(o(a, 100).hex).alpha(t).hex()}`
	};
	return /* @__PURE__ */ _("div", {
		className: "hc:flex hc:relative hc:basis-[20em] hc:shrink-0",
		children: n ? /* @__PURE__ */ v("div", {
			className: s,
			style: c,
			children: [r, /* @__PURE__ */ _(se, {
				size: ".75em",
				className: "hc:absolute hc:bottom-0 hc:left-1/2 hc:-translate-x-1/2"
			})]
		}) : /* @__PURE__ */ _("button", {
			onClick: i,
			className: s,
			style: c,
			children: /* @__PURE__ */ _("div", {
				className: "hc:h-full",
				children: r
			})
		})
	});
}
function Ge(e) {
	return e.length ? `linear-gradient(to right, ${e.map((t, n) => `${t} ${n / e.length * 100}% ${(n + 1) / e.length * 100}%`).join(", ")})` : "none";
}
function Ke({ theme: e }) {
	let t = [...e.neutral, ...Object.values(e.colors ?? {})];
	return /* @__PURE__ */ _("div", {
		"aria-hidden": "true",
		className: "hc:h-[.5em]",
		style: { background: Ge(t) }
	});
}
function qe({ children: e }) {
	return /* @__PURE__ */ _("h3", {
		className: "hc:mx-2 hc:py-2 hc:flex hc:items-center hc:justify-between",
		children: e
	});
}
function Je({ preview: e, bg: t }) {
	return /* @__PURE__ */ _("div", {
		className: "hc:-mt-2 hc:h-2",
		style: { background: `linear-gradient(${t.hex}, ${e.step(t, 12).hex})` }
	});
}
function Ye({ preview: e, bg: t }) {
	return Ue.map((n) => /* @__PURE__ */ _("div", {
		"aria-hidden": "true",
		className: D("hc:mt-px", n === "gray" ? "hc:h-6" : "hc:h-2"),
		style: { background: Ge([
			100,
			75,
			50,
			25
		].map((r) => e.step(t, r, n).hex)) }
	}, n));
}
function Xe({ children: e }) {
	return /* @__PURE__ */ _("div", {
		className: "hc:flex",
		children: /* @__PURE__ */ _("div", {
			className: "hc:p-2 hc:w-full hc:flex hc:flex-col",
			children: e
		})
	});
}
function Ze({ name: e, theme: t, isSelected: n, onClick: r }) {
	let { background: i, editedFrom: o, reset: c, list: l, themes: u } = E(), d = r === void 0 && !(e in u), f = l && n && !d && Object.keys(u).length > 1, p = h(t, { background: i }), m = s(null);
	return a(() => {
		n && m.current && m.current.scrollIntoView({ block: "center" });
	}, []), /* @__PURE__ */ _("div", {
		ref: m,
		children: /* @__PURE__ */ v(We, {
			preview: p,
			shadowAlpha: .2 * (t.contrast ?? 1),
			isSelected: n,
			onClick: r,
			children: [
				/* @__PURE__ */ _(Ke, { theme: t }),
				/* @__PURE__ */ v(qe, { children: [e, /* @__PURE__ */ v("span", {
					className: "hc:flex hc:gap-[.75em]",
					children: [
						d && l && /* @__PURE__ */ _(N, {
							onClick: l.saveAsNew,
							children: "Save as new"
						}),
						d && o !== void 0 && /* @__PURE__ */ v(N, {
							verify: `Discard your edits and go back to ${o}?`,
							onClick: c,
							children: ["Reset to ", o]
						}),
						f && /* @__PURE__ */ _(N, {
							verify: `Remove ${e}?`,
							onClick: () => l.remove(e),
							children: "Remove"
						})
					]
				})] }),
				/* @__PURE__ */ _(Je, {
					preview: p,
					bg: p.root
				}),
				/* @__PURE__ */ _(Xe, { children: /* @__PURE__ */ _(Ye, {
					preview: p,
					bg: p.root
				}) })
			]
		})
	});
}
function Qe() {
	let { theme: t, setTheme: n, themes: r, name: i } = E(), a = Object.entries(r);
	return /* @__PURE__ */ v(k, {
		size: 3,
		className: "hc:p-4",
		children: [i === void 0 && /* @__PURE__ */ _(Ze, {
			name: "Custom",
			theme: t,
			isSelected: !0
		}), a.map(([r, i]) => {
			let a = e(i, t);
			return /* @__PURE__ */ _(Ze, {
				name: r,
				theme: i,
				isSelected: a,
				onClick: () => n(i)
			}, r);
		})]
	});
}
// src/Themer.tsx
function $e({ children: e }) {
	return /* @__PURE__ */ _("div", {
		className: "hc:overflow-y-scroll hc:overflow-x-hidden hc:w-[30em] hc:overscroll-contain hc:flex-auto hc:min-w-0 hc:min-h-0",
		children: e
	});
}
function et() {
	let { theme: e, background: t } = E(), [n, r] = X("themer:shouldThemeSelf", !0, Ce), [i, a] = X("themer:currentTab", Z.THEMES, Pe);
	return /* @__PURE__ */ _(ae, {
		theme: n ? e : m.Base,
		background: t,
		children: /* @__PURE__ */ _(He, { children: /* @__PURE__ */ v("div", {
			className: "hc:flex hc:flex-col hc:flex-auto hc:min-w-0 hc:min-h-0 hc:overflow-hidden",
			children: [
				/* @__PURE__ */ _(Ie, {
					currentTab: i,
					onTabChange: a
				}),
				/* @__PURE__ */ _($e, { children: i === Z.EDIT_THEME ? /* @__PURE__ */ _(V, {}) : /* @__PURE__ */ _(Qe, {}) }),
				/* @__PURE__ */ _("div", {
					className: "huet-bg-10",
					children: /* @__PURE__ */ _(k, {
						className: "hc:p-4",
						children: /* @__PURE__ */ _(A, {
							label: "Theme the themer",
							value: n,
							onChange: r
						})
					})
				})
			]
		}) })
	});
}
// src/private/ErrorBoundary.tsx
var tt = class extends t.Component {
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
		return this.state.hasError ? /* @__PURE__ */ v("div", {
			style: {
				fontFamily: "sans-serif",
				textAlign: "center",
				padding: "1em",
				background: "white",
				color: "black"
			},
			children: [/* @__PURE__ */ v("h1", {
				style: {
					color: "red",
					fontSize: "1em",
					margin: "0"
				},
				children: [this.props.componentName && this.props.componentName + ": ", "Something went wrong"]
			}), /* @__PURE__ */ v("p", {
				style: { margin: ".5em 0" },
				children: [
					"Try clearing local storage:",
					" ",
					/* @__PURE__ */ _("button", {
						onClick: Ae,
						children: "Reset this Page"
					})
				]
			})]
		}) : this.props.children;
	}
};
// src/ThemeConfigurator.tsx
function nt(e, t) {
	let n = t;
	for (let r = 2; n in e; r++) n = `${t} ${r}`;
	return n;
}
function rt({ value: t, onChange: n, themes: r = m, onThemesChange: a, background: c = 1, onBackgroundChange: l, children: u }) {
	let d = s(n);
	d.current = n;
	let f = s({
		onThemesChange: a,
		onBackgroundChange: l
	});
	f.current = {
		onThemesChange: a,
		onBackgroundChange: l
	};
	let p = a !== void 0, g = l !== void 0, v = o(() => Object.entries(r).find(([, n]) => e(n, t))?.[0], [r, t]), [y, b] = X("themer:editedFrom", "", we);
	i(() => {
		v !== void 0 && b(v);
	}, [v, b]);
	let x = v === void 0 && y in r ? y : void 0, S = o(() => ({
		theme: t,
		resolved: h(t, { background: c }),
		setTheme: (e) => d.current(e),
		themes: r,
		background: c,
		name: v,
		editedFrom: x,
		reset: () => {
			x !== void 0 && d.current(r[x]);
		},
		setBackground: g ? (e) => f.current.onBackgroundChange?.(e) : void 0,
		list: p ? {
			saveAsNew: () => {
				let e = nt(r, `${x ?? "Custom"} Copy`);
				f.current.onThemesChange?.({
					[e]: t,
					...r
				}), b(e);
			},
			remove: (e) => {
				let { [e]: t, ...n } = r;
				f.current.onThemesChange?.(n);
				let [i] = Object.values(n);
				e === v && i && d.current(i);
			},
			rename: (e, t) => {
				!t || t === e || t in r || (f.current.onThemesChange?.(Object.fromEntries(Object.entries(r).map(([n, r]) => [n === e ? t : n, r]))), b(t));
			},
			add: (e, t) => {
				let n = nt(r, e);
				f.current.onThemesChange?.({
					[n]: t,
					...r
				}), d.current(t);
			}
		} : void 0
	}), [
		t,
		r,
		c,
		v,
		x,
		p,
		g,
		b
	]);
	return /* @__PURE__ */ _(T.Provider, {
		value: S,
		children: u
	});
}
function it(e) {
	return /* @__PURE__ */ _(tt, {
		componentName: "Theme Configurator",
		children: /* @__PURE__ */ _(rt, {
			...e,
			children: /* @__PURE__ */ _(et, {})
		})
	});
}
// src/private/ThemeMiniMap.tsx
var at = [
	100,
	87.5,
	75,
	62.5,
	50,
	37.5,
	25,
	12.5,
	0
], ot = [
	"red",
	"yellow",
	"green",
	"blue",
	"purple"
];
function st(e, t) {
	let n = (e) => b(e).get("lab.l");
	return ot.map((r) => {
		let i = e.step(t, 100, r).hex;
		return {
			hue: r,
			color: i,
			distance: Math.abs(n(i) - n(t.hex))
		};
	}).sort((e, t) => t.distance - e.distance);
}
function ct(e, t) {
	return `linear-gradient(to right, ${at.map((n) => e.step(t, n).hex).join(", ")})`;
}
function lt({ theme: e, bg: t }) {
	return /* @__PURE__ */ v("span", {
		"aria-hidden": !0,
		className: "hc:flex hc:flex-col hc:gap-[.25em] hc:shrink-0",
		children: [/* @__PURE__ */ _("span", {
			className: "hc:flex hc:gap-[.25em]",
			children: st(e, t).map(({ hue: e, color: t }) => /* @__PURE__ */ _("span", {
				title: e,
				className: "hc:size-[.625em] hc:rounded-full",
				style: { backgroundColor: t }
			}, e))
		}), /* @__PURE__ */ _("span", {
			className: "hc:h-[.375em] hc:rounded-full",
			style: { backgroundImage: ct(e, t) }
		})]
	});
}
// src/EmbeddedThemeConfigurator.tsx
var Q = "hc:not-focus-visible:shadow-none!";
function $({ name: e, theme: t, isSelected: n, isEdited: r, onSelect: i }) {
	let { background: a } = E(), o = h(t, { background: a }), { root: s, step: c } = o, l = c(s, 100), u = n ? l.hex : c(s, 15).hex, d = n ? l.hex : c(s, 40).hex;
	return /* @__PURE__ */ v("button", {
		type: "button",
		"aria-pressed": n,
		onClick: i,
		className: D("hc:flex hc:items-center hc:gap-[.75em] hc:w-full hc:py-[.5em] hc:px-[.625em]", "hc:rounded-md hc:border hc:cursor-pointer hc:text-left", Q, "hc:border-(color:--item-border) hc:hover:border-(color:--item-border-hover)"),
		style: {
			backgroundColor: s.hex,
			color: l.hex,
			"--item-border": u,
			"--item-border-hover": d
		},
		children: [
			/* @__PURE__ */ _(lt, {
				theme: o,
				bg: s
			}),
			/* @__PURE__ */ _("span", {
				className: "hc:grow",
				children: e
			}),
			r && /* @__PURE__ */ _("span", {
				className: "hc:opacity-70",
				children: "Edited"
			}),
			/* @__PURE__ */ _(S, {
				size: "1em",
				stroke: 2.5,
				className: D("hc:shrink-0", !n && "hc:invisible")
			})
		]
	});
}
function ut() {
	let { theme: e, setTheme: t, themes: n, name: r, editedFrom: i, reset: a, list: o } = E(), s = r !== void 0, c = o && s && Object.keys(n).length > 1;
	return /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ v("div", {
		className: "hc:flex hc:flex-col hc:gap-[.375em] hc:p-2 hc:flex-auto hc:min-h-0 hc:overflow-y-auto hc:overscroll-contain",
		children: [!s && /* @__PURE__ */ _($, {
			name: i ?? "Custom",
			theme: e,
			isSelected: !0,
			isEdited: !0,
			onSelect: () => {}
		}), Object.entries(n).map(([e, n]) => {
			let a = e === r;
			return !s && e === i ? null : /* @__PURE__ */ _($, {
				name: e,
				theme: n,
				isSelected: a,
				onSelect: () => !a && t(n)
			}, e);
		})]
	}), /* @__PURE__ */ _(O, {
		growEach: !0,
		className: "hc:p-2 hc:border-t",
		children: [
			/* @__PURE__ */ _(le, {
				onUpload: (e, n) => o ? o.add(n, e) : t(e),
				children: "Import"
			}, "import"),
			!s && o && /* @__PURE__ */ _(M, {
				onClick: o.saveAsNew,
				children: "Save as New"
			}, "save"),
			i !== void 0 && /* @__PURE__ */ _(M, {
				verify: `Discard your edits and go back to ${i}?`,
				onClick: a,
				children: "Reset"
			}, "reset"),
			c && /* @__PURE__ */ _(M, {
				verify: `Remove ${r}?`,
				onClick: () => o.remove(r),
				children: "Remove"
			}, "remove")
		].filter(Boolean)
	})] });
}
function dt() {
	let [e, t] = X("embedded:currentTab", Z.THEMES, Pe);
	return /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _(Ie, {
		currentTab: e,
		onTabChange: t,
		buttonClassName: Q
	}), e === Z.EDIT_THEME ? /* @__PURE__ */ _("div", {
		className: "hc:flex-auto hc:min-h-0 hc:overflow-y-auto hc:overscroll-contain",
		children: /* @__PURE__ */ _(V, {})
	}) : /* @__PURE__ */ _(ut, {})] });
}
function ft({ mode: e = "contrast", side: t = "bottom", align: n = "end", style: r }) {
	let { theme: i, resolved: o, background: s, name: l = "Custom" } = E(), [u, d] = c(!1);
	a(ie, []);
	let { root: f, step: p } = o, m = p(f, 100), h = e === "contrast" ? m : f, g = {
		color: p(h, 100).hex,
		borderColor: e === "outlined" || e === "blended" && u ? m.hex : "transparent",
		"--trigger-bg": e === "contrast" ? h.hex : "transparent",
		"--trigger-hover": e === "contrast" ? p(h, 6).hex : `color-mix(in srgb, ${m.hex} 8%, transparent)`
	};
	return /* @__PURE__ */ v(w.Root, {
		open: u,
		onOpenChange: d,
		children: [/* @__PURE__ */ _("span", {
			"data-huet-configurator": "",
			style: {
				fontSize: "inherit",
				...r
			},
			children: /* @__PURE__ */ _(w.Trigger, {
				asChild: !0,
				children: /* @__PURE__ */ v("button", {
					type: "button",
					"aria-label": `Theme: ${l}`,
					title: l,
					className: D("hc:inline-flex hc:items-center hc:gap-[.5em] hc:py-[.375em] hc:pl-[.5em] hc:pr-[.375em]", "hc:rounded-md hc:border hc:cursor-pointer", Q, "hc:bg-(--trigger-bg) hc:hover:bg-(--trigger-hover)"),
					style: g,
					children: [/* @__PURE__ */ _(lt, {
						theme: o,
						bg: h
					}), /* @__PURE__ */ _(C, {
						size: "1em",
						stroke: 2,
						className: D("hc:shrink-0 hc:transition-transform hc:duration-150", u && "hc:rotate-180")
					})]
				})
			})
		}), /* @__PURE__ */ _(ae, {
			theme: i,
			background: s,
			children: /* @__PURE__ */ _(w.Content, {
				side: t,
				align: n,
				sideOffset: 6,
				collisionPadding: 8,
				"aria-label": "Theme Configurator",
				className: D("huet-bg-0 huet-border-100 hc:border hc:rounded-lg hc:z-[1000] hc:overflow-hidden", "hc:font-ui hc:text-[.8125rem] hc:flex hc:flex-col hc:w-[28em]", "hc:h-[min(40em,var(--radix-popover-content-available-height))]", "hc:shadow-[0_6px_24px_color-mix(in_srgb,var(--huet-foreground)_calc(16%*var(--huet-configurator-contrast,1)),transparent)]"),
				children: /* @__PURE__ */ _(dt, {})
			})
		})]
	});
}
function pt({ mode: e, side: t, align: n, style: r, ...i }) {
	return /* @__PURE__ */ _(tt, {
		componentName: "Embedded Theme Configurator",
		children: /* @__PURE__ */ _(rt, {
			...i,
			children: /* @__PURE__ */ _(ft, {
				mode: e,
				side: t,
				align: n,
				style: r
			})
		})
	});
}
export { pt as EmbeddedThemeConfigurator, it as ThemeConfigurator };

//# sourceMappingURL=index.js.map