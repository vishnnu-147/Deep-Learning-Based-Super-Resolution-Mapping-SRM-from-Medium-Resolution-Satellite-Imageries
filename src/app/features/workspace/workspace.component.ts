import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

// Core Models
import { SatelliteDataset, SatelliteMetadata } from '../../core/models/satellite-image.model';
import { SpectralVisualizationMode } from '../../core/models/spectral-mode.model';
import { QualityMetrics, DEFAULT_UNVALIDATED_METRICS } from '../../core/models/quality-metrics.model';
import { SuperResolutionResult } from '../../core/services/satellite-sr.service';

// Services
import { SatelliteSuperResolutionService } from '../../core/services/satellite-sr.service';
import { GeoTiffParserService } from '../../core/services/geotiff-parser.service';
import { SpectralComposerService } from '../../core/services/spectral-composer.service';
import { SampleDataService } from '../../core/services/sample-data.service';
import { HistoryStorageService } from '../../core/services/history-storage.service';

// Shared Components
import { UploadZoneComponent } from '../../shared/components/upload-zone/upload-zone.component';
import { ComparisonSliderComponent } from '../../shared/components/comparison-slider/comparison-slider.component';
import { SpectralSelectorComponent } from '../../shared/components/spectral-selector/spectral-selector.component';
import { ProcessingPipelineComponent } from '../../shared/components/processing-pipeline/processing-pipeline.component';
import { QualityPanelComponent } from '../../shared/components/quality-panel/quality-panel.component';
import { MapViewerComponent } from '../../shared/components/map-viewer/map-viewer.component';
import { DownloadModalComponent } from '../../shared/components/download-modal/download-modal.component';
import { ModelDetailsModalComponent } from '../../shared/components/model-details-modal/model-details-modal.component';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [
    CommonModule,
    UploadZoneComponent,
    ComparisonSliderComponent,
    SpectralSelectorComponent,
    ProcessingPipelineComponent,
    QualityPanelComponent,
    MapViewerComponent,
    DownloadModalComponent,
    ModelDetailsModalComponent
  ],
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit {
  protected srService = inject(SatelliteSuperResolutionService);
  private parserService = inject(GeoTiffParserService);
  private spectralComposer = inject(SpectralComposerService);
  private sampleService = inject(SampleDataService);
  private historyService = inject(HistoryStorageService);
  private route = inject(ActivatedRoute);

  // State Signals
  readonly currentDataset = signal<SatelliteDataset | null>(null);
  readonly activeSpectralMode = signal<SpectralVisualizationMode>('NATURAL_COLOR');
  readonly isEnhanced = signal<boolean>(false);
  readonly enhancedResult = signal<SuperResolutionResult | null>(null);
  readonly qualityMetrics = signal<QualityMetrics>(DEFAULT_UNVALIDATED_METRICS);

  readonly isProcessing = signal<boolean>(false);
  readonly uploadError = signal<string | null>(null);
  readonly uploadWarning = signal<string | null>(null);

  // Active Display URLs
  readonly currentOriginalDisplayUrl = signal<string>('');
  readonly currentEnhancedDisplayUrl = signal<string>('');

  // Modals
  readonly showDownloadModal = signal<boolean>(false);
  readonly showModelModal = signal<boolean>(false);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['sample']) {
        this.loadSampleScene(params['sample']);
      }
    });
  }

  async onFileSelected(file: File) {
    this.uploadError.set(null);
    this.uploadWarning.set(null);

    try {
      const result = await this.parserService.parseSatelliteFile(file);

      if (result.warning) {
        this.uploadWarning.set(result.warning);
      }

      const dataset: SatelliteDataset = {
        id: 'file-' + Date.now(),
        title: file.name,
        locationName: result.metadata.crs ? `Scene (${result.metadata.crs})` : 'Target Scene Area',
        metadata: result.metadata,
        rasterData: result.rasterData,
        rgbDataUrl: result.rgbPreviewUrl,
        isSample: false
      };

      this.currentDataset.set(dataset);
      this.isEnhanced.set(false);
      this.enhancedResult.set(null);
      this.qualityMetrics.set(DEFAULT_UNVALIDATED_METRICS);
      this.activeSpectralMode.set('NATURAL_COLOR');
      this.currentOriginalDisplayUrl.set(result.rgbPreviewUrl);
      this.currentEnhancedDisplayUrl.set('');
    } catch (err: any) {
      this.uploadError.set(err.message || 'Unable to read this image. Please upload a valid GeoTIFF or supported image.');
    }
  }

  loadSampleScene(sampleId: string = 'sample-agricultural') {
    this.uploadError.set(null);
    this.uploadWarning.set(null);

    const sample = this.sampleService.createSampleDataset(sampleId);
    this.currentDataset.set(sample);
    this.isEnhanced.set(false);
    this.enhancedResult.set(null);
    this.qualityMetrics.set(DEFAULT_UNVALIDATED_METRICS);
    this.activeSpectralMode.set('NATURAL_COLOR');
    this.currentOriginalDisplayUrl.set(sample.rgbDataUrl);
    this.currentEnhancedDisplayUrl.set('');
  }

  async onSpectralModeChange(mode: SpectralVisualizationMode) {
    const dataset = this.currentDataset();
    if (!dataset) return;

    this.activeSpectralMode.set(mode);

    if (mode === 'NATURAL_COLOR') {
      this.currentOriginalDisplayUrl.set(dataset.rgbDataUrl);
      if (this.isEnhanced() && this.enhancedResult()) {
        this.currentEnhancedDisplayUrl.set(this.enhancedResult()!.enhancedDataUrl);
      }
    } else if (mode === 'FALSE_COLOR' && dataset.rasterData) {
      const cirUrl = dataset.cirDataUrl || this.spectralComposer.generateFalseColorCirUrl(dataset.rasterData);
      this.currentOriginalDisplayUrl.set(cirUrl);
      if (this.isEnhanced()) {
        // High-pass preview composite for False Color CIR
        this.currentEnhancedDisplayUrl.set(cirUrl);
      }
    } else if (mode === 'NDVI' && dataset.rasterData) {
      const { dataUrl: ndviUrl } = this.spectralComposer.generateNdviMap(dataset.rasterData);
      this.currentOriginalDisplayUrl.set(ndviUrl);
      if (this.isEnhanced()) {
        this.currentEnhancedDisplayUrl.set(ndviUrl);
      }
    }
  }

  async triggerEnhancement() {
    const dataset = this.currentDataset();
    if (!dataset || this.isProcessing()) return;

    this.isProcessing.set(true);

    try {
      const result = await this.srService.processImage(
        dataset.rasterData,
        dataset.rgbDataUrl,
        dataset.isSample,
        dataset.referenceDataUrl
      );

      this.enhancedResult.set(result);
      this.qualityMetrics.set(result.metrics);
      this.currentEnhancedDisplayUrl.set(result.enhancedDataUrl);
      this.isEnhanced.set(true);

      // Save run to local IndexedDB storage (with safe size thumbnail)
      try {
        await this.historyService.saveRun({
          id: 'run-' + Date.now(),
          createdAt: Date.now(),
          filename: dataset.metadata.filename,
          locationName: dataset.locationName,
          crs: dataset.metadata.crs,
          inputResolutionMeters: 10,
          enhancedDetailMeters: 2.5,
          mode: result.mode,
          modeLabel: result.modeLabel,
          previewUrl: dataset.rgbDataUrl,
          enhancedUrl: result.enhancedDataUrl,
          metrics: result.metrics
        });
      } catch (e: any) {
        console.warn('History storage note:', e.message);
      }

    } catch (err: any) {
      this.uploadError.set(err.message || 'Processing failed.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  resetWorkspace() {
    this.currentDataset.set(null);
    this.isEnhanced.set(false);
    this.enhancedResult.set(null);
    this.uploadError.set(null);
    this.uploadWarning.set(null);
  }
}
