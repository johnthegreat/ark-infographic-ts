/**
 * Represents an ARK color with linear RGBA values.
 * Colors are stored in linear color space and must be gamma-corrected to sRGB for display.
 */
export interface ArkColor {
  id: number;
  name: string;
  /** Linear RGBA values (0..1 range, may exceed 1 for HDR colors) */
  linearRgba: [number, number, number, number];
  isDye: boolean;
}

/**
 * Convert a linear color component to a gamma-corrected sRGB byte value (0-255).
 * Uses ARK's simplified gamma formula: `255.999 * pow(lc, 1/2.2)`, clamped to [0, 255].
 */
function linearColorComponentToSrgb(lc: number): number {
  const v = Math.trunc(255.999 * Math.pow(lc, 1 / 2.2));
  if (v > 255) return 255;
  if (v < 0) return 0;
  return v;
}

/**
 * Convert an ArkColor's linear RGB to gamma-corrected sRGB values (0-255 each).
 */
export function arkColorToSrgb(color: ArkColor): [number, number, number] {
  return [
    linearColorComponentToSrgb(color.linearRgba[0]),
    linearColorComponentToSrgb(color.linearRgba[1]),
    linearColorComponentToSrgb(color.linearRgba[2]),
  ];
}
