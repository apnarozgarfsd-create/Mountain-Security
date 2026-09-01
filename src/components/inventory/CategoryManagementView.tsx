import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Edit2,
  FolderPlus,
  FolderTree,
  Layers,
  Lock,
  Pencil,
  Plus,
  Power,
  Search,
  Shield,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryCategory, InventorySubCategory } from '../../types';

export const CategoryManagementView: React.FC = () => {
  const {
    inventoryCategories,
    products,
    currentUserRole,
    addInventoryCategory,
    updateInventoryCategory,
    deleteInventoryCategory,
    addInventorySubCategory,
    updateInventorySubCategory,
    deleteInventorySubCategory,
    logAudit,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'CAT-UNIFORM': true,
    'CAT-EQUIPMENT': true,
    'CAT-PROTECTIVE': true,
    'CAT-FOOTWEAR': true,
    'CAT-HEADWEAR': true,
    'CAT-TACTICAL': true,
    'CAT-COMMUNICATION': true,
    'CAT-AMMUNITION': true,
    'CAT-STATIONERY': true,
  });

  // Modal States
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<InventoryCategory | null>(null);
  const [catDeleteBlockedMsg, setCatDeleteBlockedMsg] = useState<string | null>(null);

  const [isAddSubCategoryOpen, setIsAddSubCategoryOpen] = useState(false);
  const [selectedParentCatId, setSelectedParentCatId] = useState<string>('');
  const [editingSubCategory, setEditingSubCategory] = useState<InventorySubCategory | null>(null);
  const [deletingSubCategory, setDeletingSubCategory] = useState<InventorySubCategory | null>(null);
  const [subDeleteBlockedMsg, setSubDeleteBlockedMsg] = useState<string | null>(null);

  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  // Forms
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryStatus, setCategoryStatus] = useState<'Active' | 'Inactive'>('Active');

  const [subCategoryName, setSubCategoryName] = useState('');
  const [subCategoryParentId, setSubCategoryParentId] = useState('');
  const [subCategoryDescription, setSubCategoryDescription] = useState('');
  const [subCategoryStatus, setSubCategoryStatus] = useState<'Active' | 'Inactive'>('Active');

  const canManage = currentUserRole === 'Super Admin' || currentUserRole === 'Armoury Officer';

  const toggleExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Helper to count products in a category
  const getCategoryProductCount = (categoryName: string, categoryId: string) => {
    return products.filter(
      (p) => p.category === categoryName || p.categoryId === categoryId
    ).length;
  };

  // Helper to count products in a subcategory
  const getSubCategoryProductCount = (subCategoryName: string, subCategoryId: string) => {
    return products.filter(
      (p) => p.subcategory === subCategoryName || p.subCategoryId === subCategoryId
    ).length;
  };

  // Category Actions
  const handleOpenAddCategory = () => {
    if (!canManage) {
      showNotice('warning', 'Only Super Admin and Armoury Officer can manage inventory categories.');
      return;
    }
    setCategoryName('');
    setCategoryDescription('');
    setCategoryStatus('Active');
    setIsAddCategoryOpen(true);
  };

  const handleOpenEditCategory = (cat: InventoryCategory) => {
    if (!canManage) {
      showNotice('warning', 'Only Super Admin and Armoury Officer can edit inventory categories.');
      return;
    }
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDescription(cat.description || '');
    setCategoryStatus(cat.status);
  };

  const handleOpenDeleteCategory = (cat: InventoryCategory) => {
    if (!canManage) {
      showNotice('warning', 'Only Super Admin can delete inventory categories.');
      return;
    }
    const productCount = getCategoryProductCount(cat.name, cat.id);
    const subCount = cat.subCategories?.length || 0;

    setDeletingCategory(cat);
    if (productCount > 0) {
      setCatDeleteBlockedMsg(
        `This category has ${productCount} item(s) and ${subCount} sub-category(ies) linked to it. You can deactivate it instead.`
      );
    } else {
      setCatDeleteBlockedMsg(null);
    }
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    addInventoryCategory({
      name: categoryName.trim(),
      description: categoryDescription.trim(),
      status: categoryStatus,
      subCategories: [],
    });

    logAudit('Add Category', 'Inventory', categoryName, `Created inventory category "${categoryName}"`);
    setIsAddCategoryOpen(false);
    showNotice('success', `Category "${categoryName}" created successfully!`);
  };

  const handleEditCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !categoryName.trim()) return;

    updateInventoryCategory(editingCategory.id, {
      name: categoryName.trim(),
      description: categoryDescription.trim(),
      status: categoryStatus,
    });

    logAudit('Update Category', 'Inventory', editingCategory.id, `Updated inventory category "${categoryName}"`);
    setEditingCategory(null);
    showNotice('success', `Category "${categoryName}" updated successfully!`);
  };

  const handleConfirmDeleteCategory = () => {
    if (!deletingCategory) return;
    const res = deleteInventoryCategory(deletingCategory.id);
    if (res.success) {
      logAudit('Delete Category', 'Inventory', deletingCategory.id, `Deleted category "${deletingCategory.name}"`);
      showNotice('success', `Category "${deletingCategory.name}" deleted permanently.`);
    } else {
      showNotice('error', res.error || 'Failed to delete category.');
    }
    setDeletingCategory(null);
  };

  const handleDeactivateCategoryInstead = () => {
    if (!deletingCategory) return;
    updateInventoryCategory(deletingCategory.id, { status: 'Inactive' });
    logAudit('Deactivate Category', 'Inventory', deletingCategory.id, `Deactivated category "${deletingCategory.name}"`);
    showNotice('success', `Category "${deletingCategory.name}" deactivated.`);
    setDeletingCategory(null);
  };

  // Sub-Category Actions
  const handleOpenAddSubCategory = (parentCatId?: string) => {
    if (!canManage) {
      showNotice('warning', 'Only Super Admin and Armoury Officer can manage sub-categories.');
      return;
    }
    setSubCategoryParentId(parentCatId || inventoryCategories[0]?.id || '');
    setSubCategoryName('');
    setSubCategoryDescription('');
    setSubCategoryStatus('Active');
    setIsAddSubCategoryOpen(true);
  };

  const handleOpenEditSubCategory = (sub: InventorySubCategory) => {
    if (!canManage) {
      showNotice('warning', 'Only Super Admin and Armoury Officer can edit sub-categories.');
      return;
    }
    setEditingSubCategory(sub);
    setSubCategoryParentId(sub.categoryId);
    setSubCategoryName(sub.name);
    setSubCategoryDescription(sub.description || '');
    setSubCategoryStatus(sub.status);
  };

  const handleOpenDeleteSubCategory = (sub: InventorySubCategory) => {
    if (!canManage) {
      showNotice('warning', 'Only Super Admin can delete sub-categories.');
      return;
    }
    const productCount = getSubCategoryProductCount(sub.name, sub.id);
    setDeletingSubCategory(sub);
    if (productCount > 0) {
      setSubDeleteBlockedMsg(
        `This sub-category has ${productCount} inventory item(s) assigned to it. You can deactivate it instead.`
      );
    } else {
      setSubDeleteBlockedMsg(null);
    }
  };

  const handleAddSubCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCategoryName.trim() || !subCategoryParentId) return;

    const parent = inventoryCategories.find((c) => c.id === subCategoryParentId);

    addInventorySubCategory(subCategoryParentId, {
      name: subCategoryName.trim(),
      categoryName: parent?.name,
      description: subCategoryDescription.trim(),
      status: subCategoryStatus,
    });

    logAudit('Add Sub-Category', 'Inventory', subCategoryName, `Created sub-category "${subCategoryName}" under "${parent?.name}"`);
    setIsAddSubCategoryOpen(false);
    showNotice('success', `Sub-Category "${subCategoryName}" added successfully!`);
  };

  const handleEditSubCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubCategory || !subCategoryName.trim() || !subCategoryParentId) return;

    updateInventorySubCategory(editingSubCategory.categoryId, editingSubCategory.id, {
      name: subCategoryName.trim(),
      categoryId: subCategoryParentId,
      description: subCategoryDescription.trim(),
      status: subCategoryStatus,
    });

    logAudit('Update Sub-Category', 'Inventory', editingSubCategory.id, `Updated sub-category "${subCategoryName}"`);
    setEditingSubCategory(null);
    showNotice('success', `Sub-Category "${subCategoryName}" updated successfully!`);
  };

  const handleConfirmDeleteSubCategory = () => {
    if (!deletingSubCategory) return;
    const res = deleteInventorySubCategory(deletingSubCategory.categoryId, deletingSubCategory.id);
    if (res.success) {
      logAudit('Delete Sub-Category', 'Inventory', deletingSubCategory.id, `Deleted sub-category "${deletingSubCategory.name}"`);
      showNotice('success', `Sub-Category "${deletingSubCategory.name}" deleted.`);
    } else {
      showNotice('error', res.error || 'Failed to delete sub-category.');
    }
    setDeletingSubCategory(null);
  };

  const handleDeactivateSubCategoryInstead = () => {
    if (!deletingSubCategory) return;
    updateInventorySubCategory(deletingSubCategory.categoryId, deletingSubCategory.id, { status: 'Inactive' });
    logAudit('Deactivate Sub-Category', 'Inventory', deletingSubCategory.id, `Deactivated sub-category "${deletingSubCategory.name}"`);
    showNotice('success', `Sub-Category "${deletingSubCategory.name}" deactivated.`);
    setDeletingSubCategory(null);
  };

  const showNotice = (type: 'success' | 'warning' | 'error', message: string) => {
    setActionNotice({ type, message });
    setTimeout(() => setActionNotice(null), 3500);
  };

  const totalSubCategories = inventoryCategories.reduce((acc, cat) => acc + (cat.subCategories?.length || 0), 0);

  const filteredCategories = inventoryCategories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cat.subCategories?.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
              <FolderTree className="w-6 h-6 text-sky-400" />
              <span>Inventory Category & Sub-Category Taxonomy</span>
            </h1>
            {!canManage && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 border border-amber-800 text-amber-300">
                <Lock className="w-2.5 h-2.5" /> View Only
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage the 3-tier hierarchy: <strong className="text-white">Category → Sub-Category → Item</strong> with delete protections and cascading assignments.
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAddSubCategory()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-sky-400" />
              <span>Add Sub-Category</span>
            </button>
            <button
              onClick={handleOpenAddCategory}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>
        )}
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

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Parent Categories</span>
          <div className="text-xl font-black text-sky-400 mt-0.5">{inventoryCategories.length}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Sub-Categories</span>
          <div className="text-xl font-black text-emerald-400 mt-0.5">{totalSubCategories}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Store Inventory Items</span>
          <div className="text-xl font-black text-blue-400 mt-0.5">{products.length}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Categories</span>
          <div className="text-xl font-black text-purple-400 mt-0.5">
            {inventoryCategories.filter((c) => c.status === 'Active').length}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Categories or Sub-Categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const allExpanded: Record<string, boolean> = {};
              inventoryCategories.forEach((c) => (allExpanded[c.id] = true));
              setExpandedCategories(allExpanded);
            }}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] font-bold text-slate-300 cursor-pointer"
          >
            Expand All
          </button>
          <button
            onClick={() => setExpandedCategories({})}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] font-bold text-slate-300 cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Categories Tree Accordion */}
      <div className="space-y-3">
        {filteredCategories.map((cat) => {
          const isExpanded = expandedCategories[cat.id] ?? true;
          const productCount = getCategoryProductCount(cat.name, cat.id);
          const subCats = cat.subCategories || [];

          return (
            <div
              key={cat.id}
              className={`border rounded-xl overflow-hidden transition-all ${
                cat.status === 'Inactive'
                  ? 'bg-slate-950/60 border-slate-800/80 opacity-75'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              {/* Category Header Bar */}
              <div
                onClick={() => toggleExpand(cat.id)}
                className="p-3.5 bg-slate-900/90 hover:bg-slate-900 flex items-center justify-between cursor-pointer border-b border-slate-800/80 select-none"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(cat.id);
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-sky-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <div className="p-2 bg-sky-950/80 border border-sky-800/70 text-sky-400 rounded-lg">
                    <Layers className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white tracking-wide">{cat.name}</h3>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                          cat.status === 'Inactive'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {cat.status}
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{cat.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="bg-slate-900 px-2 py-1 rounded text-slate-300 border border-slate-800">
                      {subCats.length} Sub-Categories
                    </span>
                    <span className="bg-blue-950/70 px-2 py-1 rounded text-blue-300 border border-blue-800/60 font-bold">
                      {productCount} Items
                    </span>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenAddSubCategory(cat.id)}
                        className="p-1.5 text-sky-400 hover:text-white hover:bg-sky-950/80 rounded-lg border border-transparent hover:border-sky-800 cursor-pointer"
                        title="Add Sub-Category under this Category"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-950/80 rounded-lg border border-transparent hover:border-blue-800 cursor-pointer"
                        title="Edit Category"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenDeleteCategory(cat)}
                        className="p-1.5 text-red-400 hover:text-white hover:bg-red-950/80 rounded-lg border border-transparent hover:border-red-800 cursor-pointer"
                        title="Delete / Deactivate Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-Categories List */}
              {isExpanded && (
                <div className="p-3 bg-slate-950/40 divide-y divide-slate-800/40">
                  {subCats.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-500">
                      No sub-categories created for {cat.name} yet.{' '}
                      {canManage && (
                        <button
                          onClick={() => handleOpenAddSubCategory(cat.id)}
                          className="text-sky-400 hover:underline font-bold ml-1 cursor-pointer"
                        >
                          Add the first one
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                      {subCats.map((sub) => {
                        const subProdCount = getSubCategoryProductCount(sub.name, sub.id);
                        return (
                          <div
                            key={sub.id}
                            className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                              sub.status === 'Inactive'
                                ? 'bg-slate-900/40 border-slate-800/60 opacity-70'
                                : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Tag className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              <div className="truncate">
                                <div className="font-bold text-slate-200 truncate flex items-center gap-1.5">
                                  <span>{sub.name}</span>
                                  {sub.status === 'Inactive' && (
                                    <span className="text-[9px] px-1 bg-slate-800 text-slate-400 rounded">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {subProdCount} item(s) in stock
                                </span>
                              </div>
                            </div>

                            {canManage && (
                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                <button
                                  onClick={() => handleOpenEditSubCategory(sub)}
                                  className="p-1 text-slate-400 hover:text-blue-400 rounded cursor-pointer"
                                  title="Edit Sub-Category"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleOpenDeleteSubCategory(sub)}
                                  className="p-1 text-slate-400 hover:text-red-400 rounded cursor-pointer"
                                  title="Delete Sub-Category"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Add Category */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-sky-400" />
                <span>Create New Category</span>
              </h3>
              <button
                onClick={() => setIsAddCategoryOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Surveillance Gear"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Operational scope of items in this category..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Status</label>
                <select
                  value={categoryStatus}
                  onChange={(e) => setCategoryStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Category */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-sky-400" />
                <span>Edit Category Details</span>
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditCategorySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Status</label>
                <select
                  value={categoryStatus}
                  onChange={(e) => setCategoryStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
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

      {/* Modal: Delete Category Confirmation */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 bg-red-950/90 border border-red-800/80 rounded-xl text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Category Confirmation</h3>
                <p className="text-xs text-slate-400">Category: {deletingCategory.name}</p>
              </div>
            </div>

            {catDeleteBlockedMsg ? (
              <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-xl space-y-2 text-xs text-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="font-semibold">{catDeleteBlockedMsg}</p>
                </div>
                <p className="text-[11px] text-amber-300/80 pl-6">
                  Deactivating this category hides it from new item creation while preserving all current inventory items and historical issue registers.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-300">
                Are you sure you want to permanently delete category <strong>"{deletingCategory.name}"</strong>?
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              {catDeleteBlockedMsg ? (
                <button
                  type="button"
                  onClick={handleDeactivateCategoryInstead}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Deactivate Instead
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmDeleteCategory}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Confirm Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Sub-Category */}
      {isAddSubCategoryOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-sky-400" />
                <span>Add Sub-Category</span>
              </h3>
              <button
                onClick={() => setIsAddSubCategoryOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubCategorySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Parent Category *</label>
                <select
                  value={subCategoryParentId}
                  onChange={(e) => setSubCategoryParentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                >
                  {inventoryCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Sub-Category Name *</label>
                <input
                  type="text"
                  required
                  value={subCategoryName}
                  onChange={(e) => setSubCategoryName(e.target.value)}
                  placeholder="e.g. Tactical Vest"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={subCategoryDescription}
                  onChange={(e) => setSubCategoryDescription(e.target.value)}
                  placeholder="Subcategory specifications..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Status</label>
                <select
                  value={subCategoryStatus}
                  onChange={(e) => setSubCategoryStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSubCategoryOpen(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Save Sub-Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Sub-Category */}
      {editingSubCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-sky-400" />
                <span>Edit Sub-Category</span>
              </h3>
              <button
                onClick={() => setEditingSubCategory(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubCategorySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Parent Category *</label>
                <select
                  value={subCategoryParentId}
                  onChange={(e) => setSubCategoryParentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                >
                  {inventoryCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Sub-Category Name *</label>
                <input
                  type="text"
                  required
                  value={subCategoryName}
                  onChange={(e) => setSubCategoryName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={subCategoryDescription}
                  onChange={(e) => setSubCategoryDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Status</label>
                <select
                  value={subCategoryStatus}
                  onChange={(e) => setSubCategoryStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSubCategory(null)}
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

      {/* Modal: Delete Sub-Category Confirmation */}
      {deletingSubCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 bg-red-950/90 border border-red-800/80 rounded-xl text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Sub-Category</h3>
                <p className="text-xs text-slate-400">Sub-Category: {deletingSubCategory.name}</p>
              </div>
            </div>

            {subDeleteBlockedMsg ? (
              <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-xl space-y-2 text-xs text-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="font-semibold">{subDeleteBlockedMsg}</p>
                </div>
                <p className="text-[11px] text-amber-300/80 pl-6">
                  Deactivating this sub-category preserves existing stock registers while hiding it from new item creation dropdowns.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-300">
                Are you sure you want to permanently delete sub-category <strong>"{deletingSubCategory.name}"</strong>?
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingSubCategory(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              {subDeleteBlockedMsg ? (
                <button
                  type="button"
                  onClick={handleDeactivateSubCategoryInstead}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Deactivate Instead
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmDeleteSubCategory}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Confirm Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
