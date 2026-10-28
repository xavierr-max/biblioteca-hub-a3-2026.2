import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  variant = 'neutral',
  dot = true,
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; dotColor: string }> = {
    success: {
      bg: 'bg-[#EDF7ED]',
      text: 'text-[#2E7D32]',
      dotColor: 'bg-[#2E7D32]',
    },
    warning: {
      bg: 'bg-[#FFF8E1]',
      text: 'text-[#B76E00]',
      dotColor: 'bg-[#B76E00]',
    },
    danger: {
      bg: 'bg-[#FFEBEE]',
      text: 'text-[#C62828]',
      dotColor: 'bg-[#C62828]',
    },
    info: {
      bg: 'bg-[#E3F2FD]',
      text: 'text-[#1565C0]',
      dotColor: 'bg-[#1565C0]',
    },
    neutral: {
      bg: 'bg-[#F2E9DE]',
      text: 'text-[#6D5A4D]',
      dotColor: 'bg-[#6D5A4D]',
    },
  };

  const style = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${style.bg} ${style.text} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`} />}
      {children}
    </span>
  );
};

