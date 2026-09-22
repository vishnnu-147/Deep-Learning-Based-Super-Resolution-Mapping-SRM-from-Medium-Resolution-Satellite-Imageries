import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QualityMetrics } from '../../../core/models/quality-metrics.model';

@Component({
  selector: 'app-quality-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quality-panel">
      <div class="panel-top">
        <span class="panel-title">QUALITY ANALYSIS</span>
        <span class="origin-tag" [class.sample]="metrics.isSampleResult" [class.unvalidated]="!metrics.hasReference">
          {{ metrics.metricOriginText }}
        </span>
      </div>

      <!-- 4 Compact Metric Cards -->
      <div class="metrics-grid">
        <!-- PSNR Card -->
        <div class="metric-card">
          <div class="card-head">
            <span class="card-name">PSNR</span>
            <span class="card-unit" *ngIf="metrics.psnr !== null">dB</span>
          </div>
          <div class="card-val" [class.na]="metrics.psnr === null">
            {{ metrics.psnr !== null ? metrics.psnr + ' dB' : 'Ref. required' }}
          </div>
          <div class="card-footnote">
            {{ metrics.psnr !== null ? 'Peak Signal-to-Noise' : 'Reference data required' }}
          </div>
        </div>

        <!-- SSIM Card -->
        <div class="metric-card">
          <div class="card-head">
            <span class="card-name">SSIM</span>
            <span class="card-unit" *ngIf="metrics.ssim !== null">index</span>
          </div>
          <div class="card-val" [class.na]="metrics.ssim === null">
            {{ metrics.ssim !== null ? metrics.ssim : 'Ref. required' }}
          </div>
          <div class="card-footnote">
            {{ metrics.ssim !== null ? 'Structural Similarity' : 'Validation unavailable' }}
          </div>
        </div>

        <!-- Spectral Consistency Card -->
        <div class="metric-card">
          <div class="card-head">
            <span class="card-name">Spectral Consistency</span>
            <span class="card-unit" *ngIf="metrics.spectralConsistencyPct !== null">%</span>
          </div>
          <div class="card-val" [class.na]="metrics.spectralConsistencyPct === null">
            {{ metrics.spectralConsistencyPct !== null ? metrics.spectralConsistencyPct + '%' : 'Ref. required' }}
          </div>
          <div class="card-footnote">Low-pass band alignment</div>
        </div>

        <!-- Edge Detail Card -->
        <div class="metric-card">
          <div class="card-head">
            <span class="card-name">Edge Detail</span>
            <span class="card-unit" *ngIf="metrics.edgeDetailScore !== null">grad</span>
          </div>
          <div class="card-val" [class.highlight]="metrics.edgeDetailScore !== null" [class.na]="metrics.edgeDetailScore === null">
            {{ metrics.edgeDetailScore !== null ? metrics.edgeDetailScore : 'Not available' }}
          </div>
          <div class="card-footnote">Spatial gradient magnitude</div>
        </div>
      </div>

      <!-- Confidence & Scientific Disclaimer Block -->
      <div class="confidence-box">
        <div class="conf-header">
          <div class="conf-left">
            <span class="conf-label">Confidence Assessment:</span>
            <span class="conf-level" [ngClass]="metrics.confidenceLevel.toLowerCase()">
              {{ metrics.confidenceLevel }}
            </span>
          </div>
          <button class="tooltip-trigger" (click)="toggleExplainer()" title="Explain confidence estimation">
            Learn more
          </button>
        </div>

        <p class="disclaimer-text">
          {{ metrics.scientificNotice }}
        </p>

        <div class="explainer-drawer" *ngIf="showExplainer()">
          <h6>Scientific Validation Principle</h6>
          <p>
            AI super-resolution constructs estimated high-frequency geospatial details by learning spatial priors.
            Because synthetic high-resolution features are mathematically inferred, quantitative validation metrics
            (PSNR/SSIM) are only reported when verified against paired ground-truth satellite references.
          </p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./quality-panel.component.scss']
})
export class QualityPanelComponent {
  @Input({ required: true }) metrics!: QualityMetrics;

  readonly showExplainer = signal<boolean>(false);

  toggleExplainer() {
    this.showExplainer.update(v => !v);
  }
}
