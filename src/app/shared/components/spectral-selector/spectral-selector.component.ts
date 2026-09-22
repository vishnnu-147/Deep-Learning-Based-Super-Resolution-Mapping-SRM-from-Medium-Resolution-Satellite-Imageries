import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SpectralVisualizationMode,
  SPECTRAL_MODES,
  SpectralModeOption,
  NDVI_SIGNAL_CATEGORIES
} from '../../../core/models/spectral-mode.model';

@Component({
  selector: 'app-spectral-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spectral-panel">
      <div class="panel-header">
        <span class="header-label">SPECTRAL VISUALIZATION</span>
        <span class="band-tag" *ngIf="isMultispectral">B02 · B03 · B04 · B08 Active</span>
        <span class="rgb-tag" *ngIf="!isMultispectral">RGB Mode Only</span>
      </div>

      <!-- Segmented Mode Switcher -->
      <div class="segmented-control">
        <button
          *ngFor="let mode of modes"
          class="mode-btn"
          [class.active]="selectedMode === mode.id"
          [class.disabled]="mode.multispectralOnly && !isMultispectral"
          [disabled]="mode.multispectralOnly && !isMultispectral"
          [title]="getTooltip(mode)"
          (click)="selectMode(mode.id)">
          <span class="mode-name">{{ mode.label }}</span>
          <span class="mode-formula">{{ mode.formulaLabel }}</span>
        </button>
      </div>

      <!-- RGB Limitation Warning if user uploaded PNG/JPG -->
      <div class="rgb-limitation-alert" *ngIf="!isMultispectral">
        <span class="alert-icon">ℹ</span>
        <span>RGB image detected. Multispectral analysis requires a compatible GeoTIFF.</span>
      </div>

      <!-- Compact Continuous NDVI Legend Bar (When NDVI is active) -->
      <div class="ndvi-legend-container" *ngIf="selectedMode === 'NDVI' && isMultispectral">
        <div class="legend-bar-wrapper">
          <div class="ndvi-gradient-bar"></div>
          <div class="legend-scale-labels">
            <span>-1.0</span>
            <span>0.0</span>
            <span>+0.2</span>
            <span>+0.5</span>
            <span>+1.0</span>
          </div>
        </div>
        <div class="signal-tags">
          <div class="signal-tag" *ngFor="let cat of signalCategories">
            <span class="signal-dot" [style.background-color]="cat.color"></span>
            <span class="signal-text">{{ cat.label }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./spectral-selector.component.scss']
})
export class SpectralSelectorComponent {
  @Input() selectedMode: SpectralVisualizationMode = 'NATURAL_COLOR';
  @Input() isMultispectral: boolean = true;
  @Output() modeChanged = new EventEmitter<SpectralVisualizationMode>();

  readonly modes: SpectralModeOption[] = SPECTRAL_MODES;
  readonly signalCategories = NDVI_SIGNAL_CATEGORIES;

  selectMode(mode: SpectralVisualizationMode) {
    if (this.selectedMode !== mode) {
      this.modeChanged.emit(mode);
    }
  }

  getTooltip(mode: SpectralModeOption): string {
    if (mode.multispectralOnly && !this.isMultispectral) {
      return 'Multispectral analysis requires a compatible GeoTIFF.';
    }
    return mode.tooltip;
  }
}
