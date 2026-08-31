import {
  AlertCircle,
  Building,
  Clock,
  Edit2,
  FileText,
  MapPin,
  Phone,
  Plus,
  Printer,
  Search,
  Shield,
  User,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Site } from '../../types';
import { formatPKR } from '../../utils/formatters';

export const SitesPage: React.FC = () => {
  const { sites, clients, guards, weapons, addSite, updateSite, triggerPrint } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const [formData, setFormData] = useState<Omit<Site, 'id' | 'createdAt'>>({
    siteCode: `S-${(sites.length + 1).toString().padStart(3, '0')}`,
    clientId: clients[0]?.id || '',
    clientName: clients[0]?.companyName || '',
    siteName: '',
    location: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    requiredGuards: 2,
    shiftDetails: '12 Hours (2 Shifts)',
    siteSupervisor: 'Insp. Tariq Shah',
    status: 'Active',
    monthlyRate: 50000,
    notes: '',
  });

  const filteredSites = sites.filter((s) => {
    const matchesSearch =
      s.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.siteCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.clientName && s.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClient = selectedClientId === 'All' || s.clientId === selectedClientId;
    return matchesSearch && matchesClient;
  });

  const handleSaveSite = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedClient = clients.find((c) => c.id === formData.clientId);
    const sitePayload = {
      ...formData,
      clientName: matchedClient?.companyName || formData.clientName,
    };

    if (selectedSite) {
      updateSite(selectedSite.id, sitePayload);
      setSelectedSite(null);
    } else {
      addSite(sitePayload);
      setIsModalOpen(false);
    }

    setFormData({
      siteCode: `S-${(sites.length + 2).toString().padStart(3, '0')}`,
      clientId: clients[0]?.id || '',
      clientName: clients[0]?.companyName || '',
      siteName: '',
      location: '',
      address: '',
      contactPerson: '',
      contactPhone: '',
      requiredGuards: 2,
      shiftDetails: '12 Hours (2 Shifts)',
      siteSupervisor: 'Insp. Tariq Shah',
      status: 'Active',
      monthlyRate: 50000,
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-400" />
            <span>Operational Sites & Security Posts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Monitor client deployments, post supervisors, shift requirements, and stationed armed guards.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedSite(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy New Site</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search site name, code, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-400 font-semibold shrink-0">Client Filter:</label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Corporate Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSites.map((site) => {
          const siteGuards = guards.filter((g) => g.currentSiteId === site.id);
          const isUnderStaffed = siteGuards.length < site.requiredGuards;

          return (
            <div
              key={site.id}
              className="bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4 relative group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
                      {site.siteCode}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1 group-hover:text-blue-300 transition-colors">
                      {site.siteName}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">{site.clientName}</p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      site.status === 'Active'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        : 'bg-red-950/80 text-red-300 border-red-800'
                    }`}
                  >
                    {site.status}
                  </span>
                </div>

                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{site.location}</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{site.contactPhone}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{site.shiftDetails}</span>
                    </span>
                    <span className="text-slate-400">Supervisor: <strong className="text-slate-200">{site.siteSupervisor}</strong></span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400">Deployment Strength:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-xs flex items-center gap-1 ${
                        isUnderStaffed
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {siteGuards.length} / {site.requiredGuards} Guards
                    </span>
                  </div>
                </div>

                {/* Stationed Guard Avatars / List */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Assigned Personnel:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {siteGuards.length === 0 ? (
                      <span className="text-xs text-slate-500 italic">No guards stationed</span>
                    ) : (
                      siteGuards.map((g) => (
                        <span
                          key={g.id}
                          className="bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded text-[11px] font-medium"
                        >
                          {g.name} ({g.designation})
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400 font-mono font-bold">
                  {formatPKR(site.monthlyRate)}/mo
                </span>

                <button
                  onClick={() => {
                    setSelectedSite(site);
                    setFormData({
                      siteCode: site.siteCode,
                      clientId: site.clientId,
                      clientName: site.clientName,
                      siteName: site.siteName,
                      location: site.location,
                      address: site.address,
                      contactPerson: site.contactPerson,
                      contactPhone: site.contactPhone,
                      requiredGuards: site.requiredGuards,
                      shiftDetails: site.shiftDetails,
                      siteSupervisor: site.siteSupervisor,
                      status: site.status,
                      monthlyRate: site.monthlyRate,
                      notes: site.notes || '',
                    });
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Edit Site
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                {selectedSite ? 'Edit Site Deployment' : 'Deploy New Operational Site'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSite} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Select Corporate Client *</label>
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => {
                      const c = clients.find((client) => client.id === e.target.value);
                      setFormData({
                        ...formData,
                        clientId: e.target.value,
                        clientName: c?.companyName || '',
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.clientCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Site Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.siteCode}
                    onChange={(e) => setFormData({ ...formData, siteCode: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Site / Branch Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Location / Sector *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Site Supervisor Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.siteSupervisor}
                    onChange={(e) => setFormData({ ...formData, siteSupervisor: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Site Incharge / Focal Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Required Guards Count *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.requiredGuards}
                    onChange={(e) => setFormData({ ...formData, requiredGuards: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Shift Schedule</label>
                  <select
                    value={formData.shiftDetails}
                    onChange={(e: any) => setFormData({ ...formData, shiftDetails: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                  >
                    <option value="12 Hours (2 Shifts)">12 Hours (2 Shifts)</option>
                    <option value="8 Hours (3 Shifts)">8 Hours (3 Shifts)</option>
                    <option value="24 Hours Standby">24 Hours Standby</option>
                    <option value="Day Shift Only">Day Shift Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Monthly Billing Rate (PKR)</label>
                  <input
                    type="number"
                    value={formData.monthlyRate}
                    onChange={(e) => setFormData({ ...formData, monthlyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Save Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
