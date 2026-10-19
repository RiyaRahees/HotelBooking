import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { housekeepingApi } from '../services/housekeeping';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  Clock,
  User,
  CheckSquare,
  Square,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  XCircle,
  FileCheck,
} from 'lucide-react';
import { HousekeepingStatus } from '../types';

export const HousekeepingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { tasks, currentUser, refreshAll } = useHotelData();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [inspectionDecision, setInspectionDecision] = useState<'approve' | 'reject'>('approve');
  const [inspectionNotes, setInspectionNotes] = useState('');

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-cream-200">
        <h3 className="text-lg font-bold text-navy-900">Task Not Found</h3>
        <p className="text-xs text-navy-500 mt-1">No housekeeping assignment matches ID {id}.</p>
        <Link to="/housekeeping" className="mt-4 inline-block gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold">
          Back to Housekeeping
        </Link>
      </div>
    );
  }

  const handleToggleItem = async (itemId: string) => {
    const updatedChecklist = task.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    await housekeepingApi.updateChecklist(task.id, updatedChecklist);
    refreshAll();
  };

  const handleCheckAll = async () => {
    const allChecked = task.checklist.map((item) => ({ ...item, completed: true }));
    await housekeepingApi.updateChecklist(task.id, allChecked);
    showToast('Checklist Completed', `All 8 inspection items verified for Room ${task.roomNumber}.`);
    refreshAll();
  };

  const handleSubmitForInspection = async () => {
    await housekeepingApi.updateStatus(task.id, 'Inspection');
    showToast(
      'Submitted for Inspection',
      `Room ${task.roomNumber} is now marked as Inspection. Awaiting supervisor sign-off.`
    );
    refreshAll();
  };

  const handleProcessInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    const isApproved = inspectionDecision === 'approve';

    await housekeepingApi.inspectRoom(
      task.id,
      isApproved,
      inspectionNotes,
      currentUser.name
    );

    if (isApproved) {
      try {
        confetti({
          particleCount: 70,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#10B981', '#B89758', '#0F172A'],
        });
      } catch (e) {}

      showToast(
        'Inspection Approved! ✨',
        `Room ${task.roomNumber} is now certified and marked Available for reception check-in.`
      );
    } else {
      showToast(
        'Inspection Rejected',
        `Room ${task.roomNumber} returned to Cleaning Required. Notes logged for housekeeping.`
      );
    }

    setInspectionModalOpen(false);
    refreshAll();
  };

  const completedCount = task.checklist.filter((i) => i.completed).length;
  const totalCount = task.checklist.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl mx-auto">
      <Link
        to="/housekeeping"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-600 hover:text-gold-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Housekeeping Queue</span>
      </Link>

      <PageHeader
        title={`Room ${task.roomNumber} — Turnover &amp; Sanitization`}
        subtitle={`${task.roomType} · Task: ${task.taskType} · Priority: ${task.priority}`}
        badge={task.status}
      />

      {/* Progress & Supervisor Summary Bar */}
      <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-navy-400">Sanitization Progress</span>
            <h3 className="text-2xl font-bold font-serif text-navy-950 mt-0.5">
              {completedCount} of {totalCount} Items Completed ({progressPercent}%)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCheckAll}
              className="px-3.5 py-2 bg-cream-100 hover:bg-cream-200 text-navy-800 rounded-xl text-xs font-bold border border-cream-200 transition-colors"
            >
              Select All 8 Items
            </button>

            {task.status === 'Cleaning Required' && (
              <button
                onClick={() => housekeepingApi.updateStatus(task.id, 'In Progress').then(() => refreshAll())}
                className="gold-gradient-btn px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-luxury"
              >
                <span>Start Cleaning</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {task.status === 'In Progress' && (
              <button
                onClick={handleSubmitForInspection}
                className="gold-gradient-btn px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-luxury"
              >
                <FileCheck className="w-4 h-4" />
                <span>Send for Inspection</span>
              </button>
            )}

            {task.status === 'Inspection' && (
              <button
                onClick={() => setInspectionModalOpen(true)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Review &amp; Inspect Room</span>
              </button>
            )}
          </div>
        </div>

        <div className="w-full bg-cream-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              progressPercent === 100 ? 'bg-emerald-600' : 'bg-gold-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Inspection Feedback (if previously logged) */}
      {task.inspectionNotes && (
        <div className="p-4 bg-gold-50/70 border border-gold-200 rounded-2xl text-xs space-y-1">
          <span className="font-bold text-gold-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-gold-700" />
            Supervisor Inspection Remarks (by {task.inspectedBy || 'Floor Lead'}):
          </span>
          <p className="text-navy-800">{task.inspectionNotes}</p>
        </div>
      )}

      {/* 8-Point Interactive Luxury Cleaning Checklist */}
      <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-navy-400 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold-600" />
          Standard 8-Point Luxury Cleaning Checklist
        </h3>

        <div className="divide-y divide-cream-100">
          {task.checklist.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => handleToggleItem(item.id)}
              className={`py-3.5 px-3 flex items-center justify-between rounded-xl cursor-pointer transition-all ${
                item.completed ? 'bg-emerald-50/40 hover:bg-emerald-50/60' : 'hover:bg-cream-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <button className="flex-shrink-0 text-navy-700">
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5 text-navy-400 hover:text-navy-700" />
                  )}
                </button>
                <span
                  className={`text-xs font-semibold ${
                    item.completed ? 'text-navy-900 line-through opacity-80' : 'text-navy-900'
                  }`}
                >
                  {idx + 1}. {item.label}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  item.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-cream-200 text-navy-600'
                }`}
              >
                {item.completed ? 'Done' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Guidance & Status State Machine */}
      <div className="p-4 bg-cream-50 border border-cream-200 rounded-2xl text-xs space-y-2 text-navy-700">
        <span className="font-bold text-navy-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-gold-600" />
          Royal Vista SOP Workflow:
        </span>
        <p className="leading-relaxed text-navy-600">
          <strong>Cleaning Required</strong> → Staff begins room overhaul (<strong>In Progress</strong>) → All 8 items checked
          → Supervisor floor audit (<strong>Inspection</strong>) → <strong>Available</strong> (Room unlocked in reception inventory).
        </p>
      </div>

      {/* Supervisor Inspection Modal */}
      <Modal
        isOpen={inspectionModalOpen}
        onClose={() => setInspectionModalOpen(false)}
        title={`Supervisor Room Inspection — Room ${task.roomNumber}`}
        subtitle={`Inspector: ${currentUser.name} (${currentUser.role})`}
        maxWidth="md"
      >
        <form onSubmit={handleProcessInspection} className="space-y-4">
          <p className="text-xs text-navy-600">
            Review the 8-point cleaning standards and choose whether to approve the room for immediate guest check-in or send it back for rectification:
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setInspectionDecision('approve')}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                inspectionDecision === 'approve'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200'
                  : 'border-cream-200 bg-white text-navy-700'
              }`}
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span className="text-xs font-bold">Approve Room</span>
              <span className="text-[10px] text-emerald-700">Mark Room as Available</span>
            </button>

            <button
              type="button"
              onClick={() => setInspectionDecision('reject')}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                inspectionDecision === 'reject'
                  ? 'border-red-500 bg-red-50 text-red-950 ring-2 ring-red-200'
                  : 'border-cream-200 bg-white text-navy-700'
              }`}
            >
              <XCircle className="w-6 h-6 text-red-600" />
              <span className="text-xs font-bold">Reject &amp; Re-clean</span>
              <span className="text-[10px] text-red-700">Send Back to Cleaning</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Inspection Notes / Remarks {inspectionDecision === 'reject' && '*'}
            </label>
            <textarea
              rows={3}
              required={inspectionDecision === 'reject'}
              placeholder={
                inspectionDecision === 'approve'
                  ? 'e.g. Excellent linen presentation and aroma.'
                  : 'e.g. Bathroom mirror has streaks; replace towels.'
              }
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
              className="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
            <button
              type="button"
              onClick={() => setInspectionModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-cream-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold rounded-xl text-white shadow-sm transition-all ${
                inspectionDecision === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {inspectionDecision === 'approve' ? 'Confirm Approval (Available)' : 'Submit Rejection (Cleaning)'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
