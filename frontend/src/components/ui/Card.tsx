import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'flat' | 'interactive';
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#FFFDF9] border border-[#E7DED2] rounded-xl shadow-xs',
    flat: 'bg-[#FFFDF9] border border-[#E7DED2] rounded-xl',
    interactive:
      'bg-[#FFFDF9] border border-[#E7DED2] hover:border-[#C8A97E] hover:shadow-sm transition-all cursor-pointer rounded-xl',
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`} {...props}>
      {header && (
        <div className="px-5 py-4 border-b border-[#E7DED2]/80 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3.5 border-t border-[#E7DED2]/80 bg-[#F8F4EE]/50 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
};
