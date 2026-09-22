import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as maplibregl from 'maplibre-gl';

@Component({
  selector: 'app-map-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-wrapper">
      <div class="map-header">
        <div class="header-left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
            <line x1="8" y1="2" x2="8" y2="18"/>
            <line x1="16" y1="6" x2="16" y2="22"/>
          </svg>
          <span class="map-title">GEOSPATIAL FOOTPRINT</span>
        </div>
        <div class="header-right">
          <span class="crs-badge" [class.not-available]="!crs">
            CRS: {{ crs ? crs : 'Not available' }}
          </span>
        </div>
      </div>

      <!-- Map Container -->
      <div class="map-container-inner" #mapContainer>
        <!-- Fallback if map tiles offline or no coordinates -->
        <div class="map-fallback-overlay" *ngIf="mapOffline() || !bounds">
          <div class="fallback-radar-grid">
            <div class="radar-circle c1"></div>
            <div class="radar-circle c2"></div>
            <div class="radar-crosshair-h"></div>
            <div class="radar-crosshair-v"></div>
            <div class="footprint-box-svg" *ngIf="bounds">
              <span class="box-label">EXTENT BOUNDARY</span>
            </div>
          </div>
          <div class="fallback-note">
            <span *ngIf="!bounds">Geospatial footprint unavailable</span>
            <span *ngIf="bounds">Footprint rendered · Tile service in telemetry mode</span>
          </div>
        </div>
      </div>

      <!-- Footprint Coordinates Bar -->
      <div class="map-footer" *ngIf="bounds">
        <div class="coord-item">
          <span class="coord-label">W:</span> {{ bounds.west | number:'1.2-4' }}°
        </div>
        <div class="coord-item">
          <span class="coord-label">S:</span> {{ bounds.south | number:'1.2-4' }}°
        </div>
        <div class="coord-item">
          <span class="coord-label">E:</span> {{ bounds.east | number:'1.2-4' }}°
        </div>
        <div class="coord-item">
          <span class="coord-label">N:</span> {{ bounds.north | number:'1.2-4' }}°
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./map-viewer.component.scss']
})
export class MapViewerComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() crs: string | null = null;
  @Input() bounds: { west: number; south: number; east: number; north: number } | null = null;
  @Input() locationName: string = '';

  @ViewChild('mapContainer') mapContainerRef!: ElementRef<HTMLDivElement>;

  readonly mapOffline = signal<boolean>(false);
  private map: maplibregl.Map | null = null;

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['bounds'] && !changes['bounds'].firstChange) {
      this.updateFootprint();
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap() {
    if (!this.mapContainerRef) return;

    try {
      const centerLon = this.bounds ? (this.bounds.west + this.bounds.east) / 2 : 0;
      const centerLat = this.bounds ? (this.bounds.south + this.bounds.north) / 2 : 20;

      // Dark minimalist vector style with graceful error handling
      this.map = new maplibregl.Map({
        container: this.mapContainerRef.nativeElement,
        style: {
          version: 8,
          sources: {
            'osm-dark': {
              type: 'raster',
              tiles: [
                'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap © CARTO'
            }
          },
          layers: [
            {
              id: 'osm-dark-layer',
              type: 'raster',
              source: 'osm-dark',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: [centerLon, centerLat],
        zoom: this.bounds ? 9 : 2,
        attributionControl: false
      });

      this.map.on('error', () => {
        this.mapOffline.set(true);
      });

      this.map.on('load', () => {
        this.updateFootprint();
      });

    } catch {
      this.mapOffline.set(true);
    }
  }

  private updateFootprint() {
    if (!this.map || !this.bounds) return;

    const b = this.bounds;
    const coordinates = [
      [
        [b.west, b.north],
        [b.east, b.north],
        [b.east, b.south],
        [b.west, b.south],
        [b.west, b.north]
      ]
    ];

    try {
      if (this.map.getSource('scene-footprint')) {
        (this.map.getSource('scene-footprint') as maplibregl.GeoJSONSource).setData({
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates },
          properties: { name: this.locationName }
        });
      } else {
        this.map.addSource('scene-footprint', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates },
            properties: { name: this.locationName }
          }
        });

        this.map.addLayer({
          id: 'footprint-fill',
          type: 'fill',
          source: 'scene-footprint',
          paint: {
            'fill-color': '#35d5ff',
            'fill-opacity': 0.15
          }
        });

        this.map.addLayer({
          id: 'footprint-line',
          type: 'line',
          source: 'scene-footprint',
          paint: {
            'line-color': '#35d5ff',
            'line-width': 2,
            'line-dasharray': [2, 1]
          }
        });
      }

      // Fly to bounds
      this.map.fitBounds([
        [b.west, b.south],
        [b.east, b.north]
      ], { padding: 30, maxZoom: 12, duration: 1000 });

    } catch {
      // MapLibre layer update notice
    }
  }
}
