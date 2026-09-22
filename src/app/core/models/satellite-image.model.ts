export type SpectralBandId = 'B02' | 'B03' | 'B04' | 'B08' | 'R' | 'G' | 'B';

export interface BandMetadata {
  id: SpectralBandId;
  name: string;
  nominalWavelengthNm?: number;
  nativeResolutionMeters: number;
  rasterIndex: number;
}

export interface SatelliteMetadata {
  filename: string;
  format: 'GeoTIFF' | 'PNG' | 'JPEG' | 'Unknown';
  isMultispectral: boolean;
  availableBands: SpectralBandId[];
  bandMap: Partial<Record<SpectralBandId, number>>; // Maps B02, B03, B04, B08 to raster band indices
  crs: string | null; // e.g. "EPSG:32632" or null if not present
  dimensions: { width: number; height: number };
  spatialResolutionMeters: number | null; // e.g. 10 or null
  acquisitionDate: string | null; // null if not in metadata
  cloudCoverage: number | null; // null if not in metadata
  tileId: string | null; // null if not in metadata
  bounds: {
    west: number;
    south: number;
    east: number;
    north: number;
  } | null;
  geotransform?: number[] | null;
  rawValuesRange?: { min: number; max: number };
}

export interface MultispectralRasterData {
  b02?: Float32Array; // Blue (10m)
  b03?: Float32Array; // Green (10m)
  b04?: Float32Array; // Red (10m)
  b08?: Float32Array; // NIR (10m)
  width: number;
  height: number;
}

export interface SatelliteDataset {
  id: string;
  title: string;
  locationName: string;
  metadata: SatelliteMetadata;
  rasterData?: MultispectralRasterData;
  rgbDataUrl: string; // 10m Natural Color baseline
  enhancedDataUrl?: string; // Enhanced result
  referenceDataUrl?: string; // Real high-res reference if bundled sample
  ndviDataUrl?: string; // Precomputed/computed NDVI
  cirDataUrl?: string; // Precomputed/computed Color-Infrared
  isSample: boolean;
}
