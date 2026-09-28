# SATELLITE SUPER RESOLUTION

> **Sharper satellite imagery. Better insight.**  
> An AI-powered Earth-observation platform for multispectral satellite imagery enhancement, spatial analysis, and spectral inspection.

[![Live Web Application](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-00d4ff?style=for-the-badge&logo=google-chrome&logoColor=white)](https://vishnnu-147.github.io/Deep-Learning-Based-Super-Resolution-Mapping-SRM-from-Medium-Resolution-Satellite-Imageries/)
[![Angular 19](https://img.shields.io/badge/Angular-19.2-dd0031?style=for-the-badge&logo=angular)](https://angular.dev/)
[![TensorFlow.js](https://img.shields.io/badge/AI%20Engine-TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow)](https://www.tensorflow.org/js)

---

### 🌐 Live Web Application

Access the fully deployed application directly in your browser:
- **Public URL**: **[https://vishnnu-147.github.io/Deep-Learning-Based-Super-Resolution-Mapping-SRM-from-Medium-Resolution-Satellite-Imageries/](https://vishnnu-147.github.io/Deep-Learning-Based-Super-Resolution-Mapping-SRM-from-Medium-Resolution-Satellite-Imageries/)**
- **Interactive Workspace**: [Launch Workspace](https://vishnnu-147.github.io/Deep-Learning-Based-Super-Resolution-Mapping-SRM-from-Medium-Resolution-Satellite-Imageries/workspace)
- **Castilla Sample Scene**: [Explore Sample](https://vishnnu-147.github.io/Deep-Learning-Based-Super-Resolution-Mapping-SRM-from-Medium-Resolution-Satellite-Imageries/workspace?sample=sample-agricultural)
- **Analytics Dashboard**: [Open Analytics](https://vishnnu-147.github.io/Deep-Learning-Based-Super-Resolution-Mapping-SRM-from-Medium-Resolution-Satellite-Imageries/analytics)
- **History Viewer**: [Open History](https://vishnnu-147.github.io/Deep-Learning-Based-Super-Resolution-Mapping-SRM-from-Medium-Resolution-Satellite-Imageries/history)

---

## 🛰 Overview

**Satellite Super Resolution** transforms medium-resolution satellite imagery (primarily Sentinel-2 Level-2A 10 m bands) into enhanced, analysis-ready views with approximately 4× spatial upscaling (~2.5 m estimated detail).

Designed as an advanced Earth-observation workstation, the platform enables researchers, geospatial analysts, and remote-sensing engineers to upload, preprocess, enhance, and analyze multispectral scenes directly in the browser.

### Key Capabilities

1. **Multispectral Ingestion & Dynamic Detection**:
   - Supports GeoTIFF, TIFF, PNG, and JPG formats.
   - Automatically detects 10 m Sentinel-2 bands: **B02 (Blue)**, **B03 (Green)**, **B04 (Red)**, and **B08 (Near-Infrared)**.
   - Dynamic Coordinate Reference System (CRS) detection from raster metadata (e.g., UTM EPSG projections); never assumes a hardcoded zone.
   - Differentiates standard RGB files from multispectral GeoTIFFs.

2. **Decoupled AI Inference Pipeline**:
   - 9-stage real-time progress tracker:
     1. Reading image
     2. Validating bands
     3. Normalizing data
     4. Preparing tensors
     5. Loading AI model
     6. Running inference
     7. Reconstructing output
     8. Computing available metrics
     9. Rendering result
   - **State A (AI Super Resolution)**: Activates when a trained TensorFlow.js model is present at `assets/models/model.json`.
   - **State C (Preview Enhancement)**: Automatic fallback when model weights are not yet loaded, clearly disclaimed as *"AI model unavailable — showing a visual preview only"*.

3. **Spectral Visualization Modes**:
   - **Natural Color**: RGB composite using visible bands ($B_{04} \cdot B_{03} \cdot B_{02}$).
   - **False Color (CIR)**: Color-Infrared composite ($B_{08} \cdot B_{04} \cdot B_{03}$) highlighting canopy vigor and water boundaries.
   - **NDVI**: Standardized Normalized Difference Vegetation Index evaluated via:
     $$\text{NDVI} = \frac{B_{08} - B_{04}}{B_{08} + B_{04}}$$
     where $B_{08} = \text{NIR}$ and $B_{04} = \text{Red}$, with safe division-by-zero protection and a continuous gradient legend.

4. **Dual-Canvas Comparison Slider**:
   - Draggable vertical split slider with cyan circular handle.
   - Synchronized zoom ($0.5\times$ to $5\times$), pan, and live hover coordinate HUD (pixel X, Y).
   - Instant toggle between Original (10 m) and Enhanced (Estimated Detail: ~2.5 m).

5. **Geospatial Footprint Mapping**:
   - Dark MapLibre GL map rendering the exact geographic bounding box polygon.
   - Coordinate extents HUD and graceful offline telemetry fallback.

6. **Analytics & Metrics Dashboard**:
   - Apache ECharts visualizations:
     - Multispectral band reflectance histograms ($B_{02}, B_{03}, B_{04}, B_{08}$).
     - NDVI signal density distribution curves.
     - Spatial frequency edge energy comparisons.
   - Quantitative edge detail gradient calculated directly from pixel matrices using Sobel gradient magnitude (`grad`).
   - Strict scientific honesty: PSNR and SSIM report *"Reference data required"* when ground-truth verification imagery is absent.

7. **Persistent Browser Cache (IndexedDB)**:
   - Stores processed runs, metadata, and lightweight thumbnails in `SatelliteSuperResDB` with browser quota protection.

---

## 🔬 Scientific Honesty Standards

- **Estimated Detail**: AI-reconstructed spatial details are mathematically inferred from learned priors and are consistently labeled as **"Estimated Detail: ~2.5 m"** or **"Enhanced Detail: ~2.5 m"** rather than native sensor acquisitions.
- **Validation Disclaimers**: Quantitative metrics (PSNR/SSIM) are only reported when verified against paired reference truth. Unvalidated runs explicitly state *"Reference data required"*.

---

## 🛠 Tech Stack

- **Frontend**: Angular 19 (Standalone Components, Signals, Router, SCSS)
- **Deep Learning / AI**: `@tensorflow/tfjs`
- **Raster / GeoTIFF Engine**: `geotiff`
- **Geospatial Mapping**: `maplibre-gl`
- **Data Visualizations**: `echarts` (Apache ECharts)
- **Local Storage**: IndexedDB API

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended, v20+ supported)
- npm (v9+ or v10+)

### Installation

```bash
# Clone the repository
git clone https://github.com/vishnnu-147/Deep-Learning-Based-Super-Resolution-Mapping-SRM-from-Medium-Resolution-Satellite-Imageries.git
cd Deep-Learning-Based-Super-Resolution-Mapping-SRM-from-Medium-Resolution-Satellite-Imageries

# Install dependencies
npm install
```

### Running Locally

**Option 1: Production Server (Fastest, zero compile wait)**
```bash
# Serves pre-built production bundle on port 4200
node server.js

# Or on Windows, simply double-click start.bat
```

**Option 2: Angular Development Server (HMR enabled)**
```bash
npm start
# or: npx ng serve --host 0.0.0.0 --port 4200
```

Open your browser at:
**[http://localhost:4200/](http://localhost:4200/)**

---

## 📦 Building for Production

```bash
npm run build
```

Compiled production artifacts will be placed in the `dist/satellite-super-res/` directory.

---

## 🧠 Trained Model Drop-in Guide

To deploy a custom-trained deep learning model:
1. Train a 4-band residual CNN on paired Sentinel-2 ($B_{02}, B_{03}, B_{04}, B_{08}$) rasters.
2. Convert the model to TensorFlow.js format via `tensorflowjs_converter`.
3. Place `model.json` and associated `.bin` weight shards into `public/assets/models/`.
4. The application automatically detects the model, validates input/output tensor dimensions, and transitions to **AI Super Resolution** mode.

---

## 📄 License

MIT License.
