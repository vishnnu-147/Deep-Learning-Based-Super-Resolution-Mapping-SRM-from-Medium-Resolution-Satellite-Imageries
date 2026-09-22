import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-copernicus-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
              <path d="M2 12h20"/>
            </svg>
            <span>Connect Satellite Data Source</span>
          </div>
          <button class="close-btn" (click)="close.emit()">×</button>
        </div>

        <div class="modal-body">
          <p class="body-intro">
            Direct retrieval from the Copernicus Sentinel-2 Open Access / Data Space Hub requires an authenticated backend gateway to safely manage OAuth tokens without exposing credentials in client code.
          </p>

          <div class="query-filters">
            <div class="filter-group">
              <label class="filter-label">Constellation</label>
              <input type="text" class="filter-input" value="Sentinel-2 (MSI Level-2A)" readonly />
            </div>

            <div class="filter-row">
              <div class="filter-group">
                <label class="filter-label">Target Bands</label>
                <input type="text" class="filter-input" value="10m (B02, B03, B04, B08)" readonly />
              </div>
              <div class="filter-group">
                <label class="filter-label">Max Cloud Cover</label>
                <input type="text" class="filter-input" value="< 10%" readonly />
              </div>
            </div>
          </div>

          <!-- Connection Status Card -->
          <div class="status-box">
            <div class="status-indicator">
              <span class="status-dot idle"></span>
              <span class="status-heading">Satellite data connection not configured.</span>
            </div>
            <p class="status-detail">
              API credentials are not stored in the browser for security. Local file upload (GeoTIFF, TIFF, PNG, JPG) and bundled sample datasets are fully functional without external satellite network dependencies.
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" (click)="close.emit()">
            Continue with Local Upload
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./copernicus-modal.component.scss']
})
export class CopernicusModalComponent {
  @Output() close = new EventEmitter<void>();
}
