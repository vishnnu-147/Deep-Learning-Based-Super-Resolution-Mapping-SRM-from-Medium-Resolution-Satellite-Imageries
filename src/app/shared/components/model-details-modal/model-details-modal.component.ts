import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SatelliteSuperResolutionService } from '../../../core/services/satellite-sr.service';

@Component({
  selector: 'app-model-details-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/>
            </svg>
            <span>AI Super-Resolution Engine Specifications</span>
          </div>
          <button class="close-btn" (click)="close.emit()">×</button>
        </div>

        <div class="modal-body">
          <!-- Status Banner -->
          <div class="status-banner" [ngClass]="srService.modelStatus().toLowerCase()">
            <div class="banner-top">
              <span class="status-dot" [ngClass]="getStatusDotClass()"></span>
              <span class="status-title">STATUS: {{ getStatusTitle() }}</span>
            </div>
            <p class="banner-detail">{{ config().statusDetail }}</p>
          </div>

          <!-- Technical Specs Table -->
          <div class="specs-grid">
            <div class="spec-row">
              <span class="spec-label">Target Architecture</span>
              <span class="spec-val">{{ config().architecture }}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Super-Resolution Scale</span>
              <span class="spec-val highlight">{{ config().scaleFactor }}× Spatial Upscaling</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Supported 10 m Bands</span>
              <span class="spec-val">B02 (Blue), B03 (Green), B04 (Red), B08 (NIR)</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Inference Engine</span>
              <span class="spec-val">TensorFlow.js (WebGL / WebAssembly Backend)</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Expected Input Shape</span>
              <span class="spec-val font-mono">{{ formatShape(config().expectedInputShape) }}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Expected Output Shape</span>
              <span class="spec-val font-mono">{{ formatShape(config().expectedOutputShape) }}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Model Target Directory</span>
              <span class="spec-val font-mono">assets/models/model.json</span>
            </div>
          </div>

          <!-- Production Drop-in Workflow Box -->
          <div class="integration-guide">
            <span class="guide-title">Trained Model Integration Workflow</span>
            <p class="guide-text">
              The application provides a fully decoupled deep-learning service interface. To deploy a newly trained model:
            </p>
            <ol class="workflow-steps">
              <li>Train a 4-band residual CNN on paired Sentinel-2 (10 m) and reference rasters.</li>
              <li>Export and convert the model to TensorFlow.js format via <code>tensorflowjs_converter</code>.</li>
              <li>Place <code>model.json</code> and binary weight shards into <code>public/assets/models/</code>.</li>
              <li>The engine automatically validates tensor dimensions and switches to <strong>AI Super Resolution</strong> state.</li>
            </ol>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" (click)="close.emit()">Close Specifications</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./model-details-modal.component.scss']
})
export class ModelDetailsModalComponent {
  @Output() close = new EventEmitter<void>();

  protected srService = inject(SatelliteSuperResolutionService);
  protected config = this.srService.modelConfig;

  getStatusDotClass(): string {
    const s = this.srService.modelStatus();
    switch (s) {
      case 'READY': return 'ready';
      case 'LOADING': return 'loading';
      case 'NOT_LOADED': return 'idle';
      case 'ERROR': return 'error';
    }
  }

  getStatusTitle(): string {
    const s = this.srService.modelStatus();
    switch (s) {
      case 'READY': return 'Active · Ready for Deep Learning Inference';
      case 'LOADING': return 'Probing & Initializing Model...';
      case 'NOT_LOADED': return 'Not Loaded · Running Preview Enhancement Pipeline';
      case 'ERROR': return 'Model Verification Error';
    }
  }

  formatShape(shape: number[]): string {
    return `[${shape.map(v => (v === -1 ? 'None' : v)).join(', ')}]`;
  }
}
