export enum Sex {
  Unknown = 0,
  Male = 1,
  Female = 2,
}

export interface CreatureData {
  speciesName: string;
  creatureName: string;
  sex: Sex;
  isNeutered: boolean;
  isMutagenApplied: boolean;
  isBred: boolean;

  /** int[12] — wild levels per stat */
  levelsWild: number[];
  /** int[12] — domesticated levels per stat */
  levelsDom: number[];
  /** int[12] — mutated levels per stat (nullable in source) */
  levelsMutated: number[] | null;

  /** double[12] — breeding stat values */
  valuesBreeding: number[];
  /** double[12] — current stat values */
  valuesCurrent: number[];

  /** byte[6] — color region IDs */
  colors: number[];

  tamingEffectiveness: number;
  imprintingBonus: number;

  mutations: number;
  generation: number;
  level: number;
  levelHatched: number;
}
