import React, { useState, useEffect, useRef } from 'react';
import {
  datasetService,
  SUPPORTED_EXTENSIONS,
} from '../../services/datasetService';
import {
  UploadedDatasetFile,
  DatasetCategory,
  DatasetProcessingStatus,
} from '../../types';
import {
  UploadCloud,
  FileArchive,
  FileSpreadsheet,
  FileText,
  FileCode,
  Layers,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileQuestion,
  Eye,
  X,
  RefreshCw,
  FolderArchive,
  Table,
  MapPin,
  Calendar,
  Sparkles,
  Info,
  Plus,
} from 'lucide-react';

const CATEGORIES: DatasetCategory[] = [
  'Radar',
  'Satellite',
  'Lightning',
  'Weather Observations',
  'NWP',
  'GIS',
  'Other',
];

export const DatasetsPage: React.FC = () => {
  const [files, setFiles] = useState<UploadedDatasetFile[]>(datasetService.getFiles());
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inspectingFile, setInspectingFile] = useState<UploadedDatasetFile | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [uploadMode, setUploadMode] = useState<'add' | 'replace'>('add');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = datasetService.subscribe(() => {
      setFiles(datasetService.getFiles());
    });
    return unsubscribe;
  }, []);

  const handleFiles = async (fileList: FileList | File[], mode: 'add' | 'replace' = uploadMode) => {
    if (!fileList || fileList.length === 0) return;
    setIsProcessing(true);
    try {
      if (mode === 'replace') {
        await datasetService.replaceDatasets(fileList);
      } else {
        await datasetService.addDatasets(fileList);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsProcessing(false);
      setUploadMode('add');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files, uploadMode);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFormatIcon = (format: string) => {
    switch (format.toUpperCase()) {
      case 'ZIP':
        return <FolderArchive className="w-5 h-5 text-amber-400" />;
      case 'CSV':
      case 'XLS':
      case 'XLSX':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case 'JSON':
      case 'GEOJSON':
        return <FileCode className="w-5 h-5 text-sky-400" />;
      case 'NC':
      case 'NETCDF':
      case 'GRIB':
      case 'GRIB2':
        return <Layers className="w-5 h-5 text-purple-400" />;
      case 'TXT':
      default:
        return <FileText className="w-5 h-5 text-slate-300" />;
    }
  };

  const getStatusBadge = (status: DatasetProcessingStatus) => {
    switch (status) {
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" />
            READY
          </span>
        );
      case 'VALIDATING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono bg-sky-500/15 text-sky-300 border border-sky-500/40 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            VALIDATING
          </span>
        );
      case 'UPLOADED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono bg-amber-500/15 text-amber-300 border border-amber-500/40">
            <Clock className="w-3 h-3" />
            UPLOADED
          </span>
        );
      case 'ERROR':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono bg-rose-500/15 text-rose-300 border border-rose-500/40">
            <AlertTriangle className="w-3 h-3" />
            ERROR
          </span>
        );
    }
  };

  const filteredFiles = files.filter((f) => {
    if (selectedCategoryFilter === 'ALL') return true;
    return f.category === selectedCategoryFilter;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-semibold uppercase tracking-wider">DATASET INGESTION PORTAL</span>
              <span>•</span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ORIGINAL DATASETS ONLY
              </span>
              {files.length > 0 && (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PERSISTENT STORAGE ACTIVE
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {files.length > 0 ? 'Saved Original Datasets' : 'Upload Original Dataset'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {files.length > 0
                ? 'Your uploaded original meteorological and GIS datasets are saved in persistent storage. They are automatically retained across page refreshes, tab navigation, and application reopening.'
                : 'Upload original raw meteorological and GIS datasets. Uploaded datasets remain unchanged and are saved persistently for TEMPESTCAST monitoring.'}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {files.length > 0 ? (
              <>
                <button
                  onClick={() => {
                    setUploadMode('add');
                    fileInputRef.current?.click();
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  title="Add more datasets to existing saved files"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Dataset
                </button>

                <button
                  onClick={() => {
                    setUploadMode('replace');
                    fileInputRef.current?.click();
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Replace existing saved datasets with new files"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Replace Dataset
                </button>

                <button
                  onClick={() => setInspectingFile(files[0])}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                  title="View details of uploaded datasets"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Uploaded Datasets
                </button>

                <button
                  onClick={() => datasetService.clearAllFiles()}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Clear all saved datasets from storage"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove All
                </button>
              </>
            ) : (
              <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
                Saved Files: <strong className="text-amber-400">0</strong>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Upload Zone */}
      <section className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".zip,.csv,.json,.xls,.xlsx,.txt,.nc,.netcdf,.grib,.grib2,.geojson"
          onChange={(e) => e.target.files && handleFiles(e.target.files, uploadMode)}
          className="hidden"
        />

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleBrowseClick}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10 scale-[1.005]'
              : 'border-slate-700/80 hover:border-amber-500/60 bg-slate-950/60 hover:bg-slate-950/90'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/5">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-white">
                {files.length > 0
                  ? 'Add or Replace Original Datasets'
                  : 'Drag-and-drop original dataset files here'}
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {files.length > 0
                  ? 'Upload additional datasets to append them, or use Replace Dataset to swap saved files. All files are saved persistently in browser storage.'
                  : 'Upload single files or multiple files at once. Multiple ZIP archives are supported and will be inspected and extracted without modifying originals.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadMode('add');
                  fileInputRef.current?.click();
                }}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isProcessing
                  ? 'Processing Original Files...'
                  : files.length > 0
                  ? 'Add Dataset'
                  : 'Upload Dataset'}
              </button>

              {files.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadMode('replace');
                    fileInputRef.current?.click();
                  }}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Replace Dataset
                </button>
              )}
            </div>

            {/* Supported Formats Pill Display */}
            <div className="pt-3 border-t border-slate-800/80 w-full max-w-2xl">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
                Supported Formats:
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {[
                  'ZIP',
                  'CSV',
                  'JSON',
                  'XLS',
                  'XLSX',
                  'TXT',
                  'NC',
                  'NETCDF',
                  'GRIB',
                  'GRIB2',
                  'GEOJSON',
                ].map((fmt) => (
                  <span
                    key={fmt}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800/90 text-slate-300 border border-slate-700/60"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Saved / Uploaded Files Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Saved Original Datasets
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {files.length > 0 ? `SAVED • ${files.length}` : '0'}
              </span>
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 mr-1 text-[11px]">Filter:</span>
            {['ALL', ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {files.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
              <FileQuestion className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 inline-block mb-1 border border-slate-700">
                NO ORIGINAL DATASET LOADED
              </div>
              <h3 className="text-sm font-bold text-white">Awaiting Original Dataset</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No original files have been uploaded yet. Use the upload area above to add your raw weather observations, radar sweeps, satellite imagery, lightning logs, NWP grids, or GIS polygons.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="rounded-xl border border-slate-800 bg-slate-900/90 hover:border-slate-700/80 p-4 transition-all shadow-sm space-y-3"
              >
                {/* Row Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex-shrink-0">
                      {getFormatIcon(file.format)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white truncate max-w-md">
                          {file.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          ORIGINAL DATASET
                        </span>
                        {file.isZipped && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            Extracted from: {file.parentZipName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono flex-wrap">
                        <span>File format: <strong className="text-slate-200">{file.format}</strong></span>
                        <span>•</span>
                        <span>Dataset type: <strong className="text-slate-200">{file.datasetType}</strong></span>
                        <span>•</span>
                        <span>Size: <strong className="text-slate-200">{formatFileSize(file.sizeBytes)}</strong></span>
                        <span>•</span>
                        <span>Upload date: <strong className="text-slate-200">{file.uploadedAt}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Status, Category & Actions */}
                  <div className="flex items-center flex-wrap gap-2.5 self-start md:self-center">
                    {/* Category Selector */}
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-400 text-[11px] hidden sm:inline">Category:</span>
                      <select
                        value={file.category}
                        onChange={(e) =>
                          datasetService.updateFileCategory(file.id, e.target.value as DatasetCategory)
                        }
                        className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Processing Status Badge */}
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[11px] hidden lg:inline">Processing status:</span>
                      {getStatusBadge(file.status)}
                    </div>

                    {/* View Uploaded Dataset Button */}
                    <button
                      onClick={() => setInspectingFile(file)}
                      className="p-1.5 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                      title="View Uploaded Dataset"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View</span>
                    </button>

                    {/* Remove Dataset Button */}
                    <button
                      onClick={() => datasetService.removeFile(file.id)}
                      className="p-1.5 px-2.5 rounded-lg bg-slate-950 hover:bg-rose-500/20 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                      title="Remove Dataset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>

                {/* Detected Dataset Validation Metadata Box */}
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">
                      Dataset Type:
                    </span>
                    <span className="font-semibold text-slate-200 block truncate">
                      {file.datasetType}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">
                      Records / Features:
                    </span>
                    <span className="font-mono text-amber-300 font-semibold block">
                      {file.totalRecordsCount > 0 ? `${file.totalRecordsCount.toLocaleString()} items` : 'Binary / Gridded'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">
                      Coordinates Detected:
                    </span>
                    <span className="text-slate-300 block font-mono">
                      {file.hasCoordinates
                        ? file.latitudeRange
                          ? `${file.latitudeRange[0].toFixed(2)}° to ${file.latitudeRange[1].toFixed(2)}° N`
                          : 'Valid Geolocation'
                        : 'None Detected'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">
                      Missing Values:
                    </span>
                    <span className="font-mono text-slate-300 block">
                      {file.missingValuesCount} detected (No fabrication)
                    </span>
                  </div>
                </div>

                {/* Detected Variables & Columns Tags */}
                {file.variablesDetected.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">
                      Detected Variables:
                    </span>
                    {file.variablesDetected.map((v, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 text-amber-200 border border-slate-700/50"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal: Detailed Inspection of Original Dataset */}
      {inspectingFile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    ORIGINAL DATASET
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {inspectingFile.format} • {formatFileSize(inspectingFile.sizeBytes)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {inspectingFile.name}
                </h3>
              </div>

              <button
                onClick={() => setInspectingFile(null)}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Validation Summary */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-mono text-amber-400 font-bold uppercase tracking-wider block">
                  Original Dataset Validation Report
                </span>
                <p className="text-slate-300">
                  {inspectingFile.parsedSummary || 'Validated without modifying original content.'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-[11px] font-mono">
                  <div>Category: <strong className="text-slate-200">{inspectingFile.category}</strong></div>
                  <div>Status: <strong className="text-emerald-400">{inspectingFile.status}</strong></div>
                  <div>Missing Values: <strong className="text-slate-200">{inspectingFile.missingValuesCount}</strong></div>
                </div>
              </div>

              {/* Detected Columns */}
              {inspectingFile.columnsDetected.length > 0 && (
                <div>
                  <span className="font-bold text-slate-300 block mb-1.5">
                    Detected Columns ({inspectingFile.columnsDetected.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectingFile.columnsDetected.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded font-mono text-[11px] bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw File Preview */}
              {inspectingFile.rawTextPreview ? (
                <div>
                  <span className="font-bold text-slate-300 block mb-1.5">
                    Unchanged Original File Preview:
                  </span>
                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-60 leading-relaxed">
                    {inspectingFile.rawTextPreview}
                  </pre>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 italic">
                  Binary meteorological dataset preserved in original format.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Uploaded data remains strictly unchanged.
              </span>
              <button
                onClick={() => setInspectingFile(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
