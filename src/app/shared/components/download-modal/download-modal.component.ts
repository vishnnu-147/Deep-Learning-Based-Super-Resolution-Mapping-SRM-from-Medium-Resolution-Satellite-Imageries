import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SatelliteDataset } from '../../../core/models/satellite-image.model';
import { QualityMetrics } from '../../../core/models/quality-metrics.model';

@Component({
  selector: 'app-download-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Export Satellite Products</span>
          </div>
          <button class="close-btn" (click)="close.emit()">×</button>
        </div>

        <div class="modal-body">
          <div class="export-options">
            <!-- Option 1: Enhanced Visual Image (PNG) -->
            <div class="export-card active">
              <div class="card-radio">
                <input type="radio" id="exp-png" name="export-type" checked />
              </div>
              <div class="card-info">
                <label for="exp-png" class="info-title">Enhanced Visual Image (PNG)</label>
                <p class="info-desc">High-detail reconstructed image plane (~2.5 m estimated spatial resolution).</p>
                <span class="info-badge">Recommended for reports & visual analysis</span>
              </div>
            </div>

            <!-- Option 2: GeoTIFF Format Notice -->
            <div class="export-card disabled">
              <div class="card-radio">
                <input type="radio" id="exp-tif" name="export-type" disabled />
              </div>
              <div class="card-info">
                <label for="exp-tif" class="info-title">Full Geospatial GeoTIFF (16-bit Float)</label>
                <p class="info-desc">Requires server-side GDAL geospatial re-encoding pipeline to write multi-band GeoKey directories.</p>
                <span class="info-badge warning">Client-side GeoTIFF export pipeline pending</span>
              </div>
            </div>

            <!-- Option 3: Analysis Quality Report (JSON) -->
            <div class="export-card">
              <div class="card-radio">
                <input type="radio" id="exp-json" name="export-type" (change)="selectJsonExport()" />
              </div>
              <div class="card-info">
                <label for="exp-json" class="info-title">Quality & Metadata Report (JSON)</label>
                <p class="info-desc">Full machine-readable metadata, CRS, footprint coordinates, and quality metrics.</p>
              </div>
            </div>
          </div>

          <!-- Scientific Honesty Disclaimer -->
          <div class="export-notice">
            <span class="notice-icon">⚠</span>
            <p>
              Fine details in exported products are AI-reconstructed estimates (~2.5 m) and are not directly observed measurements.
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="close.emit()">Cancel</button>
          <button class="btn btn-primary" (click)="executeDownload()">
            Download Product
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./download-modal.component.scss']
})
export class DownloadModalComponent {
  @Input({ required: true }) dataset!: SatelliteDataset;
  @Input() enhancedImageUrl: string = '';
  @Input() metrics?: QualityMetrics;
  @Output() close = new EventEmitter<void>();

  private exportType: 'PNG' | 'JSON' = 'PNG';

  selectJsonExport() {
    this.exportType = 'JSON';
  }

  executeDownload() {
    if (this.exportType === 'PNG') {
      const link = document.createElement('a');
      link.download = `Enhanced_2.5m_${this.dataset.metadata.filename.replace(/\.[^/.]+$/, '')}.png`;
      link.href = this.enhancedImageUrl || this.dataset.enhancedDataUrl || this.dataset.rgbDataUrl;
      link.click();
    } else {
      const report = {
        product: 'Satellite Super Resolution Result',
        targetDetail: '~2.5 m (Estimated)',
        inputResolution: '10 m (Sentinel-2 L2A)',
        filename: this.dataset.metadata.filename,
        crs: this.dataset.metadata.crs || 'Not available',
        bounds: this.dataset.metadata.bounds || 'Not available',
        acquisitionDate: this.dataset.metadata.acquisitionDate || 'Not available',
        qualityMetrics: this.metrics || null,
        exportedAt: new Date().toISOString(),
        disclaimer: 'Fine details are AI-reconstructed estimates and are not directly observed measurements.'
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `Analysis_Report_${this.dataset.metadata.filename.replace(/\.[^/.]+$/, '')}.json`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }

    this.close.emit();
  }
}
