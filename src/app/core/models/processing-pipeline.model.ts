export type ProcessingStateMode = 'REAL_AI' | 'SAMPLE_AI' | 'PREVIEW_ENHANCEMENT';

export type ModelLifecycleStatus = 'READY' | 'LOADING' | 'NOT_LOADED' | 'ERROR';

export interface PipelineStage {
  id: number;
  label: string;
  statusText: string;
  completed: boolean;
  active: boolean;
  error?: string;
}

export interface ProcessingProgress {
  currentStageIndex: number;
  percentage: number;
  statusMessage: string;
  stages: PipelineStage[];
  isProcessing: boolean;
  isComplete: boolean;
  error?: string;
  mode: ProcessingStateMode;
}

export interface ModelConfiguration {
  id: string;
  name: string;
  architecture: string;
  scaleFactor: number;
  supportedInputBands: string[];
  expectedInputShape: number[]; // e.g. [-1, -1, -1, 4]
  expectedOutputShape: number[];
  normalization: { min: number; max: number };
  status: ModelLifecycleStatus;
  statusDetail?: string;
  isLoaded: boolean;
}

export const INITIAL_PIPELINE_STAGES: Omit<PipelineStage, 'completed' | 'active'>[] = [
  { id: 1, label: 'Reading image', statusText: 'Parsing raster bytes and geospatial headers...' },
  { id: 2, label: 'Validating bands', statusText: 'Verifying 10 m multispectral bands (B02, B03, B04, B08)...' },
  { id: 3, label: 'Normalizing data', statusText: 'Converting reflectance values to model range...' },
  { id: 4, label: 'Preparing tensors', statusText: 'Constructing multidimensional inference tensors...' },
  { id: 5, label: 'Loading AI model', statusText: 'Checking model weights and tensor execution engine...' },
  { id: 6, label: 'Running inference', statusText: 'Executing deep spatial reconstruction across spectral bands...' },
  { id: 7, label: 'Reconstructing output', statusText: 'Synthesizing ~2.5 m enhanced geospatial image planes...' },
  { id: 8, label: 'Computing available metrics', statusText: 'Evaluating spectral consistency and reference validation...' },
  { id: 9, label: 'Rendering result', statusText: 'Preparing viewport composites and dual-canvas view...' }
];
