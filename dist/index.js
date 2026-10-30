import e, { useCallback as t, useContext as n, useEffect as r, useLayoutEffect as i, useMemo as a, useRef as o, useState as s, useSyncExternalStore as c } from "react";
import { contrastRatio as l, mountTheme as u } from "huet";
import { Color as d, Theme as f, baseThemeConfig as p, getLightness as ee, parseThemeConfig as m, rampModes as h, themeConfigs as g, themeFromConfig as _ } from "huet/config";
import te from "file-saver";
import { Fragment as v, jsx as y, jsxs as b } from "react/jsx-runtime";
import x from "chroma-js";
import { chunk as ne, first as re, flatMap as ie, initial as ae, isEqual as oe, last as se, map as ce, range as S, tail as le } from "lodash-es";
import { createPortal as ue } from "react-dom";
import * as C from "@radix-ui/react-popover";
import { IconCheck as de, IconChevronDown as fe } from "@tabler/icons-react";
// src/context.ts
var w = e.createContext(null);
function T() {
	let e = n(w);
	if (!e) throw Error("Only available inside ThemeConfigurator");
	return e;
}
// src/private/cx.ts
function E(...e) {
	return e.filter(Boolean).join(" ");
}
// src/private/AllExceptFirst.tsx
var pe = {
	1: "hc:ml-1",
	2: "hc:ml-2",
	3: "hc:ml-4"
}, me = {
	1: "hc:mt-1",
	2: "hc:mt-2",
	3: "hc:mt-4"
};
function D({ exceptFirst: t, each: n, children: r }) {
	return e.Children.map(r, (e, r) => /* @__PURE__ */ y("div", {
		className: E(r > 0 && t, n) || void 0,
		children: e
	}));
}
function O({ size: e = 1, growEach: t, children: n, className: r }) {
	return /* @__PURE__ */ y("div", {
		className: E("hc:flex hc:flex-row", r),
		children: /* @__PURE__ */ y(D, {
			each: t ? "hc:grow" : void 0,
			exceptFirst: pe[e],
			children: n
		})
	});
}
function k({ size: e = 1, children: t, className: n }) {
	return /* @__PURE__ */ y("div", {
		className: E("hc:flex hc:flex-col", n),
		children: /* @__PURE__ */ y(D, {
			exceptFirst: me[e],
			children: t
		})
	});
}
// src/private/Arrow.tsx
var he = {
	".5em": "hc:border-x-[.5em] hc:border-b-[.5em]",
	".75em": "hc:border-x-[.75em] hc:border-b-[.75em]"
};
function A({ size: e, className: t, style: n }) {
	return /* @__PURE__ */ y("span", {
		className: E("hc:inline-block hc:w-0 hc:h-0 hc:border-x-transparent hc:border-b-current", he[e], t),
		style: n
	});
}
// src/private/displayError.ts
function j(e) {
	console.error(e), alert(e);
}
// src/private/inputClass.ts
var M = "hc:py-[.3em] hc:px-[.5em] hc:border hc:max-w-[30em] hc:rounded-xs";
// src/private/Button.tsx
function ge({ children: e, className: t, onUpload: n }) {
	return /* @__PURE__ */ b(P, {
		as: "div",
		"data-focus-within": "",
		className: E("hc:relative", t),
		children: [e, /* @__PURE__ */ y("input", {
			type: "file",
			className: "hc:absolute hc:w-full hc:h-full hc:left-0 hc:top-0 hc:opacity-0",
			onChange: (e) => {
				let t = new FileReader(), r = () => {
					if (typeof t.result == "string") {
						let e;
						try {
							e = JSON.parse(t.result);
						} catch {}
						let r = m(e);
						r ? n(r) : j("That file isn't a valid Huet theme.");
					}
					t.removeEventListener("load", r);
				};
				t.addEventListener("load", r);
				let i = e.target.files?.[0];
				e.target.value = "", i && (i.type === "application/json" || i.name.toLowerCase().endsWith(".json") ? t.readAsText(i) : j("Only JSON files are accepted."));
			}
		})]
	});
}
function N(e, t) {
	if (e && !t) throw Error("Need a callback, otherwise `doubleCheck(boolOrMessage, cb)` doesn't do anything.");
	return (n) => {
		(!e || window.confirm(e === !0 ? "Are you sure?" : e)) && t?.(n);
	};
}
function P({ as: e = "button", colors: t = "huet-bg-12", className: n, children: r, verify: i, onClick: a, ...o }) {
	return /* @__PURE__ */ y(e, {
		onClick: N(i, a),
		...o,
		className: E(M, "hc:w-full hc:border-transparent hc:cursor-default hc:flex hc:justify-center hc:items-center", t, n),
		children: r
	});
}
function _e({ onClick: e, className: t, verify: n, ...r }) {
	return /* @__PURE__ */ y("button", {
		...r,
		className: E("hc:underline hc:cursor-pointer", t),
		onClick: N(n, e)
	});
}
// src/private/BgColors.tsx
function ve({ theme: e, scaleValue: t, isSelected: n, onClick: r }) {
	let i = e.ramps[e.bgRamp], a = i(t), o = new d({
		theme: e,
		bgColor: null,
		lab: a,
		ramp: i,
		baseRamp: i
	});
	return /* @__PURE__ */ b(P, {
		colors: "",
		className: "hc:relative hc:h-8",
		style: {
			backgroundColor: o.toString(),
			borderColor: o.contrast(n ? 100 : 12).toString(),
			color: o.contrast(75).toString(),
			boxShadow: `0 2px 10px ${o.shadowColor(.2)}`
		},
		onClick: r,
		children: [
			t * 100,
			"%",
			n && /* @__PURE__ */ y(A, {
				size: ".5em",
				className: "hc:absolute hc:bottom-0 hc:left-1/2 hc:-translate-x-1/2 hc:translate-y-px",
				style: { color: o.contrast(100).toString() }
			})
		]
	});
}
function ye({ theme: e, bgRampValue: t, onRampValueChange: n }) {
	return /* @__PURE__ */ y(O, {
		growEach: !0,
		size: 2,
		children: [
			0,
			.25,
			.75,
			1
		].map((r) => /* @__PURE__ */ y(ve, {
			theme: e,
			scaleValue: r,
			isSelected: t === r,
			onClick: () => n(r)
		}, r))
	});
}
// src/private/Checkbox.tsx
function be({ label: e, value: t, onChange: n, className: r }) {
	return /* @__PURE__ */ b("label", {
		className: E("huet-text-100 hc:inline-flex hc:relative hc:cursor-default", r),
		children: [
			/* @__PURE__ */ y("input", {
				"aria-label": e,
				type: "checkbox",
				checked: t,
				onChange: (e) => n?.(e.target.checked),
				className: "hc:absolute hc:top-0 hc:left-0 hc:w-full hc:h-full"
			}),
			/* @__PURE__ */ y("span", {
				className: "hc:mr-1 hc:text-[1.25em] hc:leading-none",
				children: t ? "☒" : "☐"
			}),
			/* @__PURE__ */ y("span", { children: e })
		]
	});
}
// src/private/ColorRamps.tsx
function xe({ color: e, grayRamp: t }) {
	let n = (ee(e) - (t.startL ?? 0)) / ((t.endL ?? 0) - (t.startL ?? 0));
	return /* @__PURE__ */ y("div", {
		className: "hc:absolute hc:border hc:border-[color-mix(in_srgb,var(--huet-background)_calc(30%*var(--huet-configurator-contrast,1)),transparent)] hc:outline hc:outline-[color-mix(in_srgb,var(--huet-foreground)_calc(30%*var(--huet-configurator-contrast,1)),transparent)] hc:-outline-offset-2 hc:top-1/2 hc:-translate-y-1/2",
		style: {
			backgroundColor: e || "transparent",
			width: "1em",
			height: "1em",
			left: `calc(${n * 100}% - 1em * ${n})`
		}
	});
}
function Se(e) {
	return [e, e];
}
function Ce(e) {
	let t = e.config.classes, n = Array.isArray(t) ? t : [...S(0, 1, 1 / (t ?? 1)), 1], r = re(n) ?? 0, i = se(n) ?? 1, a = ae(le(n));
	return ne([
		r,
		...ie(a, Se),
		i
	], 2);
}
var we = e.memo(function({ ramp: e }) {
	if (!e) return null;
	switch (e.config.classes ? "classes" : "normal") {
		case "classes": return /* @__PURE__ */ y("div", {
			className: "hc:rounded-xs hc:h-full hc:w-full hc:flex",
			children: Ce(e).map(([t = 0, n = 0], r) => /* @__PURE__ */ y("div", {
				className: "hc:h-full",
				style: {
					backgroundColor: x.lab(...e((t + n) / 2)).hex(),
					width: `${(n - t) * 100}%`
				}
			}, r))
		});
		default: return /* @__PURE__ */ y("div", {
			className: "hc:rounded-xs hc:h-full hc:w-full",
			style: { background: `linear-gradient(to right, ${S(0, 1.2, .2).map((t) => x.lab(...e(t)).hex()).join(",")})` }
		});
	}
});
function Te({ ramp: e, theme: t }) {
	return /* @__PURE__ */ y("div", {
		className: "hc:flex hc:w-full hc:flex-row hc:h-4 hc:mb-2",
		style: {
			marginLeft: `${e.startL}%`,
			width: `${(e.endL ?? NaN) - (e.startL ?? NaN)}%`
		},
		children: /* @__PURE__ */ b("div", {
			className: "hc:w-full hc:relative hc:flex",
			children: [/* @__PURE__ */ y(we, { ramp: e }), e.config.colors.map((e, n) => /* @__PURE__ */ y(xe, {
				color: t.pallet[e] ?? "",
				grayRamp: t.ramps.gray
			}, n))]
		})
	});
}
function Ee({ theme: e }) {
	return /* @__PURE__ */ b("div", {
		className: "hc:w-full",
		children: [/* @__PURE__ */ y("div", { className: "huet-border-10 hc:h-[4px] hc:mb-[6px] hc:w-full hc:bg-[linear-gradient(to_right,black,white)]" }), Object.keys(e.ramps).map((t) => /* @__PURE__ */ y(Te, {
			ramp: e.ramps[t],
			theme: e
		}, t))]
	});
}
// src/configurator.css?inline
var De = "/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */\n@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-translate-x:0;--tw-translate-y:0;--tw-translate-z:0;--tw-scale-x:1;--tw-scale-y:1;--tw-scale-z:1;--tw-border-style:solid;--tw-leading:initial;--tw-font-weight:initial;--tw-shadow:0 0 #0000;--tw-shadow-color:initial;--tw-shadow-alpha:100%;--tw-inset-shadow:0 0 #0000;--tw-inset-shadow-color:initial;--tw-inset-shadow-alpha:100%;--tw-ring-color:initial;--tw-ring-shadow:0 0 #0000;--tw-inset-ring-color:initial;--tw-inset-ring-shadow:0 0 #0000;--tw-ring-inset:initial;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-offset-shadow:0 0 #0000;--tw-outline-style:solid;--tw-duration:initial;--tw-ease:initial}}}:root,:host{--hc-spacing:.25rem;--hc-font-weight-normal:400;--hc-font-weight-semibold:600;--hc-font-weight-bold:700;--hc-radius-xs:.125rem;--hc-radius-sm:.25rem;--hc-radius-md:.375rem;--hc-radius-lg:.5rem;--hc-default-transition-duration:.15s;--hc-default-transition-timing-function:cubic-bezier(.4, 0, .2, 1);--hc-font-ui:-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Roboto\", \"Oxygen\", \"Ubuntu\", \"Cantarell\", \"Fira Sans\", \"Droid Sans\", \"Helvetica Neue\", sans-serif}[data-huet-configurator]{all:initial}[data-huet-configurator] :where(:not(svg,svg *)){all:unset;box-sizing:border-box;display:block}[data-huet-configurator][data-huet-root],[data-huet-configurator][data-huet-color-bg],[data-huet-configurator] [data-huet-color-bg]{background-color:var(--huet-background);color:var(--huet-foreground)}[data-huet-configurator][data-huet-color-text],[data-huet-configurator] [data-huet-color-text]{color:var(--huet-relative-text,var(--huet-foreground))}[data-huet-configurator][data-huet-color-border],[data-huet-configurator] [data-huet-color-border]{border-color:var(--huet-relative-border)}[data-huet-configurator][data-huet-color-outline],[data-huet-configurator] [data-huet-color-outline]{outline-color:var(--huet-relative-outline)}@media (forced-colors:active){[data-huet-configurator][data-huet-root],[data-huet-configurator][data-huet-color-bg],[data-huet-configurator] [data-huet-color-bg]{color:canvastext;background-color:canvas}[data-huet-configurator][data-huet-color-text],[data-huet-configurator] [data-huet-color-text]{color:canvastext}[data-huet-configurator][data-huet-color-border],[data-huet-configurator] [data-huet-color-border]{border-color:buttonborder}[data-huet-configurator][data-huet-color-outline],[data-huet-configurator] [data-huet-color-outline]{outline-color:highlight}}[data-huet-configurator] :focus,[data-huet-configurator] [data-focus-within]:focus-within{z-index:1;box-shadow:0 0 0 2px #00f5,0 0 0 2px #fff5!important}[data-huet-configurator] input[type=range]{appearance:none;background:0 0;width:100%!important}[data-huet-configurator] input[type=range]::-webkit-slider-thumb{-webkit-appearance:none!important;background:currentColor!important;width:1px!important;height:1em!important}[data-huet-configurator] input[type=color]::-webkit-color-swatch-wrapper{padding:0;-webkit-appearance:none!important}[data-huet-configurator] input[type=color]::-webkit-color-swatch{border:none;padding:0}.hc\\:pointer-events-none{pointer-events:none}.hc\\:invisible{visibility:hidden}.hc\\:absolute{position:absolute}.hc\\:fixed{position:fixed}.hc\\:relative{position:relative}.hc\\:top-0{top:0}.hc\\:top-1\\/2{top:50%}.hc\\:right-\\[1em\\]{right:1em}.hc\\:bottom-0{bottom:0}.hc\\:bottom-\\[1em\\]{bottom:1em}.hc\\:left-0{left:0}.hc\\:left-1\\/2{left:50%}.hc\\:z-\\[999\\]{z-index:999}.hc\\:z-\\[1000\\]{z-index:1000}.hc\\:mx-2{margin-inline:calc(var(--hc-spacing) * 2)}.hc\\:-mt-2{margin-top:calc(var(--hc-spacing) * -2)}.hc\\:mt-1{margin-top:var(--hc-spacing)}.hc\\:mt-2{margin-top:calc(var(--hc-spacing) * 2)}.hc\\:mt-4{margin-top:calc(var(--hc-spacing) * 4)}.hc\\:mt-px{margin-top:1px}.hc\\:mr-1{margin-right:var(--hc-spacing)}.hc\\:mr-2{margin-right:calc(var(--hc-spacing) * 2)}.hc\\:mb-1{margin-bottom:var(--hc-spacing)}.hc\\:mb-2{margin-bottom:calc(var(--hc-spacing) * 2)}.hc\\:mb-\\[6px\\]{margin-bottom:6px}.hc\\:ml-1{margin-left:var(--hc-spacing)}.hc\\:ml-2{margin-left:calc(var(--hc-spacing) * 2)}.hc\\:ml-4{margin-left:calc(var(--hc-spacing) * 4)}.hc\\:flex{display:flex}.hc\\:inline{display:inline}.hc\\:inline-block{display:inline-block}.hc\\:inline-flex{display:inline-flex}.hc\\:size-\\[\\.625em\\]{width:.625em;height:.625em}.hc\\:size-\\[1\\.25em\\]{width:1.25em;height:1.25em}.hc\\:h-0{height:0}.hc\\:h-2{height:calc(var(--hc-spacing) * 2)}.hc\\:h-4{height:calc(var(--hc-spacing) * 4)}.hc\\:h-6{height:calc(var(--hc-spacing) * 6)}.hc\\:h-8{height:calc(var(--hc-spacing) * 8)}.hc\\:h-\\[\\.5em\\]{height:.5em}.hc\\:h-\\[\\.375em\\]{height:.375em}.hc\\:h-\\[4px\\]{height:4px}.hc\\:h-\\[min\\(64em\\,100vh-2em\\)\\]{height:min(64em,100vh - 2em)}.hc\\:h-full{height:100%}.hc\\:max-h-\\[min\\(28em\\,var\\(--radix-popover-content-available-height\\)\\)\\]{max-height:min(28em, var(--radix-popover-content-available-height))}.hc\\:min-h-0{min-height:0}.hc\\:w-0{width:0}.hc\\:w-\\[5em\\]{width:5em}.hc\\:w-\\[18em\\]{width:18em}.hc\\:w-\\[30em\\]{width:30em}.hc\\:w-full{width:100%}.hc\\:max-w-\\[30em\\]{max-width:30em}.hc\\:min-w-0{min-width:0}.hc\\:flex-auto{flex:auto}.hc\\:shrink-0{flex-shrink:0}.hc\\:grow{flex-grow:1}.hc\\:basis-\\[20em\\]{flex-basis:20em}.hc\\:-translate-x-1\\/2{--tw-translate-x:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:-translate-y-1\\/2{--tw-translate-y:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-y-0{--tw-translate-y:0px;translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-y-\\[2em\\]{--tw-translate-y:2em;translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-y-px{--tw-translate-y:1px;translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:scale-y-0{--tw-scale-y:0%;scale:var(--tw-scale-x) var(--tw-scale-y)}.hc\\:rotate-180{rotate:180deg}.hc\\:cursor-auto{cursor:auto}.hc\\:cursor-default{cursor:default}.hc\\:cursor-pointer{cursor:pointer}.hc\\:flex-col{flex-direction:column}.hc\\:flex-row{flex-direction:row}.hc\\:items-center{align-items:center}.hc\\:justify-between{justify-content:space-between}.hc\\:justify-center{justify-content:center}.hc\\:gap-1\\.5{gap:calc(var(--hc-spacing) * 1.5)}.hc\\:gap-\\[\\.5em\\]{gap:.5em}.hc\\:gap-\\[\\.25em\\]{gap:.25em}.hc\\:gap-\\[\\.75em\\]{gap:.75em}.hc\\:gap-\\[\\.375em\\]{gap:.375em}.hc\\:self-stretch{align-self:stretch}.hc\\:overflow-hidden{overflow:hidden}.hc\\:overflow-x-hidden{overflow-x:hidden}.hc\\:overflow-y-auto{overflow-y:auto}.hc\\:overflow-y-scroll{overflow-y:scroll}.hc\\:overscroll-contain{overscroll-behavior:contain}.hc\\:rounded-full{border-radius:2147483647px}.hc\\:rounded-lg{border-radius:var(--hc-radius-lg)}.hc\\:rounded-md{border-radius:var(--hc-radius-md)}.hc\\:rounded-sm{border-radius:var(--hc-radius-sm)}.hc\\:rounded-xs{border-radius:var(--hc-radius-xs)}.hc\\:border{border-style:var(--tw-border-style);border-width:1px}.hc\\:border-x-\\[\\.5em\\]{border-inline-style:var(--tw-border-style);border-inline-width:.5em}.hc\\:border-x-\\[\\.75em\\]{border-inline-style:var(--tw-border-style);border-inline-width:.75em}.hc\\:border-b{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.hc\\:border-b-\\[\\.5em\\]{border-bottom-style:var(--tw-border-style);border-bottom-width:.5em}.hc\\:border-b-\\[\\.75em\\]{border-bottom-style:var(--tw-border-style);border-bottom-width:.75em}.hc\\:border-\\(color\\:--item-border\\){border-color:var(--item-border)}.hc\\:border-\\[color-mix\\(in_srgb\\,var\\(--huet-background\\)_calc\\(30\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{border-color:var(--huet-background)}@supports (color:color-mix(in lab, red, red)){.hc\\:border-\\[color-mix\\(in_srgb\\,var\\(--huet-background\\)_calc\\(30\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{border-color:color-mix(in srgb,var(--huet-background) calc(30% * var(--huet-configurator-contrast,1)),transparent)}}.hc\\:border-transparent{border-color:#0000}.hc\\:border-x-transparent{border-inline-color:#0000}.hc\\:border-b-current{border-bottom-color:currentColor}.hc\\:bg-\\(--trigger-bg\\){background-color:var(--trigger-bg)}.hc\\:bg-\\[linear-gradient\\(to_right\\,black\\,white\\)\\]{background-image:linear-gradient(90deg,#000,#fff)}.hc\\:p-0{padding:0}.hc\\:p-2{padding:calc(var(--hc-spacing) * 2)}.hc\\:p-4{padding:calc(var(--hc-spacing) * 4)}.hc\\:px-2{padding-inline:calc(var(--hc-spacing) * 2)}.hc\\:px-3{padding-inline:calc(var(--hc-spacing) * 3)}.hc\\:px-4{padding-inline:calc(var(--hc-spacing) * 4)}.hc\\:px-\\[\\.5em\\]{padding-inline:.5em}.hc\\:px-\\[\\.625em\\]{padding-inline:.625em}.hc\\:py-2{padding-block:calc(var(--hc-spacing) * 2)}.hc\\:py-\\[\\.3em\\]{padding-block:.3em}.hc\\:py-\\[\\.5em\\]{padding-block:.5em}.hc\\:py-\\[\\.375em\\]{padding-block:.375em}.hc\\:pt-1{padding-top:var(--hc-spacing)}.hc\\:pt-2{padding-top:calc(var(--hc-spacing) * 2)}.hc\\:pt-2\\.5{padding-top:calc(var(--hc-spacing) * 2.5)}.hc\\:pr-\\[\\.375em\\]{padding-right:.375em}.hc\\:pb-1\\.5{padding-bottom:calc(var(--hc-spacing) * 1.5)}.hc\\:pb-2{padding-bottom:calc(var(--hc-spacing) * 2)}.hc\\:pl-\\[\\.5em\\]{padding-left:.5em}.hc\\:text-left{text-align:left}.hc\\:font-ui{font-family:var(--hc-font-ui)}.hc\\:text-\\[\\.75rem\\]{font-size:.75rem}.hc\\:text-\\[\\.8125rem\\]{font-size:.8125rem}.hc\\:text-\\[1\\.25em\\]{font-size:1.25em}.hc\\:leading-none{--tw-leading:1;line-height:1}.hc\\:font-bold{--tw-font-weight:var(--hc-font-weight-bold);font-weight:var(--hc-font-weight-bold)}.hc\\:font-normal{--tw-font-weight:var(--hc-font-weight-normal);font-weight:var(--hc-font-weight-normal)}.hc\\:font-semibold{--tw-font-weight:var(--hc-font-weight-semibold);font-weight:var(--hc-font-weight-semibold)}.hc\\:underline{text-decoration-line:underline}.hc\\:opacity-0{opacity:0}.hc\\:opacity-100{opacity:1}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,var(--huet-foreground))}@supports (color:color-mix(in lab, red, red)){.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,color-mix(in srgb,var(--huet-foreground) calc(12.5% * var(--huet-configurator-contrast,1)),transparent))}}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-relative-text\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,var(--huet-relative-text))}@supports (color:color-mix(in lab, red, red)){.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-relative-text\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,color-mix(in srgb,var(--huet-relative-text) calc(12.5% * var(--huet-configurator-contrast,1)),transparent))}}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-relative-text\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.hc\\:shadow-\\[0_6px_24px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(16\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 6px 24px var(--tw-shadow-color,var(--huet-foreground))}@supports (color:color-mix(in lab, red, red)){.hc\\:shadow-\\[0_6px_24px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(16\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 6px 24px var(--tw-shadow-color,color-mix(in srgb,var(--huet-foreground) calc(16% * var(--huet-configurator-contrast,1)),transparent))}}.hc\\:shadow-\\[0_6px_24px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(16\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.hc\\:outline{outline-style:var(--tw-outline-style);outline-width:1px}.hc\\:-outline-offset-2{outline-offset:calc(2px * -1)}.hc\\:outline-\\[color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(30\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{outline-color:var(--huet-foreground)}@supports (color:color-mix(in lab, red, red)){.hc\\:outline-\\[color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(30\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{outline-color:color-mix(in srgb,var(--huet-foreground) calc(30% * var(--huet-configurator-contrast,1)),transparent)}}.hc\\:transition-\\[opacity\\,translate\\,height\\]{transition-property:opacity,translate,height;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:transition-\\[scale\\,margin\\,opacity\\]{transition-property:scale,margin,opacity;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:transition-opacity{transition-property:opacity;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:transition-transform{transition-property:transform,translate,scale,rotate;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:duration-150{--tw-duration:.15s;transition-duration:.15s}.hc\\:duration-200{--tw-duration:.2s;transition-duration:.2s}.hc\\:duration-400{--tw-duration:.4s;transition-duration:.4s}.hc\\:ease-\\[ease-out\\]{--tw-ease:ease-out;transition-timing-function:ease-out}.hc\\:ease-\\[ease\\]{--tw-ease:ease;transition-timing-function:ease}.hc\\:select-none{-webkit-user-select:none;user-select:none}.hc\\:not-focus-visible\\:shadow-none\\!:not(:focus-visible){--tw-shadow:0 0 #0000!important;box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)!important}@media (hover:hover){.hc\\:hover\\:border-\\(color\\:--item-border-hover\\):hover{border-color:var(--item-border-hover)}.hc\\:hover\\:bg-\\(--trigger-hover\\):hover{background-color:var(--trigger-hover)}}@property --tw-translate-x{syntax:\"*\";inherits:false;initial-value:0}@property --tw-translate-y{syntax:\"*\";inherits:false;initial-value:0}@property --tw-translate-z{syntax:\"*\";inherits:false;initial-value:0}@property --tw-scale-x{syntax:\"*\";inherits:false;initial-value:1}@property --tw-scale-y{syntax:\"*\";inherits:false;initial-value:1}@property --tw-scale-z{syntax:\"*\";inherits:false;initial-value:1}@property --tw-border-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-leading{syntax:\"*\";inherits:false}@property --tw-font-weight{syntax:\"*\";inherits:false}@property --tw-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-shadow-color{syntax:\"*\";inherits:false}@property --tw-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-inset-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-inset-shadow-color{syntax:\"*\";inherits:false}@property --tw-inset-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-ring-color{syntax:\"*\";inherits:false}@property --tw-ring-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-inset-ring-color{syntax:\"*\";inherits:false}@property --tw-inset-ring-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-ring-inset{syntax:\"*\";inherits:false}@property --tw-ring-offset-width{syntax:\"<length>\";inherits:false;initial-value:0}@property --tw-ring-offset-color{syntax:\"*\";inherits:false;initial-value:#fff}@property --tw-ring-offset-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-outline-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-duration{syntax:\"*\";inherits:false}@property --tw-ease{syntax:\"*\";inherits:false}";
// src/private/ConfiguratorPortal.tsx
function F() {
	if (document.head.querySelector("style[data-huet-configurator-styles]")) return;
	let e = document.createElement("style");
	e.setAttribute("data-huet-configurator-styles", ""), e.textContent = De, document.head.append(e);
}
function I({ themeConfig: e, children: t }) {
	let [n, r] = s(null);
	i(() => {
		F();
		let e = document.createElement("div");
		return e.setAttribute("data-huet-configurator", ""), document.body.append(e), r(e), () => e.remove();
	}, []);
	let c = a(() => _(e), [e]), l = o(c);
	l.current = c;
	let d = o(void 0);
	return i(() => {
		if (!n) return;
		let e = u(n, l.current);
		return d.current = {
			theme: l.current,
			update: e.update
		}, () => {
			e.destroy(), d.current = void 0;
		};
	}, [n]), i(() => {
		let e = d.current;
		e && e.theme !== c && (e.theme = c, e.update(c));
	}, [c]), i(() => {
		n?.style.setProperty("--huet-configurator-contrast", String(e.contrastMultiplier));
	}, [n, e.contrastMultiplier]), n ? ue(t, n) : null;
}
// src/private/Labeled.tsx
function L({ label: e, children: t, className: n, ...r }) {
	return e ? /* @__PURE__ */ b("label", {
		className: n,
		...r,
		children: [/* @__PURE__ */ y("span", {
			className: "hc:mb-1 hc:cursor-default",
			children: e
		}), t]
	}) : /* @__PURE__ */ y("div", {
		className: n,
		...r,
		children: t
	});
}
// src/private/Input.tsx
function Oe({ label: e, value: t, onChange: n, className: r, ...i }) {
	return /* @__PURE__ */ y(L, {
		label: e,
		className: "hc:flex hc:flex-col hc:flex-auto hc:min-w-0 hc:min-h-0 hc:max-w-[30em]",
		children: /* @__PURE__ */ y("input", {
			"aria-label": e,
			className: E("huet-border-20", M, "hc:w-full hc:cursor-auto", r),
			value: t,
			onChange: (e) => n?.(e.target.value),
			...i
		})
	});
}
// src/private/Pallet.tsx
function ke({ color: e, onChange: t }) {
	return /* @__PURE__ */ y("input", {
		type: "color",
		value: e,
		onChange: (e) => t(e.target.value),
		className: "huet-border-12 hc:w-full hc:h-4 hc:p-0 hc:border hc:rounded-xs hc:overflow-hidden",
		style: { backgroundColor: e || "transparent" }
	});
}
function Ae({ colors: e, onColorsChange: t }) {
	return /* @__PURE__ */ y(O, {
		growEach: !0,
		children: ce(e, (n, r) => /* @__PURE__ */ y(ke, {
			color: n,
			onChange: (n) => t({
				...e,
				[r]: n
			})
		}, r))
	});
}
// src/private/Range.tsx
function R({ label: e, min: t = 0, max: n = 100, decimals: i = 0, value: o, onChange: c, className: l, hideInput: u = !1 }) {
	let d = 1 / 10 ** i, [f, p] = s(!1), [ee, m] = s(o.toFixed(i)), h = o < t || o > n;
	r(() => {
		f || m(o.toFixed(i));
	}, [
		i,
		f,
		o
	]);
	let g = (e) => {
		m(e.target.value);
		let t = Number.parseFloat(e.target.value);
		Number.isFinite(t) && c?.(t);
	}, _ = (e) => {
		let t = Number.parseFloat(e.target.value);
		c?.(t);
	}, te = (e) => {
		let t = null;
		if (e.key === "ArrowUp" && (t = 1), e.key === "ArrowDown" && (t = -1), t) {
			let n = e.shiftKey ? o + d * 10 * t : o + d * t;
			m(n.toFixed(i)), c?.(n), e.preventDefault();
		}
	}, v = a(() => /* @__PURE__ */ b("span", {
		className: "hc:flex hc:justify-between",
		children: [e, /* @__PURE__ */ b("span", {
			className: h ? "huet-text-red-100" : "huet-text-50",
			children: [
				"(",
				t.toFixed(i),
				"-",
				n.toFixed(i),
				")"
			]
		})]
	}), [
		e,
		h,
		i,
		t,
		n
	]);
	return /* @__PURE__ */ y(L, {
		label: e && v,
		className: E("hc:flex hc:flex-col hc:max-w-[30em]", l),
		onKeyDown: te,
		children: /* @__PURE__ */ b("span", {
			className: "hc:flex hc:items-center",
			children: [!u && /* @__PURE__ */ y("input", {
				"aria-hidden": !0,
				type: "number",
				className: E(h ? "huet-border-red-100 huet-bg-red-12 huet-bg/text-red-100" : "huet-border-20", "hc:py-[.3em] hc:px-[.5em] hc:border hc:max-w-[30em] hc:rounded-xs", "hc:w-[5em] hc:mr-2 hc:cursor-auto"),
				value: ee,
				step: d,
				onFocus: () => p(!0),
				onBlur: () => p(!1),
				onChange: g
			}), /* @__PURE__ */ y("input", {
				"aria-label": typeof e == "string" ? e : void 0,
				type: "range",
				className: E("huet-border-20", M, "hc:w-full hc:self-stretch hc:cursor-default"),
				min: t,
				max: n,
				step: d,
				value: o,
				onChange: _
			})]
		})
	});
}
// src/private/HuetLogo.tsx
function je({ className: e }) {
	return /* @__PURE__ */ y("svg", {
		className: e,
		viewBox: "0 0 2000 2000",
		fill: "currentColor",
		"aria-hidden": "true",
		children: /* @__PURE__ */ y("path", { d: "M318.69 0C335.904 26.5094 354.963 53.6545 376.041 81.6494C406.318 121.861 445.764 164.12 489.449 207.412C424.268 321.409 304.798 537.625 242.982 694.983C177.763 861.005 158.731 1031.39 179.104 1178.52C199.476 1325.64 253.805 1459.39 376.041 1621.74C464.192 1738.81 630.062 1873.24 752.005 2000H0V0H318.69ZM1079.82 1524.13C1303.07 1524.13 1424.43 1601.78 1507.45 1661.95C1604.74 1732.46 1714.6 1853.99 1763.07 2000H1079.82V1524.13ZM2000 2000H1841.64C1812.22 1891.56 1758.59 1784.97 1665.97 1661.95C1543.73 1499.6 1272.05 1303.89 1175.28 1141.54C1084.56 989.344 1080.04 723.786 1079.83 691.187L1079.82 687.875L1079.82 0H1588.83C1683.26 92.4031 1770.61 224.904 1785.96 374.222C1805.7 566.316 1789.81 693.249 1726.72 895.768C1680.88 1042.89 1582.49 1262.78 1582.49 1262.78L1507.45 1422.94C1507.45 1422.94 1711.3 1081.07 1799.03 857.756C1864.24 691.735 1883.28 521.348 1862.9 374.222C1845.49 248.445 1803.25 132.448 1714.99 0H2000V2000ZM495.427 213.317C627.247 343.116 795.011 481.749 866.724 602.057C957.445 754.256 961.966 1019.81 962.177 1052.41L962.186 1055.72V1759.55C738.941 1759.55 617.58 1681.91 534.555 1621.74C414.709 1534.88 275.797 1370.61 256.05 1178.52C236.303 986.423 252.195 859.49 315.292 656.972C361.111 509.91 459.436 290.145 459.521 289.955L495.427 213.317ZM962.186 219.469C738.941 219.469 617.58 141.823 534.555 81.6494C503.695 59.2833 471.57 31.7846 440.542 0H962.186V219.469Z" })
	});
}
// src/private/persistentState.ts
var z = "huet:", B = "useBrowserState_huet_", Me = ["themer:showHelp"], Ne = 500, V = (e) => typeof e == "boolean" ? e : void 0;
function Pe(e) {
	return (t) => e.includes(t) ? t : void 0;
}
function H() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function U(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) {
		let r = e.key(n);
		r !== null && t.push(r);
	}
	return t;
}
function Fe(e, t, n) {
	if (W.has(e)) return n(W.get(e)) ?? t;
	let r = H();
	if (!r) return t;
	try {
		let i = r.getItem(z + e);
		if (i === null) return t;
		let a = n(JSON.parse(i));
		if (a !== void 0) return a;
	} catch {}
	console.warn(`Huet: discarding invalid saved value for "${e}"`);
	try {
		r.removeItem(z + e);
	} catch {}
	return t;
}
var W = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Set(), K;
function q() {
	for (let e of G) e();
}
function Ie(e, t) {
	W.set(e, t), clearTimeout(K), K = setTimeout(J, Ne), q();
}
function J() {
	if (clearTimeout(K), K = void 0, W.size === 0) return;
	let e = H();
	for (let [t, n] of W) try {
		e?.setItem(z + t, JSON.stringify(n));
	} catch (e) {
		console.warn(`Huet: couldn't save "${t}"`, e);
	}
	W.clear(), q();
}
function Le() {
	clearTimeout(K), K = void 0, W.clear(), q();
	let e = H();
	if (e) for (let t of U(e)) (t.startsWith(z) || t.startsWith(B)) && e.removeItem(t);
}
function Re() {
	Le(), window.location.reload();
}
function ze() {
	let e = H();
	if (e) try {
		for (let t of U(e)) t.startsWith(B) && e.removeItem(t);
		for (let t of Me) e.removeItem(z + t);
	} catch {}
}
typeof window < "u" && (ze(), window.addEventListener("pagehide", J), document.addEventListener("visibilitychange", () => {
	document.visibilityState === "hidden" && J();
}));
function Y(e) {
	return G.add(e), () => {
		G.delete(e);
	};
}
function Be() {
	return c(Y, () => W.size > 0, () => !1);
}
function X(e, n, i) {
	let [a, c] = s(() => Fe(e, n, i)), l = o(a);
	l.current = a;
	let u = o(!1), d = o(void 0);
	return r(() => {
		u.current && a !== d.current?.value && Ie(e, a);
	}, [e, a]), r(() => Y(() => {
		if (!W.has(e)) return;
		let t = W.get(e);
		if (t === l.current || t === d.current?.raw) return;
		let n = i(t);
		n !== void 0 && (d.current = {
			raw: t,
			value: n
		}, c(n));
	}), [e, i]), [a, t((e) => {
		u.current = !0, c(e);
	}, [])];
}
// src/private/ThemerShell.tsx
function Ve() {
	let e = Be();
	return /* @__PURE__ */ y("span", {
		className: E("huet-bg-green-25 huet-bg/text-green-100 hc:inline hc:rounded-lg hc:px-2 hc:font-normal", "hc:transition-opacity hc:duration-400 hc:ease-[ease]", e ? "hc:opacity-0" : "hc:opacity-100"),
		children: "Saved"
	});
}
function Z({ isExpanded: e, onClick: t }) {
	return /* @__PURE__ */ b("button", {
		onClick: t,
		"aria-expanded": e,
		title: e ? "Collapse" : "Expand",
		className: "huet-bg-100 hc:w-full hc:flex hc:justify-between hc:shrink-0 hc:select-none",
		children: [/* @__PURE__ */ b("span", {
			className: "hc:py-2 hc:px-2 hc:font-bold hc:flex hc:items-center hc:gap-1.5",
			children: [
				/* @__PURE__ */ y(je, { className: "hc:size-[1.25em] hc:shrink-0" }),
				"Huet Theme Configurator ",
				e && /* @__PURE__ */ y(Ve, {})
			]
		}), /* @__PURE__ */ y("span", {
			className: "huet-bg-25 hc:flex hc:justify-center hc:items-center hc:px-4 hc:font-bold",
			children: e ? "↓" : "↑"
		})]
	});
}
var He = E("huet-outline-25 hc:fixed hc:right-[1em] hc:bottom-[1em] hc:z-[999]", "hc:font-ui hc:text-[.75rem] hc:outline", "hc:transition-[opacity,translate,height] hc:duration-200 hc:ease-[ease-out]"), Ue = {
	expanded: "hc:shadow-[0_5px_30px_color-mix(in_srgb,var(--huet-foreground)_calc(12.5%*var(--huet-configurator-contrast,1)),transparent)]",
	collapsed: "hc:shadow-[0_5px_30px_color-mix(in_srgb,var(--huet-relative-text)_calc(12.5%*var(--huet-configurator-contrast,1)),transparent)]"
};
function We({ children: e }) {
	let [t, n] = X("themer:isExpanded", !0, V), [i, a] = s(!1);
	return r(() => a(!0), []), t ? /* @__PURE__ */ b("div", {
		className: E(He, "huet-bg-0", Ue.expanded, "hc:flex hc:flex-col hc:h-[min(64em,100vh-2em)]", i ? "hc:translate-y-0 hc:opacity-100" : "hc:translate-y-[2em] hc:opacity-0"),
		children: [/* @__PURE__ */ y(Z, {
			isExpanded: !0,
			onClick: () => n((e) => !e)
		}), e]
	}) : /* @__PURE__ */ y("div", {
		className: E(He, "huet-text-100", Ue.collapsed),
		children: /* @__PURE__ */ y(Z, { onClick: () => n((e) => !e) })
	});
}
// src/private/Themes.tsx
function Ge(e) {
	return d.fromTheme(e).contrast(0);
}
function Ke({ theme: e, isSelected: t, children: n, onClick: r, isHidden: i }) {
	let a = d.fromTheme(e), s = a.contrast(0), c = "hc:w-full hc:h-full hc:border hc:rounded-sm hc:relative hc:overflow-hidden", l = {
		backgroundColor: s.hex,
		color: s.contrast(100).hex,
		borderColor: a.contrast(t ? 100 : 12).hex,
		boxShadow: `0 2px 10px ${a.contrast(100).alpha(.2)}`
	}, u = o(null), f = u.current ? u.current.clientHeight : 0;
	return /* @__PURE__ */ y("div", {
		ref: u,
		className: E("hc:flex hc:relative hc:basis-[20em] hc:shrink-0 hc:transition-[scale,margin,opacity] hc:duration-150 hc:ease-[ease-out]", i && "hc:pointer-events-none hc:scale-y-0 hc:opacity-0"),
		style: i ? {
			marginTop: `-${f / 2}px`,
			marginBottom: `-${f / 2}px`
		} : void 0,
		children: t ? /* @__PURE__ */ b("div", {
			className: c,
			style: l,
			children: [n, /* @__PURE__ */ y(A, {
				size: ".75em",
				className: "hc:absolute hc:bottom-0 hc:left-1/2 hc:-translate-x-1/2"
			})]
		}) : /* @__PURE__ */ y("button", {
			onClick: r,
			className: c,
			style: l,
			children: /* @__PURE__ */ y("div", {
				className: "hc:h-full",
				children: n
			})
		})
	});
}
function qe({ theme: e }) {
	return /* @__PURE__ */ y("div", {
		className: "hc:flex hc:h-[.5em]",
		children: Object.keys(e.pallet).map((t) => /* @__PURE__ */ y("div", {
			className: "hc:w-full hc:h-full",
			style: { backgroundColor: e.pallet[t] }
		}, t))
	});
}
function Je({ children: e }) {
	return /* @__PURE__ */ y("h3", {
		className: "hc:mx-2 hc:py-2 hc:flex hc:items-center hc:justify-between",
		children: e
	});
}
function Ye({ bg: e }) {
	return /* @__PURE__ */ y("div", {
		className: "hc:-mt-2 hc:h-2",
		style: { background: `linear-gradient(${e}, ${e.contrast(12)})` }
	});
}
function Xe({ theme: e, bg: t }) {
	return Object.keys(e.ramps).filter((t) => {
		let n = e.ramps[t].config.mode;
		return n === h.SIGNAL || n === h.FURTHEST;
	}).map((n) => {
		let r = t.base(e.ramps[n]);
		return /* @__PURE__ */ y("div", {
			className: "hc:flex",
			children: [
				100,
				75,
				50,
				25
			].map((e) => /* @__PURE__ */ y("div", {
				className: E("hc:w-full hc:mt-px", n === "gray" ? "hc:h-6" : "hc:h-2"),
				style: { backgroundColor: r.contrast(e).hex }
			}, e))
		}, n);
	});
}
function Ze({ children: e }) {
	return /* @__PURE__ */ y("div", {
		className: "hc:flex",
		children: /* @__PURE__ */ y("div", {
			className: "hc:p-2 hc:w-full hc:flex hc:flex-col",
			children: e
		})
	});
}
var Qe = e.memo(function({ config: e, isSelected: t, onClick: n, onRemove: r }) {
	let [i, a] = s(!1), o = new f(e), c = Ge(o), l = e.id === p.id;
	function u() {
		a(!0), setTimeout(() => r(), 200);
	}
	return /* @__PURE__ */ b(Ke, {
		theme: o,
		isSelected: t,
		onClick: n,
		isHidden: i,
		children: [
			/* @__PURE__ */ y(qe, { theme: o }),
			/* @__PURE__ */ b(Je, { children: [o.name, t && !l && /* @__PURE__ */ y(_e, {
				style: { color: c.base(o.ramps.red).contrast(100).hex },
				onClick: u,
				verify: !0,
				children: "Remove"
			})] }),
			/* @__PURE__ */ y(Ye, { bg: c }),
			/* @__PURE__ */ y(Ze, { children: /* @__PURE__ */ y(Xe, {
				theme: o,
				bg: c
			}) })
		]
	});
});
function $e(e, t) {
	let n = e.contrast(100, e.theme.ramps[t]);
	return {
		backgroundColor: n.hex,
		color: n.contrast(100).hex
	};
}
function et({ config: e, onReset: t, onCreate: n }) {
	let r = new f(e), i = Ge(r);
	return /* @__PURE__ */ b(Ke, {
		isSelected: !0,
		theme: r,
		children: [
			/* @__PURE__ */ y(qe, { theme: r }),
			/* @__PURE__ */ y(Je, { children: r.name }),
			/* @__PURE__ */ y(Ye, { bg: i }),
			/* @__PURE__ */ b(Ze, { children: [/* @__PURE__ */ y(P, {
				colors: "",
				style: $e(i, "green"),
				onClick: n,
				children: "Save As New Theme"
			}), /* @__PURE__ */ y(P, {
				colors: "",
				className: "hc:mt-1",
				style: $e(i, "red"),
				verify: !0,
				onClick: t,
				children: "Reset"
			})] })
		]
	});
}
function tt({ configs: e, config: t, onSelectConfig: n, onConfigsChange: r }) {
	let [a] = T(), s = a.config, c = t.id === s.id, l = c && !oe(t, s), u = () => n(t), d = () => {
		let i = e.indexOf(t), a = e.filter((e) => e.id !== t.id);
		r(a), n(a[Math.min(i, a.length - 1)]);
	}, f = () => {
		let i = {
			...s,
			id: Math.random(),
			name: t.name === s.name ? `${t.name} Copy` : s.name
		};
		r([i, ...e]), n(i);
	}, p = o(null);
	return i(() => {
		c && p.current && p.current.scrollIntoView({ block: "center" });
	}, []), /* @__PURE__ */ y("div", {
		ref: p,
		children: l ? /* @__PURE__ */ y(et, {
			config: s,
			onReset: u,
			onCreate: f
		}) : /* @__PURE__ */ y(Qe, {
			config: t,
			isSelected: c,
			onClick: u,
			onRemove: d
		})
	});
}
var nt = (e) => {
	if (!Array.isArray(e)) return;
	let t = e.map(m).filter((e) => e !== void 0);
	return t.length > 0 ? t : void 0;
};
function rt() {
	let [e, t] = X("themes", g, nt), [, n] = T();
	return /* @__PURE__ */ b(k, {
		size: 3,
		className: "hc:p-4",
		children: [/* @__PURE__ */ y(ge, {
			onUpload: (r) => {
				let i = {
					...r,
					id: Math.random()
				};
				t([i, ...e]), n(i);
			},
			children: "Import Theme"
		}), e.map((r) => /* @__PURE__ */ y(tt, {
			configs: e,
			config: r,
			onSelectConfig: n,
			onConfigsChange: t
		}, r.id))]
	});
}
// src/Themer.tsx
var it = new f(p);
function at({ children: e }) {
	return /* @__PURE__ */ y("div", {
		className: "hc:overflow-y-scroll hc:overflow-x-hidden hc:w-[30em] hc:overscroll-contain hc:flex-auto hc:min-w-0 hc:min-h-0",
		children: e
	});
}
var Q = {
	THEMES: "THEMES",
	EDIT_THEME: "EDIT_THEME"
}, ot = Pe(Object.values(Q));
function st({ theme: e, themerTheme: n, onThemeConfigChange: r }) {
	let i = e.config;
	function a(e) {
		return (t) => {
			r({
				...i,
				[e]: t
			});
		};
	}
	let o = a("bgRampValue"), s = a("contrastMultiplier"), c = a("pallet"), l = a("startSignalLightness"), u = a("endSignalLightness"), d = t(() => {
		let e = {
			...i,
			id: Math.random()
		}, t = JSON.stringify(e, null, "  "), n = new Blob([t], { type: "text/plain;charset=utf-8" });
		te(n, `${i.name} Huet Theme.json`);
	}, [i]);
	return /* @__PURE__ */ y(v, { children: /* @__PURE__ */ b(k, {
		size: 2,
		className: "hc:p-4",
		children: [
			/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y(Oe, {
				label: "Theme Name",
				className: "hc:flex-auto hc:min-w-0 hc:min-h-0 hc:mb-2",
				value: i.name,
				onChange: (e) => r({
					...i,
					name: e
				})
			}), /* @__PURE__ */ y(P, {
				onClick: d,
				children: "Export Theme"
			})] }),
			/* @__PURE__ */ y(L, {
				label: "Background Color",
				children: /* @__PURE__ */ y(ye, {
					theme: e,
					bgRampValue: i.bgRampValue,
					onRampValueChange: o
				})
			}),
			/* @__PURE__ */ y(R, {
				label: "Contrast",
				min: 0,
				max: 1,
				decimals: 2,
				value: i.contrastMultiplier,
				onChange: s
			}),
			/* @__PURE__ */ y(L, {
				label: "Pallet",
				children: /* @__PURE__ */ y(Ae, {
					colors: i.pallet,
					onColorsChange: c
				})
			}),
			/* @__PURE__ */ y(L, {
				label: "Color ramps",
				children: /* @__PURE__ */ y(Ee, { theme: n })
			}),
			/* @__PURE__ */ y(R, {
				label: "Signal Lightness on 'Black'",
				value: i.endSignalLightness,
				onChange: u,
				min: 0,
				max: 1,
				decimals: 2
			}),
			/* @__PURE__ */ y(R, {
				label: "Signal Lightness on 'White'",
				value: i.startSignalLightness,
				onChange: l,
				min: 0,
				max: 1,
				decimals: 2
			})
		]
	}) });
}
function ct() {
	let [e, t] = T(), [n, r] = X("themer:shouldThemeSelf", !0, V), [i, a] = X("themer:currentTab", Q.THEMES, ot), o = n ? e : it;
	return /* @__PURE__ */ y(I, {
		themeConfig: o.config,
		children: /* @__PURE__ */ y(We, { children: /* @__PURE__ */ b("div", {
			className: "hc:flex hc:flex-col hc:flex-auto hc:min-w-0 hc:min-h-0 hc:overflow-hidden",
			children: [
				/* @__PURE__ */ y("div", {
					className: "hc:px-2 hc:pt-2 hc:border-b",
					children: /* @__PURE__ */ b(O, {
						growEach: !0,
						children: [/* @__PURE__ */ y(P, {
							colors: i === Q.THEMES ? "huet-bg-100" : "huet-text-100",
							onClick: () => a(Q.THEMES),
							children: "Themes"
						}), /* @__PURE__ */ y(P, {
							colors: i === Q.EDIT_THEME ? "huet-bg-100" : "huet-text-100",
							onClick: () => a(Q.EDIT_THEME),
							children: "Edit Theme"
						})]
					})
				}),
				/* @__PURE__ */ y(at, { children: i === Q.EDIT_THEME ? /* @__PURE__ */ y(st, {
					theme: e,
					themerTheme: o,
					onThemeConfigChange: t
				}) : /* @__PURE__ */ y(rt, {}) }),
				/* @__PURE__ */ y("div", {
					className: "huet-bg-12",
					children: /* @__PURE__ */ y(k, {
						className: "hc:p-4",
						children: /* @__PURE__ */ y(be, {
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
var lt = class extends e.Component {
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
		return this.state.hasError ? /* @__PURE__ */ b("div", {
			style: {
				fontFamily: "sans-serif",
				textAlign: "center",
				padding: "1em",
				background: "white",
				color: "black"
			},
			children: [/* @__PURE__ */ b("h1", {
				style: {
					color: "red",
					fontSize: "1em",
					margin: "0"
				},
				children: [this.props.componentName && this.props.componentName + ": ", "Something went wrong"]
			}), /* @__PURE__ */ b("p", {
				style: { margin: ".5em 0" },
				children: [
					"Try clearing local storage:",
					" ",
					/* @__PURE__ */ y("button", {
						onClick: Re,
						children: "Reset this Page"
					})
				]
			})]
		}) : this.props.children;
	}
};
// src/ThemeConfigurator.tsx
function ut(e) {
	let t = typeof e == "string" ? document.querySelector(e) : e;
	if (!t) throw Error(`Huet: no element matches ${String(e)}`);
	return t;
}
function dt(e, t) {
	let n = a(() => _(t), [t]), r = o(n);
	r.current = n;
	let s = o(void 0);
	i(() => {
		if (!e) return;
		let t = u(ut(e), r.current);
		return s.current = t, () => {
			t.destroy(), s.current = void 0;
		};
	}, [e]), i(() => s.current?.update(n), [n]);
}
function ft({ target: e, config: t, setConfig: n, children: r }) {
	let i = a(() => new f(t), [t]);
	return dt(e, t), /* @__PURE__ */ y(w.Provider, {
		value: [i, n],
		children: r
	});
}
function pt({ value: e, onChange: n, target: r, children: i }) {
	let a = o(e);
	a.current = e;
	let s = o(n);
	s.current = n;
	let c = t((e) => {
		let t = typeof e == "function" ? e(a.current) : e;
		t !== a.current && s.current?.(t);
	}, []);
	return /* @__PURE__ */ y(ft, {
		target: r,
		config: e,
		setConfig: c,
		children: i
	});
}
function mt({ defaultValue: e = p, onChange: t, target: n, children: r }) {
	let [a, s] = X("theme", e, m), c = o(t);
	return c.current = t, i(() => c.current?.(a), [a]), /* @__PURE__ */ y(ft, {
		target: n,
		config: a,
		setConfig: s,
		children: r
	});
}
function ht({ componentName: e, children: t, ...n }) {
	return /* @__PURE__ */ y(lt, {
		componentName: e,
		children: n.value ? /* @__PURE__ */ y(pt, {
			...n,
			value: n.value,
			children: t
		}) : /* @__PURE__ */ y(mt, {
			...n,
			children: t
		})
	});
}
function gt(e) {
	return /* @__PURE__ */ y(ht, {
		componentName: "Theme Configurator",
		...e,
		children: /* @__PURE__ */ y(ct, {})
	});
}
// src/private/ThemeMiniMap.tsx
var _t = [
	100,
	87.5,
	75,
	62.5,
	50,
	37.5,
	25,
	12.5,
	0
];
function vt(e) {
	let t = e.theme;
	return Object.keys(t.ramps).filter((e) => {
		let n = t.ramps[e].config.mode;
		return e !== t.bgRamp && (n === h.SIGNAL || n === h.FURTHEST);
	}).map((n) => {
		let r = e.contrast(100, t.ramps[n]).hex;
		return {
			rampKey: n,
			color: r,
			ratio: l(e.hex, r)
		};
	}).sort((e, t) => t.ratio - e.ratio);
}
function yt(e) {
	return `linear-gradient(to right, ${_t.map((t) => e.contrast(t).hex).join(", ")})`;
}
function bt({ bg: e }) {
	return /* @__PURE__ */ b("span", {
		"aria-hidden": !0,
		className: "hc:flex hc:flex-col hc:gap-[.25em] hc:shrink-0",
		children: [/* @__PURE__ */ y("span", {
			className: "hc:flex hc:gap-[.25em]",
			children: vt(e).map(({ rampKey: e, color: t }) => /* @__PURE__ */ y("span", {
				title: e,
				className: "hc:size-[.625em] hc:rounded-full",
				style: { backgroundColor: t }
			}, e))
		}), /* @__PURE__ */ y("span", {
			className: "hc:h-[.375em] hc:rounded-full",
			style: { backgroundImage: yt(e) }
		})]
	});
}
// src/EmbeddedThemeConfigurator.tsx
var $ = "hc:not-focus-visible:shadow-none!";
function xt({ config: e, isSelected: t, onSelect: n }) {
	let r = d.fromTheme(new f(e)), i = r.contrast(100), a = t ? i.hex : r.contrast(15).hex, o = t ? i.hex : r.contrast(40).hex;
	return /* @__PURE__ */ b("button", {
		type: "button",
		"aria-pressed": t,
		onClick: n,
		className: E("hc:flex hc:items-center hc:gap-[.75em] hc:w-full hc:py-[.5em] hc:px-[.625em]", "hc:rounded-md hc:border hc:cursor-pointer hc:text-left", $, "hc:border-(color:--item-border) hc:hover:border-(color:--item-border-hover)"),
		style: {
			backgroundColor: r.hex,
			color: i.hex,
			"--item-border": a,
			"--item-border-hover": o
		},
		children: [
			/* @__PURE__ */ y(bt, { bg: r }),
			/* @__PURE__ */ y("span", {
				className: "hc:grow",
				children: e.name
			}),
			/* @__PURE__ */ y(de, {
				size: "1em",
				stroke: 2.5,
				className: E("hc:shrink-0", !t && "hc:invisible")
			})
		]
	});
}
function St() {
	let [e, t] = T(), [n] = X("themes", g, nt);
	return /* @__PURE__ */ y("div", {
		className: "hc:flex hc:flex-col hc:gap-[.375em] hc:px-2 hc:pb-2 hc:pt-1 hc:overflow-y-auto hc:overscroll-contain",
		children: n.map((n) => {
			let r = n.id === e.config.id;
			return /* @__PURE__ */ y(xt, {
				config: r ? e.config : n,
				isSelected: r,
				onSelect: () => !r && t(n)
			}, n.id);
		})
	});
}
function Ct({ mode: e = "contrast", side: t = "bottom", align: n = "end", style: r }) {
	let [a] = T(), [o, c] = s(!1);
	i(F, []);
	let l = d.fromTheme(a), u = l.contrast(100), f = e === "contrast" ? u : l, p = {
		color: f.contrast(100).hex,
		borderColor: e === "outlined" || e === "blended" && o ? u.hex : "transparent",
		"--trigger-bg": e === "contrast" ? f.hex : "transparent",
		"--trigger-hover": e === "contrast" ? f.contrast(6).hex : `color-mix(in srgb, ${u.hex} 8%, transparent)`
	};
	return /* @__PURE__ */ b(C.Root, {
		open: o,
		onOpenChange: c,
		children: [/* @__PURE__ */ y("span", {
			"data-huet-configurator": "",
			style: {
				fontSize: "inherit",
				...r
			},
			children: /* @__PURE__ */ y(C.Trigger, {
				asChild: !0,
				children: /* @__PURE__ */ b("button", {
					type: "button",
					"aria-label": `Theme: ${a.name}`,
					title: a.name,
					className: E("hc:inline-flex hc:items-center hc:gap-[.5em] hc:py-[.375em] hc:pl-[.5em] hc:pr-[.375em]", "hc:rounded-md hc:border hc:cursor-pointer", $, "hc:bg-(--trigger-bg) hc:hover:bg-(--trigger-hover)"),
					style: p,
					children: [/* @__PURE__ */ y(bt, { bg: f }), /* @__PURE__ */ y(fe, {
						size: "1em",
						stroke: 2,
						className: E("hc:shrink-0 hc:transition-transform hc:duration-150", o && "hc:rotate-180")
					})]
				})
			})
		}), /* @__PURE__ */ y(I, {
			themeConfig: a.config,
			children: /* @__PURE__ */ b(C.Content, {
				side: t,
				align: n,
				sideOffset: 6,
				collisionPadding: 8,
				"aria-label": "Themes",
				className: E("huet-bg-0 huet-border-100 hc:border hc:rounded-lg hc:z-[1000]", "hc:font-ui hc:text-[.8125rem] hc:flex hc:flex-col hc:w-[18em]", "hc:max-h-[min(28em,var(--radix-popover-content-available-height))]", "hc:shadow-[0_6px_24px_color-mix(in_srgb,var(--huet-foreground)_calc(16%*var(--huet-configurator-contrast,1)),transparent)]"),
				children: [/* @__PURE__ */ y("div", {
					className: "hc:px-3 hc:pt-2.5 hc:pb-1.5 hc:font-semibold",
					children: "Themes"
				}), /* @__PURE__ */ y(St, {})]
			})
		})]
	});
}
function wt({ mode: e, side: t, align: n, style: r, ...i }) {
	return /* @__PURE__ */ y(ht, {
		componentName: "Embedded Theme Configurator",
		...i,
		children: /* @__PURE__ */ y(Ct, {
			mode: e,
			side: t,
			align: n,
			style: r
		})
	});
}
export { wt as EmbeddedThemeConfigurator, gt as ThemeConfigurator };

//# sourceMappingURL=index.js.map