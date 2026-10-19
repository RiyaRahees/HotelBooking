import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, Sparkles, CheckCheck, RefreshCw, LogOut, Settings as SettingsIcon, User, ShieldCheck } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { Modal } from '../common/Modal';
import { useNavigate } from 'react-router-dom';
import { mockStore } from '../../services/mockStore';
import { useHotelData } from '../../hooks/useHotelData';
import { Staff } from '../../types';

interface HeaderProps {
  collapsed: boolean;
  onMobileToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ collapsed, onMobileToggle }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { notifications, markAsRead, markAllAsRead, showToast } = useNotification();
  const { currentUser, switchCurrentUser, staff } = useHotelData();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleResetData = () => {
    mockStore.resetAllData();
    showToast('Mock Data Reset', 'Demonstration database restored to initial clean state.', 'info');
    setProfileOpen(false);
  };

  const handleSelectRoleUser = (member: Staff) => {
    switchCurrentUser(member);
    showToast('Switched User Role', `Active session switched to ${member.name} (${member.role}).`, 'info');
    setRoleModalOpen(false);
    setProfileOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-[#EFE8DA] px-4 sm:px-6 flex items-center justify-between transition-all duration-300 ${
          collapsed ? 'lg:pl-24' : 'lg:pl-68'
        }`}
      >
        {/* Left Side: Mobile Toggle & Global Search Trigger */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={onMobileToggle}
            className="p-2 rounded-xl text-navy-600 hover:text-navy-950 hover:bg-cream-100 lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Trigger Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-cream-50 hover:bg-cream-100 border border-cream-200 rounded-xl text-xs text-navy-400 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-gold-600 group-hover:text-gold-700" />
              <span className="text-navy-500 font-medium">Search guests, rooms, bookings...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-white border border-cream-300 rounded text-[10px] font-mono text-navy-500 shadow-2xs">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Side: Clock, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Live Date & Clock Display */}
          <div className="hidden md:flex flex-col items-end pr-2 border-r border-cream-200">
            <span className="text-xs font-bold text-navy-900 tracking-tight">{formattedTime}</span>
            <span className="text-[11px] font-medium text-gold-700">{formattedDate}</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              className="p-2 rounded-xl text-navy-600 hover:text-navy-950 hover:bg-cream-100 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-cream-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                <div className="p-3.5 bg-cream-50 border-b border-cream-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-navy-950">Staff Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-gold-100 text-gold-900 text-[10px] font-bold rounded-full border border-gold-300">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-semibold text-gold-700 hover:text-gold-900 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-cream-100">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3 text-xs transition-colors cursor-pointer ${
                        !n.read ? 'bg-gold-50/40 hover:bg-gold-50/70 font-medium' : 'hover:bg-cream-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-navy-900 leading-snug">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-gold-600 flex-shrink-0 mt-1" />}
                      </div>
                      <span className="text-[10px] text-navy-400 mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Staff User Avatar & Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-cream-100 transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-gold-300 shadow-xs"
              />
              <div className="hidden xl:block text-left">
                <span className="text-xs font-bold text-navy-950 block leading-tight">{currentUser.name}</span>
                <span className="text-[10px] font-medium text-gold-700 block leading-tight">{currentUser.role}</span>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-cream-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-fadeIn">
                <div className="px-4 py-3 border-b border-cream-100 bg-cream-50/50">
                  <p className="text-xs font-bold text-navy-900">{currentUser.name}</p>
                  <p className="text-[11px] text-navy-500 truncate">{currentUser.email}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold">
                      {currentUser.role} · Active
                    </span>
                    <button
                      onClick={() => setRoleModalOpen(true)}
                      className="text-[10px] text-gold-700 hover:text-gold-900 font-bold underline underline-offset-2"
                    >
                      Switch Role
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigate('/staff');
                    setProfileOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-xs text-left font-medium text-navy-700 hover:bg-cream-100 flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4 text-navy-400" />
                  Staff Directory &amp; Roster
                </button>

                <button
                  onClick={() => {
                    navigate('/settings');
                    setProfileOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-xs text-left font-medium text-navy-700 hover:bg-cream-100 flex items-center gap-2.5 transition-colors"
                >
                  <SettingsIcon className="w-4 h-4 text-navy-400" />
                  Hotel Settings
                </button>

                <button
                  onClick={handleResetData}
                  className="w-full px-4 py-2.5 text-xs text-left font-medium text-gold-800 hover:bg-gold-50 flex items-center gap-2.5 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-gold-600" />
                  Reset Demo Database
                </button>

                <div className="border-t border-cream-100 my-1" />

                <button
                  onClick={() => {
                    showToast('Logged Out', 'Staff session closed.');
                    setProfileOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-xs text-left font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Log Out Session
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Switch Current User / Role Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title="Switch Active Staff Session"
        subtitle="Test role-based views across front office, management, housekeeping, and maintenance"
        maxWidth="md"
      >
        <div className="space-y-3">
          {staff.map((member) => (
            <button
              key={member.id}
              onClick={() => handleSelectRoleUser(member)}
              className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                currentUser.id === member.id
                  ? 'border-gold-500 bg-gold-50/70 ring-2 ring-gold-200'
                  : 'border-cream-200 bg-white hover:bg-cream-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-full object-cover border border-gold-300" />
                <div>
                  <p className="text-xs font-bold text-navy-900">{member.name}</p>
                  <p className="text-[11px] text-navy-500">{member.role} · {member.department}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-cream-100 text-navy-800 rounded-lg text-xs font-bold">
                {currentUser.id === member.id ? 'Active Session' : 'Select'}
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
};
