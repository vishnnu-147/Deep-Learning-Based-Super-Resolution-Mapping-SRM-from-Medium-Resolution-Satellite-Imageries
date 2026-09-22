import { Injectable } from '@angular/core';
import { QualityMetrics } from '../models/quality-metrics.model';
import { ProcessingStateMode } from '../models/processing-pipeline.model';

export interface HistoryRecord {
  id: string;
  createdAt: number;
  filename: string;
  locationName: string;
  crs: string | null;
  inputResolutionMeters: number;
  enhancedDetailMeters: number;
  mode: ProcessingStateMode;
  modeLabel: string;
  thumbnailUrl: string;
  previewUrl: string;
  enhancedUrl: string;
  metrics: QualityMetrics;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryStorageService {
  private readonly DB_NAME = 'SatelliteSuperResDB';
  private readonly STORE_NAME = 'processed_runs';
  private readonly DB_VERSION = 1;

  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDb();
  }

  private initDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported'));
      }
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveRun(record: Omit<HistoryRecord, 'thumbnailUrl'> & { fullUrl?: string }): Promise<void> {
    try {
      const db = await this.dbPromise;
      // Generate lightweight thumbnail (max 160x160) to protect against storage quota overflows
      const thumbUrl = await this.createThumbnail(record.enhancedUrl);
      
      const item: HistoryRecord = {
        ...record,
        thumbnailUrl: thumbUrl
      };

      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        const req = store.put(item);

        req.onsuccess = () => resolve();
        req.onerror = (e) => {
          const err = (e.target as any).error;
          if (err && err.name === 'QuotaExceededError') {
            reject(new Error('File is too large for browser storage. Current run remains active in workspace.'));
          } else {
            reject(new Error(err?.message || 'Failed to save to history'));
          }
        };
      });
    } catch (err: any) {
      console.warn('History save notice:', err.message);
      throw err;
    }
  }

  async getAllRuns(): Promise<HistoryRecord[]> {
    try {
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const store = tx.objectStore(this.STORE_NAME);
        const index = store.index('createdAt');
        const req = index.openCursor(null, 'prev'); // Latest first
        const results: HistoryRecord[] = [];

        req.onsuccess = () => {
          const cursor = req.result;
          if (cursor) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  }

  async deleteRun(id: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  private createThumbnail(url: string, maxSize = 160): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > h) {
          if (w > maxSize) {
            h = Math.round((h * maxSize) / w);
            w = maxSize;
          }
        } else {
          if (h > maxSize) {
            w = Math.round((w * maxSize) / h);
            h = maxSize;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(url);
        }
      };
      img.onerror = () => resolve(url);
      img.src = url;
    });
  }
}
