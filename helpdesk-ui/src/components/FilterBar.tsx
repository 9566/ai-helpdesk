import React from 'react';
import './FilterBar.css';

interface FilterChip {
  key: string;
  label: string;
  active: boolean;
}

interface FilterBarProps {
  groups: { label: string; chips: FilterChip[]; onToggle: (key: string) => void }[];
  onClear?: () => void;
  hasActive?: boolean;
}

export function FilterBar({ groups, onClear, hasActive }: FilterBarProps) {
  return (
    <div className="filter-bar" role="group" aria-label="Filters">
      {groups.map(g => (
        <div key={g.label} className="filter-bar__group">
          <span className="filter-bar__group-label">{g.label}:</span>
          <div className="filter-bar__chips">
            {g.chips.map(c => (
              <button
                key={c.key}
                className={`filter-chip ${c.active ? 'filter-chip--active' : ''}`}
                onClick={() => g.onToggle(c.key)}
                aria-pressed={c.active}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      {hasActive && onClear && (
        <button className="filter-bar__clear" onClick={onClear}>Clear all</button>
      )}
    </div>
  );
}
