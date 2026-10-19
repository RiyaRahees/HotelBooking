import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-cream-200 rounded-2xl">
      <div className="p-4 bg-cream-100 rounded-2xl text-navy-400 mb-4 border border-cream-200">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-navy-900 mb-1">{title}</h3>
      <p className="text-sm text-navy-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
