import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessingProgress } from '../../../core/models/processing-pipeline.model';

@Component({
  selector: 'app-processing-pipeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pipeline-container" [class.active]="progress.isProcessing">
      <div class="pipeline-header">
        <div class="header-left">
          <span class="pulse-beacon"></span>
          <span class="pipeline-title">INFERENCE PIPELINE</span>
        </div>
        <div class="header-right">
          <span class="mode-badge" [ngClass]="progress.mode">
            {{ getModeBadgeLabel() }}
          </span>
          <span class="percentage-label">{{ progress.percentage }}%</span>
        </div>
      </div>

      <!-- Main Progress Bar -->
      <div class="progress-track">
        <div class="progress-fill" [style.width]="progress.percentage + '%'"></div>
      </div>

      <!-- Current Status Message -->
      <div class="status-callout">
        <svg class="spinner-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" *ngIf="progress.isProcessing">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span class="status-text">{{ progress.statusMessage }}</span>
      </div>

      <!-- 9 Pipeline Stages List -->
      <div class="stages-grid">
        <div
          *ngFor="let stage of progress.stages"
          class="stage-item"
          [class.completed]="stage.completed"
          [class.active]="stage.active">
          <div class="stage-status-indicator">
            <span class="check-mark" *ngIf="stage.completed">✓</span>
            <span class="active-dot" *ngIf="stage.active">●</span>
            <span class="pending-num" *ngIf="!stage.completed && !stage.active">{{ stage.id }}</span>
          </div>
          <div class="stage-content">
            <span class="stage-label">{{ stage.label }}</span>
            <span class="stage-sub" *ngIf="stage.active">{{ stage.statusText }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./processing-pipeline.component.scss']
})
export class ProcessingPipelineComponent {
  @Input({ required: true }) progress!: ProcessingProgress;

  getModeBadgeLabel(): string {
    switch (this.progress.mode) {
      case 'REAL_AI': return 'AI Super Resolution';
      case 'SAMPLE_AI': return 'Sample AI Result';
      case 'PREVIEW_ENHANCEMENT': return 'Preview Enhancement';
    }
  }
}
