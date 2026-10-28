import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8A97E] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-4 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#6F4E37] hover:bg-[#4E3727] active:bg-[#3D2B1F] text-[#FFFDF9] shadow-xs',
    secondary:
      'bg-[#E6D5BF] hover:bg-[#D8CCC0] active:bg-[#C8A97E] text-[#2F241C]',
    outline:
      'border border-[#E7DED2] bg-[#FFFDF9] hover:bg-[#F8F4EE] active:bg-[#F2E9DE] text-[#2F241C]',
    ghost:
      'bg-transparent hover:bg-[#F2E9DE]/60 active:bg-[#E6D5BF]/60 text-[#2F241C]',
    danger:
      'bg-[#C62828] hover:bg-[#B71C1C] active:bg-[#8E0000] text-white shadow-xs',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
    </button>
  );
};

