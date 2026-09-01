import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Edit2,
  FolderTree,
  Lock,
  Package,
  Pencil,
  Plus,
  Power,
  Search,
  ShoppingCart,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductItem } from '../../types';
import { formatPKR } from '../../utils/formatters';

interface InventoryProductsViewProps {
  onNavigateToCategories?: () => void;
}

export const InventoryProductsView: React.FC<InventoryProductsViewProps> = ({
  onNavigateToCategories,
}) => {
  const {
    products,
    inventoryCategories,
    guards,
    sites,
    currentUserRole,
    addProduct,
    updateProduct,
    deleteProduct,
    issueInventoryItem,
    receiveInventoryStock,
    logAudit,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSubCategory, setFilterSubCategory] = useState('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deleteModalProduct, setDeleteModalProduct] = useState<ProductItem | null>(null);
  const [deleteBlockReason, setDeleteBlockReason] = useState<string | null>(null);
  const [issueModalProduct, setIssueModalProduct] = useState<ProductItem | null>(null);
  const [receiveModalProduct, setReceiveModalProduct] = useState<ProductItem | null>(null);

  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  // Form State (New & Edit Product)
  const [sku, setSku] = useState(`MSS-INV-${String(products.length + 1).padStart(3, '0')}`);
  const [productName, setProductName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    inventoryCategories[0]?.id || 'CAT-UNIFORM'
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('');
  const [unit, setUnit] = useState('Pcs');
  const [unitPrice, setUnitPrice] = useState<number>(1200);
  const [currentStock, setCurrentStock] = useState<number>(50);
  const [minimumStock, setMinimumStock] = useState<number>(15);
  const [reorderLevel, setReorderLevel] = useState<number>(20);
  const [location, setLocation] = useState('Store Rack A-1');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  // Issue Form
  const [issueQty, setIssueQty] = useState<number>(1);
  const [issueGuardId, setIssueGuardId] = useState(guards[0]?.id || '');
  const [issueSiteId, setIssueSiteId] = useState(sites[0]?.id || '');
  const [issueNotes, setIssueNotes] = useState('Issued to guard upon joining');

  // Receive Stock Form
  const [receiveQty, setReceiveQty] = useState<number>(20);
  const [receiveUnitCost, setReceiveUnitCost] = useState<number>(1200);
  const [receiveSupplier, setReceiveSupplier] = useState('Royal Uniform Suppliers Faisalabad');
  const [receiveNotes, setReceiveNotes] = useState('Fresh inventory batch arrived');

  const canManageInventory =
    currentUserRole === 'Super Admin' || currentUserRole === 'Armoury Officer';

  // Get active subcategories for currently selected category in form
  const activeParentCategory = inventoryCategories.find((c) => c.id === selectedCategoryId);
  const availableSubCategories = activeParentCategory?.subCategories || [];

  const handleOpenAddProduct = () => {
    if (!canManageInventory) {
      showNotice('warning', 'Only Super Admin and Armoury Officer can add inventory items.');
      return;
    }
    const defaultCat = inventoryCategories[0];
    const defaultSub = defaultCat?.subCategories?.[0];

    setSku(`MSS-INV-${String(products.length + 1).padStart(3, '0')}`);
    setProductName('');
    setSelectedCategoryId(defaultCat?.id || 'CAT-UNIFORM');
    setSelectedSubCategoryId(defaultSub?.id || '');
    setUnit('Pcs');
    setUnitPrice(1200);
    setCurrentStock(50);
    setMinimumStock(15);
    setReorderLevel(20);
    setLocation('Store Rack A-1');
    setDescription('');
    setStatus('Active');
    setIsAddProductOpen(true);
  };

  const handleOpenEditProduct = (prod: ProductItem) => {
    if (!canManageInventory) {
      showNotice('warning', 'Only Super Admin and Armoury Officer can edit inventory items.');
      return;
    }
    setEditingProduct(prod);
    setSku(prod.productCode || prod.sku || '');
    setProductName(prod.productName || prod.name || '');

    // Match category
    const matchedCat =
      inventoryCategories.find((c) => c.id === prod.categoryId || c.name === prod.category) ||
      inventoryCategories[0];

    setSelectedCategoryId(matchedCat?.id || '');

    // Match subcategory
    const matchedSub =
      matchedCat?.subCategories.find(
        (s) => s.id === prod.subCategoryId || s.name === prod.subcategory
      ) || matchedCat?.subCategories[0];

    setSelectedSubCategoryId(matchedSub?.id || '');
    setUnit(prod.unit || 'Pcs');
    setUnitPrice(prod.unitPrice || prod.costPrice || 0);
    setCurrentStock(prod.currentStock || 0);
    setMinimumStock(prod.minimumStock || prod.minStockLevel || 10);
    setReorderLevel(prod.reorderLevel || 15);
    setLocation(prod.location || 'Store Rack A-1');
    setDescription(prod.description || '');
    setStatus(prod.status || 'Active');
  };

  const handleOpenDeleteProduct = (prod: ProductItem) => {
    if (!canManageInventory) {
      showNotice('warning', 'Only Super Admin and Armoury Officer can delete inventory items.');
      return;
    }
    setDeleteModalProduct(prod);
    // If current stock > 0, recommend deactivating
    if ((prod.currentStock || 0) > 0) {
      setDeleteBlockReason(
        `This item has ${prod.currentStock} ${prod.unit} currently in stock. Deactivate it instead to avoid inventory discrepancies.`
      );
    } else {
      setDeleteBlockReason(null);
    }
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    const parentCat = inventoryCategories.find((c) => c.id === selectedCategoryId);
    const subCat = parentCat?.subCategories.find((s) => s.id === selectedSubCategoryId);

    addProduct({
      productCode: sku,
      sku,
      productName: productName.trim(),
      name: productName.trim(),
      category: parentCat?.name || 'Uniform',
      categoryId: selectedCategoryId,
      subcategory: subCat?.name || '',
      subCategoryId: selectedSubCategoryId,
      unit,
      unitPrice,
      costPrice: unitPrice,
      sellingPrice: unitPrice * 1.2,
      currentStock: Number(currentStock) || 0,
      minimumStock: Number(minimumStock) || 10,
      minStockLevel: Number(minimumStock) || 10,
      reorderLevel: Number(reorderLevel) || 15,
      location,
      description: description.trim(),
      status,
    });

    logAudit('Add Product', 'Inventory', sku, `Created inventory item "${productName}" under ${parentCat?.name}`);
    setIsAddProductOpen(false);
    showNotice('success', `Item "${productName}" added to inventory store.`);
  };

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !productName.trim()) return;

    const parentCat = inventoryCategories.find((c) => c.id === selectedCategoryId);
    const subCat = parentCat?.subCategories.find((s) => s.id === selectedSubCategoryId);

    updateProduct(editingProduct.id, {
      productCode: sku,
      sku,
      productName: productName.trim(),
      name: productName.trim(),
      category: parentCat?.name || 'Uniform',
      categoryId: selectedCategoryId,
      subcategory: subCat?.name || '',
      subCategoryId: selectedSubCategoryId,
      unit,
      unitPrice,
      costPrice: unitPrice,
      minimumStock: Number(minimumStock) || 10,
      minStockLevel: Number(minimumStock) || 10,
      reorderLevel: Number(reorderLevel) || 15,
      location,
      description: description.trim(),
      status,
    });

    logAudit('Update Product', 'Inventory', sku, `Updated inventory item "${productName}"`);
    setEditingProduct(null);
    showNotice('success', `Item "${productName}" updated successfully.`);
  };

  const handleConfirmDeleteProduct = () => {
    if (!deleteModalProduct) return;
    deleteProduct(deleteModalProduct.id);
    logAudit('Delete Product', 'Inventory', deleteModalProduct.productCode || deleteModalProduct.id, `Deleted item "${deleteModalProduct.productName}"`);
    showNotice('success', `Item "${deleteModalProduct.productName}" removed from store.`);
    setDeleteModalProduct(null);
  };

  const handleDeactivateProductInstead = () => {
    if (!deleteModalProduct) return;
    updateProduct(deleteModalProduct.id, { status: 'Inactive' });
    logAudit('Deactivate Product', 'Inventory', deleteModalProduct.productCode || deleteModalProduct.id, `Deactivated item "${deleteModalProduct.productName}"`);
    showNotice('success', `Item "${deleteModalProduct.productName}" marked as Inactive.`);
    setDeleteModalProduct(null);
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

    logAudit('Issue Inventory', 'Inventory', issueModalProduct.productCode, `Issued ${issueQty} ${issueModalProduct.unit} to guard ${guard?.name}`);
    setIssueModalProduct(null);
    showNotice('success', `Issued ${issueQty} ${issueModalProduct.unit} of "${issueModalProduct.productName}" to ${guard?.name}.`);
  };

  const handleReceiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiveModalProduct || receiveQty <= 0) return;

    receiveInventoryStock({
      productId: receiveModalProduct.id,
      quantity: receiveQty,
      unitPrice: receiveUnitCost,
      supplierName: receiveSupplier,
      notes: receiveNotes,
    });

    logAudit('Receive Stock', 'Inventory', receiveModalProduct.productCode, `Received batch of ${receiveQty} ${receiveModalProduct.unit}`);
    setReceiveModalProduct(null);
    showNotice('success', `Received stock: ${receiveQty} ${receiveModalProduct.unit} added to "${receiveModalProduct.productName}".`);
  };

  const showNotice = (type: 'success' | 'warning' | 'error', message: string) => {
    setActionNotice({ type, message });
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const pName = p.productName || p.name || '';
    const pCode = p.productCode || p.sku || '';
    const pSub = p.subcategory || '';
    const matchesSearch =
      pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pSub.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    const matchesSubCategory = filterSubCategory === 'All' || p.subcategory === filterSubCategory;
    const matchesLowStock = !showLowStockOnly || (p.currentStock || 0) <= (p.minimumStock || p.minStockLevel || 10);
    const matchesStatus = statusFilter === 'All' || (p.status || 'Active') === statusFilter;

    return matchesSearch && matchesCategory && matchesSubCategory && matchesLowStock && matchesStatus;
  });

  const totalStoreValue = products.reduce(
    (sum, p) => sum + (Number(p.currentStock) || 0) * (Number(p.unitPrice) || Number(p.costPrice) || 0),
    0
  );

  const lowStockCount = products.filter(
    (p) => (p.currentStock || 0) <= (p.minimumStock || p.minStockLevel || 10)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
              <Boxes className="w-6 h-6 text-sky-400" />
              <span>Inventory & Store Management</span>
            </h1>
            {!canManageInventory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 border border-amber-800 text-amber-300">
                <Lock className="w-2.5 h-2.5" /> View Only
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Store catalogue classified by <strong className="text-white">Category → Sub-Category → Item</strong> with real-time stock balance and guard issuance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToCategories && (
            <button
              onClick={onNavigateToCategories}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <FolderTree className="w-3.5 h-3.5 text-sky-400" />
              <span>Taxonomy Directory</span>
            </button>
          )}

          {canManageInventory && (
            <button
              onClick={handleOpenAddProduct}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Store Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div
          className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold animate-in fade-in ${
            actionNotice.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : actionNotice.type === 'warning'
              ? 'bg-amber-950/80 border-amber-800 text-amber-300'
              : 'bg-red-950/80 border-red-800 text-red-300'
          }`}
        >
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Unique Items</span>
          <div className="text-xl font-black text-white mt-0.5">{products.length}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Inventory Value</span>
          <div className="text-xl font-black text-emerald-400 mt-0.5">{formatPKR(totalStoreValue)}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Low Stock Alerts</span>
          <div className="text-xl font-black text-amber-400 mt-0.5">{lowStockCount}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Categories</span>
          <div className="text-xl font-black text-sky-400 mt-0.5">{inventoryCategories.length}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Items by Name, SKU, Sub-Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterSubCategory('All');
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-semibold"
            >
              <option value="All">All Categories</option>
              {inventoryCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Low Stock Toggle */}
            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer shrink-0 ${
                showLowStockOnly
                  ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Low Stock Only ({lowStockCount})
            </button>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 shrink-0">
              <button
                onClick={() => setStatusFilter('All')}
                className={`px-2 py-1 text-[11px] font-bold rounded cursor-pointer ${
                  statusFilter === 'All' ? 'bg-slate-700 text-white' : 'text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('Active')}
                className={`px-2 py-1 text-[11px] font-bold rounded cursor-pointer ${
                  statusFilter === 'Active' ? 'bg-emerald-700 text-white' : 'text-slate-400'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('Inactive')}
                className={`px-2 py-1 text-[11px] font-bold rounded cursor-pointer ${
                  statusFilter === 'Inactive' ? 'bg-amber-700 text-white' : 'text-slate-400'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <th className="py-3 px-3">Item & SKU</th>
                <th className="py-3 px-3">Category Hierarchy</th>
                <th className="py-3 px-3 text-center">In Stock</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                <th className="py-3 px-3 text-right">Total Valuation</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredProducts.map((prod) => {
                const prodName = prod.productName || prod.name || '';
                const prodCode = prod.productCode || prod.sku || '';
                const uPrice = prod.unitPrice || prod.costPrice || 0;
                const stock = prod.currentStock || 0;
                const minStock = prod.minimumStock || prod.minStockLevel || 10;
                const isLow = stock <= minStock;
                const totalVal = stock * uPrice;

                return (
                  <tr
                    key={prod.id}
                    className={`hover:bg-slate-900/50 transition-colors ${
                      prod.status === 'Inactive' ? 'bg-slate-950/40 opacity-70' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-white text-sm">{prodName}</div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="font-mono text-blue-400">{prodCode}</span>
                        {prod.location && <span>• {prod.location}</span>}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-950 text-blue-300 rounded uppercase">
                          {prod.category}
                        </span>
                        {prod.subcategory && (
                          <span className="text-[10px] font-medium text-slate-300">
                            › {prod.subcategory}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`font-black font-mono text-sm px-2.5 py-0.5 rounded-lg ${
                            isLow
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80 animate-pulse'
                              : 'bg-slate-900 text-slate-100 border border-slate-800'
                          }`}
                        >
                          {stock} {prod.unit}
                        </span>
                      </div>
                      {isLow && (
                        <div className="text-[10px] text-amber-400 font-bold mt-0.5">
                          Min: {minStock} {prod.unit}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-200">
                      {formatPKR(uPrice)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                      {formatPKR(totalVal)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          prod.status === 'Inactive'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {prod.status || 'Active'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Issue to Guard Button */}
                        <button
                          onClick={() => {
                            setIssueModalProduct(prod);
                            setIssueQty(1);
                          }}
                          disabled={stock <= 0}
                          className="px-2 py-1 bg-sky-950 hover:bg-sky-900 border border-sky-800/80 text-sky-300 font-bold rounded text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Issue Item to Security Guard"
                        >
                          <ArrowUpRight className="w-3 h-3" />
                          <span>Issue</span>
                        </button>

                        {/* Receive Stock Batch Button */}
                        <button
                          onClick={() => {
                            setReceiveModalProduct(prod);
                            setReceiveQty(20);
                            setReceiveUnitCost(uPrice);
                          }}
                          className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 font-bold rounded text-[11px] flex items-center gap-1 cursor-pointer"
                          title="Receive Stock Batch"
                        >
                          <ArrowDownLeft className="w-3 h-3" />
                          <span>Receive</span>
                        </button>

                        {/* Edit Item */}
                        {canManageInventory && (
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 text-blue-400 hover:text-white rounded-lg hover:bg-blue-950/80 border border-transparent hover:border-blue-800 cursor-pointer"
                            title="Edit Item"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Item */}
                        {canManageInventory && (
                          <button
                            onClick={() => handleOpenDeleteProduct(prod)}
                            className="p-1.5 text-red-400 hover:text-white rounded-lg hover:bg-red-950/80 border border-transparent hover:border-red-800 cursor-pointer"
                            title="Delete / Deactivate Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 text-xs">
                    No inventory items found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-900/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Total Store Items: <strong>{products.length}</strong></span>
          <span>Valuation: <strong className="text-emerald-400 font-mono">{formatPKR(totalStoreValue)}</strong></span>
        </div>
      </div>

      {/* Modal: Create Item */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-400" />
                <span>Add New Store Item</span>
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">SKU / Item Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Measurement Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Pairs / Sets">Pairs / Sets</option>
                    <option value="Rounds / Cartridges">Rounds / Cartridges</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Units">Units</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Item Title / Name *</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Tactical Combat Boots (Size 9)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>

              {/* Dynamic Cascading Category & Sub-Category Selection */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-sky-400 font-bold mb-1">1. Parent Category *</label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => {
                      const newCatId = e.target.value;
                      setSelectedCategoryId(newCatId);
                      const cat = inventoryCategories.find((c) => c.id === newCatId);
                      setSelectedSubCategoryId(cat?.subCategories?.[0]?.id || '');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                  >
                    {inventoryCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-emerald-400 font-bold mb-1">2. Sub-Category *</label>
                  <select
                    value={selectedSubCategoryId}
                    onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                  >
                    {availableSubCategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Unit Cost (PKR)</label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={minimumStock}
                    onChange={(e) => setMinimumStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Store Rack / Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Armoury Safe B"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Item specifications and notes..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Save Store Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Item */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-sky-400" />
                <span>Edit Store Item</span>
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">SKU / Item Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Measurement Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Pairs / Sets">Pairs / Sets</option>
                    <option value="Rounds / Cartridges">Rounds / Cartridges</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Units">Units</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Item Title / Name *</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>

              {/* Dynamic Cascading Category & Sub-Category Selection */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-sky-400 font-bold mb-1">1. Parent Category *</label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => {
                      const newCatId = e.target.value;
                      setSelectedCategoryId(newCatId);
                      const cat = inventoryCategories.find((c) => c.id === newCatId);
                      setSelectedSubCategoryId(cat?.subCategories?.[0]?.id || '');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                  >
                    {inventoryCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-emerald-400 font-bold mb-1">2. Sub-Category *</label>
                  <select
                    value={selectedSubCategoryId}
                    onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                  >
                    {availableSubCategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Unit Cost (PKR)</label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={minimumStock}
                    onChange={(e) => setMinimumStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Store Rack / Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Item Confirmation */}
      {deleteModalProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 bg-red-950/90 border border-red-800/80 rounded-xl text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Item Confirmation</h3>
                <p className="text-xs text-slate-400">{deleteModalProduct.productName || deleteModalProduct.name}</p>
              </div>
            </div>

            {deleteBlockReason ? (
              <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-xl space-y-2 text-xs text-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="font-semibold">{deleteBlockReason}</p>
                </div>
                <p className="text-[11px] text-amber-300/80 pl-6">
                  Deactivating this item hides it from issuance while keeping full historical records of past deployments.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-300">
                Are you sure you want to permanently delete <strong>"{deleteModalProduct.productName || deleteModalProduct.name}"</strong>?
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalProduct(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              {deleteBlockReason ? (
                <button
                  type="button"
                  onClick={handleDeactivateProductInstead}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Deactivate Instead
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmDeleteProduct}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Confirm Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Issue Item to Guard */}
      {issueModalProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-sky-400" />
                <span>Issue Item to Guard</span>
              </h3>
              <button
                onClick={() => setIssueModalProduct(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-white">{issueModalProduct.productName || issueModalProduct.name}</div>
                <div className="text-slate-400 font-mono">{issueModalProduct.productCode || issueModalProduct.sku}</div>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-[10px]">Available Stock</div>
                <div className="font-bold font-mono text-sky-400">{issueModalProduct.currentStock} {issueModalProduct.unit}</div>
              </div>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Quantity to Issue *</label>
                <input
                  type="number"
                  min={1}
                  max={issueModalProduct.currentStock}
                  required
                  value={issueQty}
                  onChange={(e) => setIssueQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select Security Guard *</label>
                <select
                  value={issueGuardId}
                  onChange={(e) => setIssueGuardId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                >
                  {guards.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.guardCode} - {g.name} ({g.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Assigned Security Site</label>
                <select
                  value={issueSiteId}
                  onChange={(e) => setIssueSiteId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.siteCode} - {s.siteName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Issuance Narration / Remarks</label>
                <textarea
                  rows={2}
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIssueModalProduct(null)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Receive Stock Batch */}
      {receiveModalProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                <span>Receive Stock Batch</span>
              </h3>
              <button
                onClick={() => setReceiveModalProduct(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="font-bold text-white">{receiveModalProduct.productName || receiveModalProduct.name}</div>
              <div className="text-slate-400 font-mono text-[11px]">Current Store Balance: {receiveModalProduct.currentStock} {receiveModalProduct.unit}</div>
            </div>

            <form onSubmit={handleReceiveSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Batch Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={receiveQty}
                    onChange={(e) => setReceiveQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Unit Cost (PKR)</label>
                  <input
                    type="number"
                    value={receiveUnitCost}
                    onChange={(e) => setReceiveUnitCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Supplier / Vendor Name</label>
                <input
                  type="text"
                  value={receiveSupplier}
                  onChange={(e) => setReceiveSupplier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Batch Remarks</label>
                <textarea
                  rows={2}
                  value={receiveNotes}
                  onChange={(e) => setReceiveNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReceiveModalProduct(null)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Add to Store Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
