import React, { useState } from 'react';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { staffApi } from '../services/staff';
import { useNotification } from '../context/NotificationContext';
import { UserCheck, UserPlus, Search, Edit3, Shield, Mail, Phone, Clock } from 'lucide-react';
import { Staff as StaffType, StaffRole, StaffStatus } from '../types';

export const Staff: React.FC = () => {
  const { staff, refreshAll } = useHotelData();
  const { showToast } = useNotification();

  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editMember, setEditMember] = useState<StaffType | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole>('Receptionist');
  const [department, setDepartment] = useState('Front Office');
  const [status, setStatus] = useState<StaffStatus>('Active');
  const [shift, setShift] = useState<StaffType['shift']>('Morning (6 AM - 2 PM)');

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'All' || s.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      showToast('Validation Error', 'Name and email are required.', 'error');
      return;
    }

    await staffApi.create({
      name,
      email,
      phone: phone || '+91 98000 11229',
      role,
      department,
      status,
      shift,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    });

    showToast('Staff Registered', `${name} registered as ${role}.`);
    setAddModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    refreshAll();
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMember) return;

    await staffApi.update(editMember.id, {
      role,
      department,
      status,
      shift,
    });

    showToast('Staff Updated', `${editMember.name}'s profile updated.`);
    setEditMember(null);
    refreshAll();
  };

  const handleOpenEdit = (s: StaffType) => {
    setEditMember(s);
    setRole(s.role);
    setDepartment(s.department);
    setStatus(s.status);
    setShift(s.shift);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <PageHeader
        title="Staff &amp; Workforce Management"
        subtitle="Manage hotel personnel roster, duty shifts, access tiers and department allocations"
        icon={UserCheck}
        actions={
          <button
            onClick={() => setAddModalOpen(true)}
            className="gold-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-luxury"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Staff Member</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="luxury-card p-4 bg-white rounded-2xl border border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            placeholder="Search staff name, email, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs font-semibold text-navy-800 focus:outline-none"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Receptionist">Receptionist</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Accountant">Accountant</option>
          </select>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="luxury-card bg-white rounded-2xl border border-cream-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-50/70 border-b border-cream-200 text-navy-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4">Personnel</th>
                <th className="p-4">Role &amp; Department</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4">Shift Assignment</th>
                <th className="p-4">Duty Status</th>
                <th className="p-4">Last Active</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filteredStaff.map((s) => (
                <tr key={s.id} className="hover:bg-cream-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-9 h-9 rounded-full object-cover border border-gold-300"
                      />
                      <div>
                        <span className="font-bold text-navy-950 text-sm block">{s.name}</span>
                        <span className="text-[10px] text-navy-400">Joined: {s.joinDate}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-navy-900 block">{s.role}</span>
                    <span className="text-[11px] text-navy-500 font-medium">{s.department}</span>
                  </td>
                  <td className="p-4 space-y-0.5">
                    <p className="font-semibold text-navy-900">{s.phone}</p>
                    <p className="text-[11px] text-navy-500">{s.email}</p>
                  </td>
                  <td className="p-4 font-medium text-navy-800">{s.shift}</td>
                  <td className="p-4">
                    <StatusBadge status={s.status} size="sm" />
                  </td>
                  <td className="p-4 text-navy-600">{s.lastActive}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="px-3 py-1.5 bg-cream-100 hover:bg-cream-200 text-navy-800 rounded-xl font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Hotel Staff Member"
        subtitle="Provision staff credentials and shift schedule"
        maxWidth="md"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Marcus Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="staff@royalvista.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98700 11223"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 focus:outline-none"
              >
                <option value="Receptionist">Receptionist</option>
                <option value="Manager">Manager</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Accountant">Accountant</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Department</label>
              <input
                type="text"
                placeholder="Front Office"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Shift</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 focus:outline-none"
              >
                <option value="Morning (6 AM - 2 PM)">Morning (6 AM - 2 PM)</option>
                <option value="Day (2 PM - 10 PM)">Day (2 PM - 10 PM)</option>
                <option value="Night (10 PM - 6 AM)">Night (10 PM - 6 AM)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Duty Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StaffStatus)}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Off Duty">Off Duty</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-cream-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-gradient-btn px-5 py-2 text-xs font-bold rounded-xl shadow-sm"
            >
              Create Staff Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        isOpen={!!editMember}
        onClose={() => setEditMember(null)}
        title={`Edit Staff — ${editMember?.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleUpdateStaff} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 focus:outline-none"
              >
                <option value="Receptionist">Receptionist</option>
                <option value="Manager">Manager</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Accountant">Accountant</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Shift</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 focus:outline-none"
              >
                <option value="Morning (6 AM - 2 PM)">Morning (6 AM - 2 PM)</option>
                <option value="Day (2 PM - 10 PM)">Day (2 PM - 10 PM)</option>
                <option value="Night (10 PM - 6 AM)">Night (10 PM - 6 AM)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Duty Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StaffStatus)}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Off Duty">Off Duty</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
            <button
              type="button"
              onClick={() => setEditMember(null)}
              className="px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-cream-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-gradient-btn px-5 py-2 text-xs font-bold rounded-xl shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
