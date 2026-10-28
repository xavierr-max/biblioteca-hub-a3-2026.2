import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, helperText, error, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold uppercase tracking-wider text-[#6D5A4D]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none bg-[#FFFDF9] text-[#2F241C] border rounded-lg px-3 py-2 pr-9 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C8A97E] focus:border-[#C8A97E] ${
              error
                ? 'border-[#C62828] focus:ring-[#C62828]'
                : 'border-[#E7DED2] hover:border-[#C8A97E]'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="w-4 h-4 text-[#9B887B] absolute right-3 pointer-events-none"
            aria-hidden="true"
          />
        </div>
        {error && <p className="text-xs text-[#C62828]">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#6D5A4D]">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
