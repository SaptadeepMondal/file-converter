"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Download, Check } from 'lucide-react';
import { Button } from '../core-ui/Button';
import styles from './ResultView.module.css';

interface ResultViewProps {
  markdown: string;
  filename: string;
  onReset: () => void;
}

export function ResultView({ markdown, filename, onReset }: ResultViewProps) {
  const [view, setView] = useState<'preview' | 'raw'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${view === 'preview' ? styles.activeTab : ''}`}
            onClick={() => setView('preview')}
          >
            Preview
          </button>
          <button 
            className={`${styles.tab} ${view === 'raw' ? styles.activeTab : ''}`}
            onClick={() => setView('raw')}
          >
            Raw Source
          </button>
        </div>
        
        <div className={styles.actions}>
          <Button variant="ghost" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="ghost" onClick={handleDownload}>
            <Download size={16} />
            Download
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        {view === 'preview' ? (
          <div className={styles.previewContent}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </div>
        ) : (
          <pre className={styles.rawContent}>
            <code>{markdown}</code>
          </pre>
        )}
      </div>

      <div className={styles.footer}>
        <Button variant="secondary" fullWidth onClick={onReset}>
          Convert Another File
        </Button>
      </div>
    </div>
  );
}
