import type { StringProvider } from "../models/interfaces.js";

const STRINGS: Record<string, string> = {
  Level: "Level",
  W: "W",
  M: "M",
  D: "D",
  Values: "Values",
  Colors: "Colors",
  Spayed: "Spayed",
  Neutered: "Neutered",
  "mutation counter": "Mut",
  generation: "Gen",
  "max wild level": "max wild level",
  // Stat names
  Health: "Health",
  Stamina: "Stamina",
  Torpidity: "Torpidity",
  Oxygen: "Oxygen",
  Food: "Food",
  Water: "Water",
  Temperature: "Temperature",
  Weight: "Weight",
  Damage: "Damage",
  Speed: "Speed",
  Fortitude: "Fortitude",
  "Crafting Speed": "Crafting Speed",
  // Abbreviations
  Health_Abb: "HP",
  Stamina_Abb: "St",
  Torpidity_Abb: "To",
  Oxygen_Abb: "Ox",
  Food_Abb: "Fo",
  Water_Abb: "Wa",
  Temperature_Abb: "Te",
  Weight_Abb: "We",
  Damage_Abb: "Dm",
  Speed_Abb: "Sp",
  Fortitude_Abb: "Fr",
  "Crafting Speed_Abb": "Cr",
};

export const DEFAULT_STRING_PROVIDER: StringProvider = {
  useSecondaryLanguage: false,
  getString(key: string): string {
    return STRINGS[key] ?? key;
  },
};
