import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-heading font-bold text-sm uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-3 bg-[var(--input-bg)] text-[var(--text-primary)]
              border-3 border-[var(--input-border)] shadow-brutal-sm
              font-body text-base placeholder:text-[var(--text-muted)]
              focus:shadow-brutal focus:outline-none focus:ring-0
              transition-shadow duration-150
              disabled:opacity-50 disabled:bg-[var(--bg-secondary)]
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-[var(--error)] shadow-[4px_4px_0px_var(--error)]' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm font-bold text-[var(--error)]">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-[var(--text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

// ==================== TEXTAREA ====================
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-heading font-bold text-sm uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3 bg-[var(--input-bg)] text-[var(--text-primary)]
            border-3 border-[var(--input-border)] shadow-brutal-sm
            font-body text-base placeholder:text-[var(--text-muted)]
            focus:shadow-brutal focus:outline-none focus:ring-0
            transition-shadow duration-150 resize-y min-h-[100px]
            disabled:opacity-50 disabled:bg-[var(--bg-secondary)]
            ${error ? 'border-[var(--error)] shadow-[4px_4px_0px_var(--error)]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm font-bold text-[var(--error)]">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-[var(--text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

// ==================== SELECT ====================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-heading font-bold text-sm uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3 bg-[var(--input-bg)] text-[var(--text-primary)]
            border-3 border-[var(--input-border)] shadow-brutal-sm
            font-body text-base appearance-none
            focus:shadow-brutal focus:outline-none focus:ring-0
            transition-shadow duration-150
            disabled:opacity-50 disabled:bg-[var(--bg-secondary)]
            ${error ? 'border-[var(--error)]' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm font-bold text-[var(--error)]">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
