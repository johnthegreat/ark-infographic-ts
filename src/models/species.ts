export interface SpeciesInfo {
  /** bool[6] — which color regions are enabled for this species */
  enabledColorRegions: boolean[];
  /** bool[12] — which stats are used by this species */
  usedStats: boolean[];
  /** Optional custom stat names (key = stat name key, value = display name) */
  statNames: Record<string, string> | null;
  /** string[6] — color region names (null entries for unnamed regions) */
  colorRegionNames: (string | null)[];
}
