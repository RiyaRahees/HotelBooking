import React, { useState } from 'react';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { housekeepingApi } from '../services/housekeeping';
import { useNotification } from '../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, Clock, User, Filter, ArrowRight, CheckSquare } from 'lucide-react';
import { HousekeepingStatus, HousekeepingTask } from '../types';

export const Housekeeping: React.FC = () => {
  const { tasks, rooms, staff, refreshAll } = useHotelData();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [assignModalTask, setAssignModalTask] = useState<HousekeepingTask | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const housekeepingStaff = staff.filter((s) => s.role === 'Housekeeping' || s.role === 'Manager');

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const handleQuickAdvance = async (task: HousekeepingTask) => {
    let nextStatus: HousekeepingStatus = 'In Progress';
    if (task.status === 'Cleaning Required') nextStatus = 'In Progress';
    else if (task.status === 'In Progress') nextStatus = 'Inspection';
    else if (task.status === 'Inspection') nextStatus = 'Completed';

    await housekeepingApi.updateStatus(task.id, nextStatus);
    showToast(
      'Housekeeping Updated',
      `Room ${task.roomNumber} moved to ${nextStatus}${nextStatus === 'Completed' ? ' (Room is now Available)' : ''}.`
    );
    refreshAll();
  };

  const handleAssignStaff = async () => {
    if (!assignModalTask) return;
    const staffMember = staff.find((s) => s.id === selectedStaffId);
    if (!staffMember) return;

    await housekeepingApi.updateTask(assignModalTask.id, {
      assignedStaffId: staffMember.id,
      assignedStaffName: staffMember.name,
    });

    showToast('Staff Assigned', `${staffMember.name} assigned to Room ${assignModalTask.roomNumber}.`);
    setAssignModalTask(null);
    refreshAll();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <PageHeader
        title="Housekeeping &amp; Turnaround"
        subtitle="Manage room sanitization schedules, 8-point inspection checklists, and staff assignments"
        icon={Sparkles}
      />

      {/* Filter Tabs */}
      <div className="luxury-card p-4 bg-white rounded-2xl border border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-cream-100 rounded-xl border border-cream-200">
          {(['All', 'Cleaning Required', 'In Progress', 'Inspection', 'Completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-white text-navy-950 shadow-sm'
                  : 'text-navy-600 hover:text-navy-950'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-cream-50 border border-cream-200 rounded-xl text-xs font-semibold text-navy-800 focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Housekeeping Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTasks.map((task) => {
          const completedCount = task.checklist.filter((i) => i.completed).length;
          const totalCount = task.checklist.length;
          const progressPercent = Math.round((completedCount / totalCount) * 100);

          return (
            <div
              key={task.id}
              className="luxury-card bg-white rounded-2xl border border-cream-200 p-5 flex flex-col justify-between group transition-all duration-200"
            >
              <div>
                {/* Top Badge Info */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-cream-100 rounded-xl font-bold font-mono text-sm text-navy-900 border border-cream-200">
                      {task.roomNumber}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-navy-950 font-serif">Room {task.roomNumber}</h4>
                      <p className="text-[11px] text-navy-500 font-medium">{task.roomType} · {task.taskType}</p>
                    </div>
                  </div>
                  <StatusBadge status={task.status} size="sm" />
                </div>

                {/* Priority & Estimate */}
                <div className="flex items-center justify-between text-[11px] text-navy-500 py-2 border-y border-cream-100 mb-3">
                  <span className="flex items-center gap-1 font-semibold text-navy-700">
                    <Clock className="w-3.5 h-3.5 text-gold-600" />
                    Est. {task.timeEstimate}
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      task.priority === 'High' || task.priority === 'Urgent'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-cream-100 text-navy-700'
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                </div>

                {/* Checklist Progress Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-navy-700 flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-gold-600" />
                      Checklist Progress
                    </span>
                    <span className="font-bold text-navy-900 font-mono">{completedCount}/{totalCount} Items</span>
                  </div>
                  <div className="w-full bg-cream-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        progressPercent === 100 ? 'bg-emerald-600' : 'bg-gold-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Staff Assignment */}
                <div className="flex items-center justify-between text-xs mb-4">
                  <span className="text-navy-500">Assigned:</span>
                  <button
                    onClick={() => {
                      setAssignModalTask(task);
                      setSelectedStaffId(task.assignedStaffId || housekeepingStaff[0]?.id);
                    }}
                    className="font-bold text-navy-800 hover:text-gold-700 flex items-center gap-1 underline underline-offset-2"
                  >
                    <User className="w-3.5 h-3.5 text-navy-400" />
                    <span>{task.assignedStaffName || 'Unassigned'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-cream-200">
                <Link
                  to={`/housekeeping/${task.id}`}
                  className="py-2 bg-cream-100 hover:bg-cream-200 text-navy-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Checklist</span>
                </Link>

                <button
                  onClick={() => handleQuickAdvance(task)}
                  className="gold-gradient-btn py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>
                    {task.status === 'Cleaning Required'
                      ? 'Start Clean'
                      : task.status === 'In Progress'
                      ? 'Mark Inspection'
                      : task.status === 'Inspection'
                      ? 'Mark Available'
                      : 'Completed'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Staff Assignment Modal */}
      <Modal
        isOpen={!!assignModalTask}
        onClose={() => setAssignModalTask(null)}
        title={`Assign Staff — Room ${assignModalTask?.roomNumber}`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <label className="block text-xs font-bold text-navy-900">Select Housekeeping Attendant</label>
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 focus:outline-none"
          >
            {housekeepingStaff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.department} — Shift: {s.shift.split(' ')[0]})
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
            <button
              onClick={() => setAssignModalTask(null)}
              className="px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-cream-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignStaff}
              className="gold-gradient-btn px-5 py-2 text-xs font-bold rounded-xl shadow-sm"
            >
              Confirm Assignment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
