import React, { useState } from 'react';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { useNotification } from '../context/NotificationContext';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  TrendingUp,
  BedDouble,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Reports: React.FC = () => {
  const { stats, payments, bookings, tasks } = useHotelData();
  const { showToast } = useNotification();

  const [dateFilter, setDateFilter] = useState<'Today' | 'This Week' | 'This Month' | 'Custom'>('This Month');
  const [activeTab, setActiveTab] = useState<'revenue' | 'occupancy' | 'operations' | 'turnover'>('revenue');

  const monthlyRevenueData = [
    { month: 'Apr', revenue: 980000, bookings: 72, ADR: 5200 },
    { month: 'May', revenue: 1120000, bookings: 84, ADR: 5400 },
    { month: 'Jun', revenue: 1040000, bookings: 78, ADR: 5350 },
    { month: 'Jul', revenue: 1280000, bookings: 92, ADR: 5600 },
    { month: 'Aug', revenue: 1350000, bookings: 98, ADR: 5750 },
    { month: 'Sep', revenue: 1245000, bookings: 90, ADR: 5800 },
  ];

  const occupancyTrendData = [
    { day: 'Sep 13', occupancy: 72, arrivals: 8, departures: 6 },
    { day: 'Sep 14', occupancy: 75, arrivals: 10, departures: 7 },
    { day: 'Sep 15', occupancy: 80, arrivals: 14, departures: 9 },
    { day: 'Sep 16', occupancy: 82, arrivals: 12, departures: 10 },
    { day: 'Sep 17', occupancy: 85, arrivals: 15, departures: 11 },
    { day: 'Sep 18', occupancy: 81, arrivals: 9, departures: 12 },
    { day: 'Sep 19', occupancy: 78, arrivals: 12, departures: 8 },
  ];

  const channelDistribution = [
    { name: 'Direct Front Desk', value: 42, color: '#B89758' },
    { name: 'Official Website', value: 30, color: '#1E293B' },
    { name: 'Corporate Partners', value: 18, color: '#2E7D52' },
    { name: 'Luxury OTAs', value: 10, color: '#D97706' },
  ];

  const handleExportPDF = () => {
    showToast('Exporting Report', 'Generating Royal Vista Executive PDF Report...');
  };

  const handleExportExcel = () => {
    showToast('Exporting Spreadsheet', 'Downloading operational ledger as XLSX...');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <PageHeader
        title="Analytics &amp; Financial Reports"
        subtitle="Comprehensive hospitality KPIs, revenue per available room (RevPAR), and departmental analytics"
        icon={BarChart3}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-cream-100 hover:bg-cream-200 text-navy-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-cream-200 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-luxury"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        }
      />

      {/* Date Filter & Tab Switcher Bar */}
      <div className="luxury-card p-4 bg-white rounded-2xl border border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Metric Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-cream-100 rounded-xl border border-cream-200">
          {[
            { id: 'revenue', label: 'Revenue & ADR' },
            { id: 'occupancy', label: 'Occupancy Trends' },
            { id: 'operations', label: 'Channel Source' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-navy-950 shadow-sm'
                  : 'text-navy-600 hover:text-navy-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date Ranges */}
        <div className="flex items-center gap-1 p-1 bg-cream-100 rounded-xl border border-cream-200">
          {(['Today', 'This Week', 'This Month', 'Custom'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateFilter(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateFilter === range ? 'bg-white text-navy-950 shadow-sm' : 'text-navy-500 hover:text-navy-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="luxury-card p-4.5 bg-white border border-cream-200 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">Total Net Revenue</span>
          <h3 className="text-2xl font-bold font-serif text-navy-950 mt-1">₹12,45,000</h3>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">↑ 14.2% vs last month</span>
        </div>

        <div className="luxury-card p-4.5 bg-white border border-cream-200 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">Average Daily Rate (ADR)</span>
          <h3 className="text-2xl font-bold font-serif text-navy-950 mt-1">₹5,800</h3>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">↑ 4.1% tariff growth</span>
        </div>

        <div className="luxury-card p-4.5 bg-white border border-cream-200 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">RevPAR</span>
          <h3 className="text-2xl font-bold font-serif text-navy-950 mt-1">₹4,524</h3>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Based on 78% occupancy</span>
        </div>

        <div className="luxury-card p-4.5 bg-white border border-cream-200 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">Avg Turnover Time</span>
          <h3 className="text-2xl font-bold font-serif text-navy-950 mt-1">32 Mins</h3>
          <span className="text-[11px] text-gold-700 font-semibold mt-1 block">Within 35 min SOP limit</span>
        </div>
      </div>

      {/* Active Visualizations */}
      {activeTab === 'revenue' && (
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
          <h3 className="text-base font-bold font-serif text-navy-950 mb-4">
            Monthly Revenue &amp; Average Daily Rate (ADR)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE8DA" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    name === 'revenue' ? `₹${Number(val).toLocaleString()}` : `₹${val}`,
                    name === 'revenue' ? 'Gross Revenue' : 'ADR Tariff',
                  ]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', borderColor: '#EFE8DA' }}
                />
                <Legend />
                <Bar dataKey="revenue" name="Gross Revenue (₹)" fill="#B89758" radius={[8, 8, 0, 0]} />
                <Bar dataKey="ADR" name="Avg Daily Rate (₹)" fill="#1E293B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'occupancy' && (
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
          <h3 className="text-base font-bold font-serif text-navy-950 mb-4">
            Daily Occupancy Rate &amp; Front Desk Turnover Volume
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE8DA" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', borderColor: '#EFE8DA' }} />
                <Legend />
                <Line type="monotone" dataKey="occupancy" name="Occupancy (%)" stroke="#B89758" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="arrivals" name="Arrivals Checked In" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="departures" name="Departures Checked Out" stroke="#DC2626" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'operations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
            <h3 className="text-base font-bold font-serif text-navy-950 mb-4">Reservation Origin Channels</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {channelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${val}% of Bookings`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 pt-2 text-xs">
              {channelDistribution.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-navy-700">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </span>
                  <span className="font-bold text-navy-900">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200 space-y-4">
            <h3 className="text-base font-bold font-serif text-navy-950">Operations Insights</h3>
            <div className="p-4 bg-cream-50 rounded-xl border border-cream-200 text-xs text-navy-800 space-y-2">
              <p className="font-bold text-navy-950">Direct Booking Advantage:</p>
              <p>Direct front desk and branded website reservations generated 72% of all revenue, saving ₹1,42,000 in OTA commission fees this month.</p>
            </div>
            <div className="p-4 bg-gold-50/60 rounded-xl border border-gold-200 text-xs text-gold-950 space-y-2">
              <p className="font-bold text-gold-900">Highest Yield Suite:</p>
              <p>Executive Suites registered 94% weekend occupancy at peak ADR of ₹14,500/night.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
