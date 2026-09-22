import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  signal,
  HostListener,
  AfterViewInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comparison-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="slider-viewport" #viewport [class.fullscreen]="isFullscreen()">
      <!-- Interactive Container with Zoom & Pan transform -->
      <div
        class="transform-container"
        [style.transform]="'translate(' + panX() + 'px, ' + panY() + 'px) scale(' + zoom() + ')'"
        (mousedown)="startPan($event)"
        (mousemove)="onImageMouseMove($event)"
        (wheel)="onWheel($event)">

        <!-- Original Image Layer (Underneath / Left) -->
        <div class="image-layer original-layer">
          <img [src]="originalImage" alt="Original 10m satellite input" draggable="false" />
        </div>

        <!-- Enhanced Image Layer (Clipped / Right) -->
        <div class="image-layer enhanced-layer" [style.clip-path]="'inset(0 0 0 ' + sliderPos() + '%)'">
          <img [src]="enhancedImage" alt="Enhanced satellite estimate" draggable="false" />
        </div>

        <!-- Divider Line & Circular Handle -->
        <div
          class="divider-line"
          [style.left]="sliderPos() + '%'"
          (mousedown)="startDrag($event); $event.stopPropagation()"
          (touchstart)="startTouchDrag($event); $event.stopPropagation()">
          <div class="slider-handle" title="Drag to compare Original vs Enhanced">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6"/>
              <polyline points="9 18 3 12 9 6"/>
            </svg>
            <div class="handle-center-dot"></div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"/>
              <polyline points="15 18 21 12 15 6"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Top Overlay Badges: ORIGINAL vs ENHANCED -->
      <div class="overlay-labels">
        <div class="label-chip original-chip">
          <span class="chip-title">ORIGINAL</span>
          <span class="chip-meta">10 m</span>
        </div>
        <div class="label-chip enhanced-chip">
          <span class="chip-title">{{ enhancedLabel }}</span>
          <span class="chip-meta">Estimated Detail: ~2.5 m</span>
        </div>
      </div>

      <!-- Bottom Floating Mini-HUD: Coordinates, Zoom, Controls -->
      <div class="viewer-hud">
        <div class="hud-item coords" *ngIf="hoverCoords()">
          <span class="hud-dim">POS:</span>
          <span>X: {{ hoverCoords()?.x }}px, Y: {{ hoverCoords()?.y }}px</span>
        </div>

        <div class="hud-item scale-factor">
          <span class="hud-dim">SCALE:</span>
          <span class="hud-val">4×</span>
        </div>

        <div class="hud-item zoom-level">
          <span class="hud-dim">ZOOM:</span>
          <span class="hud-val">{{ Math.round(zoom() * 100) }}%</span>
        </div>

        <div class="hud-toolbar">
          <button class="hud-btn" (click)="zoomIn()" title="Zoom In">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <button class="hud-btn" (click)="zoomOut()" title="Zoom Out">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <button class="hud-btn" (click)="resetView()" title="Fit to Screen">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
          <button class="hud-btn" (click)="toggleFullscreen()" title="Toggle Fullscreen">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./comparison-slider.component.scss']
})
export class ComparisonSliderComponent implements AfterViewInit, OnChanges {
  @Input() originalImage: string = '';
  @Input() enhancedImage: string = '';
  @Input() enhancedLabel: string = 'ENHANCED';

  @ViewChild('viewport') viewportRef!: ElementRef<HTMLDivElement>;

  readonly sliderPos = signal<number>(50); // percentage 0..100
  readonly zoom = signal<number>(1.0);
  readonly panX = signal<number>(0);
  readonly panY = signal<number>(0);
  readonly isFullscreen = signal<boolean>(false);
  readonly hoverCoords = signal<{ x: number; y: number } | null>(null);

  protected readonly Math = Math;

  private isDragging = false;
  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;

  ngAfterViewInit() {
    this.resetView();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['originalImage'] || changes['enhancedImage']) {
      // Re-center when images change
      this.resetView();
    }
  }

  startDrag(e: MouseEvent) {
    e.preventDefault();
    this.isDragging = true;
  }

  startTouchDrag(e: TouchEvent) {
    this.isDragging = true;
  }

  startPan(e: MouseEvent) {
    if (e.button !== 0) return; // Left mouse click only
    this.isPanning = true;
    this.panStartX = e.clientX - this.panX();
    this.panStartY = e.clientY - this.panY();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (this.isDragging) {
      this.updateSliderPos(e.clientX);
    } else if (this.isPanning) {
      this.panX.set(e.clientX - this.panStartX);
      this.panY.set(e.clientY - this.panStartY);
    }
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(e: TouchEvent) {
    if (this.isDragging && e.touches.length > 0) {
      this.updateSliderPos(e.touches[0].clientX);
    }
  }

  @HostListener('window:mouseup')
  @HostListener('window:touchend')
  onMouseUp() {
    this.isDragging = false;
    this.isPanning = false;
  }

  onImageMouseMove(e: MouseEvent) {
    const rect = this.viewportRef?.nativeElement.getBoundingClientRect();
    if (rect) {
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);
      this.hoverCoords.set({ x, y });
    }
  }

  onWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    const newZoom = Math.min(5.0, Math.max(0.6, this.zoom() + delta));
    this.zoom.set(Number(newZoom.toFixed(2)));
  }

  zoomIn() {
    this.zoom.set(Math.min(5.0, Number((this.zoom() + 0.25).toFixed(2))));
  }

  zoomOut() {
    this.zoom.set(Math.max(0.5, Number((this.zoom() - 0.25).toFixed(2))));
  }

  resetView() {
    this.zoom.set(1.0);
    this.panX.set(0);
    this.panY.set(0);
    this.sliderPos.set(50);
  }

  toggleFullscreen() {
    this.isFullscreen.update(v => !v);
  }

  private updateSliderPos(clientX: number) {
    if (!this.viewportRef) return;
    const rect = this.viewportRef.nativeElement.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    this.sliderPos.set(Number(pct.toFixed(1)));
  }
}
