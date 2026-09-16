import React from 'react';
import './StatCard.css';

interface StatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  variant?: 'default' | 'error' | 'success' | 'warning';
  onClick?: () => void;
  active?: boolean;
}

export function StatCard({ label, value, subLabel, variant = 'default', onClick, active }: StatCardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      className={`stat-card stat-card--${variant} ${active ? 'stat-card--active' : ''} ${onClick ? 'stat-card--clickable' : ''}`}
      onClick={onClick}
      aria-pressed={onClick ? active : undefined}
    >
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {subLabel && <span className="stat-card__sublabel">{subLabel}</span>}
    </Tag>
  );
}
