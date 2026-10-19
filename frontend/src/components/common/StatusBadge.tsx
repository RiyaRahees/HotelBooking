import React from 'react';
import { RoomStatus, BookingStatus, PaymentStatus, HousekeepingStatus, MaintenanceStatus, MaintenancePriority } from '../../types';

interface StatusBadgeProps {
  status: RoomStatus | BookingStatus | PaymentStatus | HousekeepingStatus | MaintenanceStatus | MaintenancePriority | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showDot = true }) => {
  const getStyles = () => {
    switch (status) {
      // Room & Booking Available / Paid / Completed / Verified / Active
      case 'Available':
      case 'Paid':
      case 'Completed':
      case 'Verified':
      case 'Active':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dot: 'bg-emerald-500',
        };

      // Confirmed / Reserved / Partially Paid
      case 'Confirmed':
      case 'Reserved':
        return {
          bg: 'bg-gold-50 text-gold-900 border-gold-300',
          dot: 'bg-gold-600',
        };

      // Occupied / Checked In
      case 'Occupied':
      case 'Checked In':
        return {
          bg: 'bg-navy-50 text-navy-800 border-navy-200',
          dot: 'bg-navy-700',
        };

      // Cleaning / Cleaning Required / In Progress / Inspection / Assigned / Partial
      case 'Cleaning':
      case 'Cleaning Required':
      case 'In Progress':
      case 'Inspection':
      case 'Partial':
      case 'Assigned':
      case 'Medium':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dot: 'bg-amber-500',
        };

      // Maintenance / Cancelled / Refunded / Urgent / High / Open / Failed / Out of Service / No-show
      case 'Maintenance':
      case 'Cancelled':
      case 'Refunded':
      case 'Failed':
      case 'Open':
      case 'Urgent':
      case 'High':
      case 'Out of Service':
      case 'No-show':
        return {
          bg: 'bg-red-50 text-red-800 border-red-200/80',
          dot: 'bg-red-500',
        };

      // Checked Out / Pending / Low / On Leave / Off Duty / Fixed
      case 'Fixed':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
        };

      case 'Checked Out':
      case 'Pending':
      case 'Low':
      case 'Off Duty':
      case 'On Leave':
      default:
        return {
          bg: 'bg-cream-200/70 text-navy-700 border-cream-300',
          dot: 'bg-navy-400',
        };
    }
  };

  const styles = getStyles();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3.5 py-1.5 text-sm font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${sizeClasses[size]} ${styles.bg}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} animate-pulse`} />
      )}
      <span className="capitalize">{status}</span>
    </span>
  );
};
