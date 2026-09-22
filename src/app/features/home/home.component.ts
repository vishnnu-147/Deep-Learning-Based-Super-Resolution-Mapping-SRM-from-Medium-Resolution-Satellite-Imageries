import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-eyebrow">
            <span class="pulse-dot"></span>
            <span>AI-POWERED EARTH OBSERVATION</span>
          </div>

          <h1 class="hero-heading">
            Sharper satellite imagery.<br>
            Clearer decisions.
          </h1>

          <p class="hero-subtext">
            Transform medium-resolution satellite imagery into enhanced, analysis-ready views.
          </p>

          <div class="hero-cta-group">
            <a routerLink="/workspace" class="cta-primary">
              <span>Start Enhancing</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>

            <a routerLink="/workspace" [queryParams]="{ sample: 'sample-agricultural' }" class="cta-secondary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <span>Explore Sample</span>
            </a>
          </div>

          <!-- Quick Specs Strip -->
          <div class="specs-strip">
            <div class="spec-pill">
              <span class="label">Primary Input:</span>
              <span class="val">Sentinel-2 10 m</span>
            </div>
            <div class="spec-pill">
              <span class="label">Scale Factor:</span>
              <span class="val cyan">4×</span>
            </div>
            <div class="spec-pill">
              <span class="label">Enhanced Detail:</span>
              <span class="val green">~2.5 m (Estimated)</span>
            </div>
          </div>
        </div>

        <!-- Hero Animated Visual Composition (Low Detail -> Enhanced Reveal) -->
        <div class="hero-visual">
          <div class="visual-card">
            <div class="card-glow"></div>
            <div class="hud-corner tl"></div>
            <div class="hud-corner tr"></div>
            <div class="hud-corner bl"></div>
            <div class="hud-corner br"></div>

            <div class="interactive-split-preview" (mousemove)="onHeroMove($event)">
              <!-- Low Detail Base (Simulated 10m pixelated satellite patch) -->
              <div class="preview-layer low-detail-layer">
                <div class="satellite-scene-bg pixelated"></div>
                <div class="hud-stamp left">
                  <span class="stamp-title">INPUT</span>
                  <span class="stamp-metric">10 m Native GSD</span>
                </div>
              </div>

              <!-- Enhanced Detail Reveal (Clipped right layer) -->
              <div class="preview-layer high-detail-layer" [style.clip-path]="'inset(0 0 0 ' + heroSplitPos() + '%)'">
                <div class="satellite-scene-bg crisp"></div>
                <div class="hud-stamp right">
                  <span class="stamp-title">ENHANCED</span>
                  <span class="stamp-metric">~2.5 m Estimated Detail</span>
                </div>
              </div>

              <!-- Draggable Divider Line -->
              <div class="hero-divider" [style.left]="heroSplitPos() + '%'">
                <div class="hero-handle">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="15 18 9 12 15 6"/><polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>

              <div class="scanline-sweep"></div>
            </div>

            <div class="visual-footer">
              <span class="status-indicator-tag">● SENTINEL-2 L2A MULTISPECTRAL COMPOSITE</span>
              <span class="coords-tag">39°53'42.1"N · 04°02'18.7"W</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Three Compact Capability Blocks -->
      <section class="capabilities-section">
        <div class="capability-card">
          <div class="card-index">01</div>
          <h3 class="cap-title">SUPER RESOLUTION</h3>
          <p class="cap-desc">Enhance spatial detail with deep learning.</p>
        </div>

        <div class="capability-card">
          <div class="card-index">02</div>
          <h3 class="cap-title">MULTISPECTRAL</h3>
          <p class="cap-desc">Work with multiple satellite spectral bands.</p>
        </div>

        <div class="capability-card">
          <div class="card-index">03</div>
          <h3 class="cap-title">ANALYSIS READY</h3>
          <p class="cap-desc">Explore enhanced imagery through visual and quality analysis.</p>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="workflow-section">
        <div class="section-header">
          <span class="section-eyebrow">PIPELINE ARCHITECTURE</span>
          <h2 class="section-title">How it works</h2>
        </div>

        <div class="workflow-steps-grid">
          <div class="step-card">
            <div class="step-num">01</div>
            <h4 class="step-heading">Upload</h4>
            <p class="step-body">Import Sentinel-2 GeoTIFF or compatible raster images with automatic band detection.</p>
          </div>

          <div class="step-card">
            <div class="step-num">02</div>
            <h4 class="step-heading">Process</h4>
            <p class="step-body">Normalize reflectance values and structure multispectral inference tensors.</p>
          </div>

          <div class="step-card">
            <div class="step-num">03</div>
            <h4 class="step-heading">Enhance</h4>
            <p class="step-body">Synthesize estimated ~2.5 m spatial details using our deep-learning model pipeline.</p>
          </div>

          <div class="step-card">
            <div class="step-num">04</div>
            <h4 class="step-heading">Analyze</h4>
            <p class="step-body">Inspect Natural Color, False Color CIR, NDVI, quality metrics, and geospatial footprints.</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  readonly heroSplitPos = signal<number>(50);

  onHeroMove(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(10, Math.min(90, (x / rect.width) * 100));
    this.heroSplitPos.set(Number(pct.toFixed(1)));
  }
}
