import React from 'react';
import './ProgressIndicator.css';

interface ProgressIndicatorProps {
  value?: number; // 0-100 for determinate; undefined for indeterminate
  label?: string;
}

export function ProgressIndicator({ value, label }: ProgressIndicatorProps) {
  const isDeterminate = value !== undefined;
  return (
    <div className="progress" aria-label={label ?? 'Loading'}>
      <div
        className={`progress__track`}
        role="progressbar"
        aria-valuenow={isDeterminate ? value : undefined}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`progress__bar ${isDeterminate ? 'progress__bar--determinate' : 'progress__bar--indeterminate'}`}
          style={isDeterminate ? { width: `${value}%` } : undefined}
        />
      </div>
      {label && <span className="progress__label">{label}</span>}
    </div>
  );
}
