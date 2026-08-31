import { Search, X, User, Shield, Building, MapPin, Receipt, FileText, Package, ArrowRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SearchResultItem } from '../../types';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, searchGlobal, setActiveTab } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      setResults(searchGlobal(searchTerm));
    } else {
      setResults([]);
    }
  }, [searchTerm, searchGlobal]);

  if (!isSearchOpen) return null;

  const handleSelect = (item: SearchResultItem) => {
    setActiveTab(item.targetTab);
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Guard':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'Weapon':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'Client':
        return <Building className="w-4 h-4 text-emerald-600" />;
      case 'Site':
        return <MapPin className="w-4 h-4 text-amber-600" />;
      case 'Voucher':
        return <Receipt className="w-4 h-4 text-purple-600" />;
      case 'Salary Slip':
        return <FileText className="w-4 h-4 text-cyan-600" />;
      case 'Product':
        return <Package className="w-4 h-4 text-indigo-600" />;
      default:
        return <Search className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 sm:pt-20">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search Guards, Weapons, Clients, Sites, Vouchers, Slips, Products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="w-full text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden bg-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded font-mono hover:bg-slate-200 cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-2">
          {searchTerm.trim().length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-slate-600">Quick Global Search</p>
              <p className="mt-1">Search by Guard name, CNIC, Weapon S/N, Client, Voucher # or Slip No.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              <p>No matching records found for "{searchTerm}"</p>
            </div>
          ) : (
            results.map((item) => (
              <button
                key={`${item.category}-${item.id}`}
                onClick={() => handleSelect(item)}
                className="w-full text-left p-3 hover:bg-blue-50/70 rounded-lg flex items-center justify-between gap-3 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 bg-slate-100 rounded-lg shrink-0 group-hover:bg-white border border-slate-200">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 truncate">{item.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.status === 'Active' || item.status === 'Issued' || item.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Available'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Quick Shortcuts Footer */}
        <div className="bg-slate-50 px-4 py-2 text-[11px] text-slate-500 border-t border-slate-200 flex items-center justify-between">
          <span>Search SGMS unified database</span>
          <span className="font-mono text-[10px]">Mountain Security Services</span>
        </div>
      </div>
    </div>
  );
};
