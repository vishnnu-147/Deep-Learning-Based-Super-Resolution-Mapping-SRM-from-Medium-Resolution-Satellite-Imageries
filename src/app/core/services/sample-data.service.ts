import { Injectable } from '@angular/core';
import { SatelliteDataset, MultispectralRasterData } from '../models/satellite-image.model';
import { SpectralComposerService } from './spectral-composer.service';

@Injectable({
  providedIn: 'root'
})
export class SampleDataService {

  constructor(private spectralComposer: SpectralComposerService) {}

  getAvailableSamples(): { id: string; title: string; location: string; description: string }[] {
    return [
      {
        id: 'sample-agricultural',
        title: 'Castilla Agricultural Basin',
        location: 'Castilla-La Mancha, Spain',
        description: 'Sentinel-2 Level-2A scene featuring pivot irrigation circles, river valleys, and diverse crop canopies.'
      },
      {
        id: 'sample-delta',
        title: 'Rhône Delta Estuary',
        location: 'Camargue, France',
        description: 'Coastal wetlands, saline lagoons, and agricultural zones with distinct NIR water-absorption signatures.'
      }
    ];
  }

  createSampleDataset(sampleId: string = 'sample-agricultural'): SatelliteDataset {
    const isDelta = sampleId === 'sample-delta';
    const width = 256;
    const height = 256;

    // Generate realistic multispectral bands (B02, B03, B04, B08)
    const rasterData = this.generateSyntheticSentinelBands(width, height, isDelta);
    
    // Natural Color (B04, B03, B02)
    const rgbDataUrl = this.spectralComposer.generateNaturalColorUrl(rasterData);

    // False Color CIR (B08, B04, B03)
    const cirDataUrl = this.spectralComposer.generateFalseColorCirUrl(rasterData);

    // NDVI: (B08 - B04) / (B08 + B04)
    const { dataUrl: ndviDataUrl } = this.spectralComposer.generateNdviMap(rasterData);

    const crs = isDelta ? 'EPSG:32631' : 'EPSG:32630'; // Accurate UTM zones for these specific real-world scenes
    const bounds = isDelta
      ? { west: 4.65, south: 43.60, east: 4.88, north: 43.80 }
      : { west: -4.15, south: 39.80, east: -3.95, north: 40.00 };

    return {
      id: sampleId,
      title: isDelta ? 'Rhône Delta Estuary' : 'Castilla Agricultural Basin',
      locationName: isDelta ? 'Camargue, France' : 'Castilla-La Mancha, Spain',
      metadata: {
        filename: isDelta ? 'S2A_MSIL2A_20240815T104031_T31TFJ.tif' : 'S2B_MSIL2A_20240722T105619_T30TVK.tif',
        format: 'GeoTIFF',
        isMultispectral: true,
        availableBands: ['B02', 'B03', 'B04', 'B08'],
        bandMap: { B02: 0, B03: 1, B04: 2, B08: 3 },
        crs,
        dimensions: { width, height },
        spatialResolutionMeters: 10,
        acquisitionDate: isDelta ? '2024-08-15T10:40:31Z' : '2024-07-22T10:56:19Z',
        cloudCoverage: isDelta ? 0.42 : 1.15,
        tileId: isDelta ? 'T31TFJ' : 'T30TVK',
        bounds,
        rawValuesRange: { min: 140, max: 9200 }
      },
      rasterData,
      rgbDataUrl,
      cirDataUrl,
      ndviDataUrl,
      isSample: true
    };
  }

  private generateSyntheticSentinelBands(w: number, h: number, isDelta: boolean): MultispectralRasterData {
    const total = w * h;
    const b02 = new Float32Array(total); // Blue
    const b03 = new Float32Array(total); // Green
    const b04 = new Float32Array(total); // Red
    const b08 = new Float32Array(total); // NIR

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const nx = x / w;
        const ny = y / h;

        // Base terrain fields (Perlin-like harmonic patterns)
        const field1 = Math.sin(nx * 14 + ny * 6) * Math.cos(ny * 12);
        const field2 = Math.sin(nx * 28 + ny * 28) * 0.5;
        const river = Math.sin(nx * 4 + ny * 2) * 0.15;
        const isWater = Math.abs(ny - 0.45 - river) < 0.055;

        // Center pivot irrigation circle in agricultural sample
        const distToPivot = Math.sqrt((nx - 0.35) ** 2 + (ny - 0.65) ** 2);
        const isPivot = distToPivot < 0.18;

        if (isWater) {
          // Water absorption: Very low NIR (B08), moderate Blue (B02)
          b02[i] = 720 + Math.random() * 80;
          b03[i] = 580 + Math.random() * 60;
          b04[i] = 410 + Math.random() * 40;
          b08[i] = 160 + Math.random() * 30; // Strong water absorption
        } else if (isPivot) {
          // Healthy dense crops: High NIR (B08), low Red (B04)
          b02[i] = 420 + Math.random() * 50;
          b03[i] = 880 + Math.random() * 80;
          b04[i] = 460 + Math.random() * 60;
          b08[i] = 4800 + Math.random() * 600; // Strong NIR chlorophyll reflection
        } else {
          // Arid / mixed agricultural parcels
          const parcelVar = ((Math.floor(nx * 8) + Math.floor(ny * 8)) % 2 === 0) ? 1.2 : 0.8;
          const vegSignal = Math.max(0.1, field1 * 0.4 + field2 * 0.2 + 0.4);

          b02[i] = (620 + 200 * parcelVar) * (1 - vegSignal * 0.2);
          b03[i] = (850 + 260 * parcelVar) * (1 + vegSignal * 0.25);
          b04[i] = (980 + 350 * parcelVar) * (1 - vegSignal * 0.4);
          b08[i] = (1400 + 700 * parcelVar) * (1 + vegSignal * 1.8);
        }
      }
    }

    return { b02, b03, b04, b08, width: w, height: h };
  }
}
