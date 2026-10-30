// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import Color from "../Color";
import Theme from "../Theme";
import themeConfigs from "../themeConfigs";
import { mountTheme } from "./dom";
import { themeFromConfig } from "./fromConfig";

const variable = (el: Element, name: string) =>
  (el as HTMLElement).style.getPropertyValue(name);

describe("themeFromConfig", () => {
  it.each(themeConfigs.map((config) => [config.name, config] as const))(
    "%s: classes resolve like <Block contrast>",
    (_, config) => {
      const theme = new Theme(config);
      const parent = Color.fromTheme(theme);
      const root = document.createElement("div");
      root.innerHTML =
        '<div class="huet-bg-10 huet-border-50"><span class="huet-text-red-100"></span></div>';
      document.body.append(root);
      const mount = mountTheme(root, themeFromConfig(config));
      const box = root.firstElementChild!,
        span = box.firstElementChild!;
      expect(variable(root, "--huet-background")).toBe(parent.hex);
      const bg = parent.contrast(10);
      expect(variable(box, "--huet-background")).toBe(bg.hex);
      expect(variable(box, "--huet-foreground")).toBe(bg.contrast(100).hex);
      expect(variable(box, "--huet-relative-border")).toBe(parent.contrast(50).hex);
      expect(variable(span, "--huet-relative-text")).toBe(
        bg.contrast(100, theme.ramps.red).hex,
      );
      mount.destroy();
      root.remove();
    },
  );
});
