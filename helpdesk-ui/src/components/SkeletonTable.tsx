import React from 'react';
import './SkeletonTable.css';

interface SkeletonTableProps { rows?: number; cols?: number; }

export function SkeletonTable({ rows = 5, cols = 6 }: SkeletonTableProps) {
  return (
    <div className="skeleton-table" aria-busy="true" aria-label="Loading data">
      <div className="skeleton-table__header">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton skeleton-table__th" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="skeleton-table__row">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton" style={{ width: `${55 + ((r + c) % 4) * 10}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
