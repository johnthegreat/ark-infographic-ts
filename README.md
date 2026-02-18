# ark-infographic-ts

A TypeScript library for generating ARK: Survival Ascended / Evolved creature stat infographics. Produces SVG or PNG output showing wild/domesticated levels, stat bars, color regions, and an optional colorized creature sprite.

Ported from the C# [ARK Smart Breeding](https://github.com/cadon/ARKStatsExtractor) infographic renderer.

## Installation

```bash
npm install ark-infographic
```

For PNG output, install the optional peer dependency:

```bash
npm install @resvg/resvg-wasm
```

## Usage

### SVG Output

```ts
import {
  renderInfoGraphicSvg,
  DEFAULT_CONFIG,
  DEFAULT_SERVER_SETTINGS,
  DEFAULT_STRING_PROVIDER,
  computeStatValues,
  Sex,
} from "ark-infographic";
import type { CreatureData, SpeciesInfo, ColorLookup } from "ark-infographic";

// Build your species info, creature data, and color lookup
// (see type definitions for full interfaces)

const svg = renderInfoGraphicSvg(
  creature,
  species,
  DEFAULT_SERVER_SETTINGS,
  DEFAULT_CONFIG,
  colorLookup,
  DEFAULT_STRING_PROVIDER,
  creatureImageDataUri, // optional base64 data URI of colorized sprite
);
```

### PNG Output

```ts
import { initRasterizer, renderInfoGraphicPng } from "ark-infographic/rasterizer";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import fs from "node:fs";

// Initialize once (pass WASM binary + font buffers)
await initRasterizer(resvgWasm, [
  { name: "Arial", data: fs.readFileSync("/path/to/Arial-Regular.ttf").buffer },
  { name: "Arial", data: fs.readFileSync("/path/to/Arial-Bold.ttf").buffer, weight: 700 },
]);

// Render
const png = renderInfoGraphicPng(
  creature,
  species,
  DEFAULT_SERVER_SETTINGS,
  DEFAULT_CONFIG,
  colorLookup,
  DEFAULT_STRING_PROVIDER,
  creatureImageDataUri,
);

fs.writeFileSync("output.png", png);
```

### Creature Sprite Colorization

```ts
import { colorizeCreature, arkColorToSrgb } from "ark-infographic";
import type { ArkColor } from "ark-infographic";
import fs from "node:fs";

const basePng = new Uint8Array(fs.readFileSync("base.png"));
const maskPng = new Uint8Array(fs.readFileSync("mask.png"));

// Convert ARK linear colors to sRGB, null = skip region
const regionColors = [
  arkColorToSrgb({ r: 0.5, g: 0.1, b: 0.1 }),
  null, // region 1 disabled
  arkColorToSrgb({ r: 0.2, g: 0.8, b: 0.3 }),
  null, null, null,
];

const colorizedPng = colorizeCreature(basePng, maskPng, regionColors);
fs.writeFileSync("colorized.png", colorizedPng);
```

### Stat Computation

```ts
import { computeStatValues } from "ark-infographic";

const result = computeStatValues(
  speciesStatData, // from values.json
  levelsWild,      // number[12]
  levelsDom,       // number[12]
  levelsMutated,   // number[12] | null
  imprintingBonus,
  tamingEffectiveness,
);

// result.valuesBreeding[12], result.valuesCurrent[12]
```

## Configuration

### InfoGraphicConfig

Controls the visual layout. `DEFAULT_CONFIG` provides sensible defaults:

- `height`: 180 (content height in pixels; width is computed as `height * 2 + 2 * borderWidth`)
- `fontName`: `"Arial"`
- `foreColor` / `backColor`: black on white
- Display toggles: creature name, dom levels, mutations, generation, stat values, max wild level, color region names

### ServerSettings

Game-specific parameters. `DEFAULT_SERVER_SETTINGS` defaults:

- `maxWildLevel`: 150
- `maxDomLevel`: 88
- `maxChartLevel`: 50
- `game`: `"ASA"`

When `game` is `"ASA"`, the header displays the species name with an `(ASA)` suffix.

## API Reference

### Exports from `"ark-infographic"`

| Export | Type | Description |
|--------|------|-------------|
| `renderInfoGraphicSvg` | function | Generate infographic as SVG string |
| `colorizeCreature` | function | Apply region colors to a creature sprite |
| `computeStatValues` | function | Compute stat values from levels using ARK formulas |
| `arkColorToSrgb` | function | Convert ARK linear color to sRGB tuple |
| `DEFAULT_CONFIG` | const | Default infographic config |
| `DEFAULT_SERVER_SETTINGS` | const | Default server settings |
| `DEFAULT_STRING_PROVIDER` | const | English string provider |
| `SvgBuilder` | class | Fluent SVG element builder |
| `Stats` | enum | Stat index constants |
| `Sex` | enum | `Unknown`, `Male`, `Female` |

### Exports from `"ark-infographic/rasterizer"`

| Export | Type | Description |
|--------|------|-------------|
| `initRasterizer` | async function | Initialize resvg WASM + fonts (call once) |
| `renderInfoGraphicPng` | function | Generate infographic as PNG buffer |

## Dependencies

- **[fast-png](https://www.npmjs.com/package/fast-png)** — Pure JS PNG encode/decode (runtime dependency)
- **[@resvg/resvg-wasm](https://www.npmjs.com/package/@resvg/resvg-wasm)** — SVG-to-PNG rasterizer (optional peer dependency, only needed for PNG output)

## License

ISC
