import { decode, encode } from "fast-png";
import type { DecodedPng, PngDataArray } from "fast-png";

/** sRGB color as [R, G, B], each 0–255. */
export type SrgbColor = [number, number, number];

/**
 * Colorize a creature sprite by applying region-based color blending.
 *
 * @param basePng  Raw PNG bytes for the base creature sprite
 * @param maskPng  Raw PNG bytes for the region mask (RGB channels encode 6 regions)
 * @param regionColors  6-element array; null entries skip that region
 * @returns PNG-encoded colorized image as Uint8Array
 */
export function colorizeCreature(
  basePng: Uint8Array,
  maskPng: Uint8Array,
  regionColors: (SrgbColor | null)[],
): Uint8Array {
  const base = decode(basePng);
  const mask = decode(maskPng);

  const { width, height } = base;
  const baseCh = base.channels as number;
  const hasAlpha = baseCh === 4;

  // Get mask RGB data, resizing if dimensions differ
  let maskData: PngDataArray;
  let maskCh: number;
  if (mask.width === width && mask.height === height) {
    maskData = mask.data;
    maskCh = mask.channels as number;
  } else {
    maskData = resizeMaskData(mask.data, mask.width, mask.height, mask.channels as number, width, height);
    maskCh = 3;
  }

  // Build active region list upfront to avoid inner-loop null checks
  const activeRegions: { index: number; r: number; g: number; b: number }[] = [];
  for (let m = 0; m < 6; m++) {
    const c = regionColors[m];
    if (c != null) {
      activeRegions.push({ index: m, r: c[0], g: c[1], b: c[2] });
    }
  }

  // If no active regions, return original image unchanged
  if (activeRegions.length === 0) {
    return basePng;
  }

  // Clone base data for in-place mutation
  const outData = new Uint8Array(base.data.length);
  outData.set(base.data);

  const pixelCount = width * height;

  for (let p = 0; p < pixelCount; p++) {
    const baseOff = p * baseCh;

    // Skip fully transparent pixels
    if (hasAlpha && outData[baseOff + 3] === 0) continue;

    let finalR = outData[baseOff];
    let finalG = outData[baseOff + 1];
    let finalB = outData[baseOff + 2];

    const maskOff = p * maskCh;
    const mR = maskData[maskOff];
    const mG = maskData[maskOff + 1];
    const mB = maskData[maskOff + 2];

    for (const region of activeRegions) {
      // Compute region opacity from mask channels
      let opacity: number;
      switch (region.index) {
        case 0: opacity = Math.max(0, mR - mG - mB) / 255; break;
        case 1: opacity = Math.max(0, mG - mR - mB) / 255; break;
        case 2: opacity = Math.max(0, mB - mR - mG) / 255; break;
        case 3: opacity = Math.min(mG, mB) / 255; break;
        case 4: opacity = Math.min(mR, mG) / 255; break;
        case 5: opacity = Math.min(mR, mB) / 255; break;
        default: continue;
      }

      if (opacity <= 0) continue;

      // Two-stage blending: grain-merge then lerp
      const mixR = clamp(finalR + region.r - 128, 0, 255);
      const mixG = clamp(finalG + region.g - 128, 0, 255);
      const mixB = clamp(finalB + region.b - 128, 0, 255);

      finalR = Math.trunc(opacity * mixR + (1 - opacity) * finalR);
      finalG = Math.trunc(opacity * mixG + (1 - opacity) * finalG);
      finalB = Math.trunc(opacity * mixB + (1 - opacity) * finalB);
    }

    outData[baseOff] = finalR;
    outData[baseOff + 1] = finalG;
    outData[baseOff + 2] = finalB;
  }

  return encode({
    width,
    height,
    data: outData,
    channels: baseCh as DecodedPng["channels"],
  });
}

function clamp(v: number, min: number, max: number): number {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

/** Nearest-neighbor resize of mask data to target dimensions. Returns RGB-only data. */
function resizeMaskData(
  srcData: PngDataArray,
  srcW: number,
  srcH: number,
  srcCh: number,
  dstW: number,
  dstH: number,
): Uint8Array {
  const out = new Uint8Array(dstW * dstH * 3);
  for (let y = 0; y < dstH; y++) {
    const srcY = Math.trunc((y * srcH) / dstH);
    for (let x = 0; x < dstW; x++) {
      const srcX = Math.trunc((x * srcW) / dstW);
      const srcOff = (srcY * srcW + srcX) * srcCh;
      const dstOff = (y * dstW + x) * 3;
      out[dstOff] = srcData[srcOff];
      out[dstOff + 1] = srcData[srcOff + 1];
      out[dstOff + 2] = srcData[srcOff + 2];
    }
  }
  return out;
}
