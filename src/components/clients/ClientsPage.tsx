import {
  Building2,
  CheckCircle2,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Printer,
  Search,
  Shield,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';
import { formatPKR } from '../../utils/formatters';

export const ClientsPage: React.FC = () => {
  const { clients, sites, guards, addClient, updateClient, triggerPrint } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState<Omit<Client, 'id' | 'createdAt'>>({
    clientCode: `C-${(clients.length + 1).toString().padStart(3, '0')}`,
    clientName: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: 'Peshawar',
    contractStartDate: new Date().toISOString().split('T')[0],
    contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    billingMethod: 'Per Guard Monthly',
    monthlyBillingAmount: 75000,
    ratePerGuard: 25000,
    paymentTerms: 'Due on 5th of each month',
    status: 'Active',
    notes: '',
  });

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClient) {
      updateClient(selectedClient.id, formData);
      setSelectedClient(null);
    } else {
      addClient(formData);
      setIsAddModalOpen(false);
    }
    setFormData({
      clientCode: `C-${(clients.length + 2).toString().padStart(3, '0')}`,
      clientName: '',
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      city: 'Peshawar',
      contractStartDate: new Date().toISOString().split('T')[0],
      contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      billingMethod: 'Per Guard Monthly',
      monthlyBillingAmount: 75000,
      ratePerGuard: 25000,
      paymentTerms: 'Due on 5th of each month',
      status: 'Active',
      notes: '',
    });
  };

  const handlePrintClientSummary = (client: Client) => {
    const clientSites = sites.filter((s) => s.clientId === client.id);
    const clientGuards = guards.filter((g) => clientSites.some((s) => s.id === g.currentSiteId));

    triggerPrint({
      type: 'client-invoice',
      title: `Client Security Profile - ${client.companyName}`,
      data: {
        invoiceNo: `PROF-${client.clientCode}`,
        clientName: client.companyName,
        billingMonth: 'Current Deployment',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: client.contractEndDate,
        guardsDeployed: clientGuards.length,
        ratePerGuard: client.ratePerGuard,
        additionalCharges: 0,
        taxAmount: 0,
        totalAmount: client.monthlyBillingAmount,
        paidAmount: 0,
        balanceAmount: client.monthlyBillingAmount,
        notes: `Registered sites: ${clientSites.map((s) => s.siteName).join(', ')}. Contact: ${client.contactPerson} (${client.phone})`,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-400" />
            <span>Corporate Client Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage security service contracts, authorized client contacts, and site billing terms.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedClient(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Client</span>
        </button>
      </div>

      {/* Control Filters */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company, code, contact person..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['All', 'Active', 'Inactive', 'Suspended'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => {
          const clientSites = sites.filter((s) => s.clientId === client.id);
          const clientGuards = guards.filter((g) =>
            clientSites.some((s) => s.id === g.currentSiteId)
          );

          return (
            <div
              key={client.id}
              className="bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4 relative group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950/70 border border-blue-800/80 px-2 py-0.5 rounded">
                      {client.clientCode}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1 group-hover:text-blue-300 transition-colors">
                      {client.companyName}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{client.contactPerson}</span>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      client.status === 'Active'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        : 'bg-red-950/80 text-red-300 border-red-800'
                    }`}
                  >
                    {client.status}
                  </span>
                </div>

                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{client.phone}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{client.city}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400">Monthly Contract:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {formatPKR(client.monthlyBillingAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Active Force Deployed:</span>
                    <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                      {clientGuards.length} Guards ({clientSites.length} Sites)
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <button
                  onClick={() => handlePrintClientSummary(client)}
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white font-medium cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>Print Slip</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setFormData({
                        clientCode: client.clientCode,
                        clientName: client.clientName,
                        companyName: client.companyName,
                        contactPerson: client.contactPerson,
                        phone: client.phone,
                        email: client.email || '',
                        address: client.address,
                        city: client.city,
                        contractStartDate: client.contractStartDate,
                        contractEndDate: client.contractEndDate,
                        billingMethod: client.billingMethod,
                        monthlyBillingAmount: client.monthlyBillingAmount,
                        ratePerGuard: client.ratePerGuard,
                        paymentTerms: client.paymentTerms,
                        status: client.status,
                        notes: client.notes || '',
                      });
                      setIsAddModalOpen(true);
                    }}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                {selectedClient ? 'Edit Client Details' : 'Register New Corporate Client'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Client Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.clientCode}
                    onChange={(e) => setFormData({ ...formData, clientCode: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Company Registered Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value, clientName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Official Mobile / Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Official Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Full Head Office Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Monthly Billing Amount (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={formData.monthlyBillingAmount}
                    onChange={(e) => setFormData({ ...formData, monthlyBillingAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Standard Rate Per Guard (PKR)</label>
                  <input
                    type="number"
                    value={formData.ratePerGuard}
                    onChange={(e) => setFormData({ ...formData, ratePerGuard: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Contract Start Date</label>
                  <input
                    type="date"
                    value={formData.contractStartDate}
                    onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Contract Expiry Date</label>
                  <input
                    type="date"
                    value={formData.contractEndDate}
                    onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Payment & Invoice Terms</label>
                  <input
                    type="text"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
