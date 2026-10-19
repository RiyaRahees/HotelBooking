import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Users,
  LogIn,
  LogOut,
  Sparkles,
  Wrench,
  CreditCard,
  MessageSquareQuote,
  UserCheck,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Crown,
  Info,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const [helpOpen, setHelpOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Rooms', path: '/rooms', icon: BedDouble },
    { name: 'Bookings', path: '/bookings', icon: CalendarCheck },
    { name: 'Guests', path: '/guests', icon: Users },
    { name: 'Check-in', path: '/check-in', icon: LogIn },
    { name: 'Check-out', path: '/check-out', icon: LogOut },
    { name: 'Housekeeping', path: '/housekeeping', icon: Sparkles },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Feedback', path: '/feedback', icon: MessageSquareQuote },
    { name: 'Staff', path: '/staff', icon: UserCheck },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-[#FCFBF8] border-r border-[#EFE8DA] flex flex-col justify-between transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Branding */}
        <div>
          <div className="h-18 px-4 py-4 flex items-center justify-between border-b border-[#EFE8DA]">
            <NavLink
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 min-w-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 flex items-center justify-center text-white shadow-md flex-shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <span className="font-serif font-bold text-base tracking-wide text-navy-950 block truncate">
                    ROYAL VISTA
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-700 block truncate">
                    Hotel &amp; Suites
                  </span>
                </div>
              )}
            </NavLink>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-cream-100 transition-colors"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                    isActive
                      ? 'bg-gold-100/90 text-gold-950 border border-gold-300 shadow-sm font-bold'
                      : 'text-navy-600 hover:text-navy-950 hover:bg-cream-100/80'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? 'text-gold-700' : 'text-navy-400 group-hover:text-navy-700'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                  {isActive && !collapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-600" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Help & User */}
        <div className="p-3 border-t border-[#EFE8DA] space-y-2 bg-[#FAF8F3]">
          {/* Help & Support Button */}
          <button
            onClick={() => setHelpOpen(true)}
            title={collapsed ? 'Help & Support' : undefined}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-navy-600 hover:text-navy-950 hover:bg-cream-100 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-navy-400 flex-shrink-0" />
            {!collapsed && <span>Help &amp; Operations Guide</span>}
          </button>

          {/* Current Staff Badge */}
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-white border border-cream-200 shadow-sm ${
              collapsed ? 'justify-center p-1.5' : ''
            }`}
          >
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
              alt="Riya Rahees"
              className="w-8 h-8 rounded-full object-cover border border-gold-300 flex-shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-navy-950 truncate">Riya Rahees</p>
                <p className="text-[10px] font-medium text-gold-700 truncate">Receptionist · Front Desk</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Help Modal */}
      <Modal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Royal Vista Operations Guide"
        subtitle="Quick shortcuts and staff SOP reference"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-navy-700">
          <div className="p-3.5 bg-gold-50 border border-gold-200 rounded-xl">
            <h4 className="font-bold text-gold-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-gold-600" />
              Standard Front Desk Flow
            </h4>
            <p className="text-gold-950 leading-relaxed">
              1. <strong>Arrivals:</strong> Use the 5-step Check-in stepper (/check-in) to verify ID and issue room keys.
              <br />
              2. <strong>Departures:</strong> Complete checkout (/check-out) which automatically generates the invoice and flags the room for <em>Cleaning Required</em>.
              <br />
              3. <strong>Housekeeping:</strong> Staff complete the 8-point checklist to advance room state from <em>Cleaning → Inspection → Available</em>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
              <p className="font-bold text-navy-900 mb-1">Global Search</p>
              <p className="text-navy-500">Press <kbd className="px-1.5 py-0.5 bg-white border border-cream-300 rounded font-mono text-[10px]">Ctrl+K</kbd> or click the search bar to find any guest or room.</p>
            </div>
            <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
              <p className="font-bold text-navy-900 mb-1">Front Desk Hotline</p>
              <p className="text-navy-500">Ext 100 for Duty Manager · Ext 104 for Housekeeping Lead.</p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
