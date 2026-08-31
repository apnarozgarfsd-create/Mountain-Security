import {
  AlertTriangle,
  ArrowRightLeft,
  Calendar,
  CheckCircle,
  Edit2,
  FileText,
  MapPin,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Guard, GuardDesignation, GuardStatus } from '../../types';
import { formatPKR } from '../../utils/formatters';

export const GuardsDirectoryView: React.FC = () => {
  const {
    guards,
    sites,
    weapons,
    addGuard,
    updateGuard,
    deleteGuard,
    transferGuard,
    triggerPrint,
    companySettings,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [transferModalGuard, setTransferModalGuard] = useState<Guard | null>(null);
  const [editModalGuard, setEditModalGuard] = useState<Guard | null>(null);
  const [deleteModalGuard, setDeleteModalGuard] = useState<Guard | null>(null);

  // New Guard Form State
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [designation, setDesignation] = useState<GuardDesignation>('Armed Guard');
  const [basicSalary, setBasicSalary] = useState<number>(40000);
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [initialSiteId, setInitialSiteId] = useState('');
  const [initialWeaponId, setInitialWeaponId] = useState('');
  const [notes, setNotes] = useState('');

  // Edit Guard Form State
  const [editName, setEditName] = useState('');
  const [editFatherName, setEditFatherName] = useState('');
  const [editCnic, setEditCnic] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editDesignation, setEditDesignation] = useState<GuardDesignation>('Armed Guard');
  const [editBasicSalary, setEditBasicSalary] = useState<number>(40000);
  const [editBloodGroup, setEditBloodGroup] = useState('B+');
  const [editStatus, setEditStatus] = useState<GuardStatus>('Active');
  const [editEmergencyContactName, setEditEmergencyContactName] = useState('');
  const [editEmergencyContactPhone, setEditEmergencyContactPhone] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Transfer Form State
  const [targetSiteId, setTargetSiteId] = useState(sites[0]?.id || '');
  const [targetShift, setTargetShift] = useState('12 Hours (Day Shift)');
  const [transferRemarks, setTransferRemarks] = useState('');

  const openEditModal = (guard: Guard) => {
    setEditModalGuard(guard);
    setEditName(guard.name);
    setEditFatherName(guard.fatherName || '');
    setEditCnic(guard.cnic);
    setEditPhone(guard.phone);
    setEditAddress(guard.address || '');
    setEditDesignation(guard.designation);
    setEditBasicSalary(guard.basicSalary || 40000);
    setEditBloodGroup(guard.bloodGroup || 'B+');
    setEditStatus(guard.status);
    setEditEmergencyContactName(guard.emergencyContactName || '');
    setEditEmergencyContactPhone(guard.emergencyContactPhone || '');
    setEditNotes(guard.notes || '');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalGuard) return;

    updateGuard(editModalGuard.id, {
      name: editName,
      fatherName: editFatherName,
      cnic: editCnic,
      phone: editPhone,
      address: editAddress,
      designation: editDesignation,
      basicSalary: editBasicSalary,
      bloodGroup: editBloodGroup,
      status: editStatus,
      emergencyContactName: editEmergencyContactName,
      emergencyContactPhone: editEmergencyContactPhone,
      notes: editNotes,
    });

    setEditModalGuard(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteModalGuard) return;
    deleteGuard(deleteModalGuard.id);
    setDeleteModalGuard(null);
  };

  const designations: GuardDesignation[] = [
    'Security Guard',
    'Armed Guard',
    'Head Guard',
    'Site Supervisor',
    'Gunman',
    'Lady Guard',
  ];

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const site = sites.find((s) => s.id === initialSiteId);
    const newGuard = addGuard({
      guardCode: `G-${1000 + guards.length + 1}`,
      name,
      fatherName,
      cnic,
      phone,
      address,
      joiningDate,
      designation,
      basicSalary,
      status: 'Active',
      bloodGroup,
      emergencyContactName,
      emergencyContactPhone,
      currentSiteId: initialSiteId || undefined,
      currentSiteName: site?.siteName || undefined,
      currentWeaponId: initialWeaponId || undefined,
      notes,
    });

    setIsRegisterOpen(false);
    // Reset form
    setName('');
    setFatherName('');
    setCnic('');
    setPhone('');
    setAddress('');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalGuard || !targetSiteId) return;

    transferGuard(transferModalGuard.id, targetSiteId, targetShift, transferRemarks);
    setTransferModalGuard(null);
    setTransferRemarks('');
  };

  const filteredGuards = guards.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.guardCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.cnic.includes(searchTerm) ||
      (g.currentSiteName && g.currentSiteName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDesig = filterDesignation === 'All' || g.designation === filterDesignation;
    const matchesStatus = filterStatus === 'All' || g.status === filterStatus;
    return matchesSearch && matchesDesig && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span>Guards Master Directory ({guards.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Personnel profiles, CNIC verification, site postings, armed licenses & basic wage setup.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Guard</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Guard Name, Code, CNIC, Site..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterDesignation}
            onChange={(e) => setFilterDesignation(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Designations</option>
            {designations.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Guards Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <th className="py-3 px-4">Guard Code & Name</th>
                <th className="py-3 px-4">CNIC & Contact</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Current Site Station</th>
                <th className="py-3 px-4">Weapon</th>
                <th className="py-3 px-4 text-right">Basic Salary</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredGuards.map((guard) => (
                <tr key={guard.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-100">{guard.name}</div>
                    <div className="text-[10px] text-blue-400 font-mono">{guard.guardCode} (S/O {guard.fatherName})</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono text-slate-300 font-semibold">{guard.cnic}</div>
                    <div className="text-[10px] text-slate-400">{guard.phone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-semibold text-[11px]">
                      {guard.designation}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {guard.currentSiteName ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{guard.currentSiteName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned (HQ Pool)</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {guard.currentWeaponId ? (
                      <span className="inline-flex items-center gap-1 bg-red-950 text-red-300 px-2 py-0.5 rounded text-[10px] font-bold border border-red-800/50">
                        <Shield className="w-3 h-3" />
                        <span>{guard.currentWeaponId}</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-black font-mono text-slate-200">
                    {formatPKR(guard.basicSalary)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        guard.status === 'Active'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                          : guard.status === 'On Leave'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          : 'bg-red-950 text-red-300 border border-red-800/60'
                      }`}
                    >
                      {guard.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setTransferModalGuard(guard)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/80 hover:bg-blue-600 text-white rounded font-bold text-[11px] cursor-pointer shadow-xs"
                        title="Transfer Guard to Site"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Transfer</span>
                      </button>
                      <button
                        onClick={() => openEditModal(guard)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-amber-600/80 hover:bg-amber-600 text-white rounded font-bold text-[11px] cursor-pointer shadow-xs"
                        title="Edit Guard Profile"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteModalGuard(guard)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded font-bold text-[11px] cursor-pointer shadow-xs"
                        title="Delete Guard Record"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Guard */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Users className="w-5 h-5 text-blue-400" />
              <span>Register Guard Bio-Data & Service Record</span>
            </h3>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Guard Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tariq Mahmood"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Father's Name *</label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="e.g. Fazal Din"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">CNIC Number (13-digit) *</label>
                  <input
                    type="text"
                    required
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value)}
                    placeholder="33100-XXXXXXX-X"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Designation *</label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value as GuardDesignation)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold"
                  >
                    {designations.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Basic Monthly Salary (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Permanent Residential Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Village / Chak / Street Address..."
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              {/* Initial Site & Weapon Allocation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Initial Site Station</label>
                  <select
                    value={initialSiteId}
                    onChange={(e) => setInitialSiteId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="">-- Leave in HQ Reserve Pool --</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.siteName} ({s.clientName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Assign Weapon (Optional)</label>
                  <select
                    value={initialWeaponId}
                    onChange={(e) => setInitialWeaponId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="">-- No Weapon Assigned --</option>
                    {weapons.map((w) => (
                      <option key={w.id} value={w.weaponCode}>
                        {w.weaponCode} - {w.weaponType} ({w.serialNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Register Guard Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Transfer Guard */}
      {transferModalGuard && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-400" />
              <span>Transfer Guard: {transferModalGuard.name} ({transferModalGuard.guardCode})</span>
            </h3>

            <p className="text-xs text-slate-300">
              Current Station: <strong className="text-emerald-400">{transferModalGuard.currentSiteName || 'Headquarters'}</strong>
            </p>

            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select Destination Site *</label>
                <select
                  required
                  value={targetSiteId}
                  onChange={(e) => setTargetSiteId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-bold"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.siteName} ({s.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Shift Schedule *</label>
                <select
                  value={targetShift}
                  onChange={(e) => setTargetShift(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                >
                  <option value="12 Hours (Day Shift)">12 Hours (Day Shift)</option>
                  <option value="12 Hours (Night Shift)">12 Hours (Night Shift)</option>
                  <option value="8 Hours (Shift 1)">8 Hours (Shift 1)</option>
                  <option value="8 Hours (Shift 2)">8 Hours (Shift 2)</option>
                  <option value="8 Hours (Shift 3)">8 Hours (Shift 3)</option>
                  <option value="24 Hours Standby">24 Hours Standby</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Transfer Remarks / Reason</label>
                <textarea
                  rows={2}
                  value={transferRemarks}
                  onChange={(e) => setTransferRemarks(e.target.value)}
                  placeholder="e.g. Routine monthly rotation / Client request..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferModalGuard(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg cursor-pointer shadow-md"
                >
                  Execute Transfer & Log History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Guard */}
      {editModalGuard && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <span>Edit Guard Profile: {editModalGuard.name} ({editModalGuard.guardCode})</span>
              </div>
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Guard Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Father's Name *</label>
                  <input
                    type="text"
                    required
                    value={editFatherName}
                    onChange={(e) => setEditFatherName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">CNIC Number (13-digit) *</label>
                  <input
                    type="text"
                    required
                    value={editCnic}
                    onChange={(e) => setEditCnic(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Designation *</label>
                  <select
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value as GuardDesignation)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold"
                  >
                    {designations.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Basic Monthly Salary (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={editBasicSalary}
                    onChange={(e) => setEditBasicSalary(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Duty Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as GuardStatus)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold"
                  >
                    <option value="Active">Active Duty</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Terminated">Terminated / Resigned</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Blood Group</label>
                  <select
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Permanent Residential Address</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Emergency Contact Person</label>
                  <input
                    type="text"
                    value={editEmergencyContactName}
                    onChange={(e) => setEditEmergencyContactName(e.target.value)}
                    placeholder="e.g. Brother / Relative"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Emergency Contact Phone</label>
                  <input
                    type="text"
                    value={editEmergencyContactPhone}
                    onChange={(e) => setEditEmergencyContactPhone(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Internal Notes / Verification Remarks</label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Police verification remarks, special training, etc."
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalGuard(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Guard Confirmation */}
      {deleteModalGuard && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-800/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400 pb-3 border-b border-slate-800">
              <div className="p-2.5 bg-red-950/80 border border-red-800 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Guard Record</h3>
                <p className="text-xs text-slate-400">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Guard Name:</span>
                <span className="font-bold text-white">{deleteModalGuard.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Guard Code:</span>
                <span className="font-mono text-blue-400 font-bold">{deleteModalGuard.guardCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CNIC:</span>
                <span className="font-mono text-slate-300">{deleteModalGuard.cnic}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stationed At:</span>
                <span className="text-emerald-400 font-semibold">{deleteModalGuard.currentSiteName || 'Headquarters'}</span>
              </div>
              {deleteModalGuard.currentWeaponId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Weapon:</span>
                  <span className="text-red-400 font-bold">{deleteModalGuard.currentWeaponId} (Will be returned to Armoury)</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to permanently remove <strong>{deleteModalGuard.name}</strong> from the Mountain Security personnel database?
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalGuard(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-md cursor-pointer text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Guard</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
