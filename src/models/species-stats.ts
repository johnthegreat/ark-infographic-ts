/**
 * Per-stat raw values from values.json:
 * [BaseValue, IncPerWildLevel, IncPerTamedLevel, AddWhenTamed, MultAffinity]
 */
export type StatRaw = [number, number, number, number, number];

/** Species stat data needed for stat value computation. */
export interface SpeciesStatData {
  /** 12-element array; null entries indicate the stat is unused. */
  fullStatsRaw: (StatRaw | null)[];
  /** Health multiplier for tamed creatures (stat 0 only), default 1.0. */
  tamedBaseHealthMultiplier: number;
  /** Per-stat imprint multipliers, 12-element array (0 = not affected). */
  statImprintMultipliers: number[];
  /**
   * Per-stat flag: true = level-ups scale as percentage of base (multiplicative),
   * false = level-ups are fixed additive amounts.
   * Defaults to all true if absent (matches C# SpeciesStat.IncreaseStatAsPercentage).
   */
  increaseStatAsPercentage?: boolean[];
}
