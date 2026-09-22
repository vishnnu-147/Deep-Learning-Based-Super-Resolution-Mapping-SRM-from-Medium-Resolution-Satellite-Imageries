import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryStorageService } from '../../../core/services/history-storage.service';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span>Platform Settings</span>
          </div>
          <button class="close-btn" (click)="close.emit()">×</button>
        </div>

        <div class="modal-body">
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-title">Interface Theme</span>
              <span class="setting-desc">Optimized for dark-room Earth-observation imagery inspection</span>
            </div>
            <div class="setting-control">
              <span class="badge-chip">Dark Cosmic (Fixed)</span>
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-title">Processing Pipeline Mode</span>
              <span class="setting-desc">Executes TensorFlow.js model if present, or visual preview fallback</span>
            </div>
            <div class="setting-control">
              <span class="badge-chip">Auto (Adaptive)</span>
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-title">Raster Interpolation Quality</span>
              <span class="setting-desc">High-pass spatial frequency reconstruction</span>
            </div>
            <div class="setting-control">
              <span class="badge-chip">High Precision</span>
            </div>
          </div>

          <div class="setting-row danger-row">
            <div class="setting-info">
              <span class="setting-title">Local Browser History</span>
              <span class="setting-desc">Remove all cached scenes and thumbnails from IndexedDB</span>
            </div>
            <div class="setting-control">
              <button class="btn btn-danger" (click)="clearHistory()">
                {{ cleared() ? 'Cleared ✓' : 'Clear History' }}
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" (click)="close.emit()">Save & Close</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./settings-modal.component.scss']
})
export class SettingsModalComponent {
  @Output() close = new EventEmitter<void>();

  private historyService = inject(HistoryStorageService);
  readonly cleared = signal<boolean>(false);

  async clearHistory() {
    await this.historyService.clearAll();
    this.cleared.set(true);
    setTimeout(() => this.cleared.set(false), 2000);
  }
}
