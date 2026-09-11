'use client';

import React, { useState, useCallback } from 'react';
import { UploadCloud, FileType, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { convertImage } from '@/lib/image';
import { convertSpreadsheet } from '@/lib/spreadsheet';

type ConversionStatus = 'idle' | 'converting' | 'success' | 'error';

const FORMAT_MAPPING: Record<string, string[]> = {
  'md': ['pdf', 'docx'],
  'docx': ['md', 'pdf'],
  'csv': ['xlsx'],
  'xlsx': ['csv'],
  'png': ['jpg', 'webp'],
  'jpg': ['png', 'webp'],
  'jpeg': ['png', 'webp'],
};

const getExtension = (filename: string) => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export default function FileConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    const ext = getExtension(selectedFile.name);
    if (!FORMAT_MAPPING[ext]) {
      setErrorMsg(`Unsupported file format: .${ext}. Supported: .md, .docx, .csv, .xlsx, .png, .jpg`);
      setStatus('error');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setTargetFormat(FORMAT_MAPPING[ext][0]); // Default to first available
    setStatus('idle');
    setErrorMsg('');
    setResultBlob(null);
  };

  const handleConvert = async () => {
    if (!file || !targetFormat) return;

    setStatus('converting');
    setErrorMsg('');
    setResultBlob(null);
    
    const ext = getExtension(file.name);
    
    try {
      let blob: Blob | null = null;
      
      // Route to correct converter
      if (['png', 'jpg', 'jpeg'].includes(ext)) {
        blob = await convertImage(file, `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}` as any);
      } else if (['csv', 'xlsx'].includes(ext)) {
        blob = await convertSpreadsheet(file, targetFormat as 'csv' | 'xlsx');
      } else if (['md', 'docx'].includes(ext)) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`/api/py/convert/${ext}-to-${targetFormat}`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Backend conversion failed');
        }
        
        blob = await response.blob();
      }
      
      if (blob) {
        setResultBlob(blob);
        setStatus('success');
      } else {
        throw new Error('Conversion failed or unsupported path.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'An error occurred during conversion.');
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file || !targetFormat) return;
    
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    
    // Create new filename
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
    a.download = `${nameWithoutExt}.${targetFormat}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
      {/* Glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />

      <h2 className="text-3xl font-bold text-white mb-2 text-center">Transform Files</h2>
      <p className="text-gray-400 text-center mb-8">Convert Markdown, Word, Images, and Spreadsheets instantly.</p>

      {/* Upload Zone */}
      {!file && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative group flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 transition-all duration-200 ease-in-out cursor-pointer",
            isDragging 
              ? "border-blue-500 bg-blue-500/10" 
              : "border-gray-700 hover:border-gray-500 hover:bg-gray-800/50"
          )}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileInput}
          />
          <div className="p-4 bg-gray-800 rounded-full group-hover:scale-110 transition-transform duration-200">
            <UploadCloud className="w-10 h-10 text-blue-400" />
          </div>
          <p className="mt-4 text-lg font-medium text-white">Drop your file here</p>
          <p className="mt-2 text-sm text-gray-500">or click to browse from your computer</p>
        </div>
      )}

      {/* File Details & Conversion Options */}
      {file && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700 p-4 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <FileType className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white truncate max-w-[200px] md:max-w-xs">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button 
              onClick={() => setFile(null)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Change
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-400 mb-2">Convert to</label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
              >
                {FORMAT_MAPPING[getExtension(file.name)]?.map(fmt => (
                  <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-none w-full md:w-auto mt-auto">
              {status !== 'success' ? (
                <button
                  onClick={handleConvert}
                  disabled={status === 'converting'}
                  className={cn(
                    "w-full px-8 py-3 rounded-lg font-medium flex items-center justify-center transition-all duration-200",
                    status === 'converting' 
                      ? "bg-blue-600/50 text-white cursor-not-allowed" 
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                  )}
                >
                  {status === 'converting' ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    'Convert Now'
                  )}
                </button>
              ) : (
                <button
                  onClick={handleDownload}
                  className="w-full px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium flex items-center justify-center transition-all duration-200 shadow-lg shadow-emerald-500/25"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {status === 'error' && (
        <div className="mt-6 flex items-start space-x-3 text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="mt-6 flex items-center space-x-3 text-emerald-400 bg-emerald-400/10 p-4 rounded-xl border border-emerald-400/20">
          <CheckCircle className="w-5 h-5" />
          <p className="text-sm">Conversion successful! Ready to download.</p>
        </div>
      )}
    </div>
  );
}
