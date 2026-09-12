"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import styles from './Uploader.module.css';

interface UploaderProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export function Uploader({ onUpload, isLoading }: UploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${isLoading ? styles.loading : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isLoading && fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        className={styles.hiddenInput}
        disabled={isLoading}
      />
      <div className={styles.content}>
        <UploadCloud size={48} className={styles.icon} />
        <h3 className={styles.title}>Upload a document</h3>
        <p className={styles.subtitle}>Drag and drop or click to browse</p>
        <p className={styles.hint}>Supports PDF, DOCX, XLSX, HTML, and Images</p>
      </div>
    </div>
  );
}
