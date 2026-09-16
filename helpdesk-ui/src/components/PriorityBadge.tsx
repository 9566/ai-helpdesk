import React from 'react';
import { Minus, Info, AlertTriangle, Zap } from 'lucide-react';
import './Badge.css';

const PRIORITY_CONFIG = {
  'Low':      { icon: Minus,         bg: '#F6F7F9', color: '#5B6472',  border: '#DEE2E8' },
  'Medium':   { icon: Info,          bg: '#E8F0FA', color: '#2461A8',  border: '#c4d7f0' },
  'High':     { icon: AlertTriangle, bg: '#FEF3E2', color: '#B8790F',  border: '#f5d99d' },
  'Critical': { icon: Zap,           bg: '#FDECEA', color: '#B3261E',  border: '#f0b4b1' },
} as const;

interface PriorityBadgeProps {
  priority: keyof typeof PRIORITY_CONFIG;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const cfg = PRIORITY_CONFIG[priority];
  const Icon = cfg.icon;
  return (
    <span
      className={`badge badge--${size}`}
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
      aria-label={`Priority: ${priority}`}
    >
      <Icon size={size === 'sm' ? 10 : 12} aria-hidden />
      {priority}
    </span>
  );
}
