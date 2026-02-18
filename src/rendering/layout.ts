import type { CreatureData } from "../models/creature.js";
import type { InfoGraphicConfig } from "../models/config.js";
import type { ServerSettings } from "../models/server-settings.js";
import { STATS_COUNT, Stats, precision } from "./stats-constants.js";

/**
 * All computed layout dimensions for an infographic card.
 * Mirrors the arithmetic from C# InfoGraphicCreator, using Math.trunc()
 * for integer division equivalence.
 */
export interface Layout {
  /** Card dimensions */
  width: number;
  height: number;
  contentWidth: number;
  contentHeight: number;
  borderWidth: number;
  padding: number;
  borderAndPadding: number;

  /** Font sizes */
  fontSize: number;
  fontSizeSmall: number;
  fontSizeHeader: number;

  /** Stat layout */
  statLineHeight: number;
  meanLetterWidth: number;
  statBoxHeight: number;

  /** Column x-positions (right edges for right-aligned text) */
  xStatName: number;
  xRightLevelValue: number;
  xRightLevelMutValue: number;
  xRightLevelDomValue: number;
  xRightBrValue: number;
  maxBoxLength: number;

  /** Color section */
  xColor: number;
  circleDiameter: number;
  colorRowHeight: number;

  /** Derived flags */
  displayMutatedLevels: boolean;

  /** Extra margin at bottom for max wild level text */
  extraMarginBottom: number;
}

/** Integer division matching C# truncation behavior. */
function idiv(a: number, b: number): number {
  return Math.trunc(a / b);
}

/**
 * Compute the maximum character length for stat value formatting.
 * Matches C# MaxCharLength().
 */
function maxCharLength(values: number[]): number {
  let max = 0;
  for (let si = 0; si < STATS_COUNT; si++) {
    const formatted = Math.trunc(values[si]).toString();
    const l = formatted.length + precision(si);
    if (l > max) max = l;
  }
  return max;
}

/**
 * Compute all layout dimensions from config and creature data.
 * Every number here mirrors the C# InfoGraphicCreator arithmetic.
 */
export function computeLayout(
  config: InfoGraphicConfig,
  creature: CreatureData,
  server: ServerSettings,
): Layout {
  const height = config.height < 5 ? 180 : config.height;
  const borderWidth = config.borderWidth;
  const contentHeight = height - 2 * borderWidth;
  const contentWidth = idiv(contentHeight * 12, 6);
  let width = contentWidth + 2 * borderWidth;
  if (config.displayExtraRegionNames) {
    width += idiv(contentHeight, 2);
  }
  const padding = 3 * Math.max(1, idiv(height, 180));
  const borderAndPadding = borderWidth + padding;

  // Font sizes
  const fontSize = Math.max(5, idiv(contentHeight, 18));
  const fontSizeSmall = Math.max(5, idiv(contentHeight * 2, 45));
  const fontSizeHeader = Math.max(5, idiv(contentHeight, 15));
  const statLineHeight = idiv(contentHeight * 5, 59);

  // meanLetterWidth is a double in C# (uses 7d / 10)
  const meanLetterWidth = fontSize * 7 / 10;

  const statBoxHeight = Math.max(2, idiv(contentHeight, 90));

  // Column x-positions
  const xStatName = borderAndPadding;
  const displayMutatedLevels =
    !config.displaySumWildMutLevels &&
    creature.levelsMutated != null &&
    server.game === "ASA";

  const torpidityLevelLength = creature.levelsWild[Stats.Torpidity].toString().length;
  const xRightLevelValue = Math.trunc(
    xStatName + (6 + torpidityLevelLength) * meanLetterWidth,
  );

  let xRightLevelMutValue = xRightLevelValue;
  if (displayMutatedLevels && creature.levelsMutated != null) {
    const maxMutLevel = Math.max(...creature.levelsMutated);
    xRightLevelMutValue += Math.trunc(
      (maxMutLevel.toString().length + 2) * meanLetterWidth,
    );
  }

  let xRightLevelDomValue = xRightLevelMutValue;
  if (config.displayDomLevels) {
    const maxDomLevel = Math.max(...creature.levelsDom);
    xRightLevelDomValue += Math.trunc(
      (maxDomLevel.toString().length + 1) * meanLetterWidth,
    );
  }

  const xRightBrValue = Math.trunc(
    xRightLevelDomValue + (2 + maxCharLength(creature.valuesBreeding)) * meanLetterWidth,
  );

  const maxBoxLength = xRightBrValue - xStatName;

  // Color section
  const xColor = Math.trunc(xRightBrValue + meanLetterWidth * 3.5);
  const circleDiameter = idiv(contentHeight * 4, 45);
  const colorRowHeight = circleDiameter + 2;

  const extraMarginBottom = config.displayMaxWildLevel ? fontSizeSmall : 0;

  return {
    width,
    height,
    contentWidth,
    contentHeight,
    borderWidth,
    padding,
    borderAndPadding,
    fontSize,
    fontSizeSmall,
    fontSizeHeader,
    statLineHeight,
    meanLetterWidth,
    statBoxHeight,
    xStatName,
    xRightLevelValue,
    xRightLevelMutValue,
    xRightLevelDomValue,
    xRightBrValue,
    maxBoxLength,
    xColor,
    circleDiameter,
    colorRowHeight,
    displayMutatedLevels,
    extraMarginBottom,
  };
}
