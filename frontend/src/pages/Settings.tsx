import React, { useState } from 'react';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { settingsApi } from '../services/settings';
import { useNotification } from '../context/NotificationContext';
import {
  Settings as SettingsIcon,
  Building,
  BedDouble,
  Receipt,
  CreditCard,
  Shield,
  Bell,
  HardDrive,
  RefreshCw,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { HotelSettings } from '../types';

export const Settings: React.FC = () => {
  const { settings, refreshAll } = useHotelData();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'roomTypes' | 'taxes' | 'payments' | 'permissions' | 'notifications' | 'system'
  >('profile');

  // Form State initialized from settings
  const [formData, setFormData] = useState<HotelSettings>({ ...settings });

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await settingsApi.update(formData);
    showToast('Settings Saved', 'Hotel configuration updated successfully.');
    refreshAll();
  };

  const handleResetDemoData = async () => {
    await settingsApi.resetAll();
    showToast('Data Reset Completed', 'All rooms, bookings and mock entities reset to pristine defaults.', 'info');
    refreshAll();
  };

  const tabs = [
    { id: 'profile', label: 'Hotel Profile', icon: Building },
    { id: 'roomTypes', label: 'Room Tiers & Amenities', icon: BedDouble },
    { id: 'taxes', label: 'Taxes & Invoicing', icon: Receipt },
    { id: 'payments', label: 'Payment Settings', icon: CreditCard },
    { id: 'permissions', label: 'Staff & Roles', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System & Data', icon: HardDrive },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
      <PageHeader
        title="Hotel Configuration &amp; Settings"
        subtitle="Configure property branding, tax rates, checkout policies and system preferences"
        icon={SettingsIcon}
      />

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-cream-100 rounded-2xl border border-cream-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-white text-navy-950 shadow-sm border border-cream-200'
                  : 'text-navy-600 hover:text-navy-950'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-gold-700' : 'text-navy-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSaveSettings}>
        {/* Tab 1: Hotel Profile */}
        {activeTab === 'profile' && (
          <div className="luxury-card p-6 sm:p-8 bg-white rounded-3xl border border-cream-200 space-y-6">
            <div>
              <h3 className="text-lg font-bold font-serif text-navy-950">Property Identity &amp; Branding</h3>
              <p className="text-xs text-navy-500 mt-0.5">Primary information printed on invoices and guest confirmations</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Hotel Name</label>
                <input
                  type="text"
                  value={formData.hotelName}
                  onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Subtitle / Tier</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Primary Reception Hotline</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Official Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Website URL</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-navy-900 mb-1">Property Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-cream-200">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Default Check-in Time</label>
                <input
                  type="time"
                  value={formData.checkInTime}
                  onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-bold text-navy-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Default Check-out Time</label>
                <input
                  type="time"
                  value={formData.checkOutTime}
                  onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-bold text-navy-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Room Tiers */}
        {activeTab === 'roomTypes' && (
          <div className="luxury-card p-6 sm:p-8 bg-white rounded-3xl border border-cream-200 space-y-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-navy-950">Room Tiers &amp; Rate Structure</h3>
              <p className="text-xs text-navy-500 mt-0.5">Base rack tariffs and default inclusions</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                { name: 'Standard Room', rate: '₹3,500', size: '320 sq ft', cap: '2 Guests' },
                { name: 'Deluxe Room', rate: '₹5,500', size: '420 sq ft', cap: '2 Guests' },
                { name: 'Executive Suite', rate: '₹9,500', size: '650 sq ft', cap: '3 Guests' },
                { name: 'Presidential Suite', rate: '₹24,000', size: '1,650 sq ft', cap: '6 Guests' },
              ].map((tier, i) => (
                <div key={i} className="p-4 bg-cream-50 rounded-2xl border border-cream-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-navy-900 text-sm font-serif">{tier.name}</h4>
                    <p className="text-xs text-navy-500">{tier.size} · {tier.cap}</p>
                  </div>
                  <span className="font-bold text-navy-950 font-serif text-base">{tier.rate}<span className="text-[10px] text-navy-400 font-normal">/night</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Taxes */}
        {activeTab === 'taxes' && (
          <div className="luxury-card p-6 sm:p-8 bg-white rounded-3xl border border-cream-200 space-y-6">
            <div>
              <h3 className="text-lg font-bold font-serif text-navy-950">Taxation &amp; Invoicing</h3>
              <p className="text-xs text-navy-500 mt-0.5">GST rates and mandatory service levies</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Hospitality GST / VAT Rate (%)</label>
                <input
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-bold text-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-bold text-navy-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Payments */}
        {activeTab === 'payments' && (
          <div className="luxury-card p-6 sm:p-8 bg-white rounded-3xl border border-cream-200 space-y-6">
            <div>
              <h3 className="text-lg font-bold font-serif text-navy-950">Accepted Payment Gateways</h3>
              <p className="text-xs text-navy-500 mt-0.5">Front desk POS terminals and digital settlement channels</p>
            </div>

            <div className="space-y-3">
              {[
                { name: 'POS Card Machine (Mastercard / Visa / Amex)', status: 'Active', desc: 'Terminal 01 & 02 connected' },
                { name: 'UPI Dynamic QR (PhonePe / Google Pay / BHIM)', status: 'Active', desc: 'Instant merchant settlement' },
                { name: 'NEFT / RTGS Bank Transfer', status: 'Active', desc: 'HDFC Corporate Escrow' },
                { name: 'Direct Cash Ledger', status: 'Active', desc: 'Front desk safe cash drawer' },
              ].map((gw, i) => (
                <div key={i} className="p-4 bg-cream-50 rounded-2xl border border-cream-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-navy-900 text-xs">{gw.name}</h4>
                    <p className="text-[11px] text-navy-500">{gw.desc}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                    {gw.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Staff & Permissions */}
        {activeTab === 'permissions' && (
          <div className="luxury-card p-6 sm:p-8 bg-white rounded-3xl border border-cream-200 space-y-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-navy-950">Role-Based Access Control (RBAC)</h3>
              <p className="text-xs text-navy-500 mt-0.5">Permissions matrix across department modules</p>
            </div>

            <div className="divide-y divide-cream-100 text-xs">
              {[
                { role: 'Admin & General Manager', perms: 'Full access to Bookings, Financials, Staff roster, System settings, Audits' },
                { role: 'Receptionist / Front Office', perms: 'Check-in, Check-out, Folio settlement, Guest registration, Invoices' },
                { role: 'Housekeeping Lead', perms: 'Room turnover checklist, Inspection audits, Linen turnaround' },
                { role: 'Engineering & Maintenance', perms: 'Equipment tickets, HVAC logs, Defect resolution' },
                { role: 'Accountant', perms: 'Financial ledger, Tax reports, Audit receipts, Revenue exports' },
              ].map((r, i) => (
                <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-navy-900 sm:w-1/3">{r.role}</span>
                  <span className="text-navy-600 sm:w-2/3">{r.perms}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Notifications */}
        {activeTab === 'notifications' && (
          <div className="luxury-card p-6 sm:p-8 bg-white rounded-3xl border border-cream-200 space-y-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-navy-950">Staff Alerts &amp; Event Triggers</h3>
              <p className="text-xs text-navy-500 mt-0.5">Audible and visual alerts for operational events</p>
            </div>

            <div className="space-y-3">
              {[
                'VIP Guest Check-in Announcement',
                'Room Cleaned & Ready for Supervisor Inspection',
                'Urgent Maintenance Ticket Notification',
                'Folio Settlement Receipt Confirmation',
              ].map((pref, i) => (
                <label key={i} className="flex items-center gap-3 p-3.5 bg-cream-50 rounded-xl border border-cream-200 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-gold-600 rounded" />
                  <span className="text-xs font-bold text-navy-900">{pref}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: System Settings & Demo Reset */}
        {activeTab === 'system' && (
          <div className="luxury-card p-6 sm:p-8 bg-white rounded-3xl border border-cream-200 space-y-6">
            <div>
              <h3 className="text-lg font-bold font-serif text-navy-950">System Diagnostics &amp; Mock Persistence</h3>
              <p className="text-xs text-navy-500 mt-0.5">Manage local reactive storage cache</p>
            </div>

            <div className="p-4 bg-gold-50/60 border border-gold-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-gold-950">Reset Demonstration Database</h4>
                <p className="text-xs text-gold-800 mt-0.5">
                  Restores all 120 rooms, bookings, housekeeping checklists, and guests to pristine initial showcase state.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetDemoData}
                className="px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm flex-shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Demo State</span>
              </button>
            </div>
          </div>
        )}

        {/* Form Bottom Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="gold-gradient-btn px-8 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-luxury"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
