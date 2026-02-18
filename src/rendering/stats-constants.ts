export const STATS_COUNT = 12;
export const COLOR_REGION_COUNT = 6;

/** Stat indices matching C# StatsConstants. */
export const Stats = {
  Health: 0,
  Stamina: 1,
  Torpidity: 2,
  Oxygen: 3,
  Food: 4,
  Water: 5,
  Temperature: 6,
  Weight: 7,
  MeleeDamageMultiplier: 8,
  SpeedMultiplier: 9,
  TemperatureFortitude: 10,
  CraftingSpeedMultiplier: 11,
} as const;

export type StatIndex = (typeof Stats)[keyof typeof Stats];

/**
 * Display order for stat rows.
 * Torpidity is listed last (excluded from normal display rows in the infographic).
 */
export const DISPLAY_ORDER: readonly StatIndex[] = [
  Stats.Health,
  Stats.Stamina,
  Stats.Oxygen,
  Stats.Food,
  Stats.Water,
  Stats.Temperature,
  Stats.Weight,
  Stats.MeleeDamageMultiplier,
  Stats.SpeedMultiplier,
  Stats.TemperatureFortitude,
  Stats.CraftingSpeedMultiplier,
  Stats.Torpidity,
];

/** Returns true for percentage stats (indices 8–11). */
export function isPercentage(statIndex: number): boolean {
  return (
    statIndex === Stats.MeleeDamageMultiplier ||
    statIndex === Stats.SpeedMultiplier ||
    statIndex === Stats.TemperatureFortitude ||
    statIndex === Stats.CraftingSpeedMultiplier
  );
}

/** Decimal precision for stat display: 3 for percentage stats, 1 otherwise. */
export function precision(statIndex: number): number {
  return isPercentage(statIndex) ? 3 : 1;
}
