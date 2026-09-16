import React from 'react';
import './Input.css';
import './Textarea.css';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  minRows?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>((
  { label, error, hint, required, id, minRows = 4, className = '', style, ...props }, ref
) => {
  const inputId = id || `ta-${Math.random().toString(36).slice(2)}`;
  const errorId = `${inputId}-error`;
  return (
    <div className={`input-field ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-field__label">
          {label}
          {required && <span className="input-field__required" aria-hidden> (required)</span>}
        </label>
      )}
      {hint && <span className="input-field__hint">{hint}</span>}
      <textarea
        ref={ref}
        id={inputId}
        className={`input-field__input textarea ${error ? 'input-field__input--error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        rows={minRows}
        style={{ resize: 'vertical', ...style }}
        {...props}
      />
      {error && <span id={errorId} className="input-field__error" role="alert">{error}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
