import { Injectable } from '@angular/core';
import * as GeoTIFF from 'geotiff';
import { SatelliteMetadata, MultispectralRasterData, SpectralBandId } from '../models/satellite-image.model';

export interface ParseResult {
  metadata: SatelliteMetadata;
  rasterData?: MultispectralRasterData;
  rgbPreviewUrl: string;
  error?: string;
  warning?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeoTiffParserService {

  async parseSatelliteFile(file: File): Promise<ParseResult> {
    const fileNameLower = file.name.toLowerCase();
    const isTiff = fileNameLower.endsWith('.tif') || fileNameLower.endsWith('.tiff');

    if (isTiff) {
      return this.parseGeoTiff(file);
    } else if (fileNameLower.endsWith('.png') || fileNameLower.endsWith('.jpg') || fileNameLower.endsWith('.jpeg')) {
      return this.parseRgbStandardImage(file);
    } else {
      throw new Error('Unsupported file format. Please upload a GeoTIFF (.tif, .tiff) or standard satellite preview (.png, .jpg).');
    }
  }

  private async parseGeoTiff(file: File): Promise<ParseResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      
      const width = image.getWidth();
      const height = image.getHeight();
      const samplesPerPixel = image.getSamplesPerPixel();

      // Dynamic CRS detection (NEVER hardcode EPSG)
      let detectedCrs: string | null = null;
      try {
        const geoKeys = image.getGeoKeys();
        if (geoKeys) {
          if (geoKeys.ProjectedCSTypeGeoKey) {
            detectedCrs = `EPSG:${geoKeys.ProjectedCSTypeGeoKey}`;
          } else if (geoKeys.GeographicTypeGeoKey) {
            detectedCrs = `EPSG:${geoKeys.GeographicTypeGeoKey}`;
          }
        }
      } catch {
        detectedCrs = null;
      }

      // Dynamic Bounding Box / Footprint
      let bounds: { west: number; south: number; east: number; north: number } | null = null;
      try {
        const bbox = image.getBoundingBox();
        if (bbox && bbox.length === 4 && bbox.every(v => !isNaN(v) && isFinite(v))) {
          bounds = {
            west: bbox[0],
            south: bbox[1],
            east: bbox[2],
            north: bbox[3]
          };
        }
      } catch {
        bounds = null;
      }

      // Read raster data
      const rasters = await image.readRasters() as GeoTIFF.TypedArray[];
      const numBands = Array.isArray(rasters) ? rasters.length : 1;

      // Sentinel-2 band identification
      // Check if file contains at least 4 bands representing B02, B03, B04, B08
      let isMultispectral = false;
      let warning: string | undefined;
      const bandMap: Partial<Record<SpectralBandId, number>> = {};
      const availableBands: SpectralBandId[] = [];

      if (numBands >= 4) {
        // Standard Sentinel-2 4-band export convention (B02 Blue, B03 Green, B04 Red, B08 NIR)
        bandMap['B02'] = 0;
        bandMap['B03'] = 1;
        bandMap['B04'] = 2;
        bandMap['B08'] = 3;
        availableBands.push('B02', 'B03', 'B04', 'B08');
        isMultispectral = true;
      } else if (numBands === 3) {
        // 3-band RGB GeoTIFF
        bandMap['B04'] = 0; // Red
        bandMap['B03'] = 1; // Green
        bandMap['B02'] = 2; // Blue
        availableBands.push('B04', 'B03', 'B02');
        isMultispectral = false;
        warning = '3-band RGB GeoTIFF detected. Multispectral NDVI requires B08 (Near-Infrared).';
      } else {
        isMultispectral = false;
        warning = 'Required multispectral bands were not found. File contains ' + numBands + ' band(s).';
      }

      // Extract raster arrays
      let rasterData: MultispectralRasterData | undefined;
      let rgbPreviewUrl = '';

      if (isMultispectral && Array.isArray(rasters)) {
        const b02 = this.convertToFloat32(rasters[bandMap['B02'] ?? 0]);
        const b03 = this.convertToFloat32(rasters[bandMap['B03'] ?? 1]);
        const b04 = this.convertToFloat32(rasters[bandMap['B04'] ?? 2]);
        const b08 = this.convertToFloat32(rasters[bandMap['B08'] ?? 3]);

        rasterData = { b02, b03, b04, b08, width, height };
        rgbPreviewUrl = this.createRgbCompositeUrl(b04, b03, b02, width, height);
      } else if (numBands >= 3 && Array.isArray(rasters)) {
        const r = this.convertToFloat32(rasters[0]);
        const g = this.convertToFloat32(rasters[1]);
        const b = this.convertToFloat32(rasters[2]);
        rgbPreviewUrl = this.createRgbCompositeUrl(r, g, b, width, height);
      } else {
        rgbPreviewUrl = this.createGrayscaleUrl(rasters[0], width, height);
      }

      const metadata: SatelliteMetadata = {
        filename: file.name,
        format: 'GeoTIFF',
        isMultispectral,
        availableBands,
        bandMap,
        crs: detectedCrs, // dynamic or null ("Not available")
        dimensions: { width, height },
        spatialResolutionMeters: 10,
        acquisitionDate: null, // extracted or null - never fabricate
        cloudCoverage: null,
        tileId: null,
        bounds,
        rawValuesRange: this.calculateValueRange(rasters[0])
      };

      return { metadata, rasterData, rgbPreviewUrl, warning };
    } catch (err: any) {
      throw new Error(`Unable to read this GeoTIFF: ${err.message || 'Corrupted or unsupported format'}.`);
    }
  }

  private async parseRgbStandardImage(file: File): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;
          const format = file.name.toLowerCase().endsWith('.png') ? 'PNG' : 'JPEG';

          const metadata: SatelliteMetadata = {
            filename: file.name,
            format,
            isMultispectral: false,
            availableBands: ['R', 'G', 'B'],
            bandMap: {},
            crs: null, // "Not available" for standard RGB photos
            dimensions: { width, height },
            spatialResolutionMeters: null,
            acquisitionDate: null,
            cloudCoverage: null,
            tileId: null,
            bounds: null
          };

          resolve({
            metadata,
            rgbPreviewUrl: e.target?.result as string,
            warning: 'RGB image detected. Multispectral analysis requires a compatible GeoTIFF.'
          });
        };
        img.onerror = () => reject(new Error('Failed to load image preview.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file bytes.'));
      reader.readAsDataURL(file);
    });
  }

  private convertToFloat32(array: GeoTIFF.TypedArray): Float32Array {
    if (array instanceof Float32Array) return array;
    return new Float32Array(array);
  }

  private calculateValueRange(array: GeoTIFF.TypedArray): { min: number; max: number } {
    let min = Infinity;
    let max = -Infinity;
    const len = Math.min(array.length, 50000); // sample for speed
    for (let i = 0; i < len; i++) {
      const v = array[i];
      if (!isNaN(v) && isFinite(v)) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    return { min: isFinite(min) ? min : 0, max: isFinite(max) ? max : 255 };
  }

  createRgbCompositeUrl(r: Float32Array, g: Float32Array, b: Float32Array, width: number, height: number): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;
    const totalPixels = width * height;

    // Percentile or auto-stretch normalization (2% - 98%)
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

  private createGrayscaleUrl(raw: GeoTIFF.TypedArray, width: number, height: number): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;
    const total = width * height;
    const maxVal = Math.max(1, this.quickPercentile(raw, 0.98));

    for (let i = 0; i < total; i++) {
      const idx = i * 4;
      const v = Math.min(255, Math.max(0, Math.round((raw[i] / maxVal) * 255)));
      data[idx] = v;
      data[idx + 1] = v;
      data[idx + 2] = v;
      data[idx + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  private quickPercentile(arr: GeoTIFF.TypedArray | Float32Array, p: number): number {
    const step = Math.max(1, Math.floor(arr.length / 5000));
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
