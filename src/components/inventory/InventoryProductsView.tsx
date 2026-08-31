import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCategory, ProductItem } from '../../types';
import { formatPKR } from '../../utils/formatters';

export const InventoryProductsView: React.FC = () => {
  const {
    products,
    guards,
    sites,
    addProduct,
    deleteProduct,
    issueInventoryItem,
    receiveInventoryStock,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [issueModalProduct, setIssueModalProduct] = useState<ProductItem | null>(null);
  const [receiveModalProduct, setReceiveModalProduct] = useState<ProductItem | null>(null);
  const [deleteModalProduct, setDeleteModalProduct] = useState<ProductItem | null>(null);

  // New Product Form
  const [sku, setSku] = useState(`MSS-INV-${String(products.length + 1).padStart(3, '0')}`);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Uniform');
  const [unit, setUnit] = useState('Pairs / Sets');
  const [costPrice, setCostPrice] = useState<number>(3500);
  const [sellingPrice, setSellingPrice] = useState<number>(4200);
  const [currentStock, setCurrentStock] = useState<number>(50);
  const [minStockLevel, setMinStockLevel] = useState<number>(15);
  const [location, setLocation] = useState('Store Rack A-1');
  const [description, setDescription] = useState('');

  // Issue Form
  const [issueQty, setIssueQty] = useState<number>(1);
  const [issueGuardId, setIssueGuardId] = useState(guards[0]?.id || '');
  const [issueSiteId, setIssueSiteId] = useState(sites[0]?.id || '');
  const [issueNotes, setIssueNotes] = useState('Issued to guard upon joining');

  // Receive Stock Form
  const [receiveQty, setReceiveQty] = useState<number>(20);
  const [receiveUnitCost, setReceiveUnitCost] = useState<number>(3500);
  const [receiveSupplier, setReceiveSupplier] = useState('Royal Uniform Suppliers Faisalabad');
  const [receiveNotes, setReceiveNotes] = useState('Fresh inventory batch arrived');

  const categories: ProductCategory[] = [
    'Uniform',
    'Equipment',
    'Protective Gear',
    'Footwear',
    'Headwear',
    'Tactical Gear',
    'Communication',
    'Ammunition',
    'Stationery',
  ];

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      productCode: sku,
      sku,
      productName: name,
      name,
      category,
      unit,
      unitPrice: costPrice,
      costPrice,
      sellingPrice,
      minimumStock: minStockLevel,
      minStockLevel,
      reorderLevel: minStockLevel + 5,
      location,
      description,
      status: 'Active',
    });
    setIsAddProductOpen(false);
    setName('');
    setDescription('');
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueModalProduct || issueQty <= 0) return;

    const guard = guards.find((g) => g.id === issueGuardId);
    const site = sites.find((s) => s.id === issueSiteId);

    issueInventoryItem({
      productId: issueModalProduct.id,
      quantity: issueQty,
      guardId: issueGuardId,
      guardName: guard?.name,
      siteId: issueSiteId,
      siteName: site?.siteName,
      notes: issueNotes,
    });

    setIssueModalProduct(null);
  };

  const handleReceiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiveModalProduct || receiveQty <= 0) return;

    receiveInventoryStock({
      productId: receiveModalProduct.id,
      quantity: receiveQty,
      unitCost: receiveUnitCost,
      supplierName: receiveSupplier,
      notes: receiveNotes,
    });

    setReceiveModalProduct(null);
  };

  const filteredProducts = products.filter((p) => {
    const pTitle = p.productName || p.name || '';
    const pCode = p.productCode || p.sku || '';
    const pMin = p.minimumStock ?? p.minStockLevel ?? 0;

    const matchesSearch =
      pTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === 'All' || p.category === filterCategory;
    const matchesLowStock = !showLowStockOnly || p.currentStock <= pMin;
    return matchesSearch && matchesCat && matchesLowStock;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-400" />
            <span>Uniforms, Gear & Inventory Master ({products.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Track guard uniforms, boots, belts, badges, ammunition, and security hardware stock.
          </p>
        </div>

        <button
          onClick={() => {
            setSku(`MSS-INV-${String(products.length + 1).padStart(3, '0')}`);
            setIsAddProductOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Inventory Item</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search item name, SKU, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              showLowStockOnly
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Alert</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <th className="py-3 px-4">Item Details & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Store Location</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Issue/Billing Price</th>
                <th className="py-3 px-4 text-center">Current Qty</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredProducts.map((p) => {
                const pTitle = p.productName || p.name || 'Unnamed Item';
                const pCode = p.productCode || p.sku || 'N/A';
                const pMin = p.minimumStock ?? p.minStockLevel ?? 0;
                const pCost = p.unitPrice ?? p.costPrice ?? 0;
                const pSell = p.sellingPrice ?? pCost;
                const isLow = p.currentStock <= pMin;

                return (
                  <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-amber-400">{pCode}</span>
                      <div className="font-bold text-slate-100">{pTitle}</div>
                      <div className="text-[10px] text-slate-400">{p.unit}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{p.location || 'Main Store'}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {formatPKR(pCost)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatPKR(pSell)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`text-sm font-black font-mono px-2 py-0.5 rounded ${
                            isLow ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-900 text-slate-100'
                          }`}
                        >
                          {p.currentStock}
                        </span>
                        {isLow && (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" title="Below Reorder Level!" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">Min: {pMin}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isLow
                            ? 'bg-red-950 text-red-300 border border-red-800/60'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        }`}
                      >
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setReceiveModalProduct(p);
                          setReceiveUnitCost(pCost);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-800/80 hover:bg-emerald-700 text-white rounded font-bold text-xs cursor-pointer shadow-xs"
                        title="Receive Stock"
                      >
                        <ArrowDownLeft className="w-3 h-3" />
                        <span>Add Stock</span>
                      </button>

                      <button
                        onClick={() => {
                          setIssueModalProduct(p);
                          if (guards.length > 0) setIssueGuardId(guards[0].id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-800/80 hover:bg-amber-700 text-white rounded font-bold text-xs cursor-pointer shadow-xs"
                        title="Issue to Guard / Site"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        <span>Issue Item</span>
                      </button>

                      <button
                        onClick={() => setDeleteModalProduct(p)}
                        className="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-950/60 cursor-pointer"
                        title="Delete Item from Inventory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Add New Inventory / Uniform Item
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Item SKU / Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Product Description / Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MSS High-Visibility Winter Security Jacket"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Store Rack / Shelf Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Cost Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Selling / Billing Price (PKR)</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Opening Stock Quantity</label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Minimum Alert Threshold</label>
                  <input
                    type="number"
                    value={minStockLevel}
                    onChange={(e) => setMinStockLevel(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Stock Modal */}
      {receiveModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                <span>Receive Inventory Stock</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {receiveModalProduct.productName || receiveModalProduct.name} ({receiveModalProduct.productCode || receiveModalProduct.sku})
              </p>
            </div>

            <form onSubmit={handleReceiveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Incoming Quantity ({receiveModalProduct.unit}) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={receiveQty}
                  onChange={(e) => setReceiveQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Unit Purchase Cost (PKR) *</label>
                <input
                  type="number"
                  required
                  value={receiveUnitCost}
                  onChange={(e) => setReceiveUnitCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Vendor / Supplier Name</label>
                <input
                  type="text"
                  value={receiveSupplier}
                  onChange={(e) => setReceiveSupplier(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Batch / Invoice Remarks</label>
                <input
                  type="text"
                  value={receiveNotes}
                  onChange={(e) => setReceiveNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl flex items-center justify-between">
                <span className="text-emerald-300 font-semibold">Total Stock Inflow:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {formatPKR(receiveQty * receiveUnitCost)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReceiveModalProduct(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Record Stock Inflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {issueModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-amber-400" />
                <span>Issue Item to Guard / Post</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {issueModalProduct.productName || issueModalProduct.name} • Available: {issueModalProduct.currentStock} {issueModalProduct.unit}
              </p>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select Security Guard</label>
                <select
                  value={issueGuardId}
                  onChange={(e) => setIssueGuardId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                >
                  <option value="">-- No Specific Guard (Site Direct) --</option>
                  {guards.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.guardCode}) - {g.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Site / Post</label>
                <select
                  value={issueSiteId}
                  onChange={(e) => setIssueSiteId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                >
                  <option value="">-- Main Head Office --</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.siteName} ({s.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Quantity to Issue ({issueModalProduct.unit}) *</label>
                <input
                  type="number"
                  min="1"
                  max={issueModalProduct.currentStock}
                  required
                  value={issueQty}
                  onChange={(e) => setIssueQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Issue Remarks / Purpose</label>
                <input
                  type="text"
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIssueModalProduct(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Product Confirmation */}
      {deleteModalProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-800/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400 pb-3 border-b border-slate-800">
              <div className="p-2.5 bg-red-950/80 border border-red-800 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Inventory Item</h3>
                <p className="text-xs text-slate-400">Stock & Asset De-listing</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Item Name:</span>
                <span className="font-bold text-white">{deleteModalProduct.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SKU / Code:</span>
                <span className="font-mono text-blue-400 font-bold">{deleteModalProduct.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="text-slate-300 font-semibold">{deleteModalProduct.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current In-Stock:</span>
                <span className="text-amber-400 font-bold">{deleteModalProduct.currentStock} {deleteModalProduct.unit}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to delete <strong>{deleteModalProduct.name}</strong> ({deleteModalProduct.sku}) from the inventory catalog?
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalProduct(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(deleteModalProduct.id);
                  setDeleteModalProduct(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-md cursor-pointer text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Item</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
