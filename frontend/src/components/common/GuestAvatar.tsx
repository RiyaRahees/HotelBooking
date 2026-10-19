import React from 'react';
import { Crown } from 'lucide-react';

interface GuestAvatarProps {
  name: string;
  avatar?: string;
  vip?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  subtitle?: string;
}

export const GuestAvatar: React.FC<GuestAvatarProps> = ({
  name,
  avatar,
  vip = false,
  size = 'md',
  showName = false,
  subtitle,
}) => {
  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs font-semibold',
    lg: 'w-12 h-12 text-sm font-semibold',
    xl: 'w-16 h-16 text-lg font-bold',
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className={`${sizeClasses[size]} rounded-full object-cover border border-gold-200 shadow-sm`}
          />
        ) : (
          <div
            className={`${sizeClasses[size]} rounded-full bg-gold-100 text-gold-900 border border-gold-300 flex items-center justify-center`}
          >
            {getInitials(name || 'G')}
          </div>
        )}
        {vip && (
          <span
            title="VIP Guest"
            className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-sm ring-1 ring-white"
          >
            <Crown className="w-2.5 h-2.5" />
          </span>
        )}
      </div>
      {showName && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-navy-900 truncate">{name}</span>
            {vip && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-gold-100 text-gold-800 rounded border border-gold-300">
                VIP
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-navy-500 truncate">{subtitle}</p>}
        </div>
      )}
    </div>
  );
};
