export type SpectralVisualizationMode = 'NATURAL_COLOR' | 'FALSE_COLOR' | 'NDVI';

export interface SpectralModeOption {
  id: SpectralVisualizationMode;
  label: string;
  formulaLabel: string;
  bandsDescription: string;
  multispectralOnly: boolean;
  tooltip: string;
}

export const SPECTRAL_MODES: SpectralModeOption[] = [
  {
    id: 'NATURAL_COLOR',
    label: 'Natural Color',
    formulaLabel: 'RGB (B04 · B03 · B02)',
    bandsDescription: 'Red (B04) + Green (B03) + Blue (B02)',
    multispectralOnly: false,
    tooltip: 'Simulates human visual perception using visible wavelengths.'
  },
  {
    id: 'FALSE_COLOR',
    label: 'False Color',
    formulaLabel: 'CIR (B08 · B04 · B03)',
    bandsDescription: 'NIR (B08) + Red (B04) + Green (B03)',
    multispectralOnly: true,
    tooltip: 'Near-Infrared false color rendering highlighting chlorophyll density and water bodies.'
  },
  {
    id: 'NDVI',
    label: 'NDVI',
    formulaLabel: '(B08 - B04) / (B08 + B04)',
    bandsDescription: 'NDVI = (B08 - B04) / (B08 + B04) where B08 = NIR, B04 = Red',
    multispectralOnly: true,
    tooltip: 'Normalized Difference Vegetation Index: NDVI = (B08 - B04) / (B08 + B04)'
  }
];

export interface NdviSignalCategory {
  range: [number, number];
  label: string;
  color: string;
}

export const NDVI_SIGNAL_CATEGORIES: NdviSignalCategory[] = [
  { range: [-1.0, 0.0], label: 'Water / Bare / Non-vegetated', color: '#1a365d' },
  { range: [0.0, 0.2], label: 'Low vegetation signal', color: '#ecc94b' },
  { range: [0.2, 0.5], label: 'Moderate vegetation signal', color: '#68d391' },
  { range: [0.5, 1.0], label: 'High vegetation signal', color: '#276749' }
];
