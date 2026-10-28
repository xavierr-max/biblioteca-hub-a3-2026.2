import React from 'react';
import { FolderOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#E7DED2] rounded-xl bg-[#FFFDF9]/60 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[#F2E9DE] flex items-center justify-center text-[#6F4E37] mb-3">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-sm font-semibold text-[#2F241C] mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[#6D5A4D] max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

