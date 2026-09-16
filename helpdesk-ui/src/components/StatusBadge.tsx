import React from 'react';
import { Circle, Clock, CheckCircle, XCircle } from 'lucide-react';
import './Badge.css';

const STATUS_CONFIG = {
  'Open':        { icon: Circle,       bg: '#E8F0FA', color: '#2461A8', label: 'Open' },
  'In Progress': { icon: Clock,        bg: '#FEF3E2', color: '#B8790F', label: 'In Progress' },
  'Resolved':    { icon: CheckCircle,  bg: '#E8F5EE', color: '#1E7A46', label: 'Resolved' },
  'Closed':      { icon: XCircle,      bg: '#EEF0F3', color: '#5B6472', label: 'Closed' },
} as const;

interface StatusBadgeProps {
  status: keyof typeof STATUS_CONFIG;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`badge badge--${size}`}
      style={{ background: cfg.bg, color: cfg.color }}
      aria-label={`Status: ${cfg.label}`}
    >
      <Icon size={size === 'sm' ? 10 : 12} aria-hidden />
      {cfg.label}
    </span>
  );
}
