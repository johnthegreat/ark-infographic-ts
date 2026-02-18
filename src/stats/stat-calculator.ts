import type { SpeciesStatData } from "../models/species-stats.js";
import { Stats, STATS_COUNT, precision } from "../rendering/stats-constants.js";

export interface StatComputeResult {
  /** 12-element array — stat values with levelDom = 0 (breeding potential). */
  valuesBreeding: number[];
  /** 12-element array — stat values with dom levels applied. */
  valuesCurrent: number[];
}

/**
 * Compute stat values for a creature using the ARK stat formula.
 *
 * Ports the C# `StatValueCalculation.CalculateValue()` method from
 * `ARKBreedingStats/Stats.cs`.
 *
 * @param speciesStats — species-level raw stat data
 * @param levelsWild — 12-element array of wild levels
 * @param levelsDom — 12-element array of dom levels
 * @param levelsMutated — 12-element array of mutated levels (null → all zeros)
 * @param isTamed — whether the creature has been tamed
 * @param tamingEffectiveness — taming effectiveness (0.0–1.0)
 * @param imprintingBonus — imprinting bonus (0.0–1.0), typically 0 for non-bred
 */
export function computeStatValues(
  speciesStats: SpeciesStatData,
  levelsWild: number[],
  levelsDom: number[],
  levelsMutated: number[] | null,
  isTamed: boolean,
  tamingEffectiveness: number,
  imprintingBonus: number,
): StatComputeResult {
  const valuesBreeding = new Array<number>(STATS_COUNT).fill(0);
  const valuesCurrent = new Array<number>(STATS_COUNT).fill(0);

  for (let si = 0; si < STATS_COUNT; si++) {
    const raw = speciesStats.fullStatsRaw[si];
    if (raw == null) continue;

    const lw = levelsWild[si] ?? 0;
    const ld = levelsDom[si] ?? 0;
    const lm = levelsMutated?.[si] ?? 0;

    valuesBreeding[si] = calculateValue(
      speciesStats, raw, si, lw, lm, 0, isTamed, tamingEffectiveness, imprintingBonus,
    );
    valuesCurrent[si] = calculateValue(
      speciesStats, raw, si, lw, lm, ld, isTamed, tamingEffectiveness, imprintingBonus,
    );
  }

  return { valuesBreeding, valuesCurrent };
}

/**
 * Compute a single stat value.
 *
 * Formula from C# `Stats.cs`, selected by `SpeciesStat.IncreaseStatAsPercentage`:
 * - Percentage (default for all stats):
 *     `(base * (1 + wildIncrease) * tbhm * impM + add) * domMult * (1 + domIncrease)`
 * - Additive (rare, per-species override):
 *     `((base + wildIncrease) * tbhm * impM + add) * domMult + domIncrease`
 */
function calculateValue(
  speciesStats: SpeciesStatData,
  raw: [number, number, number, number, number],
  statIndex: number,
  levelWild: number,
  levelMut: number,
  levelDom: number,
  isTamed: boolean,
  tamingEff: number,
  imprintingBonus: number,
): number {
  const [baseValue, incPerWild, incPerDom, addWhenTamed, multAffinity] = raw;

  // Wild level increase (mutations use the same per-wild increment)
  const wildLevelIncrease = levelWild * incPerWild + levelMut * incPerWild;

  // Dom level increase
  const domLevelIncrease = levelDom * incPerDom;

  // Tamed base health multiplier (stat 0 only)
  const tbhm = statIndex === Stats.Health
    ? speciesStats.tamedBaseHealthMultiplier
    : 1;

  // Imprinting multiplier
  const imprintingM = imprintingBonus > 0
    ? 1 + speciesStats.statImprintMultipliers[statIndex] * imprintingBonus
    : 1;

  // AddWhenTamed (only applied if tamed)
  const add = isTamed ? addWhenTamed : 0;

  // Taming effectiveness multiplier
  let domMult: number;
  if (!isTamed || tamingEff < 0) {
    domMult = 1;
  } else if (multAffinity >= 0) {
    domMult = 1 + multAffinity * tamingEff;
  } else {
    // Negative MultAffinity is NOT scaled by TE
    domMult = 1 + multAffinity;
  }

  // Apply the formula — C# defaults IncreaseStatAsPercentage to true for all stats
  const usePercentage = speciesStats.increaseStatAsPercentage?.[statIndex] ?? true;
  let result: number;
  if (usePercentage) {
    result = (baseValue * (1 + wildLevelIncrease) * tbhm * imprintingM + add) * domMult * (1 + domLevelIncrease);
  } else {
    result = ((baseValue + wildLevelIncrease) * tbhm * imprintingM + add) * domMult + domLevelIncrease;
  }

  // Clamp to zero
  if (result <= 0) return 0;

  // Round to in-game precision
  const p = precision(statIndex);
  const factor = Math.pow(10, p);
  return Math.round(result * factor) / factor;
}
