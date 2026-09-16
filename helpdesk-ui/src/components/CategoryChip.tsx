import React from 'react';
import { Monitor, Code2, Wifi, Shield, HelpCircle } from 'lucide-react';
import './CategoryChip.css';

const CATEGORY_CONFIG = {
  'Hardware':   { icon: Monitor,     color: '#5B6472', bg: '#EEF0F3' },
  'Software':   { icon: Code2,       color: '#2461A8', bg: '#E8F0FA' },
  'Network':    { icon: Wifi,        color: '#1E7A46', bg: '#E8F5EE' },
  'Security':   { icon: Shield,      color: '#B3261E', bg: '#FDECEA' },
  'General IT': { icon: HelpCircle,  color: '#B8790F', bg: '#FEF3E2' },
} as const;

interface CategoryChipProps {
  category: keyof typeof CATEGORY_CONFIG;
  size?: 'sm' | 'md';
}

export function CategoryChip({ category, size = 'md' }: CategoryChipProps) {
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG['General IT'];
  const Icon = cfg.icon;
  return (
    <span
      className={`category-chip category-chip--${size}`}
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <Icon size={size === 'sm' ? 10 : 12} aria-hidden />
      {category}
    </span>
  );
}
