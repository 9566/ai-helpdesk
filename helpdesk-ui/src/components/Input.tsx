import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>((
  { label, error, hint, required, id, className = '', ...props }, ref
) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2)}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  return (
    <div className={`input-field ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-field__label">
          {label}
          {required && <span className="input-field__required" aria-hidden> (required)</span>}
        </label>
      )}
      {hint && <span id={hintId} className="input-field__hint">{hint}</span>}
      <input
        ref={ref}
        id={inputId}
        className={`input-field__input ${error ? 'input-field__input--error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={[error ? errorId : '', hint ? hintId : ''].filter(Boolean).join(' ') || undefined}
        {...props}
      />
      {error && <span id={errorId} className="input-field__error" role="alert">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
