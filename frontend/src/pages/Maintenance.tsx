import React, { useState } from 'react';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { maintenanceApi } from '../services/maintenance';
import { useNotification } from '../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react';
import { MaintenanceCategory, MaintenancePriority, MaintenanceStatus } from '../types';

export const Maintenance: React.FC = () => {
  const { maintenance, rooms, staff, refreshAll } = useHotelData();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Add Issue Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || '');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueCategory, setIssueCategory] = useState<MaintenanceCategory>('HVAC');
  const [issuePriority, setIssuePriority] = useState<MaintenancePriority>('High');
  const [assignedStaffId, setAssignedStaffId] = useState('staff-5');
  const [costEstimate, setCostEstimate] = useState(1500);

  const maintenanceStaff = staff.filter((s) => s.role === 'Maintenance' || s.department.includes('Engineering'));

  const filteredIssues = maintenance.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || issue.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle) {
      showToast('Validation Error', 'Issue title is required.', 'error');
      return;
    }

    const room = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
    const tech = staff.find((s) => s.id === assignedStaffId);

    await maintenanceApi.create({
      roomId: room.id,
      roomNumber: room.number,
      roomType: room.type,
      title: issueTitle,
      description: issueDescription,
      category: issueCategory,
      priority: issuePriority,
      status: 'Open',
      assignedStaffId: tech?.id,
      assignedStaffName: tech?.name,
      costEstimate: Number(costEstimate),
    });

    showToast('Maintenance Ticket Logged', `Ticket created for Room ${room.number}.`);
    setReportModalOpen(false);
    setIssueTitle('');
    setIssueDescription('');
    refreshAll();
  };

  const handleQuickStatusChange = async (issueId: string, nextStatus: MaintenanceStatus) => {
    await maintenanceApi.updateStatus(issueId, nextStatus);
    showToast('Status Updated', `Issue moved to ${nextStatus}.`);
    refreshAll();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <PageHeader
        title="Maintenance &amp; Engineering"
        subtitle="Log equipment service requests, monitor repair lifecycles and assign engineering technicians"
        icon={Wrench}
        actions={
          <button
            onClick={() => setReportModalOpen(true)}
            className="gold-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-luxury"
          >
            <Plus className="w-4 h-4" />
            <span>+ Report Issue</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="luxury-card p-4 bg-white rounded-2xl border border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            placeholder="Search issue title, room, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs font-semibold text-navy-800 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Fixed">Fixed</option>
            <option value="Verified">Verified</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs font-semibold text-navy-800 focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Maintenance Table */}
      <div className="luxury-card bg-white rounded-2xl border border-cream-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-50/70 border-b border-cream-200 text-navy-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4">Room</th>
                <th className="p-4">Issue Description</th>
                <th className="p-4">Category</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Assigned Tech</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filteredIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-cream-50/50 transition-colors">
                  <td className="p-4">
                    <span className="font-serif font-bold text-sm text-navy-950 block">Room {issue.roomNumber}</span>
                    <span className="text-[10px] text-navy-400">{issue.roomType}</span>
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="font-bold text-navy-900 truncate">{issue.title}</p>
                    <p className="text-[11px] text-navy-500 truncate">{issue.description}</p>
                  </td>
                  <td className="p-4 font-semibold text-navy-800">{issue.category}</td>
                  <td className="p-4">
                    <StatusBadge status={issue.priority} size="sm" />
                  </td>
                  <td className="p-4 font-medium text-navy-800">
                    {issue.assignedStaffName || 'Unassigned'}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={issue.status} size="sm" />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {issue.status === 'Open' && (
                        <button
                          onClick={() => handleQuickStatusChange(issue.id, 'In Progress')}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold border border-amber-200 text-[11px]"
                        >
                          Start Repair
                        </button>
                      )}
                      {issue.status === 'In Progress' && (
                        <button
                          onClick={() => handleQuickStatusChange(issue.id, 'Fixed')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold border border-emerald-200 text-[11px]"
                        >
                          Mark Fixed
                        </button>
                      )}
                      <Link
                        to={`/maintenance/${issue.id}`}
                        className="p-1.5 bg-cream-100 hover:bg-cream-200 text-navy-700 rounded-lg"
                        title="View Ticket"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Issue Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report New Maintenance Issue"
        subtitle="Log equipment defect or guest maintenance request"
        maxWidth="md"
      >
        <form onSubmit={handleCreateIssue} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Affected Room *</label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 focus:outline-none"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.number} ({r.type} — Floor {r.floor})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Issue Category</label>
              <select
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 focus:outline-none"
              >
                <option value="HVAC">HVAC / Air Conditioning</option>
                <option value="Plumbing">Plumbing / Water Pressure</option>
                <option value="Electrical">Electrical &amp; Lighting</option>
                <option value="Carpentry">Carpentry &amp; Locks</option>
                <option value="Appliance">Appliance / Mini-bar</option>
                <option value="Other">Other Fixtures</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Issue Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Balcony Door Latch Jammed"
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Detailed Description</label>
            <textarea
              rows={3}
              placeholder="Describe symptoms, noise, leaks or error codes..."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Urgency Priority</label>
              <select
                value={issuePriority}
                onChange={(e) => setIssuePriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 focus:outline-none"
              >
                <option value="Urgent">Urgent (Immediate Service)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Assign Engineering Tech</label>
              <select
                value={assignedStaffId}
                onChange={(e) => setAssignedStaffId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 focus:outline-none"
              >
                {maintenanceStaff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
            <button
              type="button"
              onClick={() => setReportModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-cream-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-gradient-btn px-5 py-2 text-xs font-bold rounded-xl shadow-sm"
            >
              Log Issue Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
