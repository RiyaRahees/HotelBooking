import React, { useState } from 'react';
import { useHotelData } from '../hooks/useHotelData';
import { StatCard } from '../components/common/StatCard';
import { RoomCard } from '../components/common/RoomCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { GuestAvatar } from '../components/common/GuestAvatar';
import { Modal } from '../components/common/Modal';
import { Room, RoomStatus, HousekeepingTask } from '../types';
import { roomsApi } from '../services/rooms';
import { housekeepingApi } from '../services/housekeeping';
import { guestsApi } from '../services/guests';
import { useNotification } from '../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  BedDouble,
  Users,
  Sparkles,
  Wrench,
  Hotel,
  Plus,
  LogIn,
  LogOut,
  UserPlus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  Star,
  Quote,
  ShieldCheck,
  History,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { rooms, bookings, tasks, feedback, stats, auditLogs, currentUser, todayArrivals, todayDepartures, refreshAll } = useHotelData();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // Filters & State
  const [roomFilter, setRoomFilter] = useState<'All' | RoomStatus>('All');
  const [revenuePeriod, setRevenuePeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedRoomForStatus, setSelectedRoomForStatus] = useState<Room | null>(null);
  const [newStatus, setNewStatus] = useState<RoomStatus>('Available');

  // Mini Calendar State
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date(2026, 8, 19)); // Sep 2026

  // Quick Add Guest Modal state
  const [addGuestOpen, setAddGuestOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestCity, setNewGuestCity] = useState('');

  // Revenue Mock Data Series
  const revenueDataMap = {
    week: [
      { name: 'Mon', revenue: 145000, bookings: 12 },
      { name: 'Tue', revenue: 168000, bookings: 14 },
      { name: 'Wed', revenue: 195000, bookings: 18 },
      { name: 'Thu', revenue: 210000, bookings: 20 },
      { name: 'Fri', revenue: 285000, bookings: 26 },
      { name: 'Sat', revenue: 320000, bookings: 30 },
      { name: 'Sun', revenue: 240000, bookings: 22 },
    ],
    month: [
      { name: 'Week 1', revenue: 840000, bookings: 68 },
      { name: 'Week 2', revenue: 980000, bookings: 76 },
      { name: 'Week 3', revenue: 1245000, bookings: 94 },
      { name: 'Week 4', revenue: 1120000, bookings: 88 },
    ],
    year: [
      { name: 'Q1', revenue: 3200000, bookings: 240 },
      { name: 'Q2', revenue: 3850000, bookings: 310 },
      { name: 'Q3', revenue: 4500000, bookings: 390 },
      { name: 'Q4', revenue: 4200000, bookings: 360 },
    ],
  };

  // Occupancy Donut Chart Data dynamically derived from stats
  const occupancyDonutData = [
    { name: 'Occupied', value: Math.max(1, stats.occupiedRooms), color: '#1E293B' },
    { name: 'Available', value: Math.max(1, stats.availableRooms), color: '#B89758' },
    { name: 'Cleaning & Insp', value: Math.max(1, stats.cleaning + stats.inspection), color: '#D97706' },
    { name: 'Maintenance', value: Math.max(1, stats.maintenance), color: '#DC2626' },
  ];

  // Room Status Filter
  const filteredRooms = rooms.filter((r) => {
    if (roomFilter === 'All') return true;
    return r.status === roomFilter;
  });

  // Handle Quick Status Change
  const handleUpdateRoomStatus = async () => {
    if (!selectedRoomForStatus) return;
    await roomsApi.updateStatus(selectedRoomForStatus.id, newStatus);
    showToast(`Room ${selectedRoomForStatus.number} Updated`, `Status changed to ${newStatus}.`);
    setSelectedRoomForStatus(null);
    refreshAll();
  };

  // Quick Start / Progress Housekeeping Task
  const handleProgressTask = async (task: HousekeepingTask) => {
    if (task.status === 'Inspection') {
      navigate(`/housekeeping/${task.id}`);
      return;
    }

    let nextStatus = 'In Progress';
    if (task.status === 'Cleaning Required') nextStatus = 'In Progress';
    else if (task.status === 'In Progress') nextStatus = 'Inspection';

    await housekeepingApi.updateStatus(task.id, nextStatus as any);
    showToast(`Housekeeping Updated`, `Room ${task.roomNumber} task moved to ${nextStatus}.`);
    refreshAll();
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* 1. Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#FAF8F5] via-[#FDFCF9] to-[#F5EFE6] border border-[#EFE8DA] rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100 text-gold-900 border border-gold-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span>Royal Vista Front Desk Live · {currentUser.role} Session</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-navy-950 tracking-tight">
            Good Morning, {currentUser.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm sm:text-base text-navy-600 mt-2 font-medium leading-relaxed">
            Let's make today a great stay for our guests. {todayArrivals.length} arrivals and {todayDepartures.length} departures scheduled today.
          </p>
        </div>

        {/* Hero Right: Premium Hotel Lobby Image & Quote */}
        <div className="w-full md:w-80 lg:w-96 rounded-2xl overflow-hidden shadow-md border border-gold-200/80 relative flex-shrink-0 group">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=700&q=80"
            alt="Royal Vista Grand Lobby"
            className="w-full h-32 sm:h-36 object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-3.5 text-white">
            <p className="text-xs italic font-serif text-gold-200 flex items-center gap-1">
              <Quote className="w-3 h-3 text-gold-400 rotate-180 flex-shrink-0" />
              "Hospitality is not a service, it's a feeling."
            </p>
            <span className="text-[10px] text-gray-300 uppercase tracking-widest mt-1">Royal Vista Concierge</span>
          </div>
        </div>
      </div>

      {/* 2. Five Key Statistics Cards (100% Dynamic) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          label="Available Rooms"
          value={stats.availableRooms}
          subtext="Ready for check-in"
          icon={BedDouble}
          variant="gold"
          onClick={() => setRoomFilter('Available')}
        />
        <StatCard
          label="Occupied Rooms"
          value={stats.occupiedRooms}
          subtext="In-house guests"
          icon={Users}
          variant="navy"
          onClick={() => setRoomFilter('Occupied')}
        />
        <StatCard
          label="Cleaning"
          value={stats.cleaning}
          subtext={`${stats.inspection} in inspection`}
          icon={Sparkles}
          variant="amber"
          onClick={() => setRoomFilter('Cleaning')}
        />
        <StatCard
          label="Maintenance"
          value={stats.maintenance}
          subtext="Under inspection"
          icon={Wrench}
          variant="red"
          onClick={() => setRoomFilter('Maintenance')}
        />
        <StatCard
          label="Total Rooms"
          value={stats.totalRooms}
          subtext={`${stats.reserved} reserved`}
          icon={Hotel}
          variant="gold"
          onClick={() => setRoomFilter('All')}
        />
      </div>

      {/* 3. Four Large Clean Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <Link
          to="/bookings/new"
          className="gold-gradient-btn p-4 rounded-2xl flex items-center justify-between shadow-luxury group transition-transform active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs text-white">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs uppercase tracking-wider text-gold-100 font-semibold block">Booking</span>
              <span className="text-sm sm:text-base font-bold text-white block">+ New Booking</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/check-in"
          className="luxury-card p-4 rounded-2xl flex items-center justify-between bg-white hover:border-gold-300 group transition-transform active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <LogIn className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs uppercase tracking-wider text-navy-400 font-semibold block">Front Desk</span>
              <span className="text-sm sm:text-base font-bold text-navy-900 block">Check-in Guest</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-gold-700 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/check-out"
          className="luxury-card p-4 rounded-2xl flex items-center justify-between bg-white hover:border-gold-300 group transition-transform active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs uppercase tracking-wider text-navy-400 font-semibold block">Settlement</span>
              <span className="text-sm sm:text-base font-bold text-navy-900 block">Check-out Guest</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-gold-700 group-hover:translate-x-1 transition-transform" />
        </Link>

        <button
          onClick={() => setAddGuestOpen(true)}
          className="luxury-card p-4 rounded-2xl flex items-center justify-between bg-white hover:border-gold-300 group transition-transform active:scale-[0.99] text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gold-50 text-gold-800 rounded-xl border border-gold-200">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-navy-400 font-semibold block">Guest Profile</span>
              <span className="text-sm sm:text-base font-bold text-navy-900 block">+ Add Guest</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-gold-700 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 4. Two-Column Layout: Arrivals & Departures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Arrivals */}
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
          <div className="flex items-center justify-between pb-4 border-b border-cream-200">
            <div>
              <h3 className="text-base font-bold font-serif text-navy-950">Today's Arrivals</h3>
              <p className="text-xs text-navy-500">{todayArrivals.length} incoming guests scheduled for reception</p>
            </div>
            <Link
              to="/bookings"
              className="text-xs font-bold text-gold-700 hover:text-gold-900 flex items-center gap-1 group"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="divide-y divide-cream-100 mt-2">
            {todayArrivals.length > 0 ? (
              todayArrivals.slice(0, 3).map((b) => (
                <div key={b.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <GuestAvatar name={b.guestName} avatar={b.guestAvatar} vip={true} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-navy-900 truncate">{b.guestName}</p>
                      <p className="text-xs text-navy-500">
                        {b.adults} Guests · Room {b.roomNumber} ({b.roomType})
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex items-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-navy-900 block">{b.arrivalTime || '12:00 PM'}</span>
                      <StatusBadge status={b.status} size="sm" />
                    </div>
                    <button
                      onClick={() => navigate('/check-in')}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200 transition-colors"
                    >
                      Check-in
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-navy-400">No pending arrivals for today.</div>
            )}
          </div>
        </div>

        {/* Today's Departures */}
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
          <div className="flex items-center justify-between pb-4 border-b border-cream-200">
            <div>
              <h3 className="text-base font-bold font-serif text-navy-950">Today's Departures</h3>
              <p className="text-xs text-navy-500">{todayDepartures.length} guests concluding their stay</p>
            </div>
            <Link
              to="/bookings"
              className="text-xs font-bold text-gold-700 hover:text-gold-900 flex items-center gap-1 group"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="divide-y divide-cream-100 mt-2">
            {todayDepartures.length > 0 ? (
              todayDepartures.slice(0, 3).map((b) => (
                <div key={b.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <GuestAvatar name={b.guestName} avatar={b.guestAvatar} vip={true} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-navy-900 truncate">{b.guestName}</p>
                      <p className="text-xs text-navy-500">
                        {b.adults} Guests · Room {b.roomNumber} ({b.roomType})
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex items-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-navy-900 block">{b.departureTime || '11:00 AM'}</span>
                      <StatusBadge status={b.status} size="sm" />
                    </div>
                    {b.status === 'Checked In' && (
                      <button
                        onClick={() => navigate('/check-out')}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold border border-amber-200 transition-colors"
                      >
                        Checkout
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-navy-400">No departures today.</div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Major Section: Room Status Grid with Live Filter Tabs */}
      <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-200">
          <div>
            <h2 className="text-lg font-bold font-serif text-navy-950">Room Status Overview</h2>
            <p className="text-xs text-navy-500">Live operational state across floors</p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-cream-100 rounded-xl border border-cream-200">
            {(['All', 'Available', 'Reserved', 'Occupied', 'Cleaning', 'Inspection', 'Maintenance'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setRoomFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  roomFilter === filter
                    ? 'bg-white text-navy-950 shadow-sm'
                    : 'text-navy-600 hover:text-navy-950'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          {filteredRooms.slice(0, 8).map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onStatusClick={(r) => {
                setSelectedRoomForStatus(r);
                setNewStatus(r.status);
              }}
              onEditClick={(r) => navigate(`/rooms/${r.id}`)}
            />
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-cream-200 flex items-center justify-between text-xs text-navy-500">
          <span>Showing {Math.min(filteredRooms.length, 8)} of {rooms.length} registered rooms</span>
          <Link
            to="/rooms"
            className="font-bold text-gold-700 hover:text-gold-900 flex items-center gap-1"
          >
            <span>Explore all rooms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 6. Middle Grid: Monthly Calendar & Housekeeping Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compact Monthly Calendar */}
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-cream-200">
              <h3 className="text-base font-bold font-serif text-navy-950">Hotel Calendar</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1)))}
                  className="p-1 text-navy-400 hover:text-navy-700 hover:bg-cream-100 rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-navy-900 px-1">
                  {currentCalendarDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1)))}
                  className="p-1 text-navy-400 hover:text-navy-700 hover:bg-cream-100 rounded-lg"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-navy-400 py-3">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              <span className="py-2 text-navy-300">30</span>
              <span className="py-2 text-navy-300">31</span>
              {Array.from({ length: 30 }).map((_, i) => {
                const day = i + 1;
                const isToday = day === 19;
                const hasArrivals = day === 19 || day === 20 || day === 22;

                return (
                  <button
                    key={day}
                    className={`py-2 rounded-xl text-xs font-semibold relative transition-colors ${
                      isToday
                        ? 'bg-gold-600 text-white font-bold shadow-sm'
                        : 'text-navy-700 hover:bg-cream-100'
                    }`}
                  >
                    {day}
                    {hasArrivals && !isToday && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-cream-200 flex items-center justify-between text-[11px] text-navy-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gold-600" /> Today (19 Sep)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gold-400" /> Arrivals Active
            </span>
          </div>
        </div>

        {/* Housekeeping Tasks Card */}
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-cream-200">
              <div>
                <h3 className="text-base font-bold font-serif text-navy-950">Housekeeping Tasks</h3>
                <p className="text-xs text-navy-500">Live turnover and inspection queue</p>
              </div>
              <Link
                to="/housekeeping"
                className="text-xs font-bold text-gold-700 hover:text-gold-900 flex items-center gap-1 group"
              >
                <span>Full Checklist</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="divide-y divide-cream-100 mt-2">
              {tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-cream-100 text-navy-800 rounded-xl font-bold text-xs font-mono">
                      {task.roomNumber}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-navy-900">Room {task.roomNumber}</span>
                        <span className="text-xs text-navy-500">({task.roomType})</span>
                        <StatusBadge status={task.status} size="sm" />
                      </div>
                      <p className="text-xs text-navy-500 truncate mt-0.5">
                        Assigned: {task.assignedStaffName} · Est: {task.timeEstimate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleProgressTask(task)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gold-50 hover:bg-gold-100 text-gold-900 border border-gold-300 transition-colors"
                    >
                      {task.status === 'Cleaning Required' ? 'Start' : task.status === 'In Progress' ? 'Inspect' : 'Review'}
                    </button>
                    <Link
                      to={`/housekeeping/${task.id}`}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cream-100 hover:bg-cream-200 text-navy-800 border border-cream-200 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-cream-200 flex items-center justify-between text-xs text-navy-500">
            <span>{tasks.filter((t) => t.status !== 'Completed').length} active housekeeping tasks pending</span>
            <span className="text-gold-700 font-medium">Standard Turnover: 35 mins</span>
          </div>
        </div>
      </div>

      {/* 7. Revenue & Occupancy Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Overview Chart */}
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-200">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-navy-400">Revenue Overview</p>
              <h3 className="text-2xl font-bold font-serif text-navy-950 mt-0.5">
                ₹{stats.totalRevenue.toLocaleString()}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-cream-100 rounded-xl border border-cream-200 self-start sm:self-auto">
              {(['week', 'month', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setRevenuePeriod(period)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-all ${
                    revenuePeriod === period ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500 hover:text-navy-900'
                  }`}
                >
                  This {period}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueDataMap[revenuePeriod]}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A880" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C5A880" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#EFE8DA',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#B89758"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Donut Breakdown */}
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-cream-200">
              <h3 className="text-base font-bold font-serif text-navy-950">Occupancy</h3>
              <span className="px-2.5 py-0.5 bg-gold-100 text-gold-900 border border-gold-300 rounded-full text-xs font-bold">
                {stats.occupancyRate}% Live
              </span>
            </div>

            <div className="h-44 relative my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={74}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {occupancyDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} Rooms`, name]}
                    contentStyle={{ borderRadius: '10px', borderColor: '#EFE8DA' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-navy-950">{stats.occupancyRate}%</span>
                <span className="text-[10px] text-navy-500 font-semibold uppercase tracking-wider">Occupied</span>
              </div>
            </div>

            {/* Breakdown Legend */}
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-navy-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-navy-800" /> Occupied
                </span>
                <span className="font-bold text-navy-950">{stats.occupiedRooms} rooms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-navy-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-gold-600" /> Available
                </span>
                <span className="font-bold text-navy-950">{stats.availableRooms} rooms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-navy-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Cleaning
                </span>
                <span className="font-bold text-navy-950">{stats.cleaning} rooms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-navy-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Maintenance
                </span>
                <span className="font-bold text-navy-950">{stats.maintenance} rooms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Recent Feedback & Live Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Feedback Preview */}
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
          <div className="flex items-center justify-between pb-4 border-b border-cream-200">
            <div>
              <h3 className="text-base font-bold font-serif text-navy-950">Recent Guest Feedback</h3>
              <p className="text-xs text-navy-500">Verified guest reviews and ratings</p>
            </div>
            <Link
              to="/feedback"
              className="text-xs font-bold text-gold-700 hover:text-gold-900 flex items-center gap-1 group"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="space-y-3 mt-4">
            {feedback.slice(0, 2).map((item) => (
              <div key={item.id} className="p-3.5 bg-cream-50/70 border border-cream-200 rounded-2xl">
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <GuestAvatar name={item.guestName} avatar={item.guestAvatar} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-navy-950">{item.guestName}</p>
                      <p className="text-[10px] text-navy-500">Room {item.roomNumber} · {item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(item.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-navy-700 italic leading-relaxed">"{item.comment}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Operational Audit Log Feed */}
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
          <div className="flex items-center justify-between pb-4 border-b border-cream-200">
            <div>
              <h3 className="text-base font-bold font-serif text-navy-950 flex items-center gap-2">
                <History className="w-4 h-4 text-gold-600" />
                Live Operational Audit Log
              </h3>
              <p className="text-xs text-navy-500">Real-time trace of front desk, housekeeping &amp; engineering</p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold">
              Live
            </span>
          </div>

          <div className="divide-y divide-cream-100 max-h-56 overflow-y-auto mt-2">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="py-2.5 text-xs">
                <div className="flex items-center justify-between text-[11px] mb-0.5">
                  <span className="font-bold text-navy-950 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-600" />
                    {log.action}
                  </span>
                  <span className="text-navy-400 font-mono">{log.time}</span>
                </div>
                <p className="text-navy-600 text-[11px] pl-3">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Status Change Modal */}
      <Modal
        isOpen={!!selectedRoomForStatus}
        onClose={() => setSelectedRoomForStatus(null)}
        title={`Change Status — Room ${selectedRoomForStatus?.number}`}
        subtitle={`${selectedRoomForStatus?.type} · Floor ${selectedRoomForStatus?.floor}`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-navy-600">
            Select the new operational status for Room {selectedRoomForStatus?.number}:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {(['Available', 'Reserved', 'Occupied', 'Cleaning', 'Inspection', 'Maintenance', 'Out of Service'] as RoomStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setNewStatus(st)}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  newStatus === st
                    ? 'border-gold-500 bg-gold-50 text-gold-950 ring-2 ring-gold-200'
                    : 'border-cream-200 bg-white text-navy-700 hover:bg-cream-50'
                }`}
              >
                <StatusBadge status={st} showDot={false} size="sm" />
                <span className="capitalize">{st}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
            <button
              onClick={() => setSelectedRoomForStatus(null)}
              className="px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-cream-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateRoomStatus}
              className="gold-gradient-btn px-5 py-2 text-xs font-bold rounded-xl shadow-sm"
            >
              Save Status
            </button>
          </div>
        </div>
      </Modal>

      {/* Quick Add Guest Modal */}
      <Modal
        isOpen={addGuestOpen}
        onClose={() => setAddGuestOpen(false)}
        title="Register New Guest Profile"
        subtitle="Quick check-in registration"
        maxWidth="md"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newGuestName || !newGuestPhone) {
              showToast('Validation Error', 'Name and phone are required.', 'error');
              return;
            }

            await guestsApi.create({
              name: newGuestName,
              phone: newGuestPhone,
              email: newGuestEmail || 'guest@domain.com',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
              address: newGuestCity || 'Bangalore, India',
              idType: 'Passport',
              idNumberMasked: '•••• •••• 5678',
              vip: false,
              notes: 'Registered from front desk quick action.',
            });

            showToast('Guest Added', `${newGuestName} has been registered successfully.`);
            setAddGuestOpen(false);
            setNewGuestName('');
            setNewGuestPhone('');
            setNewGuestEmail('');
            setNewGuestCity('');
            refreshAll();
            navigate('/guests');
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Vikram Malhotra"
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50/70 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98000 00000"
                value={newGuestPhone}
                onChange={(e) => setNewGuestPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50/70 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="guest@domain.com"
                value={newGuestEmail}
                onChange={(e) => setNewGuestEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50/70 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">City / Address</label>
            <input
              type="text"
              placeholder="e.g. Mumbai, India"
              value={newGuestCity}
              onChange={(e) => setNewGuestCity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50/70 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
            <button
              type="button"
              onClick={() => setAddGuestOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-cream-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-gradient-btn px-5 py-2 text-xs font-bold rounded-xl shadow-sm"
            >
              Create Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
