import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-zone',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="upload-container"
      [class.drag-over]="isDragging()"
      [class.uploading]="isUploading()"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)">
      
      <!-- Scanline effect while dragging or uploading -->
      <div class="scanline" *ngIf="isDragging() || isUploading()"></div>

      <div class="upload-icon-box">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>

      <h3 class="upload-heading">Add satellite imagery</h3>
      <p class="upload-subtext">Upload a supported satellite image to begin.</p>

      <div class="band-tag-strip">
        <span class="strip-label">Supported 10 m bands:</span>
        <span class="band-chip">B02 Blue</span>
        <span class="band-chip">B03 Green</span>
        <span class="band-chip">B04 Red</span>
        <span class="band-chip">B08 NIR</span>
      </div>

      <div class="upload-actions">
        <button class="btn btn-primary" (click)="fileInput.click()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span>Upload Image</span>
        </button>

        <button class="btn btn-secondary" (click)="sampleRequested.emit()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <span>Use Sample</span>
        </button>
      </div>

      <input
        #fileInput
        type="file"
        accept=".tif,.tiff,.png,.jpg,.jpeg"
        class="hidden-input"
        (change)="onFileChange($event)" />

      <div class="format-notes">
        <span>Formats: GeoTIFF, TIFF, PNG, JPG</span>
        <span class="divider">·</span>
        <span>Sentinel-2 L2A recommended</span>
      </div>

      <!-- Warning/Notification if set -->
      <div class="format-alert" *ngIf="alertMessage()">
        <span class="alert-icon">ℹ</span>
        <span>{{ alertMessage() }}</span>
      </div>
    </div>
  `,
  styleUrls: ['./upload-zone.component.scss']
})
export class UploadZoneComponent {
  @Output() fileSelected = new EventEmitter<File>();
  @Output() sampleRequested = new EventEmitter<void>();

  readonly isDragging = signal<boolean>(false);
  readonly isUploading = signal<boolean>(false);
  readonly alertMessage = signal<string | null>(null);

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File) {
    const ext = file.name.toLowerCase();
    if (ext.endsWith('.png') || ext.endsWith('.jpg') || ext.endsWith('.jpeg')) {
      this.alertMessage.set('RGB image detected. Multispectral analysis requires a compatible GeoTIFF.');
    } else if (ext.endsWith('.tif') || ext.endsWith('.tiff')) {
      this.alertMessage.set(null);
    } else {
      this.alertMessage.set('Unsupported format. Please select a GeoTIFF, TIFF, PNG, or JPG file.');
      return;
    }

    this.fileSelected.emit(file);
  }
}
