import type { CreatureData } from "../models/creature.js";
import type { SpeciesInfo } from "../models/species.js";
import type { InfoGraphicConfig } from "../models/config.js";
import type { ServerSettings } from "../models/server-settings.js";
import type { Color, ColorLookup, StringProvider } from "../models/interfaces.js";
import { Sex } from "../models/creature.js";
import { SvgBuilder } from "./svg-builder.js";
import { computeLayout } from "./layout.js";
import { Stats, COLOR_REGION_COUNT, DISPLAY_ORDER, isPercentage } from "./stats-constants.js";
import { foreColor, sexSymbol, getColorFromPercent, statName } from "./graphic-utils.js";

/** Integer division matching C# truncation behavior. */
function idiv(a: number, b: number): number {
  return Math.trunc(a / b);
}

/**
 * Render an ARK creature infographic as an SVG string.
 *
 * Ports the C# InfoGraphicCreator.CreateInfoGraphicAsync method.
 * Every layout dimension and drawing call mirrors the C# source.
 *
 * @param creature — creature stat/level data
 * @param species — species info (used stats, color regions)
 * @param server — server settings (max levels, game type)
 * @param config — infographic display configuration
 * @param colorLookup — maps ARK color IDs to RGBA colors
 * @param strings — localized string provider
 * @param creatureImageDataUri — optional data URI for the colorized creature sprite
 * @returns SVG XML string
 */
export function renderInfoGraphicSvg(
  creature: CreatureData,
  species: SpeciesInfo,
  server: ServerSettings,
  config: InfoGraphicConfig,
  colorLookup: ColorLookup,
  strings: StringProvider,
  creatureImageDataUri?: string,
): string {
  const layout = computeLayout(config, creature, server);
  const svg = new SvgBuilder(layout.width, layout.height);

  const fc = config.foreColor;
  const fontName = config.fontName || "Arial";

  // ── Background ──────────────────────────────────────────────────

  svg.rect(0, 0, layout.width, layout.height, { fill: config.backColor });

  let currentY = layout.borderAndPadding;

  // ── Header text (species + creature name, bold, auto-sized) ─────

  const speciesDisplay = server.game === "ASA"
    ? `${creature.speciesName} (ASA)`
    : creature.speciesName;
  const headerText = speciesDisplay +
    (config.displayCreatureName ? ` - ${creature.creatureName}` : "");

  const headerMlw = layout.fontSizeHeader * 0.7;
  const estHeaderWidth = headerText.length * headerMlw;
  const actualHeaderFontSize = estHeaderWidth > layout.contentWidth
    ? Math.max(5, Math.trunc(layout.fontSizeHeader * layout.contentWidth / estHeaderWidth))
    : layout.fontSizeHeader;

  svg.text(headerText, layout.borderAndPadding, currentY + actualHeaderFontSize, {
    fontFamily: fontName,
    fontSize: actualHeaderFontSize,
    fontWeight: "bold",
    fill: fc,
  });

  currentY += idiv(layout.contentHeight * 19, 180);

  // ── Creature info line ──────────────────────────────────────────

  let creatureLevel: string;
  if (config.displayDomLevels) {
    creatureLevel = `${creature.level}/${creature.levelHatched + server.maxDomLevel}`;
  } else {
    creatureLevel = creature.levelHatched.toString();
  }

  const neuterText = creature.isNeutered
    ? ` (${strings.getString(creature.sex === Sex.Female ? "Spayed" : "Neutered")})`
    : "";

  let creatureInfos =
    `${strings.getString("Level")} ${creatureLevel} | ${sexSymbol(creature.sex)}${neuterText}`;
  if (config.displayMutations) {
    creatureInfos += ` | ${strings.getString("mutation counter")} ${creature.mutations}`;
  }
  if (config.displayGeneration) {
    creatureInfos += ` | ${strings.getString("generation")} ${creature.generation}`;
  }

  const availableInfoWidth = layout.width - 2 * layout.borderAndPadding;
  const estInfoWidth = creatureInfos.length * layout.meanLetterWidth;
  const actualInfoFontSize = estInfoWidth > availableInfoWidth
    ? Math.max(5, Math.trunc(layout.fontSize * availableInfoWidth / estInfoWidth))
    : layout.fontSize;

  svg.text(creatureInfos, layout.borderAndPadding, currentY + actualInfoFontSize, {
    fontFamily: fontName,
    fontSize: actualInfoFontSize,
    fill: fc,
  });

  currentY += idiv(layout.contentHeight * 17, 180);

  // ── Separator line ──────────────────────────────────────────────

  svg.line(
    layout.borderWidth, currentY,
    layout.width - layout.borderWidth, currentY,
    { stroke: { ...fc, a: 50 }, strokeWidth: 1 },
  );

  currentY += 2;

  // ── Column headers (right-aligned) ──────────────────────────────

  const wLabel = strings.getString("W") +
    (config.displaySumWildMutLevels ? "+" + strings.getString("M") : "");

  const wHeaderShift = layout.displayMutatedLevels || config.displayDomLevels
    ? Math.trunc(layout.meanLetterWidth) : 0;

  svg.text(wLabel, layout.xRightLevelValue - wHeaderShift, currentY + layout.fontSize, {
    fontFamily: fontName, fontSize: layout.fontSize, fill: fc, textAnchor: "end",
  });

  if (layout.displayMutatedLevels) {
    const mutShift = config.displayDomLevels ? Math.trunc(layout.meanLetterWidth) : 0;
    svg.text(strings.getString("M"), layout.xRightLevelMutValue - mutShift, currentY + layout.fontSize, {
      fontFamily: fontName, fontSize: layout.fontSize, fill: fc, textAnchor: "end",
    });
  }

  if (config.displayDomLevels) {
    svg.text(strings.getString("D"), layout.xRightLevelDomValue, currentY + layout.fontSize, {
      fontFamily: fontName, fontSize: layout.fontSize, fill: fc, textAnchor: "end",
    });
  }

  if (config.displayStatValues) {
    svg.text(strings.getString("Values"), layout.xRightBrValue, currentY + layout.fontSize, {
      fontFamily: fontName, fontSize: layout.fontSize, fill: fc, textAnchor: "end",
    });
  }

  // ── Stat rows ───────────────────────────────────────────────────

  const maxGraphLevel = Math.max(1, server.maxChartLevel);
  const DARK_GRAY: Color = { r: 169, g: 169, b: 169, a: 255 };
  let statDisplayIndex = 0;

  for (const si of DISPLAY_ORDER) {
    if (si === Stats.Torpidity || !species.usedStats[si]) continue;

    const y = currentY + idiv(layout.contentHeight, 9) + statDisplayIndex * layout.statLineHeight;
    statDisplayIndex++;

    // Background track (dark gray, full width)
    svg.rect(
      layout.xStatName, y + layout.statLineHeight - 1,
      layout.maxBoxLength, layout.statBoxHeight,
      { fill: DARK_GRAY },
    );

    // Colored stat bar
    let levelFraction = Math.min(1, creature.levelsWild[si] / maxGraphLevel);
    if (levelFraction < 0) levelFraction = 0;
    const levelPercent = Math.trunc(100 * levelFraction);
    const statBoxLength = Math.max(1, Math.trunc(layout.maxBoxLength * levelFraction));
    const statColor = getColorFromPercent(levelPercent);

    svg.rect(
      layout.xStatName, y + layout.statLineHeight - 1,
      statBoxLength, layout.statBoxHeight,
      { fill: statColor },
    );

    // Glow effect (4 expanding rects with alpha=10)
    const glowColor: Color = { ...statColor, a: 10 };
    for (let r = 4; r > 0; r--) {
      svg.rect(
        layout.xStatName - r, y + layout.statLineHeight - 2 - r,
        statBoxLength + 2 * r, layout.statBoxHeight + 2 * r,
        { fill: glowColor },
      );
    }

    // Border stroke on stat bar
    const borderStatColor = getColorFromPercent(levelPercent, -0.5);
    svg.rect(
      layout.xStatName, y + layout.statLineHeight - 1,
      statBoxLength, layout.statBoxHeight,
      { stroke: borderStatColor, strokeWidth: 1 },
    );

    // Stat abbreviation
    svg.text(
      statName(si, true, species.statNames, strings),
      layout.xStatName, y + layout.fontSize,
      { fontFamily: fontName, fontSize: layout.fontSize, fill: fc },
    );

    // Wild level number (right-aligned)
    const displayedLevel = creature.levelsWild[si] +
      (config.displaySumWildMutLevels && creature.levelsMutated != null && creature.levelsMutated[si] > 0
        ? creature.levelsMutated[si] : 0);
    const pipeSuffix = layout.displayMutatedLevels || config.displayDomLevels ? " |" : "";
    const levelText = creature.levelsWild[si] < 0
      ? "?" + pipeSuffix
      : displayedLevel.toString() + pipeSuffix;

    svg.text(levelText, layout.xRightLevelValue, y + layout.fontSize, {
      fontFamily: fontName, fontSize: layout.fontSize, fill: fc, textAnchor: "end",
    });

    // Mutated level column
    if (layout.displayMutatedLevels && creature.levelsMutated != null) {
      const mutPipe = config.displayDomLevels ? " |" : "";
      const mutText = creature.levelsMutated[si] < 0
        ? ""
        : creature.levelsMutated[si].toString() + mutPipe;

      svg.text(mutText, layout.xRightLevelMutValue, y + layout.fontSize, {
        fontFamily: fontName, fontSize: layout.fontSize, fill: fc, textAnchor: "end",
      });
    }

    // Dom level column
    if (config.displayDomLevels) {
      svg.text(creature.levelsDom[si].toString(), layout.xRightLevelDomValue, y + layout.fontSize, {
        fontFamily: fontName, fontSize: layout.fontSize, fill: fc, textAnchor: "end",
      });
    }

    // Stat breeding value
    if (config.displayStatValues) {
      const displayedValue = config.displayDomLevels
        ? creature.valuesCurrent[si]
        : creature.valuesBreeding[si];

      let valueText: string;
      if (displayedValue < 0) {
        valueText = "?";
      } else if (isPercentage(si)) {
        valueText = (100 * displayedValue).toFixed(1);
        // "%" drawn left-aligned at the right edge of the value column
        svg.text("%", layout.xRightBrValue, y + layout.fontSize, {
          fontFamily: fontName, fontSize: layout.fontSize, fill: fc,
        });
      } else {
        valueText = displayedValue.toFixed(1);
      }

      svg.text(valueText, layout.xRightBrValue, y + layout.fontSize, {
        fontFamily: fontName, fontSize: layout.fontSize, fill: fc, textAnchor: "end",
      });
    }
  }

  // ── Creature image ──────────────────────────────────────────────

  const imageSize = Math.trunc(Math.min(
    layout.contentWidth - layout.xColor + layout.borderWidth - layout.circleDiameter - 8 * layout.meanLetterWidth,
    layout.contentHeight - currentY + layout.borderWidth - layout.extraMarginBottom,
  ));

  let creatureImageShown = false;
  if (imageSize > 5 && creatureImageDataUri != null) {
    svg.image(
      creatureImageDataUri,
      layout.width - imageSize - layout.borderAndPadding,
      layout.height - imageSize - layout.borderAndPadding - layout.extraMarginBottom,
      imageSize,
      imageSize,
    );
    creatureImageShown = true;
  }

  // ── Colors section ──────────────────────────────────────────────

  let maxColorNameLength = Math.trunc(
    (layout.width - 2 * layout.borderWidth - layout.xColor - layout.circleDiameter -
      (creatureImageShown ? imageSize : 0)) * 1.5 / layout.meanLetterWidth,
  );
  if (maxColorNameLength < 0) maxColorNameLength = 0;

  // "Colors" header
  svg.text(strings.getString("Colors"), layout.xColor, currentY + layout.fontSize, {
    fontFamily: fontName, fontSize: layout.fontSize, fill: fc,
  });

  // Imprinting / TE (positioned next to "Colors" header)
  if (config.displayDomLevels) {
    const colorsLabel = strings.getString("Colors");
    const impX = layout.xColor + Math.trunc((colorsLabel.length + 3) * layout.meanLetterWidth);

    if (creature.isBred || creature.imprintingBonus > 0) {
      svg.text(`Imp: ${(creature.imprintingBonus * 100).toFixed(1)} %`, impX, currentY + layout.fontSize, {
        fontFamily: fontName, fontSize: layout.fontSize, fill: fc,
      });
    } else if (creature.tamingEffectiveness >= 0) {
      svg.text(`TE: ${(creature.tamingEffectiveness * 100).toFixed(1)} %`, impX, currentY + layout.fontSize, {
        fontFamily: fontName, fontSize: layout.fontSize, fill: fc,
      });
    }
  }

  // Color swatches
  const swatchBorderColor = foreColor(config.backColor);
  let colorRow = 0;

  for (let ci = 0; ci < COLOR_REGION_COUNT; ci++) {
    if (!species.enabledColorRegions[ci]) continue;

    const y = currentY + idiv(layout.contentHeight, 9) + colorRow * layout.colorRowHeight;
    colorRow++;

    const c = colorLookup.getColor(creature.colors[ci]);

    // Filled circle
    const cr = layout.circleDiameter / 2;
    svg.ellipse(layout.xColor + cr, y + cr, cr, cr, { fill: c });

    // Circle border
    svg.ellipse(layout.xColor + cr, y + cr, cr, cr, {
      stroke: swatchBorderColor, strokeWidth: 1,
    });

    // Color region label
    let colorRegionName: string | null = null;
    if (config.displayExtraRegionNames || (!creatureImageShown && config.displayRegionNamesIfNoImage)) {
      colorRegionName = species.colorRegionNames[ci] ?? null;
      if (colorRegionName != null) {
        const totalColorLength = colorRegionName.length + 11;
        if (totalColorLength > maxColorNameLength) {
          const lengthForRegionName = colorRegionName.length - (totalColorLength - maxColorNameLength);
          colorRegionName = lengthForRegionName < 2
            ? ""
            : colorRegionName.substring(0, lengthForRegionName - 1) + "\u2026";
        }
        if (colorRegionName.length > 0) {
          colorRegionName = " (" + colorRegionName + ")";
        } else {
          colorRegionName = null;
        }
      }
    }

    svg.text(
      `[${ci}] ${creature.colors[ci]}${colorRegionName ?? ""}`,
      layout.xColor + layout.circleDiameter + 4,
      y + layout.fontSizeSmall,
      { fontFamily: fontName, fontSize: layout.fontSizeSmall, fill: fc },
    );
  }

  // ── Mutagen applied ─────────────────────────────────────────────

  if (creature.isMutagenApplied) {
    svg.text("Mutagen applied",
      layout.xColor, layout.height - layout.borderAndPadding,
      { fontFamily: fontName, fontSize: layout.fontSizeSmall, fill: fc },
    );
  }

  // ── Max wild level footer (right-aligned at bottom) ─────────────

  if (config.displayMaxWildLevel) {
    const maxWildText = `${strings.getString("max wild level")}: ${server.maxWildLevel}`;
    svg.text(maxWildText,
      layout.width - layout.borderAndPadding,
      layout.height - layout.borderAndPadding,
      { fontFamily: fontName, fontSize: layout.fontSizeSmall, fill: fc, textAnchor: "end" },
    );
  }

  // ── Border ──────────────────────────────────────────────────────

  if (layout.borderWidth > 0) {
    svg.rect(
      layout.borderWidth / 2, layout.borderWidth / 2,
      layout.width - layout.borderWidth, layout.height - layout.borderWidth,
      { stroke: config.borderColor, strokeWidth: layout.borderWidth },
    );
  }

  return svg.toString();
}
