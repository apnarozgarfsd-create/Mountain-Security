import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Edit2,
  Eye,
  FileText,
  Plus,
  Printer,
  Search,
  Shield,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Weapon, WeaponCategory, WeaponCondition } from '../../types';
import { formatPKR } from '../../utils/formatters';

export const WeaponsMasterView: React.FC = () => {
  const {
    weapons,
    guards,
    sites,
    addWeapon,
    updateWeapon,
    deleteWeapon,
    issueWeapon,
    returnWeapon,
    triggerPrint,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const [isAddWeaponOpen, setIsAddWeaponOpen] = useState(false);
  const [editModalWeapon, setEditModalWeapon] = useState<Weapon | null>(null);
  const [previewLicenseWeapon, setPreviewLicenseWeapon] = useState<Weapon | null>(null);
  const [issueModalWeapon, setIssueModalWeapon] = useState<Weapon | null>(null);
  const [returnModalWeapon, setReturnModalWeapon] = useState<Weapon | null>(null);
  const [deleteModalWeapon, setDeleteModalWeapon] = useState<Weapon | null>(null);

  // New Weapon Form State
  const [weaponCode, setWeaponCode] = useState(`W-${String(weapons.length + 1).padStart(3, '0')}`);
  const [weaponType, setWeaponType] = useState('12-Bore Shotgun');
  const [makeModel, setMakeModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseImage, setLicenseImage] = useState('');
  const [category, setCategory] = useState<WeaponCategory>('Shotguns');
  const [purchaseCost, setPurchaseCost] = useState<number>(95000);
  const [condition, setCondition] = useState<WeaponCondition>('New');
  const [armouryLocation, setArmouryLocation] = useState('Armoury Rack A-01');
  const [notes, setNotes] = useState('');

  // Edit Weapon Form State
  const [editWeaponCode, setEditWeaponCode] = useState('');
  const [editWeaponType, setEditWeaponType] = useState('12-Bore Shotgun');
  const [editMakeModel, setEditMakeModel] = useState('');
  const [editSerialNumber, setEditSerialNumber] = useState('');
  const [editLicenseNumber, setEditLicenseNumber] = useState('');
  const [editLicenseImage, setEditLicenseImage] = useState('');
  const [editCategory, setEditCategory] = useState<WeaponCategory>('Shotguns');
  const [editPurchaseCost, setEditPurchaseCost] = useState<number>(0);
  const [editCondition, setEditCondition] = useState<WeaponCondition>('Good');
  const [editArmouryLocation, setEditArmouryLocation] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Issue Form State
  const [issueGuardId, setIssueGuardId] = useState(guards[0]?.id || '');
  const [issueSiteId, setIssueSiteId] = useState(sites[0]?.id || '');
  const [issueNotes, setIssueNotes] = useState('Issued for active site protection duty.');

  // Return Form State
  const [returnCondition, setReturnCondition] = useState<WeaponCondition>('Good');
  const [returnNotes, setReturnNotes] = useState('Returned to armoury bay.');

  // Resizes and compresses uploaded arms license images to high quality ~35-50KB data URL for fast persistent storage
  const compressLicenseImage = (file: File): Promise<string> => {
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
          const maxDim = 800; // ample resolution for document readability while ~40KB
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
          const compressed = canvas.toDataURL('image/jpeg', 0.80);
          resolve(compressed);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleLicenseImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressLicenseImage(file);
      setLicenseImage(base64);
    } catch (err) {
      console.error('Error processing license image:', err);
    }
  };

  const handleEditLicenseImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressLicenseImage(file);
      setEditLicenseImage(base64);
    } catch (err) {
      console.error('Error processing edit license image:', err);
    }
  };

  const handleAddWeaponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWeapon({
      weaponCode,
      weaponType: weaponType as any,
      makeModel,
      serialNumber,
      licenseNumber,
      licenseImage: licenseImage || undefined,
      category,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseCost,
      condition,
      currentStatus: 'Available',
      armouryLocation,
      notes,
    });
    setIsAddWeaponOpen(false);
    setMakeModel('');
    setSerialNumber('');
    setLicenseNumber('');
    setLicenseImage('');
    setNotes('');
  };

  const openEditModal = (weapon: Weapon) => {
    setEditModalWeapon(weapon);
    setEditWeaponCode(weapon.weaponCode);
    setEditWeaponType(weapon.weaponType);
    setEditMakeModel(weapon.makeModel);
    setEditSerialNumber(weapon.serialNumber);
    setEditLicenseNumber(weapon.licenseNumber || '');
    setEditLicenseImage(weapon.licenseImage || '');
    setEditCategory(weapon.category);
    setEditPurchaseCost(weapon.purchaseCost || 0);
    setEditCondition(weapon.condition);
    setEditArmouryLocation(weapon.armouryLocation);
    setEditNotes(weapon.notes || '');
  };

  const handleEditWeaponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalWeapon) return;

    updateWeapon(editModalWeapon.id, {
      weaponCode: editWeaponCode,
      weaponType: editWeaponType as any,
      makeModel: editMakeModel,
      serialNumber: editSerialNumber,
      licenseNumber: editLicenseNumber,
      licenseImage: editLicenseImage || undefined,
      category: editCategory,
      purchaseCost: editPurchaseCost,
      condition: editCondition,
      armouryLocation: editArmouryLocation,
      notes: editNotes,
    });

    setEditModalWeapon(null);
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueModalWeapon || !issueGuardId || !issueSiteId) return;

    issueWeapon(issueModalWeapon.id, issueGuardId, issueSiteId, issueNotes);
    const guard = guards.find((g) => g.id === issueGuardId);
    const site = sites.find((s) => s.id === issueSiteId);

    triggerPrint({
      type: 'weapon-slip',
      data: {
        ...issueModalWeapon,
        currentGuardName: guard?.name,
        currentSiteName: site?.siteName,
        currentStatus: 'Issued',
      },
      title: `Weapon Issue Slip: ${issueModalWeapon.weaponCode}`,
    });

    setIssueModalWeapon(null);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalWeapon) return;

    returnWeapon(returnModalWeapon.id, returnCondition, returnNotes);
    setReturnModalWeapon(null);
  };

  const filteredWeapons = weapons.filter((w) => {
    const matchesSearch =
      w.weaponCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.licenseNumber && w.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      w.makeModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.weaponType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.currentGuardName && w.currentGuardName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (w.currentSiteName && w.currentSiteName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = filterCategory === 'All' || w.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || w.currentStatus === filterStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-500" />
            <span>Armoury & Weapons Master Registry ({weapons.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Firearms tracking, Govt. license records & images, live guard assignments, and armoury inventory.
          </p>
        </div>

        <button
          onClick={() => {
            setWeaponCode(`W-${String(weapons.length + 1).padStart(3, '0')}`);
            setSerialNumber('');
            setLicenseNumber('');
            setLicenseImage('');
            setMakeModel('');
            setNotes('');
            setIsAddWeaponOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Firearm</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by S/N, License #, Code, Model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            <option value="Shotguns">Shotguns</option>
            <option value="Pistols">Pistols</option>
            <option value="Rifles">Rifles</option>
            <option value="Ammunition">Ammunition</option>
            <option value="Accessories">Accessories</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available in Armoury</option>
            <option value="Issued">Issued to Guard</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        </div>
      </div>

      {/* Weapons Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <th className="py-3 px-4">Weapon Code & Type</th>
                <th className="py-3 px-4">Make / Model & Category</th>
                <th className="py-3 px-4">Serial & License No.</th>
                <th className="py-3 px-4 text-center">License Image</th>
                <th className="py-3 px-4">Armoury Location</th>
                <th className="py-3 px-4">Assigned Guard & Site</th>
                <th className="py-3 px-4 text-center">Condition</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredWeapons.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Shield className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-400">No weapons found in registry</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Click &ldquo;Register New Firearm&rdquo; to add a firearm with license details.</p>
                  </td>
                </tr>
              ) : (
                filteredWeapons.map((weapon) => (
                  <tr key={weapon.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-red-400">{weapon.weaponCode}</span>
                      <div className="font-semibold text-slate-200">{weapon.weaponType}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-semibold">{weapon.makeModel}</div>
                      <div className="text-[10px] text-slate-400">{weapon.category}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">S/N:</span>
                        <span className="font-mono font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {weapon.serialNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Lic:</span>
                        <span className="font-mono font-semibold text-cyan-400">
                          {weapon.licenseNumber || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {weapon.licenseImage ? (
                        <button
                          type="button"
                          onClick={() => setPreviewLicenseWeapon(weapon)}
                          className="group relative inline-flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                          title="Click to view full license document"
                        >
                          <img
                            src={weapon.licenseImage}
                            alt={`License for ${weapon.weaponCode}`}
                            className="w-11 h-11 object-cover rounded-lg border border-slate-700 group-hover:border-cyan-400 shadow-md bg-slate-900"
                          />
                          <span className="absolute inset-0 bg-slate-950/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-3.5 h-3.5 text-white drop-shadow" />
                          </span>
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-900/80 border border-slate-800/80 text-[10px] text-slate-500 italic">
                          <FileText className="w-3 h-3 text-slate-600" />
                          <span>No License Image</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{weapon.armouryLocation}</td>
                    <td className="py-3 px-4">
                      {weapon.currentGuardName ? (
                        <div>
                          <div className="font-bold text-emerald-400">{weapon.currentGuardName}</div>
                          <div className="text-[10px] text-slate-400">{weapon.currentSiteName}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">In Armoury Safe</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {weapon.condition}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          weapon.currentStatus === 'Issued'
                            ? 'bg-red-950 text-red-300 border border-red-800/60'
                            : weapon.currentStatus === 'Available'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        {weapon.currentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {weapon.currentStatus === 'Available' && (
                        <button
                          onClick={() => {
                            setIssueModalWeapon(weapon);
                            if (guards.length > 0) setIssueGuardId(guards[0].id);
                            if (sites.length > 0) setIssueSiteId(sites[0].id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-xs cursor-pointer shadow-xs"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>Issue</span>
                        </button>
                      )}

                      {weapon.currentStatus === 'Issued' && (
                        <button
                          onClick={() => setReturnModalWeapon(weapon)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-bold text-xs cursor-pointer shadow-xs"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          <span>Return</span>
                        </button>
                      )}

                      <button
                        onClick={() => openEditModal(weapon)}
                        className="p-1.5 text-cyan-400 hover:text-cyan-300 rounded hover:bg-cyan-950/60 cursor-pointer"
                        title="Edit Firearm Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() =>
                          triggerPrint({
                            type: 'weapon-slip',
                            data: weapon,
                            title: `Weapon Record: ${weapon.weaponCode}`,
                          })
                        }
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                        title="Print Weapon Card"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteModalWeapon(weapon)}
                        className="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-950/60 cursor-pointer"
                        title="Delete Weapon from Inventory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Firearm */}
      {isAddWeaponOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                <span>Register Firearm into Central Armoury</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddWeaponOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWeaponSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Weapon Code *</label>
                  <input
                    type="text"
                    required
                    value={weaponCode}
                    onChange={(e) => setWeaponCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as WeaponCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold"
                  >
                    <option value="Shotguns">Shotguns</option>
                    <option value="Pistols">Pistols</option>
                    <option value="Rifles">Rifles</option>
                    <option value="Ammunition">Ammunition</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Weapon Type / Caliber *</label>
                  <input
                    type="text"
                    required
                    value={weaponType}
                    onChange={(e) => setWeaponType(e.target.value)}
                    placeholder="e.g. 12-Bore Shotgun / 9mm Pistol"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Make & Model *</label>
                  <input
                    type="text"
                    required
                    value={makeModel}
                    onChange={(e) => setMakeModel(e.target.value)}
                    placeholder="e.g. Beretta A300 Outlander"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                {/* Separate Serial Number & License Number */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Serial Number *</label>
                  <input
                    type="text"
                    required
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. BER-982144-PK"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">License Number *</label>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. PB-ARMS-2026-8891"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-cyan-300 font-mono font-bold"
                  />
                </div>

                {/* License Image upload & preview */}
                <div className="sm:col-span-2 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
                  <label className="block text-slate-300 font-semibold mb-1.5">License Image</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div>
                      <input
                        type="file"
                        id="add-weapon-license-image"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleLicenseImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="add-weapon-license-image"
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg font-semibold text-xs cursor-pointer transition-colors shadow-xs"
                      >
                        <Upload className="w-4 h-4 text-cyan-400" />
                        <span>{licenseImage ? 'Change License Image' : 'Choose / Upload License Image'}</span>
                      </label>
                      <p className="text-[10px] text-slate-500 mt-1">Accepts JPG, JPEG, PNG (auto-compressed)</p>
                    </div>

                    {licenseImage ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={licenseImage}
                          alt="Selected License Preview"
                          className="w-20 h-16 object-cover rounded-lg border border-cyan-500/50 shadow-md bg-slate-950"
                        />
                        <div className="space-y-1">
                          <div className="text-[11px] text-cyan-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>License image ready</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setLicenseImage('')}
                            className="text-[10px] text-red-400 hover:text-red-300 underline cursor-pointer"
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-500 text-xs italic bg-slate-950 px-3 py-2 rounded-lg border border-dashed border-slate-800">
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span>No license image selected</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Armoury Storage Bay / Rack *</label>
                  <input
                    type="text"
                    required
                    value={armouryLocation}
                    onChange={(e) => setArmouryLocation(e.target.value)}
                    placeholder="e.g. Armoury Rack A-05"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as WeaponCondition)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Under Repair">Under Repair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Purchase / Valuation Cost (PKR)</label>
                  <input
                    type="number"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">License & Armoury Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Valid Punjab Govt arms license #..."
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddWeaponOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg cursor-pointer hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Save Firearm Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Firearm */}
      {editModalWeapon && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-cyan-400" />
                <span>Edit Firearm Record: {editModalWeapon.weaponCode}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditModalWeapon(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditWeaponSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Weapon Code *</label>
                  <input
                    type="text"
                    required
                    value={editWeaponCode}
                    onChange={(e) => setEditWeaponCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as WeaponCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold"
                  >
                    <option value="Shotguns">Shotguns</option>
                    <option value="Pistols">Pistols</option>
                    <option value="Rifles">Rifles</option>
                    <option value="Ammunition">Ammunition</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Weapon Type / Caliber *</label>
                  <input
                    type="text"
                    required
                    value={editWeaponType}
                    onChange={(e) => setEditWeaponType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Make & Model *</label>
                  <input
                    type="text"
                    required
                    value={editMakeModel}
                    onChange={(e) => setEditMakeModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                {/* Separate Serial Number & License Number */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Serial Number *</label>
                  <input
                    type="text"
                    required
                    value={editSerialNumber}
                    onChange={(e) => setEditSerialNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">License Number *</label>
                  <input
                    type="text"
                    required
                    value={editLicenseNumber}
                    onChange={(e) => setEditLicenseNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-cyan-300 font-mono font-bold"
                  />
                </div>

                {/* License Image in Edit modal */}
                <div className="sm:col-span-2 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
                  <label className="block text-slate-300 font-semibold mb-1.5">License Image</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div>
                      <input
                        type="file"
                        id="edit-weapon-license-image"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleEditLicenseImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="edit-weapon-license-image"
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg font-semibold text-xs cursor-pointer transition-colors shadow-xs"
                      >
                        <Upload className="w-4 h-4 text-cyan-400" />
                        <span>{editLicenseImage ? 'Change / Replace License Image' : 'Choose / Upload License Image'}</span>
                      </label>
                      <p className="text-[10px] text-slate-500 mt-1">Accepts JPG, JPEG, PNG (keeps existing if unchanged)</p>
                    </div>

                    {editLicenseImage ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={editLicenseImage}
                          alt="Current License Preview"
                          className="w-20 h-16 object-cover rounded-lg border border-cyan-500/50 shadow-md bg-slate-950"
                        />
                        <div className="space-y-1">
                          <div className="text-[11px] text-cyan-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Current license image</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditLicenseImage('')}
                            className="text-[10px] text-red-400 hover:text-red-300 underline cursor-pointer"
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-500 text-xs italic bg-slate-950 px-3 py-2 rounded-lg border border-dashed border-slate-800">
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span>No License Image (Click button to add)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Armoury Storage Bay / Rack *</label>
                  <input
                    type="text"
                    required
                    value={editArmouryLocation}
                    onChange={(e) => setEditArmouryLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Condition</label>
                  <select
                    value={editCondition}
                    onChange={(e) => setEditCondition(e.target.value as WeaponCondition)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Under Repair">Under Repair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Purchase / Valuation Cost (PKR)</label>
                  <input
                    type="number"
                    value={editPurchaseCost}
                    onChange={(e) => setEditPurchaseCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">License & Armoury Notes</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalWeapon(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg cursor-pointer hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Full License Image Preview */}
      {previewLicenseWeapon && previewLicenseWeapon.licenseImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <span>Arms License Document — {previewLicenseWeapon.weaponCode}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {previewLicenseWeapon.weaponType} ({previewLicenseWeapon.makeModel || 'N/A'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewLicenseWeapon(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Specs Pill */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Serial Number</div>
                <div className="font-mono font-bold text-amber-400">{previewLicenseWeapon.serialNumber}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Govt License #</div>
                <div className="font-mono font-bold text-cyan-400">{previewLicenseWeapon.licenseNumber || 'Not registered'}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Category</div>
                <div className="text-slate-200">{previewLicenseWeapon.category}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Bay / Location</div>
                <div className="text-slate-200">{previewLicenseWeapon.armouryLocation}</div>
              </div>
            </div>

            {/* License Image Display */}
            <div className="bg-slate-950 p-2 sm:p-4 rounded-xl border border-slate-800 flex items-center justify-center max-h-[65vh] overflow-hidden">
              <img
                src={previewLicenseWeapon.licenseImage}
                alt={`Arms License for ${previewLicenseWeapon.weaponCode}`}
                className="max-h-[60vh] max-w-full object-contain rounded-lg border border-slate-800 shadow-2xl"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">Official Government Weapon License Document</span>
              <button
                type="button"
                onClick={() => setPreviewLicenseWeapon(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg cursor-pointer text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Issue Weapon */}
      {issueModalWeapon && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              <span>Issue Firearm: {issueModalWeapon.weaponCode} ({issueModalWeapon.weaponType})</span>
            </h3>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <div>S/N: <strong className="text-amber-400">{issueModalWeapon.serialNumber}</strong></div>
              <div>License #: <strong className="text-cyan-400">{issueModalWeapon.licenseNumber || 'N/A'}</strong></div>
              <div>Model: <strong className="text-slate-200">{issueModalWeapon.makeModel}</strong></div>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select Guard *</label>
                <select
                  required
                  value={issueGuardId}
                  onChange={(e) => {
                    setIssueGuardId(e.target.value);
                    const guard = guards.find((g) => g.id === e.target.value);
                    if (guard?.currentSiteId) {
                      setIssueSiteId(guard.currentSiteId);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-bold"
                >
                  {guards.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.guardCode}) - {g.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Stationed Site *</label>
                <select
                  required
                  value={issueSiteId}
                  onChange={(e) => setIssueSiteId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.siteName} ({s.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Movement Notes</label>
                <textarea
                  rows={2}
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  placeholder="e.g. Issued with 10 live shells..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIssueModalWeapon(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg cursor-pointer shadow-md"
                >
                  Issue &amp; Generate Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Return Weapon */}
      {returnModalWeapon && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
              <span>Return Weapon: {returnModalWeapon.weaponCode} to Armoury</span>
            </h3>

            <p className="text-xs text-slate-300">
              Returning from Guard: <strong className="text-emerald-400">{returnModalWeapon.currentGuardName}</strong>
            </p>

            <form onSubmit={handleReturnSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Inspection Condition on Return *</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value as WeaponCondition)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-bold"
                >
                  <option value="Good">Good (Cleaned &amp; Serviceable)</option>
                  <option value="New">New</option>
                  <option value="Fair">Fair (Needs Cleaning/Oil)</option>
                  <option value="Under Repair">Under Repair (Defective Part)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Return Notes</label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="e.g. Returned upon guard leave, tested firing pin..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModalWeapon(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer shadow-md"
                >
                  Confirm Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Weapon Confirmation */}
      {deleteModalWeapon && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-800/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400 pb-3 border-b border-slate-800">
              <div className="p-2.5 bg-red-950/80 border border-red-800 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Firearm Record</h3>
                <p className="text-xs text-slate-400">Armoury &amp; Ordnance Record Removal</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Weapon Code:</span>
                <span className="font-mono text-red-400 font-bold">{deleteModalWeapon.weaponCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type / Model:</span>
                <span className="font-bold text-white">{deleteModalWeapon.weaponType} ({deleteModalWeapon.makeModel || 'N/A'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Serial No:</span>
                <span className="font-mono text-slate-300">{deleteModalWeapon.serialNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Govt License #:</span>
                <span className="font-mono text-cyan-400 font-bold">{deleteModalWeapon.licenseNumber || 'N/A'}</span>
              </div>
              {deleteModalWeapon.licenseImage && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                  <span className="text-slate-400">License Document:</span>
                  <img src={deleteModalWeapon.licenseImage} alt="License" className="w-10 h-8 object-cover rounded border border-slate-700" />
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className={`font-bold ${deleteModalWeapon.currentStatus === 'Issued' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {deleteModalWeapon.currentStatus} {deleteModalWeapon.currentGuardName ? `(to ${deleteModalWeapon.currentGuardName})` : ''}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete weapon <strong>{deleteModalWeapon.weaponCode}</strong>? Its license data and document image will be permanently removed.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalWeapon(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteWeapon(deleteModalWeapon.id);
                  setDeleteModalWeapon(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-md cursor-pointer text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Weapon</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
