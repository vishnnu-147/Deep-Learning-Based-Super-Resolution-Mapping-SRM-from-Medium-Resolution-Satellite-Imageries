import { Component, EventEmitter, Output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SatelliteSuperResolutionService } from '../../../core/services/satellite-sr.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="nav-left">
        <a routerLink="/" class="brand-link">
          <div class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
              <path d="m4.93 4.93 4.24 4.24"/>
              <path d="m14.83 9.17 4.24-4.24"/>
              <path d="m14.83 14.83 4.24 4.24"/>
              <path d="m9.17 14.83-4.24 4.24"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="product-title">SATELLITE SUPER RESOLUTION</span>
            <span class="product-tagline">Sharper satellite imagery. Better insight.</span>
          </div>
        </a>
      </div>

      <nav class="nav-center">
        <a routerLink="/workspace" routerLinkActive="active" class="nav-tab">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
          </svg>
          <span>Workspace</span>
        </a>
        <a routerLink="/analytics" routerLinkActive="active" class="nav-tab">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>
          </svg>
          <span>Analytics</span>
        </a>
        <a routerLink="/history" routerLinkActive="active" class="nav-tab">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>History</span>
        </a>
      </nav>

      <div class="nav-right">
        <!-- Model Status Chip -->
        <button class="model-status-chip" (click)="openModelDetails.emit()" title="View AI Model Engine Details">
          <span class="status-dot" [ngClass]="modelStatusClass()"></span>
          <span class="model-label">AI MODEL:</span>
          <span class="model-state">{{ modelStatusText() }}</span>
        </button>

        <!-- Copernicus Satellite Data Trigger -->
        <button class="nav-action-btn" (click)="openCopernicusModal.emit()" title="Browse Satellite Data (Sentinel-2)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
            <path d="M2 12h20"/>
          </svg>
          <span class="btn-text">Data Source</span>
        </button>

        <!-- Help Modal Trigger -->
        <button class="icon-btn" (click)="openHelpModal.emit()" title="Geospatial & Super Resolution Guide">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
          </svg>
        </button>

        <!-- Settings Modal Trigger -->
        <button class="icon-btn" (click)="openSettingsModal.emit()" title="Settings & Preferences">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
    </header>
  `,
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Output() openModelDetails = new EventEmitter<void>();
  @Output() openCopernicusModal = new EventEmitter<void>();
  @Output() openHelpModal = new EventEmitter<void>();
  @Output() openSettingsModal = new EventEmitter<void>();

  private srService = inject(SatelliteSuperResolutionService);

  modelStatusText(): string {
    const s = this.srService.modelStatus();
    switch (s) {
      case 'READY': return 'Ready';
      case 'LOADING': return 'Loading';
      case 'NOT_LOADED': return 'Not Loaded';
      case 'ERROR': return 'Error';
    }
  }

  modelStatusClass(): string {
    const s = this.srService.modelStatus();
    switch (s) {
      case 'READY': return 'ready';
      case 'LOADING': return 'loading';
      case 'NOT_LOADED': return 'idle';
      case 'ERROR': return 'error';
    }
  }
}
