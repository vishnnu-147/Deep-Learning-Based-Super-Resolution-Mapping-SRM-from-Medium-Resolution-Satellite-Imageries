import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HistoryStorageService, HistoryRecord } from '../../core/services/history-storage.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="history-container">
      <div class="history-header">
        <div class="header-left">
          <span class="mono-eyebrow">PERSISTENT CACHE (INDEXEDDB)</span>
          <h1 class="history-title">Processing History</h1>
          <p class="history-sub">
            Previously enhanced satellite scenes, spatial metrics, and spectral snapshots stored locally in your browser.
          </p>
        </div>

        <div class="header-right" *ngIf="records().length > 0">
          <button class="btn-clear" (click)="clearAll()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            <span>Clear History</span>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div class="history-empty" *ngIf="records().length === 0">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <h3 class="empty-title">No processed images yet.</h3>
        <p class="empty-sub">Run an enhancement in the workspace to save processing history and quality metrics.</p>
        <a routerLink="/workspace" class="btn-goto-workspace">
          Open Workspace
        </a>
      </div>

      <!-- History Records Grid -->
      <div class="records-grid" *ngIf="records().length > 0">
        <div class="record-card" *ngFor="let item of records()">
          <div class="thumb-frame">
            <img [src]="item.thumbnailUrl" [alt]="item.filename" />
            <span class="mode-tag" [ngClass]="item.mode">{{ item.modeLabel }}</span>
          </div>

          <div class="card-content">
            <div class="content-top">
              <h4 class="record-title" [title]="item.filename">{{ item.filename }}</h4>
              <span class="record-date">{{ item.createdAt | date:'medium' }}</span>
            </div>

            <div class="record-meta-strip">
              <div class="meta-cell">
                <span class="k">Input:</span>
                <span class="v">{{ item.inputResolutionMeters }} m</span>
              </div>
              <div class="meta-cell">
                <span class="k">Enhanced:</span>
                <span class="v cyan">~{{ item.enhancedDetailMeters }} m</span>
              </div>
              <div class="meta-cell" *ngIf="item.crs">
                <span class="k">CRS:</span>
                <span class="v">{{ item.crs }}</span>
              </div>
            </div>

            <!-- Validation Note -->
            <div class="quality-mini-badge" *ngIf="item.metrics">
              <span class="val-origin">{{ item.metrics.metricOriginText }}</span>
              <span class="val-metric" *ngIf="item.metrics.psnr !== null">PSNR: {{ item.metrics.psnr }} dB</span>
            </div>

            <div class="card-actions">
              <button class="action-btn download" (click)="downloadRecord(item)" title="Download enhanced raster">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Export</span>
              </button>
              <button class="action-btn delete" (click)="deleteRecord(item.id)" title="Remove record">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  private historyService = inject(HistoryStorageService);
  private router = inject(Router);

  readonly records = signal<HistoryRecord[]>([]);

  async ngOnInit() {
    await this.loadRecords();
  }

  async loadRecords() {
    const list = await this.historyService.getAllRuns();
    this.records.set(list);
  }

  async deleteRecord(id: string) {
    await this.historyService.deleteRun(id);
    await this.loadRecords();
  }

  async clearAll() {
    if (confirm('Clear all processed satellite imagery history?')) {
      await this.historyService.clearAll();
      await this.loadRecords();
    }
  }

  downloadRecord(item: HistoryRecord) {
    const link = document.createElement('a');
    link.download = `Enhanced_2.5m_${item.filename.replace(/\.[^/.]+$/, '')}.png`;
    link.href = item.enhancedUrl;
    link.click();
  }
}
