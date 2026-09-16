import React from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
export type ButtonSize = 'md' | 'sm';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((
  { variant = 'primary', size = 'md', loading, icon, iconPosition = 'left', children, className = '', disabled, ...props },
  ref
) => {
  const cls = ['btn', `btn--${variant}`, `btn--${size}`, loading ? 'btn--loading' : '', className].filter(Boolean).join(' ');
  const isDisabled = disabled || loading;
  return (
    <button ref={ref} className={cls} disabled={isDisabled} aria-busy={loading} {...props}>
      {loading ? <Loader2 className="btn__spinner" size={14} aria-hidden /> : null}
      {icon && iconPosition === 'left' && !loading ? <span className="btn__icon" aria-hidden>{icon}</span> : null}
      {children && <span>{children}</span>}
      {icon && iconPosition === 'right' && !loading ? <span className="btn__icon" aria-hidden>{icon}</span> : null}
    </button>
  );
});

Button.displayName = 'Button';
