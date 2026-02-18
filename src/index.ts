// Models
export { Sex } from "./models/creature.js";
export type { CreatureData } from "./models/creature.js";
export type { SpeciesInfo } from "./models/species.js";
export type { InfoGraphicConfig } from "./models/config.js";
export { DEFAULT_CONFIG } from "./models/config.js";
export type { ServerSettings } from "./models/server-settings.js";
export { DEFAULT_SERVER_SETTINGS } from "./models/server-settings.js";
export type { ArkColor } from "./models/ark-color.js";
export { arkColorToSrgb } from "./models/ark-color.js";
export type { Color, ColorLookup, StringProvider, FontConfig } from "./models/interfaces.js";
export type { SpeciesStatData, StatRaw } from "./models/species-stats.js";

// Stats
export { computeStatValues } from "./stats/stat-calculator.js";
export type { StatComputeResult } from "./stats/stat-calculator.js";

// Colorizer
export type { SrgbColor } from "./colorizer.js";
export { colorizeCreature } from "./colorizer.js";

// Defaults
export { DEFAULT_STRING_PROVIDER } from "./defaults/default-string-provider.js";

// Rendering
export { Stats, STATS_COUNT, COLOR_REGION_COUNT, DISPLAY_ORDER, isPercentage, precision } from "./rendering/stats-constants.js";
export type { StatIndex } from "./rendering/stats-constants.js";
export { SvgBuilder } from "./rendering/svg-builder.js";
export type { RectAttrs, TextAttrs, EllipseAttrs, LineAttrs, GradientStop, GroupAttrs } from "./rendering/svg-builder.js";
export { foreColor, sexSymbol, getColorFromPercent, statName } from "./rendering/graphic-utils.js";
export { renderInfoGraphicSvg } from "./rendering/infographic-creator.js";
