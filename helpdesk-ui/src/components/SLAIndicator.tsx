import React from 'react';
import { Clock, AlertTriangle, AlertOctagon } from 'lucide-react';
import './SLAIndicator.css';

function getTimeRemaining(deadline: string): { ms: number; label: string } {
  const diff = new Date(deadline).getTime() - Date.now();
  const abs = Math.abs(diff);
  const h = Math.floor(abs / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  if (diff < 0) return { ms: diff, label: `Breached ${h}h ${m}m ago` };
  if (h >= 24) return { ms: diff, label: `${Math.floor(h / 24)}d ${h % 24}h left` };
  return { ms: diff, label: `${h}h ${m}m left` };
}

function getSLAState(deadline: string, totalMs: number): 'ok' | 'warning' | 'breach' {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff < 0) return 'breach';
  if (totalMs > 0 && diff / totalMs < 0.25) return 'warning';
  return 'ok';
}

interface SLAIndicatorProps {
  deadline: string;
  priority: string;
  /** Show pulsing dot — use on queue/list rows */
  showPulse?: boolean;
  size?: 'sm' | 'md';
}

export function SLAIndicator({ deadline, priority, showPulse = false, size = 'md' }: SLAIndicatorProps) {
  const HOURS: Record<string, number> = { Critical: 4, High: 8, Medium: 24, Low: 48 };
  const totalMs = (HOURS[priority] ?? 24) * 3600000;
  const state = getSLAState(deadline, totalMs);
  const { label } = getTimeRemaining(deadline);

  const Icon = state === 'breach' ? AlertOctagon : state === 'warning' ? AlertTriangle : Clock;
  const cls = `sla-indicator sla-indicator--${state} sla-indicator--${size}`;

  return (
    <span className={cls} aria-label={label}>
      {showPulse && state === 'breach' && <span className="sla-indicator__pulse" aria-hidden />}
      <Icon size={size === 'sm' ? 11 : 13} aria-hidden />
      <span>{label}</span>
    </span>
  );
}
