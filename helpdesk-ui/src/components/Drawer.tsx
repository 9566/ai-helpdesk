import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Drawer.css';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="drawer__backdrop" onClick={onClose} aria-hidden />
      <div
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="drawer__header">
          <h3 className="drawer__title">{title}</h3>
          <button className="drawer__close" onClick={onClose} aria-label="Close panel">
            <X size={18} />
          </button>
        </div>
        <div className="drawer__body">{children}</div>
      </div>
    </>
  );
}
