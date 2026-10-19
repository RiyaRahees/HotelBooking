import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { maintenanceApi } from '../services/maintenance';
import { useNotification } from '../context/NotificationContext';
import {
  Wrench,
  ChevronLeft,
  Clock,
  User,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Building,
  Edit2,
  Check,
} from 'lucide-react';
import { MaintenanceStatus } from '../types';

export const MaintenanceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { maintenance, refreshAll } = useHotelData();
  const { showToast } = useNotification();

  const issue = maintenance.find((m) => m.id === id);

  const [notesEditing, setNotesEditing] = useState(false);
  const [techNotes, setTechNotes] = useState(issue?.notes || '');

  if (!issue) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-cream-200">
        <h3 className="text-lg font-bold text-navy-900">Issue Ticket Not Found</h3>
        <p className="text-xs text-navy-500 mt-1">No ticket matches ID {id}.</p>
        <Link to="/maintenance" className="mt-4 inline-block gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold">
          Back to Maintenance
        </Link>
      </div>
    );
  }

  const handleUpdateStatus = async (nextStatus: MaintenanceStatus) => {
    await maintenanceApi.updateStatus(issue.id, nextStatus);
    showToast('Status Updated', `Issue moved to ${nextStatus}.`);
    refreshAll();
  };

  const handleSaveNotes = async () => {
    await maintenanceApi.update(issue.id, { notes: techNotes });
    showToast('Notes Saved', 'Technician remarks updated.');
    setNotesEditing(false);
    refreshAll();
  };

  const lifecycle: MaintenanceStatus[] = ['Open', 'Assigned', 'In Progress', 'Fixed', 'Verified'];
  const currentIndex = lifecycle.indexOf(issue.status);

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl mx-auto">
      <Link
        to="/maintenance"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-600 hover:text-gold-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Maintenance Queue</span>
      </Link>

      <PageHeader
        title={`Ticket #${issue.id} — ${issue.title}`}
        subtitle={`Room ${issue.roomNumber} (${issue.roomType}) · Category: ${issue.category}`}
        badge={issue.status}
      />

      {/* Lifecycle Progress Bar */}
      <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400 mb-4">Repair Lifecycle</h3>
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-cream-200 z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gold-600 z-0 transition-all duration-300"
            style={{ width: `${(currentIndex / (lifecycle.length - 1)) * 100}%` }}
          />

          {lifecycle.map((st, i) => {
            const isDone = i <= currentIndex;
            const isCurrent = i === currentIndex;

            return (
              <div key={st} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone ? 'bg-gold-600 text-white shadow-xs' : 'bg-white border-2 border-cream-300 text-navy-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-[10px] font-bold mt-1.5 hidden sm:block ${
                    isCurrent ? 'text-navy-950 font-bold' : 'text-navy-400'
                  }`}
                >
                  {st}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Issue Description & Notes */}
        <div className="md:col-span-2 space-y-6">
          <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400 mb-2">Description &amp; Symptoms</h3>
            <p className="text-xs text-navy-700 leading-relaxed p-4 bg-cream-50 rounded-xl border border-cream-200">
              {issue.description || 'No additional symptom details recorded.'}
            </p>

            <div className="pt-4 mt-4 border-t border-cream-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy-400">Technician Remarks</h4>
                {!notesEditing ? (
                  <button onClick={() => setNotesEditing(true)} className="p-1 text-navy-400 hover:text-navy-700">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSaveNotes}
                    className="px-2 py-0.5 bg-gold-600 text-white rounded text-[11px] font-bold flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Save
                  </button>
                )}
              </div>

              {notesEditing ? (
                <textarea
                  rows={3}
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  className="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
                />
              ) : (
                <p className="text-xs text-navy-700 italic p-3 bg-cream-50/70 rounded-xl border border-cream-200">
                  "{issue.notes || 'No technician remarks entered yet.'}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Specs & Actions */}
        <div className="space-y-6">
          <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200 space-y-4 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400 mb-2">Ticket Metadata</h3>

            <div className="flex justify-between py-1.5 border-b border-cream-100">
              <span className="text-navy-400">Priority:</span>
              <StatusBadge status={issue.priority} size="sm" />
            </div>

            <div className="flex justify-between py-1.5 border-b border-cream-100">
              <span className="text-navy-400">Category:</span>
              <span className="font-bold text-navy-900">{issue.category}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-cream-100">
              <span className="text-navy-400">Assigned Tech:</span>
              <span className="font-bold text-navy-900">{issue.assignedStaffName || 'Carlos Mendez'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-cream-100">
              <span className="text-navy-400">Cost Estimate:</span>
              <span className="font-bold text-navy-900">₹{(issue.costEstimate || 1500).toLocaleString()}</span>
            </div>

            {/* Quick Progression Buttons */}
            <div className="pt-4 space-y-2">
              <button
                onClick={() => handleUpdateStatus('In Progress')}
                className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold text-xs"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleUpdateStatus('Fixed')}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl font-bold text-xs"
              >
                Mark Fixed
              </button>
              <button
                onClick={() => handleUpdateStatus('Verified')}
                className="w-full gold-gradient-btn py-2 rounded-xl font-bold text-xs shadow-xs"
              >
                Supervisor Verified &amp; Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
