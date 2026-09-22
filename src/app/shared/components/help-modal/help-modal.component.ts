import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
            </svg>
            <span>Geospatial & Super Resolution Guide</span>
          </div>
          <button class="close-btn" (click)="close.emit()">×</button>
        </div>

        <div class="modal-body">
          <div class="help-item">
            <h4 class="help-q">What is satellite super resolution?</h4>
            <p class="help-a">
              Satellite super resolution is an algorithmic technique that estimates higher-frequency spatial detail from lower-resolution raster bands by learning deep structural priors from Earth-observation datasets.
            </p>
          </div>

          <div class="help-item">
            <h4 class="help-q">What does "Estimated Detail: ~2.5 m" mean?</h4>
            <p class="help-a">
              Sentinel-2 Level-2A captures visible and near-infrared bands at 10 m Ground Sample Distance (GSD). Applying 4× spatial upscaling produces pixels corresponding to ~2.5 m spacing. However, newly synthesized high-frequency features are mathematically estimated priors—not natively sensed optical photons.
            </p>
          </div>

          <div class="help-item">
            <h4 class="help-q">What is NDVI and how is it calculated?</h4>
            <p class="help-a">
              The Normalized Difference Vegetation Index quantifies photosynthetic canopy vigor using the formula:
              <br>
              <code>NDVI = (B08 - B04) / (B08 + B04)</code>
              <br>
              where <strong>B08 is Near-Infrared (NIR)</strong> and <strong>B04 is Red</strong>. Values range from -1.0 (water/bare soil) to +1.0 (dense healthy vegetation).
            </p>
          </div>

          <div class="help-item">
            <h4 class="help-q">What does Confidence mean?</h4>
            <p class="help-a">
              Confidence reflects whether reconstructed features have been validated against co-registered high-resolution reference truth. In unvalidated custom uploads, quantitative metrics display "Reference data required" to uphold rigorous scientific integrity.
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" (click)="close.emit()">Got it</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./help-modal.component.scss']
})
export class HelpModalComponent {
  @Output() close = new EventEmitter<void>();
}
