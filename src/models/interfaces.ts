export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ColorLookup {
  getColor(colorId: number): Color;
}

export interface StringProvider {
  getString(key: string): string;
  useSecondaryLanguage: boolean;
}

export interface FontConfig {
  name: string;
  data: ArrayBuffer;
  weight?: number;
}
