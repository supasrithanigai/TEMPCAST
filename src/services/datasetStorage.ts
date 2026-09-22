import {
  UploadedDatasetFile,
  DatasetCategory,
  DatasetProcessingStatus,
} from '../types';

const DB_NAME = 'TempestCastDatasetDB';
const DB_VERSION = 1;
const STORE_FILES = 'saved_original_files';
const STORE_SETTINGS = 'app_settings';
const LOCAL_STORAGE_KEY = 'tempestcast_saved_original_datasets_v1';
const LOCAL_STORAGE_STATE_KEY = 'tempestcast_selected_state_v1';

export interface PersistedDatasetRecord {
  id: string;
  name: string;
  format: string;
  sizeBytes: number;
  category: DatasetCategory;
  status: DatasetProcessingStatus;
  isOriginal: boolean;
  uploadedAt: string;
  variablesDetected: string[];
  columnsDetected: string[];
  timestampsDetected: string[];
  hasCoordinates: boolean;
  latitudeRange?: [number, number];
  longitudeRange?: [number, number];
  missingValuesCount: number;
  totalRecordsCount: number;
  datasetType: string;
  isZipped: boolean;
  parentZipName?: string;
  rawTextPreview?: string;
  parsedSummary?: string;
  errorMessage?: string;
  detectedStates?: string[];
  state?: string;
  blobData?: Blob;
}

/**
 * Open or create native IndexedDB database for persistent original dataset storage.
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Synchronous loader from localStorage for instantaneous zero-flicker UI hydration on page reload.
 */
export function loadPersistedDatasetsSync(): {
  files: UploadedDatasetFile[];
  selectedState: string | null;
} | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedState = localStorage.getItem(LOCAL_STORAGE_STATE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const files: UploadedDatasetFile[] = parsed.map((item: any) => ({
        id: item.id,
        name: item.name,
        format: item.format,
        sizeBytes: item.sizeBytes || 0,
        category: item.category || 'Other',
        status: item.status || 'READY',
        isOriginal: true,
        uploadedAt: item.uploadedAt || 'Saved Original Dataset',
        variablesDetected: item.variablesDetected || [],
        columnsDetected: item.columnsDetected || [],
        timestampsDetected: item.timestampsDetected || [],
        hasCoordinates: Boolean(item.hasCoordinates),
        latitudeRange: item.latitudeRange,
        longitudeRange: item.longitudeRange,
        missingValuesCount: item.missingValuesCount || 0,
        totalRecordsCount: item.totalRecordsCount || 0,
        datasetType: item.datasetType || 'Original File',
        isZipped: Boolean(item.isZipped),
        parentZipName: item.parentZipName,
        rawTextPreview: item.rawTextPreview,
        parsedSummary: item.parsedSummary,
        errorMessage: item.errorMessage,
        detectedStates: item.detectedStates || [],
        state: item.state,
      }));

      return {
        files,
        selectedState: savedState || null,
      };
    }
  } catch (err) {
    console.warn('Failed to parse sync dataset from localStorage:', err);
  }

  return null;
}

/**
 * Full asynchronous persistent load from IndexedDB (with fallback to localStorage).
 */
export async function loadPersistedDatasets(): Promise<{
  files: UploadedDatasetFile[];
  selectedState: string | null;
}> {
  // First check sync cache
  const syncResult = loadPersistedDatasetsSync();

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_FILES, STORE_SETTINGS], 'readonly');
      const filesStore = tx.objectStore(STORE_FILES);
      const settingsStore = tx.objectStore(STORE_SETTINGS);

      const filesRequest = filesStore.getAll();
      const stateRequest = settingsStore.get('selectedState');

      tx.oncomplete = () => {
        const dbRecords: PersistedDatasetRecord[] = filesRequest.result || [];
        const stateRecord = stateRequest.result;

        if (dbRecords.length > 0) {
          const files: UploadedDatasetFile[] = dbRecords.map((r) => ({
            id: r.id,
            name: r.name,
            format: r.format,
            sizeBytes: r.sizeBytes,
            category: r.category,
            status: r.status,
            isOriginal: true,
            uploadedAt: r.uploadedAt,
            variablesDetected: r.variablesDetected || [],
            columnsDetected: r.columnsDetected || [],
            timestampsDetected: r.timestampsDetected || [],
            hasCoordinates: r.hasCoordinates,
            latitudeRange: r.latitudeRange,
            longitudeRange: r.longitudeRange,
            missingValuesCount: r.missingValuesCount || 0,
            totalRecordsCount: r.totalRecordsCount || 0,
            datasetType: r.datasetType,
            isZipped: r.isZipped,
            parentZipName: r.parentZipName,
            rawTextPreview: r.rawTextPreview,
            parsedSummary: r.parsedSummary,
            errorMessage: r.errorMessage,
            detectedStates: r.detectedStates || [],
            state: r.state,
            rawFile: r.blobData ? new File([r.blobData], r.name) : undefined,
          }));

          resolve({
            files,
            selectedState: stateRecord?.value || syncResult?.selectedState || null,
          });
        } else if (syncResult) {
          // If indexedDB was empty but localStorage had data, use localStorage
          resolve(syncResult);
        } else {
          resolve({ files: [], selectedState: null });
        }
      };

      tx.onerror = () => {
        resolve(syncResult || { files: [], selectedState: null });
      };
    });
  } catch (err) {
    console.warn('IndexedDB read failed, falling back to sync localStorage:', err);
    return syncResult || { files: [], selectedState: null };
  }
}

/**
 * Persist all uploaded original datasets and their metadata to IndexedDB & localStorage.
 */
export async function savePersistedDatasets(
  files: UploadedDatasetFile[],
  selectedState?: string | null
): Promise<void> {
  // 1. Immediately write serialized metadata to localStorage for instant synchronous recovery
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (files.length === 0) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } else {
        // Strip out non-serializable File objects and truncate preview if necessary for localStorage limits
        const serializable = files.map((f) => ({
          id: f.id,
          name: f.name,
          format: f.format,
          sizeBytes: f.sizeBytes,
          category: f.category,
          status: f.status,
          isOriginal: true,
          uploadedAt: f.uploadedAt,
          variablesDetected: f.variablesDetected,
          columnsDetected: f.columnsDetected,
          timestampsDetected: f.timestampsDetected,
          hasCoordinates: f.hasCoordinates,
          latitudeRange: f.latitudeRange,
          longitudeRange: f.longitudeRange,
          missingValuesCount: f.missingValuesCount,
          totalRecordsCount: f.totalRecordsCount,
          datasetType: f.datasetType,
          isZipped: f.isZipped,
          parentZipName: f.parentZipName,
          rawTextPreview: f.rawTextPreview ? f.rawTextPreview.slice(0, 15000) : undefined,
          parsedSummary: f.parsedSummary,
          errorMessage: f.errorMessage,
          detectedStates: f.detectedStates,
          state: f.state,
        }));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serializable));
      }

      if (selectedState) {
        localStorage.setItem(LOCAL_STORAGE_STATE_KEY, selectedState);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_STATE_KEY);
      }
    }
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }

  // 2. Persist full records and blobs to IndexedDB
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_FILES, STORE_SETTINGS], 'readwrite');
      const filesStore = tx.objectStore(STORE_FILES);
      const settingsStore = tx.objectStore(STORE_SETTINGS);

      // Clear existing records first to avoid stale orphan files
      filesStore.clear();

      for (const f of files) {
        const record: PersistedDatasetRecord = {
          id: f.id,
          name: f.name,
          format: f.format,
          sizeBytes: f.sizeBytes,
          category: f.category,
          status: f.status,
          isOriginal: true,
          uploadedAt: f.uploadedAt,
          variablesDetected: f.variablesDetected || [],
          columnsDetected: f.columnsDetected || [],
          timestampsDetected: f.timestampsDetected || [],
          hasCoordinates: f.hasCoordinates,
          latitudeRange: f.latitudeRange,
          longitudeRange: f.longitudeRange,
          missingValuesCount: f.missingValuesCount || 0,
          totalRecordsCount: f.totalRecordsCount || 0,
          datasetType: f.datasetType,
          isZipped: f.isZipped,
          parentZipName: f.parentZipName,
          rawTextPreview: f.rawTextPreview,
          parsedSummary: f.parsedSummary,
          errorMessage: f.errorMessage,
          detectedStates: f.detectedStates || [],
          state: f.state,
          blobData: f.rawFile ? f.rawFile : undefined,
        };
        filesStore.put(record);
      }

      if (selectedState) {
        settingsStore.put({ key: 'selectedState', value: selectedState });
      } else {
        settingsStore.delete('selectedState');
      }

      tx.oncomplete = () => {
        resolve();
      };

      tx.onerror = () => {
        reject(tx.error || new Error('Failed to write to IndexedDB'));
      };
    });
  } catch (err) {
    console.error('IndexedDB save failed:', err);
  }
}

/**
 * Remove a single dataset file from persistent storage.
 */
export async function removePersistedDataset(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_FILES, 'readwrite');
    tx.objectStore(STORE_FILES).delete(id);
  } catch (err) {
    console.warn('Failed to remove item from IndexedDB:', err);
  }
}

/**
 * Completely wipe persistent dataset storage.
 */
export async function clearAllPersistedDatasets(): Promise<void> {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_STATE_KEY);
  }

  try {
    const db = await openDatabase();
    const tx = db.transaction([STORE_FILES, STORE_SETTINGS], 'readwrite');
    tx.objectStore(STORE_FILES).clear();
    tx.objectStore(STORE_SETTINGS).clear();
  } catch (err) {
    console.warn('Failed to clear IndexedDB:', err);
  }
}
