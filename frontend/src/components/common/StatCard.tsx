import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'gold' | 'emerald' | 'navy' | 'amber' | 'red';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'gold',
  onClick,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
          accent: 'border-l-emerald-500',
        };
      case 'navy':
        return {
          iconBg: 'bg-navy-50 text-navy-800 border-navy-200',
          accent: 'border-l-navy-700',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-700 border-amber-200/60',
          accent: 'border-l-amber-500',
        };
      case 'red':
        return {
          iconBg: 'bg-red-50 text-red-700 border-red-200/60',
          accent: 'border-l-red-500',
        };
      case 'gold':
      default:
        return {
          iconBg: 'bg-gold-50 text-gold-700 border-gold-200/60',
          accent: 'border-l-gold-500',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      onClick={onClick}
      className={`luxury-card p-4.5 sm:p-5 bg-white border border-[#EFE8DA] rounded-2xl transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-navy-500 mb-1">{label}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">{value}</h3>
          {subtext && (
            <p className="text-xs text-navy-500 mt-1.5 flex items-center gap-1 font-medium">
              {subtext}
            </p>
          )}
        </div>
        <div className={`p-2.5 sm:p-3 rounded-xl border ${styles.iconBg}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
};
