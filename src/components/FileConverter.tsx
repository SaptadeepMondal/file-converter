'use client';

import React, { useState } from 'react';
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
      setErrorMsg(`Unsupported file format: .${ext.toUpperCase()}`);
      setStatus('error');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setTargetFormat(FORMAT_MAPPING[ext][0]);
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
      
      // Intentional delay to enforce pacing of irreversible progress (raised from darkroom)
      await new Promise(r => setTimeout(r, 600));

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
        throw new Error('Conversion failed.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Fatal error.');
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file || !targetFormat) return;
    
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
    a.download = `${nameWithoutExt}.${targetFormat}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white text-black nylon-border nylon-shadow p-6 md:p-12 relative flex flex-col space-y-10 z-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-6 gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight label-quote">File Converter</h2>
          <p className="mt-2 text-sm font-bold tracking-widest text-gray-500">UTILITY / V1.0.0</p>
        </div>
        <div className={cn(
          "px-4 py-2 font-mono text-sm border-2 border-black font-bold whitespace-nowrap",
          status === 'error' ? "bg-red-500 text-white" : 
          status === 'success' ? "bg-green-500 text-black" :
          "bg-black text-white"
        )}>
          STATUS: {status.toUpperCase()}
        </div>
      </div>

      {/* Upload Zone */}
      {!file && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative group w-full h-64 md:h-80 flex flex-col items-center justify-center nylon-border cursor-pointer transition-all overflow-hidden",
            isDragging ? "bg-black" : "hazard-stripe-light"
          )}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            onChange={handleFileInput}
          />
          <div className="relative z-10 bg-white nylon-border p-6 md:p-10 text-center flex flex-col items-center group-hover:scale-105 transition-transform duration-200">
            <span className="text-2xl md:text-3xl font-black label-quote">Drop File</span>
            <span className="mt-2 font-mono text-sm text-gray-500 font-bold block">OR CLICK TO BROWSE</span>
          </div>
        </div>
      )}

      {/* File Details & Conversion Options */}
      {file && (
        <div className="space-y-8">
          
          {/* Source File */}
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-black text-gray-500 tracking-widest">INPUT SOURCE</span>
            <div className="flex items-center justify-between border-4 border-black p-4 bg-white">
              <span className="font-mono font-bold text-lg truncate max-w-[60%] md:max-w-[80%]">{file.name}</span>
              <button 
                onClick={() => setFile(null)}
                className="text-sm font-bold border-b-2 border-black hover:text-gray-500 transition-colors"
              >
                REMOVE
              </button>
            </div>
          </div>

          {/* Exposed Mechanics (raised from tensegrity column) */}
          <div className="flex flex-col items-center justify-center space-y-2 py-4">
             <div className="w-1 h-8 bg-black"></div>
             <div className="border-2 border-black px-4 py-1 text-xs font-mono font-bold bg-gray-100">CONVERT TO</div>
             <div className="w-1 h-8 bg-black"></div>
          </div>

          {/* Target Format */}
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-black text-gray-500 tracking-widest">TARGET FORMAT</span>
            <div className="relative">
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="w-full border-4 border-black p-4 bg-white font-mono font-bold text-xl outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {FORMAT_MAPPING[getExtension(file.name)]?.map(fmt => (
                  <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none font-black text-xl">
                ↓
              </div>
            </div>
          </div>
          
          {/* Action Area */}
          <div className="pt-8 border-t-4 border-black relative">
            {/* The hazard stripe cuts diagonally behind the button for structure */}
            <div className="absolute inset-0 hazard-stripe-light -z-10 -mx-6 md:-mx-12 h-32 mt-4" />
            
            {status !== 'success' ? (
              <button
                onClick={handleConvert}
                disabled={status === 'converting'}
                className={cn(
                  "w-full p-6 text-xl md:text-2xl font-black nylon-border tag-swing flex items-center justify-center space-x-4",
                  status === 'converting' 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "bg-[#ff5500] text-white hover:bg-black"
                )}
              >
                <span className="label-quote">
                  {status === 'converting' ? 'PROCESSING' : 'CONVERT NOW'}
                </span>
              </button>
            ) : (
              <button
                onClick={handleDownload}
                className="w-full p-6 text-xl md:text-2xl font-black nylon-border bg-black text-white tag-swing hover:bg-[#ff5500] flex items-center justify-center"
              >
                <span className="label-quote">DOWNLOAD RESULT</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="mt-8 border-4 border-black bg-red-500 text-white p-6 relative overflow-hidden group">
          <div className="absolute inset-0 hazard-stripe opacity-20" />
          <div className="relative z-10 flex flex-col">
            <span className="text-2xl font-black label-quote">ERROR</span>
            <p className="font-mono mt-2 font-bold">{errorMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
