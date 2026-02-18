import { initWasm, Resvg } from "@resvg/resvg-wasm";
import type { CreatureData } from "./models/creature.js";
import type { SpeciesInfo } from "./models/species.js";
import type { InfoGraphicConfig } from "./models/config.js";
import type { ServerSettings } from "./models/server-settings.js";
import type { ColorLookup, FontConfig, StringProvider } from "./models/interfaces.js";
import { renderInfoGraphicSvg } from "./rendering/infographic-creator.js";

let wasmInitialized = false;
let storedFontBuffers: Uint8Array[] = [];
let defaultFontFamily: string | undefined;

/**
 * Initialize the rasterizer with the resvg WASM binary and font buffers.
 * Must be called once before any calls to {@link renderInfoGraphicPng}.
 *
 * @param resvgWasm — raw WASM bytes (`ArrayBuffer`) or a pre-compiled
 *   `WebAssembly.Module` (required in Cloudflare Workers).
 * @param fonts — one or more font files to make available during rendering
 */
export async function initRasterizer(
  resvgWasm: ArrayBuffer | WebAssembly.Module,
  fonts: FontConfig[],
): Promise<void> {
  await initWasm(resvgWasm);
  storedFontBuffers = fonts.map((f) => new Uint8Array(f.data));
  defaultFontFamily = fonts[0]?.name;
  wasmInitialized = true;
}

/**
 * Render an ARK creature infographic directly to a PNG buffer.
 *
 * Parameters mirror {@link renderInfoGraphicSvg} exactly.
 * Requires a prior call to {@link initRasterizer}.
 */
export function renderInfoGraphicPng(
  creature: CreatureData,
  species: SpeciesInfo,
  server: ServerSettings,
  config: InfoGraphicConfig,
  colorLookup: ColorLookup,
  strings: StringProvider,
  creatureImageDataUri?: string,
): Uint8Array {
  if (!wasmInitialized) {
    throw new Error(
      "Rasterizer not initialized. Call initRasterizer() first.",
    );
  }

  const svg = renderInfoGraphicSvg(
    creature,
    species,
    server,
    config,
    colorLookup,
    strings,
    creatureImageDataUri,
  );

  const resvg = new Resvg(svg, {
    font: {
      fontBuffers: storedFontBuffers,
      defaultFontFamily,
    },
    fitTo: { mode: "original" as const },
  });

  const rendered = resvg.render();
  return rendered.asPng();
}
