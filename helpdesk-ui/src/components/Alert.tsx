import React from 'react';
import { Info, AlertTriangle, AlertOctagon } from 'lucide-react';
import './Alert.css';

interface AlertProps {
  variant: 'info' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
}

export function Alert({ variant, title, children }: AlertProps) {
  const Icon = variant === 'error' ? AlertOctagon : variant === 'warning' ? AlertTriangle : Info;
  return (
    <div className={`alert alert--${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      <Icon size={16} className="alert__icon" aria-hidden />
      <div className="alert__body">
        {title && <p className="alert__title">{title}</p>}
        <div className="alert__content">{children}</div>
      </div>
    </div>
  );
}
