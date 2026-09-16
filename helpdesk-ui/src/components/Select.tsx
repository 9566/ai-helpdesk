import React from 'react';
import { ChevronDown } from 'lucide-react';
import './Select.css';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>((
  { label, error, options, placeholder, id, className = '', ...props }, ref
) => {
  const selectId = id || `sel-${Math.random().toString(36).slice(2)}`;
  const errorId = `${selectId}-error`;
  return (
    <div className={`input-field select-field ${className}`}>
      {label && <label htmlFor={selectId} className="input-field__label">{label}</label>}
      <div className="select-field__wrap">
        <select
          ref={ref}
          id={selectId}
          className={`input-field__input select-field__select ${error ? 'input-field__input--error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="select-field__icon" size={14} aria-hidden />
      </div>
      {error && <span id={errorId} className="input-field__error" role="alert">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';
