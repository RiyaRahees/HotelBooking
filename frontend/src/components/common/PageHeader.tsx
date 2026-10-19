import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
  icon?: LucideIcon;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  icon: Icon,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2.5 bg-gold-100/70 border border-gold-300/60 rounded-xl text-gold-900 mt-0.5">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-950 font-serif tracking-tight">{title}</h1>
            {badge && (
              <span className="px-2.5 py-0.5 bg-gold-100 text-gold-900 border border-gold-300 rounded-full text-xs font-bold">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-navy-600 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
};
