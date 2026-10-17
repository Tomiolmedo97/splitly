import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { mentaDark, mentaLight, type ThemeColors } from "@/components/design/themes";

const css = readFileSync(fileURLToPath(new URL("../../app/globals.css", import.meta.url)), "utf8");

function block(selectorStart: string): Record<string, string> {
  const start = css.indexOf(selectorStart);
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
  return Object.fromEntries([...body.matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1]!, m[2]!.toUpperCase()]));
}

const keys = {
  bg: "bg", surface: "surface", text: "text", muted: "muted", border: "border", primary: "primary",
  "on-primary": "onPrimary", positive: "positive", negative: "negative", celebrate: "celebrate",
} as const satisfies Record<string, keyof ThemeColors>;

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}
/** Mezcla `fg` al `alpha` sobre `bg` (para fondos translúcidos como primary/12 o border/40). */
function mix(fg: string, alpha: number, bg: string): string {
  const ch = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16);
  return "#" + [1, 3, 5].map((i) => Math.round(ch(fg, i) * alpha + ch(bg, i) * (1 - alpha)).toString(16).padStart(2, "0")).join("");
}

describe.each([
  ["claro", "@theme {", mentaLight.colors],
  ["oscuro", '.dark,\n[data-theme="dark"]', mentaDark.colors],
] as const)("tokens Menta %s", (_name, selector, colors) => {
  const tokens = block(selector);

  it("globals.css coincide con themes.ts", () => {
    for (const [cssKey, themeKey] of Object.entries(keys)) {
      expect(tokens[cssKey], cssKey).toBe(colors[themeKey].toUpperCase());
    }
  });

  it("todo texto tiene contraste >= 4,5:1", () => {
    const segmentedBg = mix(colors.border, 0.4, colors.bg);
    const avatarBg = mix(colors.primary, 0.12, colors.surface);
    const pairs: [string, string, string][] = [
      ["text/bg", colors.text, colors.bg],
      ["text/surface", colors.text, colors.surface],
      ["muted/bg", colors.muted, colors.bg],
      ["muted/surface", colors.muted, colors.surface],
      ["onPrimary/primary", colors.onPrimary, colors.primary],
      ["primary (link)/surface", colors.primary, colors.surface],
      ["primary (link)/bg", colors.primary, colors.bg],
      ["positive/surface", colors.positive, colors.surface],
      ["positive/bg", colors.positive, colors.bg],
      ["negative/surface", colors.negative, colors.surface],
      ["negative/bg", colors.negative, colors.bg],
      ["muted/segmentado", colors.muted, segmentedBg],
      ["text/avatar", colors.text, avatarBg],
    ];
    for (const [name, fg, bg] of pairs) {
      expect(contrast(fg, bg), name).toBeGreaterThanOrEqual(4.5);
    }
  });
});
