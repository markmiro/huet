import { hues, type Hue } from "./theme";
export const steps = [0, 5, 10, 25, 50, 75, 100] as const;
export type Surface = (typeof steps)[number] | Hue;
export type HuetClass =
  | `huet-surface-${Surface}`
  | "huet-text"
  | "huet-muted"
  | "huet-border"
  | "huet-focus"
  | `huet-text-${Hue}`;
export const classes: readonly HuetClass[] = Object.freeze([
  ...steps.map((x) => `huet-surface-${x}` as const),
  ...hues.map((x) => `huet-surface-${x}` as const),
  "huet-text",
  "huet-muted",
  "huet-border",
  "huet-focus",
  ...hues.map((x) => `huet-text-${x}` as const),
]);
const known = new Set<string>(classes);
export function isHuetClass(value: string): value is HuetClass {
  return known.has(value);
}
/** Check a literal class list; unrelated layout classes are allowed. */
export function validateClasses(value: string): string[] {
  const names = value.trim().split(/\s+/);
  const errors = names
    .filter((x) => /(?:^|:)huet-/.test(x) && !known.has(x))
    .map((x) => `Unknown Huet class: ${x}`);
  if (names.filter((x) => x.startsWith("huet-surface-")).length > 1)
    errors.push("Use one Huet surface class per element");
  return errors;
}
