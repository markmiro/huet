import e, { useCallback as t, useContext as n, useEffect as r, useLayoutEffect as i, useMemo as a, useRef as o, useState as s, useSyncExternalStore as c } from "react";
import { mountTheme as l } from "huet";
import { Color as u, Theme as d, baseThemeConfig as f, getLightness as p, parseThemeConfig as m, rampModes as h, themeConfigs as g, themeFromConfig as _ } from "huet/config";
import v from "file-saver";
import { Fragment as y, jsx as b, jsxs as x } from "react/jsx-runtime";
import S from "chroma-js";
import { chunk as ee, first as te, flatMap as ne, initial as re, isEqual as ie, last as ae, map as oe, range as C, tail as se } from "lodash-es";
import { createPortal as ce } from "react-dom";
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
var le = {
	1: "hc:ml-1",
	2: "hc:ml-2",
	3: "hc:ml-4"
}, ue = {
	1: "hc:mt-1",
	2: "hc:mt-2",
	3: "hc:mt-4"
};
function D({ exceptFirst: t, each: n, children: r }) {
	return e.Children.map(r, (e, r) => /* @__PURE__ */ b("div", {
		className: E(r > 0 && t, n) || void 0,
		children: e
	}));
}
function O({ size: e = 1, growEach: t, children: n, className: r }) {
	return /* @__PURE__ */ b("div", {
		className: E("hc:flex hc:flex-row", r),
		children: /* @__PURE__ */ b(D, {
			each: t ? "hc:grow" : void 0,
			exceptFirst: le[e],
			children: n
		})
	});
}
function k({ size: e = 1, children: t, className: n }) {
	return /* @__PURE__ */ b("div", {
		className: E("hc:flex hc:flex-col", n),
		children: /* @__PURE__ */ b(D, {
			exceptFirst: ue[e],
			children: t
		})
	});
}
// src/private/Arrow.tsx
var de = {
	".5em": "hc:border-x-[.5em] hc:border-b-[.5em]",
	".75em": "hc:border-x-[.75em] hc:border-b-[.75em]"
};
function A({ size: e, className: t, style: n }) {
	return /* @__PURE__ */ b("span", {
		className: E("hc:inline-block hc:w-0 hc:h-0 hc:border-x-transparent hc:border-b-current", de[e], t),
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
function fe({ children: e, className: t, onUpload: n }) {
	return /* @__PURE__ */ x(P, {
		as: "div",
		"data-focus-within": "",
		className: E("hc:relative", t),
		children: [e, /* @__PURE__ */ b("input", {
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
	return /* @__PURE__ */ b(e, {
		onClick: N(i, a),
		...o,
		className: E(M, "hc:w-full hc:border-transparent hc:cursor-default hc:flex hc:justify-center hc:items-center", t, n),
		children: r
	});
}
function pe({ onClick: e, className: t, verify: n, ...r }) {
	return /* @__PURE__ */ b("button", {
		...r,
		className: E("hc:underline hc:cursor-pointer", t),
		onClick: N(n, e)
	});
}
// src/private/BgColors.tsx
function me({ theme: e, scaleValue: t, isSelected: n, onClick: r }) {
	let i = e.ramps[e.bgRamp], a = i(t), o = new u({
		theme: e,
		bgColor: null,
		lab: a,
		ramp: i,
		baseRamp: i
	});
	return /* @__PURE__ */ x(P, {
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
			n && /* @__PURE__ */ b(A, {
				size: ".5em",
				className: "hc:absolute hc:bottom-0 hc:left-1/2 hc:-translate-x-1/2 hc:translate-y-px",
				style: { color: o.contrast(100).toString() }
			})
		]
	});
}
function he({ theme: e, bgRampValue: t, onRampValueChange: n }) {
	return /* @__PURE__ */ b(O, {
		growEach: !0,
		size: 2,
		children: [
			0,
			.25,
			.75,
			1
		].map((r) => /* @__PURE__ */ b(me, {
			theme: e,
			scaleValue: r,
			isSelected: t === r,
			onClick: () => n(r)
		}, r))
	});
}
// src/private/Checkbox.tsx
function ge({ label: e, value: t, onChange: n, className: r }) {
	return /* @__PURE__ */ x("label", {
		className: E("huet-text-100 hc:inline-flex hc:relative hc:cursor-default", r),
		children: [
			/* @__PURE__ */ b("input", {
				"aria-label": e,
				type: "checkbox",
				checked: t,
				onChange: (e) => n?.(e.target.checked),
				className: "hc:absolute hc:top-0 hc:left-0 hc:w-full hc:h-full"
			}),
			/* @__PURE__ */ b("span", {
				className: "hc:mr-1 hc:text-[1.25em] hc:leading-none",
				children: t ? "☒" : "☐"
			}),
			/* @__PURE__ */ b("span", { children: e })
		]
	});
}
// src/private/ColorRamps.tsx
function _e({ color: e, grayRamp: t }) {
	let n = (p(e) - (t.startL ?? 0)) / ((t.endL ?? 0) - (t.startL ?? 0));
	return /* @__PURE__ */ b("div", {
		className: "hc:absolute hc:border hc:border-[color-mix(in_srgb,var(--huet-background)_calc(30%*var(--huet-configurator-contrast,1)),transparent)] hc:outline hc:outline-[color-mix(in_srgb,var(--huet-foreground)_calc(30%*var(--huet-configurator-contrast,1)),transparent)] hc:-outline-offset-2 hc:top-1/2 hc:-translate-y-1/2",
		style: {
			backgroundColor: e || "transparent",
			width: "1em",
			height: "1em",
			left: `calc(${n * 100}% - 1em * ${n})`
		}
	});
}
function ve(e) {
	return [e, e];
}
function ye(e) {
	let t = e.config.classes, n = Array.isArray(t) ? t : [...C(0, 1, 1 / (t ?? 1)), 1], r = te(n) ?? 0, i = ae(n) ?? 1, a = re(se(n));
	return ee([
		r,
		...ne(a, ve),
		i
	], 2);
}
var be = e.memo(function({ ramp: e }) {
	if (!e) return null;
	switch (e.config.classes ? "classes" : "normal") {
		case "classes": return /* @__PURE__ */ b("div", {
			className: "hc:rounded-xs hc:h-full hc:w-full hc:flex",
			children: ye(e).map(([t = 0, n = 0], r) => /* @__PURE__ */ b("div", {
				className: "hc:h-full",
				style: {
					backgroundColor: S.lab(...e((t + n) / 2)).hex(),
					width: `${(n - t) * 100}%`
				}
			}, r))
		});
		default: return /* @__PURE__ */ b("div", {
			className: "hc:rounded-xs hc:h-full hc:w-full",
			style: { background: `linear-gradient(to right, ${C(0, 1.2, .2).map((t) => S.lab(...e(t)).hex()).join(",")})` }
		});
	}
});
function xe({ ramp: e, theme: t }) {
	return /* @__PURE__ */ b("div", {
		className: "hc:flex hc:w-full hc:flex-row hc:h-4 hc:mb-2",
		style: {
			marginLeft: `${e.startL}%`,
			width: `${(e.endL ?? NaN) - (e.startL ?? NaN)}%`
		},
		children: /* @__PURE__ */ x("div", {
			className: "hc:w-full hc:relative hc:flex",
			children: [/* @__PURE__ */ b(be, { ramp: e }), e.config.colors.map((e, n) => /* @__PURE__ */ b(_e, {
				color: t.pallet[e] ?? "",
				grayRamp: t.ramps.gray
			}, n))]
		})
	});
}
function Se({ theme: e }) {
	return /* @__PURE__ */ x("div", {
		className: "hc:w-full",
		children: [/* @__PURE__ */ b("div", { className: "huet-border-10 hc:h-[4px] hc:mb-[6px] hc:w-full hc:bg-[linear-gradient(to_right,black,white)]" }), Object.keys(e.ramps).map((t) => /* @__PURE__ */ b(xe, {
			ramp: e.ramps[t],
			theme: e
		}, t))]
	});
}
// src/configurator.css?inline
var Ce = "/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */\n@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-translate-x:0;--tw-translate-y:0;--tw-translate-z:0;--tw-scale-x:1;--tw-scale-y:1;--tw-scale-z:1;--tw-border-style:solid;--tw-leading:initial;--tw-font-weight:initial;--tw-shadow:0 0 #0000;--tw-shadow-color:initial;--tw-shadow-alpha:100%;--tw-inset-shadow:0 0 #0000;--tw-inset-shadow-color:initial;--tw-inset-shadow-alpha:100%;--tw-ring-color:initial;--tw-ring-shadow:0 0 #0000;--tw-inset-ring-color:initial;--tw-inset-ring-shadow:0 0 #0000;--tw-ring-inset:initial;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-offset-shadow:0 0 #0000;--tw-outline-style:solid;--tw-duration:initial;--tw-ease:initial}}}:root,:host{--hc-spacing:.25rem;--hc-font-weight-normal:400;--hc-font-weight-bold:700;--hc-radius-xs:.125rem;--hc-radius-sm:.25rem;--hc-radius-lg:.5rem;--hc-default-transition-duration:.15s;--hc-default-transition-timing-function:cubic-bezier(.4, 0, .2, 1);--hc-font-ui:-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Roboto\", \"Oxygen\", \"Ubuntu\", \"Cantarell\", \"Fira Sans\", \"Droid Sans\", \"Helvetica Neue\", sans-serif}[data-huet-configurator]{all:initial}[data-huet-configurator] *{all:unset;box-sizing:border-box;display:block}[data-huet-configurator][data-huet-root],[data-huet-configurator][data-huet-color-bg],[data-huet-configurator] [data-huet-color-bg]{background-color:var(--huet-background);color:var(--huet-foreground)}[data-huet-configurator][data-huet-color-text],[data-huet-configurator] [data-huet-color-text]{color:var(--huet-relative-text,var(--huet-foreground))}[data-huet-configurator][data-huet-color-border],[data-huet-configurator] [data-huet-color-border]{border-color:var(--huet-relative-border)}[data-huet-configurator][data-huet-color-outline],[data-huet-configurator] [data-huet-color-outline]{outline-color:var(--huet-relative-outline)}@media (forced-colors:active){[data-huet-configurator][data-huet-root],[data-huet-configurator][data-huet-color-bg],[data-huet-configurator] [data-huet-color-bg]{color:canvastext;background-color:canvas}[data-huet-configurator][data-huet-color-text],[data-huet-configurator] [data-huet-color-text]{color:canvastext}[data-huet-configurator][data-huet-color-border],[data-huet-configurator] [data-huet-color-border]{border-color:buttonborder}[data-huet-configurator][data-huet-color-outline],[data-huet-configurator] [data-huet-color-outline]{outline-color:highlight}}[data-huet-configurator] :focus,[data-huet-configurator] [data-focus-within]:focus-within{z-index:1;box-shadow:0 0 0 2px #00f5,0 0 0 2px #fff5!important}[data-huet-configurator] input[type=range]{appearance:none;background:0 0;width:100%!important}[data-huet-configurator] input[type=range]::-webkit-slider-thumb{-webkit-appearance:none!important;background:currentColor!important;width:1px!important;height:1em!important}[data-huet-configurator] input[type=color]::-webkit-color-swatch-wrapper{padding:0;-webkit-appearance:none!important}[data-huet-configurator] input[type=color]::-webkit-color-swatch{border:none;padding:0}.hc\\:pointer-events-none{pointer-events:none}.hc\\:absolute{position:absolute}.hc\\:fixed{position:fixed}.hc\\:relative{position:relative}.hc\\:top-0{top:0}.hc\\:top-1\\/2{top:50%}.hc\\:right-\\[1em\\]{right:1em}.hc\\:bottom-0{bottom:0}.hc\\:bottom-\\[1em\\]{bottom:1em}.hc\\:left-0{left:0}.hc\\:left-1\\/2{left:50%}.hc\\:z-\\[999\\]{z-index:999}.hc\\:mx-2{margin-inline:calc(var(--hc-spacing) * 2)}.hc\\:-mt-2{margin-top:calc(var(--hc-spacing) * -2)}.hc\\:mt-1{margin-top:var(--hc-spacing)}.hc\\:mt-2{margin-top:calc(var(--hc-spacing) * 2)}.hc\\:mt-4{margin-top:calc(var(--hc-spacing) * 4)}.hc\\:mt-px{margin-top:1px}.hc\\:mr-1{margin-right:var(--hc-spacing)}.hc\\:mr-2{margin-right:calc(var(--hc-spacing) * 2)}.hc\\:mb-1{margin-bottom:var(--hc-spacing)}.hc\\:mb-2{margin-bottom:calc(var(--hc-spacing) * 2)}.hc\\:mb-\\[6px\\]{margin-bottom:6px}.hc\\:ml-1{margin-left:var(--hc-spacing)}.hc\\:ml-2{margin-left:calc(var(--hc-spacing) * 2)}.hc\\:ml-4{margin-left:calc(var(--hc-spacing) * 4)}.hc\\:flex{display:flex}.hc\\:inline{display:inline}.hc\\:inline-block{display:inline-block}.hc\\:inline-flex{display:inline-flex}.hc\\:h-0{height:0}.hc\\:h-2{height:calc(var(--hc-spacing) * 2)}.hc\\:h-4{height:calc(var(--hc-spacing) * 4)}.hc\\:h-6{height:calc(var(--hc-spacing) * 6)}.hc\\:h-8{height:calc(var(--hc-spacing) * 8)}.hc\\:h-\\[\\.5em\\]{height:.5em}.hc\\:h-\\[4px\\]{height:4px}.hc\\:h-\\[min\\(64em\\,100vh-2em\\)\\]{height:min(64em,100vh - 2em)}.hc\\:h-full{height:100%}.hc\\:min-h-0{min-height:0}.hc\\:w-0{width:0}.hc\\:w-\\[5em\\]{width:5em}.hc\\:w-\\[30em\\]{width:30em}.hc\\:w-full{width:100%}.hc\\:max-w-\\[30em\\]{max-width:30em}.hc\\:min-w-0{min-width:0}.hc\\:flex-auto{flex:auto}.hc\\:shrink-0{flex-shrink:0}.hc\\:grow{flex-grow:1}.hc\\:basis-\\[20em\\]{flex-basis:20em}.hc\\:-translate-x-1\\/2{--tw-translate-x:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:-translate-y-1\\/2{--tw-translate-y:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-y-0{--tw-translate-y:0px;translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-y-\\[2em\\]{--tw-translate-y:2em;translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-y-px{--tw-translate-y:1px;translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:scale-y-0{--tw-scale-y:0%;scale:var(--tw-scale-x) var(--tw-scale-y)}.hc\\:cursor-auto{cursor:auto}.hc\\:cursor-default{cursor:default}.hc\\:cursor-pointer{cursor:pointer}.hc\\:flex-col{flex-direction:column}.hc\\:flex-row{flex-direction:row}.hc\\:items-center{align-items:center}.hc\\:justify-between{justify-content:space-between}.hc\\:justify-center{justify-content:center}.hc\\:self-stretch{align-self:stretch}.hc\\:overflow-hidden{overflow:hidden}.hc\\:overflow-x-hidden{overflow-x:hidden}.hc\\:overflow-y-scroll{overflow-y:scroll}.hc\\:overscroll-contain{overscroll-behavior:contain}.hc\\:rounded-lg{border-radius:var(--hc-radius-lg)}.hc\\:rounded-sm{border-radius:var(--hc-radius-sm)}.hc\\:rounded-xs{border-radius:var(--hc-radius-xs)}.hc\\:border{border-style:var(--tw-border-style);border-width:1px}.hc\\:border-x-\\[\\.5em\\]{border-inline-style:var(--tw-border-style);border-inline-width:.5em}.hc\\:border-x-\\[\\.75em\\]{border-inline-style:var(--tw-border-style);border-inline-width:.75em}.hc\\:border-b{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.hc\\:border-b-\\[\\.5em\\]{border-bottom-style:var(--tw-border-style);border-bottom-width:.5em}.hc\\:border-b-\\[\\.75em\\]{border-bottom-style:var(--tw-border-style);border-bottom-width:.75em}.hc\\:border-\\[color-mix\\(in_srgb\\,var\\(--huet-background\\)_calc\\(30\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{border-color:var(--huet-background)}@supports (color:color-mix(in lab, red, red)){.hc\\:border-\\[color-mix\\(in_srgb\\,var\\(--huet-background\\)_calc\\(30\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{border-color:color-mix(in srgb,var(--huet-background) calc(30% * var(--huet-configurator-contrast,1)),transparent)}}.hc\\:border-transparent{border-color:#0000}.hc\\:border-x-transparent{border-inline-color:#0000}.hc\\:border-b-current{border-bottom-color:currentColor}.hc\\:bg-\\[linear-gradient\\(to_right\\,black\\,white\\)\\]{background-image:linear-gradient(90deg,#000,#fff)}.hc\\:p-0{padding:0}.hc\\:p-2{padding:calc(var(--hc-spacing) * 2)}.hc\\:p-4{padding:calc(var(--hc-spacing) * 4)}.hc\\:px-2{padding-inline:calc(var(--hc-spacing) * 2)}.hc\\:px-4{padding-inline:calc(var(--hc-spacing) * 4)}.hc\\:px-\\[\\.5em\\]{padding-inline:.5em}.hc\\:py-2{padding-block:calc(var(--hc-spacing) * 2)}.hc\\:py-\\[\\.3em\\]{padding-block:.3em}.hc\\:pt-2{padding-top:calc(var(--hc-spacing) * 2)}.hc\\:font-ui{font-family:var(--hc-font-ui)}.hc\\:text-\\[\\.75rem\\]{font-size:.75rem}.hc\\:text-\\[1\\.25em\\]{font-size:1.25em}.hc\\:leading-none{--tw-leading:1;line-height:1}.hc\\:font-bold{--tw-font-weight:var(--hc-font-weight-bold);font-weight:var(--hc-font-weight-bold)}.hc\\:font-normal{--tw-font-weight:var(--hc-font-weight-normal);font-weight:var(--hc-font-weight-normal)}.hc\\:underline{text-decoration-line:underline}.hc\\:opacity-0{opacity:0}.hc\\:opacity-100{opacity:1}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,var(--huet-foreground))}@supports (color:color-mix(in lab, red, red)){.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,color-mix(in srgb,var(--huet-foreground) calc(12.5% * var(--huet-configurator-contrast,1)),transparent))}}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-relative-text\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,var(--huet-relative-text))}@supports (color:color-mix(in lab, red, red)){.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-relative-text\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,color-mix(in srgb,var(--huet-relative-text) calc(12.5% * var(--huet-configurator-contrast,1)),transparent))}}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-relative-text\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.hc\\:outline{outline-style:var(--tw-outline-style);outline-width:1px}.hc\\:-outline-offset-2{outline-offset:calc(2px * -1)}.hc\\:outline-\\[color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(30\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{outline-color:var(--huet-foreground)}@supports (color:color-mix(in lab, red, red)){.hc\\:outline-\\[color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(30\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{outline-color:color-mix(in srgb,var(--huet-foreground) calc(30% * var(--huet-configurator-contrast,1)),transparent)}}.hc\\:transition-\\[opacity\\,translate\\,height\\]{transition-property:opacity,translate,height;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:transition-\\[scale\\,margin\\,opacity\\]{transition-property:scale,margin,opacity;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:transition-opacity{transition-property:opacity;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:duration-150{--tw-duration:.15s;transition-duration:.15s}.hc\\:duration-200{--tw-duration:.2s;transition-duration:.2s}.hc\\:duration-400{--tw-duration:.4s;transition-duration:.4s}.hc\\:ease-\\[ease-out\\]{--tw-ease:ease-out;transition-timing-function:ease-out}.hc\\:ease-\\[ease\\]{--tw-ease:ease;transition-timing-function:ease}.hc\\:select-none{-webkit-user-select:none;user-select:none}@property --tw-translate-x{syntax:\"*\";inherits:false;initial-value:0}@property --tw-translate-y{syntax:\"*\";inherits:false;initial-value:0}@property --tw-translate-z{syntax:\"*\";inherits:false;initial-value:0}@property --tw-scale-x{syntax:\"*\";inherits:false;initial-value:1}@property --tw-scale-y{syntax:\"*\";inherits:false;initial-value:1}@property --tw-scale-z{syntax:\"*\";inherits:false;initial-value:1}@property --tw-border-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-leading{syntax:\"*\";inherits:false}@property --tw-font-weight{syntax:\"*\";inherits:false}@property --tw-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-shadow-color{syntax:\"*\";inherits:false}@property --tw-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-inset-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-inset-shadow-color{syntax:\"*\";inherits:false}@property --tw-inset-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-ring-color{syntax:\"*\";inherits:false}@property --tw-ring-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-inset-ring-color{syntax:\"*\";inherits:false}@property --tw-inset-ring-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-ring-inset{syntax:\"*\";inherits:false}@property --tw-ring-offset-width{syntax:\"<length>\";inherits:false;initial-value:0}@property --tw-ring-offset-color{syntax:\"*\";inherits:false;initial-value:#fff}@property --tw-ring-offset-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-outline-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-duration{syntax:\"*\";inherits:false}@property --tw-ease{syntax:\"*\";inherits:false}";
// src/private/ConfiguratorPortal.tsx
function we() {
	if (document.head.querySelector("style[data-huet-configurator-styles]")) return;
	let e = document.createElement("style");
	e.setAttribute("data-huet-configurator-styles", ""), e.textContent = Ce, document.head.append(e);
}
function Te({ themeConfig: e, children: t }) {
	let [n, r] = s(null);
	i(() => {
		we();
		let e = document.createElement("div");
		return e.setAttribute("data-huet-configurator", ""), document.body.append(e), r(e), () => e.remove();
	}, []);
	let c = a(() => _(e), [e]), u = o(c);
	u.current = c;
	let d = o(void 0);
	return i(() => {
		if (!n) return;
		let e = l(n, u.current);
		return d.current = {
			theme: u.current,
			update: e.update
		}, () => {
			e.destroy(), d.current = void 0;
		};
	}, [n]), i(() => {
		let e = d.current;
		e && e.theme !== c && (e.theme = c, e.update(c));
	}, [c]), i(() => {
		n?.style.setProperty("--huet-configurator-contrast", String(e.contrastMultiplier));
	}, [n, e.contrastMultiplier]), n ? ce(t, n) : null;
}
// src/private/Labeled.tsx
function F({ label: e, children: t, className: n, ...r }) {
	return e ? /* @__PURE__ */ x("label", {
		className: n,
		...r,
		children: [/* @__PURE__ */ b("span", {
			className: "hc:mb-1 hc:cursor-default",
			children: e
		}), t]
	}) : /* @__PURE__ */ b("div", {
		className: n,
		...r,
		children: t
	});
}
// src/private/Input.tsx
function Ee({ label: e, value: t, onChange: n, className: r, ...i }) {
	return /* @__PURE__ */ b(F, {
		label: e,
		className: "hc:flex hc:flex-col hc:flex-auto hc:min-w-0 hc:min-h-0 hc:max-w-[30em]",
		children: /* @__PURE__ */ b("input", {
			"aria-label": e,
			className: E("huet-border-20", M, "hc:w-full hc:cursor-auto", r),
			value: t,
			onChange: (e) => n?.(e.target.value),
			...i
		})
	});
}
// src/private/Pallet.tsx
function De({ color: e, onChange: t }) {
	return /* @__PURE__ */ b("input", {
		type: "color",
		value: e,
		onChange: (e) => t(e.target.value),
		className: "huet-border-12 hc:w-full hc:h-4 hc:p-0 hc:border hc:rounded-xs hc:overflow-hidden",
		style: { backgroundColor: e || "transparent" }
	});
}
function Oe({ colors: e, onColorsChange: t }) {
	return /* @__PURE__ */ b(O, {
		growEach: !0,
		children: oe(e, (n, r) => /* @__PURE__ */ b(De, {
			color: n,
			onChange: (n) => t({
				...e,
				[r]: n
			})
		}, r))
	});
}
// src/private/Range.tsx
function I({ label: e, min: t = 0, max: n = 100, decimals: i = 0, value: o, onChange: c, className: l, hideInput: u = !1 }) {
	let d = 1 / 10 ** i, [f, p] = s(!1), [m, h] = s(o.toFixed(i)), g = o < t || o > n;
	r(() => {
		f || h(o.toFixed(i));
	}, [
		i,
		f,
		o
	]);
	let _ = (e) => {
		h(e.target.value);
		let t = Number.parseFloat(e.target.value);
		Number.isFinite(t) && c?.(t);
	}, v = (e) => {
		let t = Number.parseFloat(e.target.value);
		c?.(t);
	}, y = (e) => {
		let t = null;
		if (e.key === "ArrowUp" && (t = 1), e.key === "ArrowDown" && (t = -1), t) {
			let n = e.shiftKey ? o + d * 10 * t : o + d * t;
			h(n.toFixed(i)), c?.(n), e.preventDefault();
		}
	}, S = a(() => /* @__PURE__ */ x("span", {
		className: "hc:flex hc:justify-between",
		children: [e, /* @__PURE__ */ x("span", {
			className: g ? "huet-text-red-100" : "huet-text-50",
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
		g,
		i,
		t,
		n
	]);
	return /* @__PURE__ */ b(F, {
		label: e && S,
		className: E("hc:flex hc:flex-col hc:max-w-[30em]", l),
		onKeyDown: y,
		children: /* @__PURE__ */ x("span", {
			className: "hc:flex hc:items-center",
			children: [!u && /* @__PURE__ */ b("input", {
				"aria-hidden": !0,
				type: "number",
				className: E(g ? "huet-border-red-100 huet-bg-red-12 huet-bg/text-red-100" : "huet-border-20", "hc:py-[.3em] hc:px-[.5em] hc:border hc:max-w-[30em] hc:rounded-xs", "hc:w-[5em] hc:mr-2 hc:cursor-auto"),
				value: m,
				step: d,
				onFocus: () => p(!0),
				onBlur: () => p(!1),
				onChange: _
			}), /* @__PURE__ */ b("input", {
				"aria-label": typeof e == "string" ? e : void 0,
				type: "range",
				className: E("huet-border-20", M, "hc:w-full hc:self-stretch hc:cursor-default"),
				min: t,
				max: n,
				step: d,
				value: o,
				onChange: v
			})]
		})
	});
}
// src/private/persistentState.ts
var L = "huet:", R = "useBrowserState_huet_", ke = ["themer:showHelp"], Ae = 500, z = (e) => typeof e == "boolean" ? e : void 0;
function je(e) {
	return (t) => e.includes(t) ? t : void 0;
}
function B() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function V(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) {
		let r = e.key(n);
		r !== null && t.push(r);
	}
	return t;
}
function Me(e, t, n) {
	let r = B();
	if (!r) return t;
	try {
		let i = r.getItem(L + e);
		if (i === null) return t;
		let a = n(JSON.parse(i));
		if (a !== void 0) return a;
	} catch {}
	console.warn(`Huet: discarding invalid saved value for "${e}"`);
	try {
		r.removeItem(L + e);
	} catch {}
	return t;
}
var H = /* @__PURE__ */ new Map(), U = /* @__PURE__ */ new Set(), W;
function G() {
	for (let e of U) e();
}
function Ne(e, t) {
	H.set(e, t), clearTimeout(W), W = setTimeout(K, Ae), G();
}
function K() {
	if (clearTimeout(W), W = void 0, H.size === 0) return;
	let e = B();
	for (let [t, n] of H) try {
		e?.setItem(L + t, JSON.stringify(n));
	} catch (e) {
		console.warn(`Huet: couldn't save "${t}"`, e);
	}
	H.clear(), G();
}
function Pe() {
	clearTimeout(W), W = void 0, H.clear(), G();
	let e = B();
	if (e) for (let t of V(e)) (t.startsWith(L) || t.startsWith(R)) && e.removeItem(t);
}
function Fe() {
	Pe(), window.location.reload();
}
function Ie() {
	let e = B();
	if (e) try {
		for (let t of V(e)) t.startsWith(R) && e.removeItem(t);
		for (let t of ke) e.removeItem(L + t);
	} catch {}
}
typeof window < "u" && (Ie(), window.addEventListener("pagehide", K), document.addEventListener("visibilitychange", () => {
	document.visibilityState === "hidden" && K();
}));
function Le(e) {
	return U.add(e), () => {
		U.delete(e);
	};
}
function Re() {
	return c(Le, () => H.size > 0, () => !1);
}
function q(e, n, i) {
	let [a, c] = s(() => Me(e, n, i)), l = o(!1);
	return r(() => {
		l.current && Ne(e, a);
	}, [e, a]), [a, t((e) => {
		l.current = !0, c(e);
	}, [])];
}
// src/private/ThemerShell.tsx
function ze() {
	let e = Re();
	return /* @__PURE__ */ b("span", {
		className: E("huet-bg-green-25 huet-bg/text-green-100 hc:inline hc:rounded-lg hc:px-2 hc:font-normal", "hc:transition-opacity hc:duration-400 hc:ease-[ease]", e ? "hc:opacity-0" : "hc:opacity-100"),
		children: "Saved"
	});
}
function J({ isExpanded: e, onClick: t }) {
	return /* @__PURE__ */ x("button", {
		onClick: t,
		"aria-expanded": e,
		title: e ? "Collapse" : "Expand",
		className: "huet-bg-100 hc:w-full hc:flex hc:justify-between hc:shrink-0 hc:select-none",
		children: [/* @__PURE__ */ x("span", {
			className: "hc:py-2 hc:px-2 hc:font-bold",
			children: ["Huet Theme Configurator ", e && /* @__PURE__ */ b(ze, {})]
		}), /* @__PURE__ */ b("span", {
			className: "huet-bg-25 hc:flex hc:justify-center hc:items-center hc:px-4 hc:font-bold",
			children: e ? "↓" : "↑"
		})]
	});
}
var Y = E("huet-outline-25 hc:fixed hc:right-[1em] hc:bottom-[1em] hc:z-[999]", "hc:font-ui hc:text-[.75rem] hc:outline", "hc:transition-[opacity,translate,height] hc:duration-200 hc:ease-[ease-out]"), X = {
	expanded: "hc:shadow-[0_5px_30px_color-mix(in_srgb,var(--huet-foreground)_calc(12.5%*var(--huet-configurator-contrast,1)),transparent)]",
	collapsed: "hc:shadow-[0_5px_30px_color-mix(in_srgb,var(--huet-relative-text)_calc(12.5%*var(--huet-configurator-contrast,1)),transparent)]"
};
function Be({ children: e }) {
	let [t, n] = q("themer:isExpanded", !0, z), [i, a] = s(!1);
	return r(() => a(!0), []), t ? /* @__PURE__ */ x("div", {
		className: E(Y, "huet-bg-0", X.expanded, "hc:flex hc:flex-col hc:h-[min(64em,100vh-2em)]", i ? "hc:translate-y-0 hc:opacity-100" : "hc:translate-y-[2em] hc:opacity-0"),
		children: [/* @__PURE__ */ b(J, {
			isExpanded: !0,
			onClick: () => n((e) => !e)
		}), e]
	}) : /* @__PURE__ */ b("div", {
		className: E(Y, "huet-text-100", X.collapsed),
		children: /* @__PURE__ */ b(J, { onClick: () => n((e) => !e) })
	});
}
// src/private/Themes.tsx
function Z(e) {
	return u.fromTheme(e).contrast(0);
}
function Q({ theme: e, isSelected: t, children: n, onClick: r, isHidden: i }) {
	let a = u.fromTheme(e), s = a.contrast(0), c = "hc:w-full hc:h-full hc:border hc:rounded-sm hc:relative hc:overflow-hidden", l = {
		backgroundColor: s.hex,
		color: s.contrast(100).hex,
		borderColor: a.contrast(t ? 100 : 12).hex,
		boxShadow: `0 2px 10px ${a.contrast(100).alpha(.2)}`
	}, d = o(null), f = d.current ? d.current.clientHeight : 0;
	return /* @__PURE__ */ b("div", {
		ref: d,
		className: E("hc:flex hc:relative hc:basis-[20em] hc:shrink-0 hc:transition-[scale,margin,opacity] hc:duration-150 hc:ease-[ease-out]", i && "hc:pointer-events-none hc:scale-y-0 hc:opacity-0"),
		style: i ? {
			marginTop: `-${f / 2}px`,
			marginBottom: `-${f / 2}px`
		} : void 0,
		children: t ? /* @__PURE__ */ x("div", {
			className: c,
			style: l,
			children: [n, /* @__PURE__ */ b(A, {
				size: ".75em",
				className: "hc:absolute hc:bottom-0 hc:left-1/2 hc:-translate-x-1/2"
			})]
		}) : /* @__PURE__ */ b("button", {
			onClick: r,
			className: c,
			style: l,
			children: /* @__PURE__ */ b("div", {
				className: "hc:h-full",
				children: n
			})
		})
	});
}
function Ve({ theme: e }) {
	return /* @__PURE__ */ b("div", {
		className: "hc:flex hc:h-[.5em]",
		children: Object.keys(e.pallet).map((t) => /* @__PURE__ */ b("div", {
			className: "hc:w-full hc:h-full",
			style: { backgroundColor: e.pallet[t] }
		}, t))
	});
}
function He({ children: e }) {
	return /* @__PURE__ */ b("h3", {
		className: "hc:mx-2 hc:py-2 hc:flex hc:items-center hc:justify-between",
		children: e
	});
}
function Ue({ bg: e }) {
	return /* @__PURE__ */ b("div", {
		className: "hc:-mt-2 hc:h-2",
		style: { background: `linear-gradient(${e}, ${e.contrast(12)})` }
	});
}
function We({ theme: e, bg: t }) {
	return Object.keys(e.ramps).filter((t) => {
		let n = e.ramps[t].config.mode;
		return n === h.SIGNAL || n === h.FURTHEST;
	}).map((n) => {
		let r = t.base(e.ramps[n]);
		return /* @__PURE__ */ b("div", {
			className: "hc:flex",
			children: [
				100,
				75,
				50,
				25
			].map((e) => /* @__PURE__ */ b("div", {
				className: E("hc:w-full hc:mt-px", n === "gray" ? "hc:h-6" : "hc:h-2"),
				style: { backgroundColor: r.contrast(e).hex }
			}, e))
		}, n);
	});
}
function Ge({ children: e }) {
	return /* @__PURE__ */ b("div", {
		className: "hc:flex",
		children: /* @__PURE__ */ b("div", {
			className: "hc:p-2 hc:w-full hc:flex hc:flex-col",
			children: e
		})
	});
}
var Ke = e.memo(function({ config: e, isSelected: t, onClick: n, onRemove: r }) {
	let [i, a] = s(!1), o = new d(e), c = Z(o), l = e.id === f.id;
	function u() {
		a(!0), setTimeout(() => r(), 200);
	}
	return /* @__PURE__ */ x(Q, {
		theme: o,
		isSelected: t,
		onClick: n,
		isHidden: i,
		children: [
			/* @__PURE__ */ b(Ve, { theme: o }),
			/* @__PURE__ */ x(He, { children: [o.name, t && !l && /* @__PURE__ */ b(pe, {
				style: { color: c.base(o.ramps.red).contrast(100).hex },
				onClick: u,
				verify: !0,
				children: "Remove"
			})] }),
			/* @__PURE__ */ b(Ue, { bg: c }),
			/* @__PURE__ */ b(Ge, { children: /* @__PURE__ */ b(We, {
				theme: o,
				bg: c
			}) })
		]
	});
});
function qe(e, t) {
	let n = e.contrast(100, e.theme.ramps[t]);
	return {
		backgroundColor: n.hex,
		color: n.contrast(100).hex
	};
}
function Je({ config: e, onReset: t, onCreate: n }) {
	let r = new d(e), i = Z(r);
	return /* @__PURE__ */ x(Q, {
		isSelected: !0,
		theme: r,
		children: [
			/* @__PURE__ */ b(Ve, { theme: r }),
			/* @__PURE__ */ b(He, { children: r.name }),
			/* @__PURE__ */ b(Ue, { bg: i }),
			/* @__PURE__ */ x(Ge, { children: [/* @__PURE__ */ b(P, {
				colors: "",
				style: qe(i, "green"),
				onClick: n,
				children: "Save As New Theme"
			}), /* @__PURE__ */ b(P, {
				colors: "",
				className: "hc:mt-1",
				style: qe(i, "red"),
				verify: !0,
				onClick: t,
				children: "Reset"
			})] })
		]
	});
}
function Ye({ configs: e, config: t, onSelectConfig: n, onConfigsChange: r }) {
	let [a] = T(), s = a.config, c = t.id === s.id, l = c && !ie(t, s), u = () => n(t), d = () => {
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
	}, []), /* @__PURE__ */ b("div", {
		ref: p,
		children: l ? /* @__PURE__ */ b(Je, {
			config: s,
			onReset: u,
			onCreate: f
		}) : /* @__PURE__ */ b(Ke, {
			config: t,
			isSelected: c,
			onClick: u,
			onRemove: d
		})
	});
}
var Xe = (e) => {
	if (!Array.isArray(e)) return;
	let t = e.map(m).filter((e) => e !== void 0);
	return t.length > 0 ? t : void 0;
};
function Ze() {
	let [e, t] = q("themes", g, Xe), [, n] = T();
	return /* @__PURE__ */ x(k, {
		size: 3,
		className: "hc:p-4",
		children: [/* @__PURE__ */ b(fe, {
			onUpload: (r) => {
				let i = {
					...r,
					id: Math.random()
				};
				t([i, ...e]), n(i);
			},
			children: "Import Theme"
		}), e.map((r) => /* @__PURE__ */ b(Ye, {
			configs: e,
			config: r,
			onSelectConfig: n,
			onConfigsChange: t
		}, r.id))]
	});
}
// src/Themer.tsx
var Qe = new d(f);
function $e({ children: e }) {
	return /* @__PURE__ */ b("div", {
		className: "hc:overflow-y-scroll hc:overflow-x-hidden hc:w-[30em] hc:overscroll-contain hc:flex-auto hc:min-w-0 hc:min-h-0",
		children: e
	});
}
var $ = {
	THEMES: "THEMES",
	EDIT_THEME: "EDIT_THEME"
}, et = je(Object.values($));
function tt({ theme: e, themerTheme: n, onThemeConfigChange: r }) {
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
		v(n, `${i.name} Huet Theme.json`);
	}, [i]);
	return /* @__PURE__ */ b(y, { children: /* @__PURE__ */ x(k, {
		size: 2,
		className: "hc:p-4",
		children: [
			/* @__PURE__ */ x("div", { children: [/* @__PURE__ */ b(Ee, {
				label: "Theme Name",
				className: "hc:flex-auto hc:min-w-0 hc:min-h-0 hc:mb-2",
				value: i.name,
				onChange: (e) => r({
					...i,
					name: e
				})
			}), /* @__PURE__ */ b(P, {
				onClick: d,
				children: "Export Theme"
			})] }),
			/* @__PURE__ */ b(F, {
				label: "Background Color",
				children: /* @__PURE__ */ b(he, {
					theme: e,
					bgRampValue: i.bgRampValue,
					onRampValueChange: o
				})
			}),
			/* @__PURE__ */ b(I, {
				label: "Contrast",
				min: 0,
				max: 1,
				decimals: 2,
				value: i.contrastMultiplier,
				onChange: s
			}),
			/* @__PURE__ */ b(F, {
				label: "Pallet",
				children: /* @__PURE__ */ b(Oe, {
					colors: i.pallet,
					onColorsChange: c
				})
			}),
			/* @__PURE__ */ b(F, {
				label: "Color ramps",
				children: /* @__PURE__ */ b(Se, { theme: n })
			}),
			/* @__PURE__ */ b(I, {
				label: "Signal Lightness on 'Black'",
				value: i.endSignalLightness,
				onChange: u,
				min: 0,
				max: 1,
				decimals: 2
			}),
			/* @__PURE__ */ b(I, {
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
function nt() {
	let [e, t] = T(), [n, r] = q("themer:shouldThemeSelf", !0, z), [i, a] = q("themer:currentTab", $.THEMES, et), o = n ? e : Qe;
	return /* @__PURE__ */ b(Te, {
		themeConfig: o.config,
		children: /* @__PURE__ */ b(Be, { children: /* @__PURE__ */ x("div", {
			className: "hc:flex hc:flex-col hc:flex-auto hc:min-w-0 hc:min-h-0 hc:overflow-hidden",
			children: [
				/* @__PURE__ */ b("div", {
					className: "hc:px-2 hc:pt-2 hc:border-b",
					children: /* @__PURE__ */ x(O, {
						growEach: !0,
						children: [/* @__PURE__ */ b(P, {
							colors: i === $.THEMES ? "huet-bg-100" : "huet-text-100",
							onClick: () => a($.THEMES),
							children: "Themes"
						}), /* @__PURE__ */ b(P, {
							colors: i === $.EDIT_THEME ? "huet-bg-100" : "huet-text-100",
							onClick: () => a($.EDIT_THEME),
							children: "Edit Theme"
						})]
					})
				}),
				/* @__PURE__ */ b($e, { children: i === $.EDIT_THEME ? /* @__PURE__ */ b(tt, {
					theme: e,
					themerTheme: o,
					onThemeConfigChange: t
				}) : /* @__PURE__ */ b(Ze, {}) }),
				/* @__PURE__ */ b("div", {
					className: "huet-bg-12",
					children: /* @__PURE__ */ b(k, {
						className: "hc:p-4",
						children: /* @__PURE__ */ b(ge, {
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
var rt = class extends e.Component {
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
						onClick: Fe,
						children: "Reset this Page"
					})
				]
			})]
		}) : this.props.children;
	}
};
// src/ThemeConfigurator.tsx
function it(e) {
	let t = typeof e == "string" ? document.querySelector(e) : e;
	if (!t) throw Error(`Huet: no element matches ${String(e)}`);
	return t;
}
function at(e, t) {
	let n = a(() => _(t), [t]), r = o(n);
	r.current = n;
	let s = o(void 0);
	i(() => {
		if (!e) return;
		let t = l(it(e), r.current);
		return s.current = t, () => {
			t.destroy(), s.current = void 0;
		};
	}, [e]), i(() => s.current?.update(n), [n]);
}
function ot({ target: e, config: t, setConfig: n }) {
	let r = a(() => new d(t), [t]);
	return at(e, t), /* @__PURE__ */ b(w.Provider, {
		value: [r, n],
		children: /* @__PURE__ */ b(nt, {})
	});
}
function st({ value: e, onChange: n, target: r }) {
	let i = o(e);
	i.current = e;
	let a = o(n);
	a.current = n;
	let s = t((e) => {
		let t = typeof e == "function" ? e(i.current) : e;
		t !== i.current && a.current?.(t);
	}, []);
	return /* @__PURE__ */ b(ot, {
		target: r,
		config: e,
		setConfig: s
	});
}
function ct({ defaultValue: e = f, onChange: t, target: n }) {
	let [r, a] = q("theme", e, m), s = o(t);
	return s.current = t, i(() => s.current?.(r), [r]), /* @__PURE__ */ b(ot, {
		target: n,
		config: r,
		setConfig: a
	});
}
function lt(e) {
	return /* @__PURE__ */ b(rt, {
		componentName: "Theme Configurator",
		children: e.value ? /* @__PURE__ */ b(st, {
			...e,
			value: e.value
		}) : /* @__PURE__ */ b(ct, { ...e })
	});
}
export { lt as ThemeConfigurator };

//# sourceMappingURL=index.js.map