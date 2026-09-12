"use client";

import React, { useState } from 'react';
import { Card } from '../features/core-ui/Card';
import { Uploader } from '../features/conversion/Uploader';
import { ResultView } from '../features/conversion/ResultView';
import { Spinner } from '../features/core-ui/Spinner';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      // Connect to the backend (proxied locally, serverless in production)
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to convert file');
      }

      const data = await response.json();
      setMarkdown(data.markdown);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setMarkdown(null);
    setError(null);
  };

  return (
    <main className="container animate-entry">
      <header>
        <h1 className="section-title">Any2MD</h1>
        <p className="section-subtitle">
          The universal file-to-markdown converter. Extract pure, structured text from PDFs, Spreadsheets, and Images for maximum token efficiency.
        </p>
      </header>

      <Card>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', gap: '1rem' }}>
            <Spinner size={32} />
            <p style={{ color: 'var(--text-secondary)' }}>Analyzing and converting {file?.name}...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--pastel-red-text)', backgroundColor: 'var(--pastel-red-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              {error}
            </p>
            <button 
              onClick={handleReset}
              style={{ padding: '0.5rem 1rem', background: 'var(--brand-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Try Again
            </button>
          </div>
        ) : markdown ? (
          <ResultView 
            markdown={markdown} 
            filename={file?.name || 'document'} 
            onReset={handleReset} 
          />
        ) : (
          <Uploader onUpload={handleUpload} isLoading={isLoading} />
        )}
      </Card>
    </main>
  );
}
