import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-[#6D5A4D]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[#9B887B]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-[#FFFDF9] text-[#2F241C] placeholder-[#9B887B] border rounded-lg px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C8A97E] focus:border-[#C8A97E] ${
              leftIcon ? 'pl-9' : ''
            } ${rightIcon ? 'pr-9' : ''} ${
              error
                ? 'border-[#C62828] focus:ring-[#C62828]'
                : 'border-[#E7DED2] hover:border-[#C8A97E]'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-[#9B887B]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[#C62828]">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#6D5A4D]">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

