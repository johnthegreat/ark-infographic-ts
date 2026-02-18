export interface ServerSettings {
  maxChartLevel: number;
  maxDomLevel: number;
  maxWildLevel: number;
  game: string;
}

export const DEFAULT_SERVER_SETTINGS: ServerSettings = {
  maxChartLevel: 50,
  maxDomLevel: 88,
  maxWildLevel: 150,
  game: "ASA",
};
