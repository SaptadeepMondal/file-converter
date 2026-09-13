import React from 'react';
import styles from './Spinner.module.css';

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div 
      className={styles.spinner} 
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  );
}
