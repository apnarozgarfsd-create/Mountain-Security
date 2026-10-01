import {
  AlertTriangle,
  ArrowRightLeft,
  Calendar,
  Camera,
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
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Guard, GuardStatus } from '../../types';
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
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSite, setFilterSite] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [transferModalGuard, setTransferModalGuard] = useState<Guard | null>(null);
  const [editModalGuard, setEditModalGuard] = useState<Guard | null>(null);
  const [deleteModalGuard, setDeleteModalGuard] = useState<Guard | null>(null);

  // New Guard Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [contact, setContact] = useState('');
  const [cnic, setCnic] = useState('');
  const [cast, setCast] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [basicSalary, setBasicSalary] = useState<number>(40000);
  const [address, setAddress] = useState('');
  const [initialSiteId, setInitialSiteId] = useState('');
  const [initialWeaponId, setInitialWeaponId] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [registerCnicError, setRegisterCnicError] = useState('');

  // Edit Guard Form State
  const [editDate, setEditDate] = useState('');
  const [editName, setEditName] = useState('');
  const [editFatherName, setEditFatherName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editCnic, setEditCnic] = useState('');
  const [editCast, setEditCast] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editWeight, setEditWeight] = useState<string>('');
  const [editDateOfBirth, setEditDateOfBirth] = useState('');
  const [editBasicSalary, setEditBasicSalary] = useState<number>(40000);
  const [editAddress, setEditAddress] = useState('');
  const [editSiteId, setEditSiteId] = useState('');
  const [editWeaponId, setEditWeaponId] = useState('');
  const [editStatus, setEditStatus] = useState<GuardStatus>('Active');
  const [editPhoto, setEditPhoto] = useState<string>('');
  const [editCnicError, setEditCnicError] = useState('');

  // Transfer Form State
  const [targetSiteId, setTargetSiteId] = useState(sites[0]?.id || '');
  const [targetShift, setTargetShift] = useState('12 Hours (Day Shift)');
  const [transferRemarks, setTransferRemarks] = useState('');

  // Resizes and compresses uploaded photos to high quality ~20-30KB data URL for fast persistent storage
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type.toLowerCase())) {
        alert('Please select a JPG, JPEG or PNG image file.');
        reject(new Error('Invalid image type'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 320;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressed);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      setPhoto(base64);
    } catch (err) {
      console.error('Error processing guard photo:', err);
    }
  };

  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      setEditPhoto(base64);
    } catch (err) {
      console.error('Error processing edit guard photo:', err);
    }
  };

  const validatePakistaniCNIC = (value: string): boolean => {
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly.length === 13;
  };

  const resetRegisterForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setName('');
    setFatherName('');
    setContact('');
    setCnic('');
    setCast('');
    setHeight('');
    setWeight('');
    setDateOfBirth('');
    setBasicSalary(40000);
    setAddress('');
    setInitialSiteId('');
    setInitialWeaponId('');
    setPhoto('');
    setRegisterCnicError('');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate 13-digit Pakistani CNIC
    if (!validatePakistaniCNIC(cnic)) {
      setRegisterCnicError('CNIC must be exactly 13 digits (e.g. 33100-0000000-X).');
      return;
    }
    setRegisterCnicError('');

    const selectedSite = sites.find((s) => s.id === initialSiteId);

    addGuard({
      guardCode: `G-${1000 + guards.length + 1}`,
      date,
      joiningDate: date,
      name: name.trim(),
      fatherName: fatherName.trim(),
      contact: contact.trim(),
      phone: contact.trim(),
      cnic: cnic.trim(),
      cast: cast.trim() || undefined,
      height: height.trim() || undefined,
      weight: weight ? Number(weight) : undefined,
      dateOfBirth: dateOfBirth || undefined,
      basicSalary: Number(basicSalary) || 0,
      address: address.trim(),
      currentSiteId: initialSiteId || undefined,
      currentSiteName: selectedSite?.siteName || undefined,
      currentWeaponId: initialWeaponId || undefined,
      status: 'Active',
      designation: 'Security Guard',
      photo: photo || undefined,
      photoUrl: photo || undefined,
    });

    setIsRegisterOpen(false);
    resetRegisterForm();
  };

  const openEditModal = (guard: Guard) => {
    setEditModalGuard(guard);
    setEditDate(guard.date || guard.joiningDate || new Date().toISOString().split('T')[0]);
    setEditName(guard.name || '');
    setEditFatherName(guard.fatherName || '');
    setEditContact(guard.contact || guard.phone || '');
    setEditCnic(guard.cnic || '');
    setEditCast(guard.cast || '');
    setEditHeight(guard.height || '');
    setEditWeight(guard.weight !== undefined && guard.weight !== null ? String(guard.weight) : '');
    setEditDateOfBirth(guard.dateOfBirth || '');
    setEditBasicSalary(guard.basicSalary || 40000);
    setEditAddress(guard.address || '');
    setEditSiteId(guard.currentSiteId || '');
    setEditWeaponId(guard.currentWeaponId || '');
    setEditStatus(guard.status || 'Active');
    setEditPhoto(guard.photo || guard.photoUrl || '');
    setEditCnicError('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalGuard) return;

    // Validate 13-digit Pakistani CNIC
    if (!validatePakistaniCNIC(editCnic)) {
      setEditCnicError('CNIC must be exactly 13 digits (e.g. 33100-0000000-X).');
      return;
    }
    setEditCnicError('');

    const selectedSite = sites.find((s) => s.id === editSiteId);

    updateGuard(editModalGuard.id, {
      date: editDate,
      joiningDate: editDate,
      name: editName.trim(),
      fatherName: editFatherName.trim(),
      contact: editContact.trim(),
      phone: editContact.trim(),
      cnic: editCnic.trim(),
      cast: editCast.trim() || undefined,
      height: editHeight.trim() || undefined,
      weight: editWeight ? Number(editWeight) : undefined,
      dateOfBirth: editDateOfBirth || undefined,
      basicSalary: Number(editBasicSalary) || 0,
      address: editAddress.trim(),
      currentSiteId: editSiteId || undefined,
      currentSiteName: editSiteId ? selectedSite?.siteName : undefined,
      currentWeaponId: editWeaponId || undefined,
      status: editStatus,
      photo: editPhoto || undefined,
      photoUrl: editPhoto || undefined,
    });

    setEditModalGuard(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteModalGuard) return;
    deleteGuard(deleteModalGuard.id);
    setDeleteModalGuard(null);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalGuard || !targetSiteId) return;

    transferGuard(transferModalGuard.id, targetSiteId, targetShift, transferRemarks);
    setTransferModalGuard(null);
    setTransferRemarks('');
  };

  const filteredGuards = guards.filter((g) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      g.name.toLowerCase().includes(term) ||
      (g.fatherName && g.fatherName.toLowerCase().includes(term)) ||
      (g.guardCode && g.guardCode.toLowerCase().includes(term)) ||
      (g.cnic && g.cnic.includes(term)) ||
      (g.contact && g.contact.includes(term)) ||
      (g.phone && g.phone.includes(term)) ||
      (g.cast && g.cast.toLowerCase().includes(term)) ||
      (g.currentSiteName && g.currentSiteName.toLowerCase().includes(term)) ||
      (g.currentWeaponId && g.currentWeaponId.toLowerCase().includes(term));

    const matchesSite =
      filterSite === 'All' ||
      (filterSite === 'Unassigned' && !g.currentSiteId) ||
      g.currentSiteId === filterSite;

    const matchesStatus = filterStatus === 'All' || g.status === filterStatus;

    return matchesSearch && matchesSite && matchesStatus;
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
          onClick={() => {
            resetRegisterForm();
            setIsRegisterOpen(true);
          }}
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
            placeholder="Search by Name, Father Name, CNIC, Site, Weapon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <select
            value={filterSite}
            onChange={(e) => setFilterSite(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Site Stations</option>
            <option value="Unassigned">Unassigned (HQ Pool)</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.siteName}
              </option>
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
            <option value="Suspended">Suspended</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Guards Table - Horizontally Scrollable & Responsive */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left min-w-[1200px]">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold whitespace-nowrap">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Father Name</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">CNIC</th>
                <th className="py-3 px-3">Cast</th>
                <th className="py-3 px-3">Height</th>
                <th className="py-3 px-3">Weight</th>
                <th className="py-3 px-3">Date of Birth</th>
                <th className="py-3 px-3 text-right">Basic Salary</th>
                <th className="py-3 px-3">Current Site Station</th>
                <th className="py-3 px-3 text-center">Weapon</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredGuards.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-8 text-center text-slate-500 italic">
                    No guards found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredGuards.map((guard) => (
                  <tr key={guard.id} className="hover:bg-slate-900/60 transition-colors whitespace-nowrap">
                    {/* 1. Date */}
                    <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                      {guard.date || guard.joiningDate || '-'}
                    </td>

                    {/* 2. Name & Photo */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        {guard.photo || guard.photoUrl ? (
                          <img
                            src={guard.photo || guard.photoUrl}
                            alt={guard.name}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0 shadow-xs"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-400 font-bold text-xs uppercase shrink-0">
                            {guard.name ? guard.name.slice(0, 2) : 'GD'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-100">{guard.name}</div>
                          <div className="text-[10px] text-blue-400 font-mono">{guard.guardCode}</div>
                        </div>
                      </div>
                    </td>

                    {/* 3. Father Name */}
                    <td className="py-3 px-3 text-slate-300">
                      {guard.fatherName || '-'}
                    </td>

                    {/* 4. Contact */}
                    <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                      {guard.contact || guard.phone || '-'}
                    </td>

                    {/* 5. CNIC */}
                    <td className="py-3 px-3 font-mono font-semibold text-slate-200 text-[11px]">
                      {guard.cnic || '-'}
                    </td>

                    {/* 6. Cast */}
                    <td className="py-3 px-3 text-slate-300">
                      {guard.cast || '-'}
                    </td>

                    {/* 7. Height */}
                    <td className="py-3 px-3 text-slate-300">
                      {guard.height || '-'}
                    </td>

                    {/* 8. Weight */}
                    <td className="py-3 px-3 text-slate-300 font-mono">
                      {guard.weight !== undefined && guard.weight !== null && guard.weight !== ''
                        ? `${guard.weight} kg`
                        : '-'}
                    </td>

                    {/* 9. Date of Birth */}
                    <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                      {guard.dateOfBirth || '-'}
                    </td>

                    {/* 10. Basic Salary */}
                    <td className="py-3 px-3 text-right font-black font-mono text-emerald-400">
                      {formatPKR(guard.basicSalary || 0)}
                    </td>

                    {/* 11. Current Site Station */}
                    <td className="py-3 px-3">
                      {guard.currentSiteName ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{guard.currentSiteName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned (HQ Pool)</span>
                      )}
                    </td>

                    {/* 12. Weapon */}
                    <td className="py-3 px-3 text-center">
                      {guard.currentWeaponId ? (
                        <span className="inline-flex items-center gap-1 bg-red-950 text-red-300 px-2 py-0.5 rounded text-[10px] font-bold border border-red-800/50">
                          <Shield className="w-3 h-3" />
                          <span>{guard.currentWeaponId}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-xs" title="No Weapon Assigned">--</span>
                      )}
                    </td>

                    {/* 13. Status */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          guard.status === 'Active'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : guard.status === 'On Leave'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                            : guard.status === 'Suspended'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                            : 'bg-red-950 text-red-300 border border-red-800/60'
                        }`}
                      >
                        {guard.status}
                      </span>
                    </td>

                    {/* 14. Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setTransferModalGuard(guard)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/80 hover:bg-blue-600 text-white rounded font-bold text-[11px] cursor-pointer shadow-xs transition-colors"
                          title="Transfer Guard to Site"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Transfer</span>
                        </button>
                        <button
                          onClick={() => openEditModal(guard)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-amber-600/80 hover:bg-amber-600 text-white rounded font-bold text-[11px] cursor-pointer shadow-xs transition-colors"
                          title="Edit Guard Profile"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteModalGuard(guard)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded font-bold text-[11px] cursor-pointer shadow-xs transition-colors"
                          title="Delete Guard Record"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Guard Bio-Data & Service Record */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Register Guard Bio-Data & Service Record</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
                {/* Row 1: Date | Name */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tariq Mahmood"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold"
                  />
                </div>

                {/* Guard Photo Field */}
                <div className="sm:col-span-2 bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative shrink-0">
                    {photo ? (
                      <div className="relative group">
                        <img
                          src={photo}
                          alt="Guard preview"
                          className="w-20 h-20 rounded-xl object-cover border-2 border-blue-500 shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => setPhoto('')}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 shadow-md transition-colors cursor-pointer"
                          title="Remove Photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-400">
                        <UserCheck className="w-7 h-7 text-slate-500 mb-1" />
                        <span className="text-[10px] font-semibold text-slate-400">No Photo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1.5">
                    <div>
                      <label className="block text-slate-200 font-bold text-xs">Guard Photo</label>
                      <p className="text-[11px] text-slate-400">
                        Upload portrait picture (JPG, JPEG, PNG). Image will be resized and optimized for fast display.
                      </p>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                        <Camera className="w-3.5 h-3.5" />
                        <span>{photo ? 'Change Photo' : 'Choose Photo'}</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {photo && (
                        <button
                          type="button"
                          onClick={() => setPhoto('')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-300 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 2: Father Name | Contact */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Father Name *</label>
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
                  <label className="block text-slate-400 font-semibold mb-1">Contact *</label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>

                {/* Row 3: CNIC | Cast */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">CNIC (13-digit) *</label>
                  <input
                    type="text"
                    required
                    value={cnic}
                    onChange={(e) => {
                      setCnic(e.target.value);
                      if (registerCnicError) setRegisterCnicError('');
                    }}
                    placeholder="33100-0000000-X"
                    className={`w-full bg-slate-900 border rounded p-2 text-white font-mono font-bold ${
                      registerCnicError ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  {registerCnicError && (
                    <p className="text-red-400 text-[11px] mt-1 font-semibold">{registerCnicError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Cast</label>
                  <input
                    type="text"
                    value={cast}
                    onChange={(e) => setCast(e.target.value)}
                    placeholder="e.g. Rajput / Gujjar / Jatt"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                {/* Row 4: Height | Weight */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Height</label>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="5 ft 8 in"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 72"
                    min="30"
                    max="200"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>

                {/* Row 5: Date of Birth | Basic Monthly Salary (PKR) */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Basic Monthly Salary (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(Number(e.target.value))}
                    min="0"
                    placeholder="40000"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono font-bold"
                  />
                </div>

                {/* Row 6: Permanent Residential Address (full width) */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Permanent Residential Address</label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Village / Chak / House / Street Address..."
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                {/* Row 7: Initial Site Station | Assign Weapon (Optional) */}
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
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md cursor-pointer transition-colors"
                >
                  Register Guard Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Guard Profile */}
      {editModalGuard && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <span>Edit Guard Profile: {editModalGuard.name} ({editModalGuard.guardCode})</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditModalGuard(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
                {/* Row 1: Date | Name */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold"
                  />
                </div>

                {/* Edit Guard Photo Field */}
                <div className="sm:col-span-2 bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative shrink-0">
                    {editPhoto ? (
                      <div className="relative group">
                        <img
                          src={editPhoto}
                          alt="Guard preview"
                          className="w-20 h-20 rounded-xl object-cover border-2 border-amber-500 shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => setEditPhoto('')}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 shadow-md transition-colors cursor-pointer"
                          title="Remove Photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-400">
                        <UserCheck className="w-7 h-7 text-slate-500 mb-1" />
                        <span className="text-[10px] font-semibold text-slate-400">No Photo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1.5">
                    <div>
                      <label className="block text-slate-200 font-bold text-xs">Guard Photo</label>
                      <p className="text-[11px] text-slate-400">
                        Update or replace guard portrait photo (JPG, JPEG, PNG).
                      </p>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/90 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                        <Camera className="w-3.5 h-3.5" />
                        <span>{editPhoto ? 'Change Photo' : 'Choose Photo'}</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={handleEditPhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {editPhoto && (
                        <button
                          type="button"
                          onClick={() => setEditPhoto('')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-300 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 2: Father Name | Contact */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Father Name *</label>
                  <input
                    type="text"
                    required
                    value={editFatherName}
                    onChange={(e) => setEditFatherName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Contact *</label>
                  <input
                    type="text"
                    required
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>

                {/* Row 3: CNIC | Cast */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">CNIC (13-digit) *</label>
                  <input
                    type="text"
                    required
                    value={editCnic}
                    onChange={(e) => {
                      setEditCnic(e.target.value);
                      if (editCnicError) setEditCnicError('');
                    }}
                    placeholder="33100-0000000-X"
                    className={`w-full bg-slate-900 border rounded p-2 text-white font-mono font-bold ${
                      editCnicError ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  {editCnicError && (
                    <p className="text-red-400 text-[11px] mt-1 font-semibold">{editCnicError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Cast</label>
                  <input
                    type="text"
                    value={editCast}
                    onChange={(e) => setEditCast(e.target.value)}
                    placeholder="e.g. Rajput / Gujjar / Jatt"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                {/* Row 4: Height | Weight */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Height</label>
                  <input
                    type="text"
                    value={editHeight}
                    onChange={(e) => setEditHeight(e.target.value)}
                    placeholder="5 ft 8 in"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    placeholder="e.g. 72"
                    min="30"
                    max="200"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>

                {/* Row 5: Date of Birth | Basic Monthly Salary (PKR) */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editDateOfBirth}
                    onChange={(e) => setEditDateOfBirth(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Basic Monthly Salary (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={editBasicSalary}
                    onChange={(e) => setEditBasicSalary(Number(e.target.value))}
                    min="0"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono font-bold"
                  />
                </div>

                {/* Row 6: Permanent Residential Address (full width) */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Permanent Residential Address</label>
                  <textarea
                    rows={3}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Village / Chak / House / Street Address..."
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                {/* Row 7: Initial Site Station | Assign Weapon (Optional) */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Current Site Station</label>
                  <select
                    value={editSiteId}
                    onChange={(e) => setEditSiteId(e.target.value)}
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
                    value={editWeaponId}
                    onChange={(e) => setEditWeaponId(e.target.value)}
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

                {/* Row 8: Duty Status */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Duty Status *</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as GuardStatus)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold"
                  >
                    <option value="Active">Active Duty</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Terminated">Terminated / Resigned</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalGuard(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-md cursor-pointer transition-colors"
                >
                  Save Changes
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
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                <span>Transfer Guard: {transferModalGuard.name} ({transferModalGuard.guardCode})</span>
              </h3>
              <button
                type="button"
                onClick={() => setTransferModalGuard(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Current Station: <strong className="text-emerald-400">{transferModalGuard.currentSiteName || 'Headquarters Reserve Pool'}</strong>
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

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTransferModalGuard(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg cursor-pointer shadow-md transition-colors"
                >
                  Execute Transfer & Log History
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
              <div className="flex items-center gap-3 pb-2 border-b border-slate-800/80">
                {deleteModalGuard.photo || deleteModalGuard.photoUrl ? (
                  <img
                    src={deleteModalGuard.photo || deleteModalGuard.photoUrl}
                    alt={deleteModalGuard.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm uppercase shrink-0">
                    {deleteModalGuard.name ? deleteModalGuard.name.slice(0, 2) : 'GD'}
                  </div>
                )}
                <div>
                  <div className="font-bold text-white text-sm">{deleteModalGuard.name}</div>
                  <div className="text-xs text-blue-400 font-mono">{deleteModalGuard.guardCode}</div>
                </div>
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
              Are you sure you want to permanently remove <strong>{deleteModalGuard.name}</strong> from the personnel database?
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalGuard(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg cursor-pointer text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-md cursor-pointer text-xs transition-colors"
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
