import type { Color } from "./interfaces.js";

export interface InfoGraphicConfig {
  height: number;
  fontName: string;
  foreColor: Color;
  backColor: Color;
  borderColor: Color;
  borderWidth: number;
  displayCreatureName: boolean;
  displayDomLevels: boolean;
  displaySumWildMutLevels: boolean;
  displayMutations: boolean;
  displayGeneration: boolean;
  displayStatValues: boolean;
  displayMaxWildLevel: boolean;
  displayExtraRegionNames: boolean;
  displayRegionNamesIfNoImage: boolean;
  backgroundImagePath: string | null;
  textOutlineColor: Color;
  textOutlineWidth: number;
  creatureOutlineColor: Color;
  creatureOutlineWidth: number;
  creatureOutlineBlurring: number;
}

export const DEFAULT_CONFIG: InfoGraphicConfig = {
  height: 180,
  fontName: "Liberation Sans",
  foreColor: { r: 0, g: 0, b: 0, a: 255 },
  backColor: { r: 255, g: 255, b: 255, a: 255 },
  borderColor: { r: 0, g: 0, b: 0, a: 255 },
  borderWidth: 1,
  displayCreatureName: true,
  displayDomLevels: true,
  displaySumWildMutLevels: false,
  displayMutations: true,
  displayGeneration: true,
  displayStatValues: true,
  displayMaxWildLevel: true,
  displayExtraRegionNames: false,
  displayRegionNamesIfNoImage: true,
  backgroundImagePath: null,
  textOutlineColor: { r: 255, g: 255, b: 255, a: 255 },
  textOutlineWidth: 0,
  creatureOutlineColor: { r: 255, g: 255, b: 255, a: 255 },
  creatureOutlineWidth: 0,
  creatureOutlineBlurring: 0.8,
};
