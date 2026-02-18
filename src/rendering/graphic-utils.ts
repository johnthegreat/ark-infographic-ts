import type { Color, StringProvider } from "../models/interfaces.js";
import { Sex } from "../models/creature.js";

/** Stat name keys matching C# GraphicUtils.StatNameKeys. */
const STAT_NAME_KEYS = [
  "Health", "Stamina", "Torpidity", "Oxygen", "Food", "Water",
  "Temperature", "Weight", "Damage", "Speed", "Fortitude", "Crafting Speed",
];

/** Determines black or white foreground based on background luminance. */
export function foreColor(backColor: Color): Color {
  const luminance = backColor.r * 0.3 + backColor.g * 0.59 + backColor.b * 0.11;
  return luminance < 110
    ? { r: 255, g: 255, b: 255, a: 255 }
    : { r: 0, g: 0, b: 0, a: 255 };
}

/** Returns the unicode sex symbol for a creature. */
export function sexSymbol(sex: Sex): string {
  switch (sex) {
    case Sex.Male: return "\u2642";
    case Sex.Female: return "\u2640";
    default: return "?";
  }
}

/** Converts a percentage (0–100) to an RGB color on the green-red gradient. */
export function getColorFromPercent(percent: number, light: number = 0, blue: boolean = false): Color {
  let g = Math.trunc(percent * 5.1);
  let r = 511 - g;
  let b = 0;
  if (r < 0) r = 0;
  if (g < 0) g = 0;
  if (r > 255) r = 255;
  if (g > 255) g = 255;

  if (light !== 0) {
    let l = light;
    if (l > 1) l = 1;
    if (l < -1) l = -1;

    if (l > 0) {
      r = Math.trunc((255 - r) * l + r);
      g = Math.trunc((255 - g) * l + g);
      b = Math.trunc((255 - b) * l + b);
    } else {
      l += 1;
      r = Math.trunc(r * l);
      g = Math.trunc(g * l);
    }
  }

  return blue
    ? { r: b, g, b: r, a: 255 }
    : { r, g, b, a: 255 };
}

/** Gets the display name (or abbreviation) for a stat index. */
export function statName(
  statIndex: number,
  abbreviation: boolean,
  customStatNames: Record<string, string> | null,
  strings: StringProvider,
): string {
  if (statIndex < 0 || statIndex >= STAT_NAME_KEYS.length) return "";

  if (customStatNames != null) {
    const customKey = customStatNames[statIndex.toString()];
    if (customKey != null) {
      return strings.getString(abbreviation ? customKey + "_Abb" : customKey);
    }
  }

  const key = STAT_NAME_KEYS[statIndex];
  return strings.getString(abbreviation ? key + "_Abb" : key);
}
