const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
const LIGHT_THRESHOLD = 0.5;

function channels(hex: string): [number, number, number] {
  const match = HEX.exec(hex.trim());
  if (!match) throw new Error(`Invalid hex colour: "${hex}"`);
  const digits =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((c) => c + c)
          .join("")
      : match[1];
  return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
}

/** WCAG 2.x relative luminance, 0 (black) … 1 (white). */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const WCAG_AA = 4.5;

/**
 * Text colour for a brand-coloured chip: white whenever it meets WCAG AA
 * (the usual brand look), otherwise whichever of black/white contrasts more.
 */
export function readableTextOn(hex: string): "#000000" | "#ffffff" {
  const l = relativeLuminance(hex);
  const onWhite = 1.05 / (l + 0.05);
  if (onWhite >= WCAG_AA) return "#ffffff";
  const onBlack = (l + 0.05) / 0.05;
  return onBlack >= onWhite ? "#000000" : "#ffffff";
}

/** True for colours too pale to read on a white tile (e.g. JS yellow). */
export function isLightColor(hex: string): boolean {
  return relativeLuminance(hex) > LIGHT_THRESHOLD;
}
