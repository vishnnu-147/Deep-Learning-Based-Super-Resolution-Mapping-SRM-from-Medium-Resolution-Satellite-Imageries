import { Injectable } from '@angular/core';
import { MultispectralRasterData } from '../models/satellite-image.model';

export interface NdviSummary {
  meanNdvi: number;
  minNdvi: number;
  maxNdvi: number;
  histogram: { binStart: number; binEnd: number; count: number }[];
  signals: {
    lowVegetationPct: number;
    moderateVegetationPct: number;
    highVegetationPct: number;
    waterOrBarePct: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SpectralComposerService {

  /**
   * Generates Natural Color RGB (B04=Red, B03=Green, B02=Blue)
   */
  generateNaturalColorUrl(raster: MultispectralRasterData): string {
    if (!raster.b04 || !raster.b03 || !raster.b02) {
      throw new Error('Multispectral bands B04 (Red), B03 (Green), and B02 (Blue) are required for Natural Color.');
    }
    return this.renderRgbCanvas(raster.b04, raster.b03, raster.b02, raster.width, raster.height);
  }

  /**
   * Generates False Color Color-Infrared (B08=NIR, B04=Red, B03=Green)
   */
  generateFalseColorCirUrl(raster: MultispectralRasterData): string {
    if (!raster.b08 || !raster.b04 || !raster.b03) {
      throw new Error('Multispectral bands B08 (NIR), B04 (Red), and B03 (Green) are required for False Color CIR.');
    }
    return this.renderRgbCanvas(raster.b08, raster.b04, raster.b03, raster.width, raster.height);
  }

  /**
   * Computes NDVI using the exact mathematical formula:
   * NDVI = (B08 - B04) / (B08 + B04)
   * where B08 = NIR, B04 = Red.
   * Handles division-by-zero safely (if B08 + B04 === 0, returns 0).
   */
  generateNdviMap(raster: MultispectralRasterData): { dataUrl: string; ndviValues: Float32Array; summary: NdviSummary } {
    if (!raster.b08 || !raster.b04) {
      throw new Error('Multispectral bands B08 (NIR) and B04 (Red) are required for NDVI computation.');
    }

    const nir = raster.b08;
    const red = raster.b04;
    const width = raster.width;
    const height = raster.height;
    const totalPixels = width * height;

    const ndviValues = new Float32Array(totalPixels);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to obtain canvas 2D context.');

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    let sumNdvi = 0;
    let validCount = 0;
    let minNdvi = 1.0;
    let maxNdvi = -1.0;

    let waterOrBareCount = 0;
    let lowCount = 0;
    let moderateCount = 0;
    let highCount = 0;

    // 20 bins between -1.0 and 1.0 (step 0.1)
    const bins = new Array(20).fill(0);

    for (let i = 0; i < totalPixels; i++) {
      const n = nir[i];
      const r = red[i];
      const denom = n + r;

      // Safe division-by-zero protection
      let ndvi = 0;
      if (denom > 0.00001 || denom < -0.00001) {
        ndvi = (n - r) / denom;
        // Clamp numerical precision to [-1.0, 1.0]
        if (ndvi < -1.0) ndvi = -1.0;
        if (ndvi > 1.0) ndvi = 1.0;
      } else {
        ndvi = 0; // Safe value when denom is 0
      }

      ndviValues[i] = ndvi;
      sumNdvi += ndvi;
      validCount++;

      if (ndvi < minNdvi) minNdvi = ndvi;
      if (ndvi > maxNdvi) maxNdvi = ndvi;

      // Categorize signal
      if (ndvi <= 0.0) {
        waterOrBareCount++;
      } else if (ndvi < 0.2) {
        lowCount++;
      } else if (ndvi < 0.5) {
        moderateCount++;
      } else {
        highCount++;
      }

      // Bin index: [-1.0, 1.0] mapped to [0, 19]
      const binIdx = Math.min(19, Math.max(0, Math.floor(((ndvi + 1.0) / 2.0) * 20)));
      bins[binIdx]++;

      // Continuous Color Mapping:
      // ndvi <= 0: Blue / Charcoal water/bare
      // 0.0 to 0.2: Ochre / Yellow (Low vegetation signal)
      // 0.2 to 0.5: Light green (Moderate vegetation signal)
      // 0.5 to 1.0: Deep emerald green (High vegetation signal)
      const color = this.getNdviColor(ndvi);
      const pixelIdx = i * 4;
      data[pixelIdx] = color[0];
      data[pixelIdx + 1] = color[1];
      data[pixelIdx + 2] = color[2];
      data[pixelIdx + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);

    const histogram = bins.map((count, idx) => ({
      binStart: -1.0 + idx * 0.1,
      binEnd: -1.0 + (idx + 1) * 0.1,
      count
    }));

    const summary: NdviSummary = {
      meanNdvi: validCount > 0 ? sumNdvi / validCount : 0,
      minNdvi: isFinite(minNdvi) ? minNdvi : 0,
      maxNdvi: isFinite(maxNdvi) ? maxNdvi : 0,
      histogram,
      signals: {
        lowVegetationPct: totalPixels > 0 ? (lowCount / totalPixels) * 100 : 0,
        moderateVegetationPct: totalPixels > 0 ? (moderateCount / totalPixels) * 100 : 0,
        highVegetationPct: totalPixels > 0 ? (highCount / totalPixels) * 100 : 0,
        waterOrBarePct: totalPixels > 0 ? (waterOrBareCount / totalPixels) * 100 : 0
      }
    };

    return {
      dataUrl: canvas.toDataURL('image/png'),
      ndviValues,
      summary
    };
  }

  private getNdviColor(val: number): [number, number, number] {
    if (val <= 0.0) {
      // Water / non-vegetated (Deep Navy Slate: rgb(24, 38, 56))
      const factor = Math.max(0, (val + 1.0)); // 0..1
      return [Math.round(18 + factor * 16), Math.round(30 + factor * 20), Math.round(50 + factor * 40)];
    } else if (val < 0.2) {
      // Low vegetation signal (Ochre / Sand: rgb(218, 165, 32))
      const t = val / 0.2;
      return [Math.round(180 + t * 45), Math.round(150 + t * 40), Math.round(50 - t * 20)];
    } else if (val < 0.5) {
      // Moderate vegetation signal (Yellow-Green -> Light Green)
      const t = (val - 0.2) / 0.3;
      return [Math.round(180 - t * 110), Math.round(195 + t * 30), Math.round(50 + t * 30)];
    } else {
      // High vegetation signal (Vibrant to Deep Emerald: rgb(24, 160, 60))
      const t = Math.min(1.0, (val - 0.5) / 0.5);
      return [Math.round(70 - t * 45), Math.round(225 - t * 45), Math.round(80 - t * 30)];
    }
  }

  private renderRgbCanvas(r: Float32Array, g: Float32Array, b: Float32Array, width: number, height: number): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;
    const totalPixels = width * height;

    const maxVal = Math.max(1, this.quickPercentile(r, 0.98), this.quickPercentile(g, 0.98), this.quickPercentile(b, 0.98));

    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      data[idx] = Math.min(255, Math.max(0, Math.round((r[i] / maxVal) * 255)));
      data[idx + 1] = Math.min(255, Math.max(0, Math.round((g[i] / maxVal) * 255)));
      data[idx + 2] = Math.min(255, Math.max(0, Math.round((b[i] / maxVal) * 255)));
      data[idx + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  private quickPercentile(arr: Float32Array, p: number): number {
    const step = Math.max(1, Math.floor(arr.length / 4000));
    const samples: number[] = [];
    for (let i = 0; i < arr.length; i += step) {
      const val = arr[i];
      if (!isNaN(val) && isFinite(val) && val > 0) {
        samples.push(val);
      }
    }
    if (samples.length === 0) return 255;
    samples.sort((a, b) => a - b);
    const idx = Math.min(samples.length - 1, Math.floor(samples.length * p));
    return samples[idx];
  }
}
