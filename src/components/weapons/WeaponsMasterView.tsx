import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Plus,
  Printer,
  Search,
  Shield,
  Wrench,
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
    issueWeapon,
    returnWeapon,
    triggerPrint,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const [isAddWeaponOpen, setIsAddWeaponOpen] = useState(false);
  const [issueModalWeapon, setIssueModalWeapon] = useState<Weapon | null>(null);
  const [returnModalWeapon, setReturnModalWeapon] = useState<Weapon | null>(null);

  // New Weapon Form State
  const [weaponCode, setWeaponCode] = useState(`W-${String(weapons.length + 1).padStart(3, '0')}`);
  const [weaponType, setWeaponType] = useState('12-Bore Shotgun');
  const [makeModel, setMakeModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [category, setCategory] = useState<WeaponCategory>('Shotguns');
  const [purchaseCost, setPurchaseCost] = useState<number>(95000);
  const [condition, setCondition] = useState<WeaponCondition>('New');
  const [armouryLocation, setArmouryLocation] = useState('Armoury Rack A-01');
  const [notes, setNotes] = useState('');

  // Issue Form State
  const [issueGuardId, setIssueGuardId] = useState(guards[0]?.id || '');
  const [issueSiteId, setIssueSiteId] = useState(sites[0]?.id || '');
  const [issueNotes, setIssueNotes] = useState('Issued for active site protection duty.');

  // Return Form State
  const [returnCondition, setReturnCondition] = useState<WeaponCondition>('Good');
  const [returnNotes, setReturnNotes] = useState('Returned to armoury bay.');

  const handleAddWeaponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWeapon({
      weaponCode,
      weaponType,
      makeModel,
      serialNumber,
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
    setNotes('');
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
            Firearms tracking, serial number registry, live guard assignments, and Armoury inventory.
          </p>
        </div>

        <button
          onClick={() => {
            setWeaponCode(`W-${String(weapons.length + 1).padStart(3, '0')}`);
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
            placeholder="Search by S/N, Weapon Code, Model, Guard..."
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
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Armoury Location</th>
                <th className="py-3 px-4">Assigned Guard & Site</th>
                <th className="py-3 px-4 text-center">Condition</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredWeapons.map((weapon) => (
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
                    <span className="font-mono font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {weapon.serialNumber}
                    </span>
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
                  <td className="py-3 px-4 text-right space-x-1.5">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Firearm */}
      {isAddWeaponOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Shield className="w-5 h-5 text-red-500" />
              <span>Register Firearm into Central Armoury</span>
            </h3>

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

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Serial Number (Govt License) *</label>
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
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
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
                  Issue & Generate Slip
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
                  <option value="Good">Good (Cleaned & Serviceable)</option>
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
    </div>
  );
};
