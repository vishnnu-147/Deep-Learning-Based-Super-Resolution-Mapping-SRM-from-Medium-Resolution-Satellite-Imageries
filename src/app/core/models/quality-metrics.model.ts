export interface QualityMetrics {
  psnr: number | null; // Peak Signal-to-Noise Ratio in dB. null if no reference
  ssim: number | null; // Structural Similarity Index 0..1. null if no reference
  spectralConsistencyPct: number | null; // % consistency with original 10m low-pass bands
  edgeDetailGradient: number | null; // High-frequency gradient magnitude improvement factor
  edgeDetailScore: number | null; // Quantitative edge preservation metric (null if uncalculated)
  hasReference: boolean; // Whether ground-truth/paired validation data was available
  isSampleResult: boolean; // Whether metrics are derived from bundled sample data
  metricOriginText: string; // e.g., "Reference data required"
  confidenceLevel: 'High' | 'Medium' | 'Low' | 'Unvalidated';
  scientificNotice: string;
}

export const DEFAULT_UNVALIDATED_METRICS: QualityMetrics = {
  psnr: null,
  ssim: null,
  spectralConsistencyPct: null,
  edgeDetailGradient: null,
  edgeDetailScore: null,
  hasReference: false,
  isSampleResult: false,
  metricOriginText: 'Reference data required',
  confidenceLevel: 'Unvalidated',
  scientificNotice: 'Fine details are AI-reconstructed estimates and are not directly observed measurements. Scientific validation requires co-registered high-resolution reference data.'
};
