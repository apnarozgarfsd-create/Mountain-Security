import {
  AlertCircle,
  Building,
  CheckCircle2,
  ChevronRight,
  FolderTree,
  HelpCircle,
  Info,
  MapPin,
  Plus,
  RotateCcw,
  Save,
  Shield,
  Sparkles,
  Tag,
  UserCheck,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  canPostToAccount,
  validateAccountCodeUnique,
  validateParentChildRelationship,
} from '../../services/accountingService';
import { Account, AccountCategory, BalanceType } from '../../types';

export interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Pre-selected parent account to anchor new account under (optional)
   */
  initialParentAccount?: Account | null;
  /**
   * Callback when account is successfully registered
   */
  onAccountCreated?: (account: Account) => void;
}

// Preset Nature / Types by category with legacy support
export const ACCOUNT_NATURE_OPTIONS: Record<AccountCategory, string[]> = {
  Asset: [
    'Cash in Hand & Drawer (1110)',
    'Bank Account / Commercial (1120)',
    'Mobile Wallet / Merchant (JazzCash/EasyPaisa)',
    'Client Receivables A/C (1130)',
    'Guard Advance A/C (1050)',
    'Inventory / Store Stock (1040)',
    'Prepaid Expenses & Security Deposits',
    'Fixed Assets — Vehicles & Transports',
    'Fixed Assets — Armoury & Weapons Valuation',
    'Fixed Assets — Office Equipment & Tech',
    'General Asset A/C',
  ],
  Liability: [
    'SALARY PAYABLES A/C (2010/2111)',
    'Overtime & Duty Bonus Payable',
    'Vendor & Supplier Payables A/C (2020)',
    'EOBI / Social Security Withholding Payable',
    'Income Tax / PRA Sales Tax Withholding Payable',
    'Security Uniform Deposit Payable to Guards',
    'Accrued Office Rent & Utility Obligations',
    'Short-Term Borrowings & Loans Payable',
    'General Liability A/C',
  ],
  Equity: [
    "Owner's Capital / Equity Investment (3010)",
    'Retained Earnings & Accumulated Surplus',
    "Partner Drawings / Withdrawals",
    'General Reserves Fund',
    'General Equity A/C',
  ],
  Income: [
    'Security Guarding Invoicing Income (4010)',
    'Weapon Rent & Escort Services Income (4020)',
    'VIP / Mobile Security Escort Income',
    'Static Guarding Direct Contract Revenue',
    'Event Security & Short-Term Duty Income',
    'Consulting, Risk Assessment & Training Income',
    'Other Operating Income / Scrap Sale',
    'Profit on Bank Deposits & Miscellaneous Gain',
    'General Revenue / Income A/C',
  ],
  Expense: [
    'Guard Salaries & Regular Pay (5010/5111)',
    'Guard Overtime & Replacement Shifts Expense',
    'Supervisor & Administrative Staff Salaries',
    'Uniform, Badges & Tactical Gear Expense (5030)',
    'Armoury Maintenance, Licence & Ammunition (5050)',
    'Patrol Vehicle Fuel & CNG Expense (5040)',
    'Vehicle Repairs, Maintenance & Insurance',
    'Head Office Rent & Regional Branches (5020)',
    'Electricity, Water, Gas & Office Utilities',
    'Mobile Phones, Internet & Wireless Communication',
    'Stationery, Biometric Printing & Office Supplies',
    'Legal, Government Regulatory & Audit Fees',
    'Marketing, Tender Procurement & Client Entertainment',
    'General Operating Expense A/C',
  ],
};

export const MSS_LOCATION_OPTIONS = [
  'Head Office (Arshad Center, Faisalabad)',
  'Lahore Regional Branch Office',
  'Islamabad / Rawalpindi Base',
  'Multan Field Operations Station',
  'Peshawar Deployment Station',
  'Karachi Hub',
  'General / All Operations',
];

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  initialParentAccount = null,
  onAccountCreated,
}) => {
  const {
    accounts,
    addAccount,
    currentUserRole,
    currentFiscalYear,
    getFiscalYearStatus,
    saveOpeningBalance,
    logAudit,
  } = useApp();

  const canManageAccounts =
    currentUserRole === 'Super Admin' || currentUserRole === 'Accountant';

  // --------------------------------------------------------------------------
  // Form State
  // --------------------------------------------------------------------------
  const [category, setCategory] = useState<AccountCategory>('Expense');
  const [levelOneId, setLevelOneId] = useState<string>('');
  const [levelTwoId, setLevelTwoId] = useState<string>('');
  const [levelThreeId, setLevelThreeId] = useState<string>('');
  const [levelFourId, setLevelFourId] = useState<string>('');

  const [natureType, setNatureType] = useState<string>('');
  const [accountCode, setAccountCode] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [effectiveDate, setEffectiveDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [location, setLocation] = useState<string>(MSS_LOCATION_OPTIONS[0]);
  const [employeePartyType, setEmployeePartyType] = useState<
    'Staff' | 'Guard' | 'Officer' | 'Vendor' | 'Client' | 'General'
  >('General');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [openingBalanceType, setOpeningBalanceType] = useState<BalanceType>('Debit');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [description, setDescription] = useState<string>('');

  // UI state
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [codeHelperInfo, setCodeHelperInfo] = useState<string>('');

  // --------------------------------------------------------------------------
  // Dependent Hierarchy Dropdowns Data Queries
  // --------------------------------------------------------------------------
  // Level 1: Root accounts across Chart of Accounts (all Level 1 accounts)
  const levelOneAccounts = useMemo(() => {
    return accounts.filter((a) => a.level === 1);
  }, [accounts]);

  // Level 2: Children of selected Level 1
  const levelTwoAccounts = useMemo(() => {
    if (!levelOneId) return [];
    return accounts.filter((a) => a.parentId === levelOneId);
  }, [accounts, levelOneId]);

  // Level 3: Children of selected Level 2
  const levelThreeAccounts = useMemo(() => {
    if (!levelTwoId) return [];
    return accounts.filter((a) => a.parentId === levelTwoId);
  }, [accounts, levelTwoId]);

  // Level 4: Children of selected Level 3
  const levelFourAccounts = useMemo(() => {
    if (!levelThreeId) return [];
    return accounts.filter((a) => a.parentId === levelThreeId);
  }, [accounts, levelThreeId]);

  // Determine active target parent ID based on deepest selected dropdown
  const activeParentAccount = useMemo(() => {
    const targetId = levelFourId || levelThreeId || levelTwoId || levelOneId;
    if (!targetId) return null;
    return accounts.find((a) => a.id === targetId) || null;
  }, [accounts, levelOneId, levelTwoId, levelThreeId, levelFourId]);

  // Expected Level of the account being created
  const calculatedLevel = useMemo(() => {
    if (!activeParentAccount) return 1;
    return (activeParentAccount.level || 1) + 1;
  }, [activeParentAccount]);

  // Check if salary payable or staff/guard specific nature is selected
  const isEmployeeOrPartySpecific = useMemo(() => {
    const lowerNature = natureType.toLowerCase();
    const lowerName = accountName.toLowerCase();
    const isSalaryPayable =
      lowerNature.includes('salary') ||
      lowerNature.includes('wages') ||
      lowerNature.includes('overtime') ||
      lowerName.includes('salary');
    const isAdvance = lowerNature.includes('advance');
    const isPayable = lowerNature.includes('payable') || category === 'Liability';
    const isReceivable = lowerNature.includes('receivable');

    return (
      isSalaryPayable ||
      isAdvance ||
      isPayable ||
      isReceivable ||
      category === 'Liability'
    );
  }, [natureType, accountName, category]);

  // --------------------------------------------------------------------------
  // Initialize / Reset Form
  // --------------------------------------------------------------------------
  const resetFormToBlank = (forcedCategory?: AccountCategory) => {
    const cat = forcedCategory || category;
    setFormError(null);
    setFormSuccess(null);
    setCategory(cat);

    // Find Level 1 for this category
    const l1 = accounts.find((a) => a.level === 1 && a.category === cat);
    setLevelOneId(l1 ? l1.id : '');
    setLevelTwoId('');
    setLevelThreeId('');
    setLevelFourId('');

    const defaultNatures = ACCOUNT_NATURE_OPTIONS[cat] || [];
    setNatureType(defaultNatures[0] || '');
    setAccountCode('');
    setAccountName('');
    setEffectiveDate(new Date().toISOString().split('T')[0]);
    setLocation(MSS_LOCATION_OPTIONS[0]);
    setEmployeePartyType('General');
    setOpeningBalance(0);
    setOpeningBalanceType(cat === 'Asset' || cat === 'Expense' ? 'Debit' : 'Credit');
    setStatus('Active');
    setDescription('');
    setCodeHelperInfo('');
  };

  // Populate when modal opens or initialParentAccount is provided
  useEffect(() => {
    if (!isOpen) return;

    setFormError(null);
    setFormSuccess(null);

    if (initialParentAccount) {
      // Find hierarchy path to set dropdowns
      setCategory(initialParentAccount.category);

      // Trace back to roots
      const ancestors: Account[] = [initialParentAccount];
      let currParentId = initialParentAccount.parentId;
      while (currParentId) {
        const p = accounts.find((a) => a.id === currParentId);
        if (p) {
          ancestors.unshift(p);
          currParentId = p.parentId;
        } else {
          break;
        }
      }

      const l1 = ancestors.find((a) => a.level === 1);
      const l2 = ancestors.find((a) => a.level === 2);
      const l3 = ancestors.find((a) => a.level === 3);
      const l4 = ancestors.find((a) => a.level === 4);

      setLevelOneId(l1 ? l1.id : '');
      setLevelTwoId(l2 ? l2.id : '');
      setLevelThreeId(l3 ? l3.id : '');
      setLevelFourId(l4 ? l4.id : '');

      // Suggest account code under this parent
      const siblings = accounts.filter((a) => a.parentId === initialParentAccount.id);
      const nextNum = siblings.length + 1;
      const suggestedCode = `${initialParentAccount.accountCode}${String(nextNum).padStart(2, '0')}`;
      setAccountCode(suggestedCode);
      setCodeHelperInfo(`Auto-suggested based on parent ${initialParentAccount.accountCode}`);

      const defaultNatures = ACCOUNT_NATURE_OPTIONS[initialParentAccount.category] || [];
      setNatureType(defaultNatures[0] || '');
      setOpeningBalanceType(
        initialParentAccount.category === 'Asset' || initialParentAccount.category === 'Expense'
          ? 'Debit'
          : 'Credit'
      );
    } else {
      resetFormToBlank(category);
    }
  }, [isOpen, initialParentAccount]);

  // --------------------------------------------------------------------------
  // Dynamic Code Suggestion when parent selection changes
  // --------------------------------------------------------------------------
  const generateSuggestedCode = (parent: Account | null) => {
    if (!parent) {
      // Category root code suggestion
      const baseMap: Record<AccountCategory, string> = {
        Asset: '1000',
        Liability: '2000',
        Equity: '3000',
        Income: '4000',
        Expense: '5000',
      };
      return baseMap[category];
    }

    const siblings = accounts.filter((a) => a.parentId === parent.id);
    const count = siblings.length + 1;

    // Standard MSS numbering convention
    if (parent.level === 1) {
      // Level 2: 1100, 1200, 2100 etc.
      return `${parent.accountCode.slice(0, 1)}${count}00`;
    } else if (parent.level === 2) {
      // Level 3: 1110, 1120 etc.
      return `${parent.accountCode.slice(0, 2)}${count}0`;
    } else if (parent.level === 3) {
      // Level 4 leaf: 1111, 1112 or with sub-code
      if (count <= 9) {
        return `${parent.accountCode.slice(0, 3)}${count}`;
      }
      return `${parent.accountCode}${String(count).padStart(2, '0')}`;
    } else {
      // Level 5+: Parent code + 2-digit serial
      return `${parent.accountCode}${String(count).padStart(2, '0')}`;
    }
  };

  // When active parent changes, suggest next code if user hasn't typed custom code
  const handleAutoSuggestCode = () => {
    if (activeParentAccount) {
      const code = generateSuggestedCode(activeParentAccount);
      setAccountCode(code);
      setCodeHelperInfo(`Auto-suggested for parent ${activeParentAccount.accountCode}`);
    } else {
      const code = generateSuggestedCode(null);
      setAccountCode(code);
      setCodeHelperInfo(`Root category baseline code`);
    }
  };

  // Quick helper to prefill legacy record format (e.g. 2010030011 WAQAS (AHMED))
  const handleLoadLegacySample = () => {
    setCategory('Liability');
    const liabL1 = accounts.find((a) => a.level === 1 && a.category === 'Liability');
    if (liabL1) {
      setLevelOneId(liabL1.id);
      const curLiabL2 = accounts.find(
        (a) =>
          a.parentId === liabL1.id &&
          (a.accountName.toLowerCase().includes('current') || a.accountCode.startsWith('21'))
      );
      if (curLiabL2) {
        setLevelTwoId(curLiabL2.id);
        const salPayL3 = accounts.find(
          (a) =>
            a.parentId === curLiabL2.id &&
            (a.accountName.toLowerCase().includes('salary') || a.accountCode.includes('11'))
        );
        if (salPayL3) {
          setLevelThreeId(salPayL3.id);
        }
      }
    }
    setNatureType('SALARY PAYABLES A/C (2010/2111)');
    setAccountCode('2010030011');
    setAccountName('WAQAS (AHMED)');
    setEffectiveDate('2026-07-01');
    setLocation('Head Office (Arshad Center, Faisalabad)');
    setEmployeePartyType('Staff');
    setOpeningBalance(0);
    setOpeningBalanceType('Credit');
    setStatus('Active');
    setDescription('Staff Salary Payables - legacy 003 control mapping (Waqas Ahmed)');
    setCodeHelperInfo('Legacy format: 201 (Current Liab) + 003 (Staff Salary) + 0011 (Serial)');
  };

  // --------------------------------------------------------------------------
  // Category Change Handler
  // --------------------------------------------------------------------------
  const handleCategoryChange = (newCat: AccountCategory) => {
    setCategory(newCat);
    const l1 = accounts.find((a) => a.level === 1 && a.category === newCat);
    setLevelOneId(l1 ? l1.id : '');
    setLevelTwoId('');
    setLevelThreeId('');
    setLevelFourId('');

    const defaultNatures = ACCOUNT_NATURE_OPTIONS[newCat] || [];
    setNatureType(defaultNatures[0] || '');
    setOpeningBalanceType(newCat === 'Asset' || newCat === 'Expense' ? 'Debit' : 'Credit');
  };

  // --------------------------------------------------------------------------
  // Save Handler
  // --------------------------------------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError(null);
    setFormSuccess(null);

    // Permission check
    if (!canManageAccounts) {
      setFormError('Permission denied: Only Super Admin and Accountant roles are authorized to create accounts.');
      return;
    }

    const trimmedCode = accountCode.trim();
    const trimmedName = accountName.trim();

    // 1. Mandatory Validations
    if (!trimmedCode) {
      setFormError('Account Code is required (e.g. 2111, 2010030011, etc.).');
      return;
    }

    if (!trimmedName) {
      setFormError('Account Name is required (e.g. WAQAS (AHMED), Guard Salaries Payable).');
      return;
    }

    // 2. Uniqueness Validation
    const isUnique = validateAccountCodeUnique(trimmedCode, undefined, accounts);
    if (!isUnique) {
      setFormError(`Account Code "${trimmedCode}" is already in use by another account in the system.`);
      return;
    }

    // 3. Parent-Child Relationship Validation (including cross-category checks)
    const targetParentId = activeParentAccount ? activeParentAccount.id : null;
    if (targetParentId) {
      const parentCheck = validateParentChildRelationship('', targetParentId, accounts, category);
      if (!parentCheck.isValid) {
        setFormError(parentCheck.error || 'Invalid parent-child account relationship.');
        return;
      }
    }

    // 4. Controlled Opening Balance Validation (Check fiscal year lock status)
    const parsedOpBal = Math.max(0, Number(openingBalance) || 0);
    if (parsedOpBal > 0) {
      const fyStatus = getFiscalYearStatus(currentFiscalYear);
      if (fyStatus === 'Locked' && currentUserRole !== 'Super Admin') {
        setFormError(
          `Opening balances for Fiscal Year ${currentFiscalYear} are locked. Only Super Admin can assign opening balances to accounts in a locked year.`
        );
        return;
      }
    }

    // 5. Save Execution
    setIsSubmitting(true);
    try {
      const newAcc = addAccount({
        accountCode: trimmedCode,
        accountName: trimmedName,
        category,
        parentId: targetParentId,
        level: calculatedLevel,
        isPostable: true,
        openingBalance: parsedOpBal,
        openingBalanceType,
        status,
        description: description.trim() || undefined,
        natureType: natureType.trim() || undefined,
        effectiveDate: effectiveDate || undefined,
        location: location || undefined,
        employeePartyType: isEmployeeOrPartySpecific ? employeePartyType : undefined,
      });

      // Synchronize with controlled opening balance batch
      if (parsedOpBal > 0) {
        try {
          saveOpeningBalance({
            accountId: newAcc.id,
            fiscalYear: currentFiscalYear,
            balanceType: openingBalanceType,
            amount: parsedOpBal,
            openingDate: effectiveDate,
            reference: `OB-INIT-${trimmedCode}`,
            notes: `Initial opening balance on account creation: ${trimmedName}`,
            reason: 'Initial Account Setup via Chart of Accounts',
          });
        } catch (obErr) {
          console.warn('Controlled opening balance batch sync notice:', obErr);
        }
      }

      // Audit log registration
      logAudit(
        'Account Registered',
        'Chart of Accounts',
        trimmedCode,
        `Created Level ${calculatedLevel} account "${trimmedCode} - ${trimmedName}" under parent ${
          activeParentAccount ? activeParentAccount.accountCode : 'ROOT'
        }. Nature: ${natureType}, Date: ${effectiveDate}`
      );

      setFormSuccess(
        `Account "${trimmedCode} - ${trimmedName}" (Level ${calculatedLevel}) saved successfully!`
      );

      if (onAccountCreated) {
        onAccountCreated(newAcc);
      }

      // Automatically reset for next entry or offer close
      setTimeout(() => {
        setIsSubmitting(false);
      }, 300);
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message || 'An unexpected error occurred while saving the account.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 bg-amber-950/60 border border-amber-800/60 rounded">
                  Chart of Accounts
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Target Level: {calculatedLevel}
                </span>
              </div>
              <h2 className="text-lg font-black font-display text-white mt-0.5">
                Create New Account (اکاؤنٹ تشکیل دیں)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadLegacySample}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
              title="Prefill legacy example: 2010030011 WAQAS (AHMED) (Staff Salary Payables under Current Liabilities)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Example: 2010030011 WAQAS</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Form (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Banners */}
        {formError && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{formError}</div>
          </div>
        )}

        {formSuccess && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-200 flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{formSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => resetFormToBlank(category)}
              className="text-[11px] underline text-emerald-300 hover:text-emerald-100 font-bold cursor-pointer"
            >
              Add Another Account
            </button>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* SECTION 1: Account Classification & Hierarchy */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Account Classification & Hierarchy</span>
              </h3>
              <span className="text-[10px] text-slate-500">
                Dependent Level Navigation
              </span>
            </div>

            {/* Account Category Selector */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Account Category (نوعیت کھاتہ) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {(['Asset', 'Liability', 'Equity', 'Income', 'Expense'] as AccountCategory[]).map(
                  (cat) => {
                    const isSelected = category === cat;
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`py-2 px-2.5 rounded-lg font-bold text-[11px] transition-all border text-center cursor-pointer ${
                          isSelected
                            ? cat === 'Asset'
                              ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                              : cat === 'Liability'
                              ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                              : cat === 'Equity'
                              ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                              : cat === 'Income'
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                              : 'bg-red-600 border-red-500 text-white shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                        }`}
                      >
                        {cat === 'Income' ? 'Revenue / Income' : cat}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Dependent Hierarchy Dropdowns: Level 1 -> Level 2 -> Level 3 -> Level 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Level One (A/C Level One) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>A/C Level One (Main) *</span>
                  <span className="text-[10px] text-slate-500 font-normal">Level 1</span>
                </label>
                <select
                  value={levelOneId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLevelOneId(val);
                    const selectedL1 = accounts.find((a) => a.id === val);
                    if (selectedL1) {
                      setCategory(selectedL1.category);
                      const defaultNatures = ACCOUNT_NATURE_OPTIONS[selectedL1.category] || [];
                      setNatureType(defaultNatures[0] || '');
                      setOpeningBalanceType(
                        selectedL1.category === 'Asset' || selectedL1.category === 'Expense' ? 'Debit' : 'Credit'
                      );
                    }
                    setLevelTwoId('');
                    setLevelThreeId('');
                    setLevelFourId('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:outline-hidden focus:border-amber-500"
                >
                  <option value="">-- Select Level 1 Account --</option>
                  {levelOneAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountCode} - {a.accountName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Two (A/C Level Two) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>A/C Level Two (Sub)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Level 2</span>
                </label>
                <select
                  value={levelTwoId}
                  disabled={!levelOneId || levelTwoAccounts.length === 0}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLevelTwoId(val);
                    setLevelThreeId('');
                    setLevelFourId('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:outline-hidden focus:border-amber-500 disabled:opacity-40"
                >
                  <option value="">
                    {levelTwoAccounts.length === 0
                      ? '(No sub-accounts available)'
                      : '-- Select Level 2 Subaccount --'}
                  </option>
                  {levelTwoAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountCode} - {a.accountName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Three (A/C Level Three) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>A/C Level Three (Group)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Level 3</span>
                </label>
                <select
                  value={levelThreeId}
                  disabled={!levelTwoId || levelThreeAccounts.length === 0}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLevelThreeId(val);
                    setLevelFourId('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:outline-hidden focus:border-amber-500 disabled:opacity-40"
                >
                  <option value="">
                    {levelThreeAccounts.length === 0
                      ? '(No group accounts under Level 2)'
                      : '-- Select Level 3 Group Account --'}
                  </option>
                  {levelThreeAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountCode} - {a.accountName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Level 4 Sub-group (if level 3 has children) */}
            {levelFourAccounts.length > 0 && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>A/C Level Four (Detail Group)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Level 4</span>
                </label>
                <select
                  value={levelFourId}
                  onChange={(e) => setLevelFourId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:outline-hidden focus:border-amber-500"
                >
                  <option value="">-- None (Place under Level 3) --</option>
                  {levelFourAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountCode} - {a.accountName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Breadcrumb Hierarchy Summary */}
            <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-400 overflow-x-auto py-0.5">
                <span className="font-bold text-amber-400">Path:</span>
                <span>{category}</span>
                {levelOneId && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="text-slate-300">
                      {accounts.find((a) => a.id === levelOneId)?.accountName}
                    </span>
                  </>
                )}
                {levelTwoId && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="text-slate-300">
                      {accounts.find((a) => a.id === levelTwoId)?.accountName}
                    </span>
                  </>
                )}
                {levelThreeId && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="text-slate-300">
                      {accounts.find((a) => a.id === levelThreeId)?.accountName}
                    </span>
                  </>
                )}
                {levelFourId && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="text-slate-300">
                      {accounts.find((a) => a.id === levelFourId)?.accountName}
                    </span>
                  </>
                )}
                <ChevronRight className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-emerald-400 font-bold">
                  {accountName ? accountName : '[New Account Title]'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAutoSuggestCode}
                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[10px] rounded border border-slate-700 cursor-pointer shrink-0 ml-2"
                title="Auto-calculate next sequential code based on parent"
              >
                <Sparkles className="w-3 h-3" />
                <span>Suggest Code</span>
              </button>
            </div>

            {/* Account Nature / Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                A/C Nature / Type (کھاتے کی نوعیت) *
              </label>
              <div className="flex gap-2">
                <select
                  value={natureType}
                  onChange={(e) => setNatureType(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:outline-hidden focus:border-amber-500"
                >
                  {(ACCOUNT_NATURE_OPTIONS[category] || []).map((nature) => (
                    <option key={nature} value={nature}>
                      {nature}
                    </option>
                  ))}
                  <option value="Custom / Other Nature">-- Custom / Other Nature --</option>
                </select>
                <input
                  type="text"
                  placeholder="Or custom nature notes..."
                  value={natureType.startsWith('Custom') ? '' : natureType}
                  onChange={(e) => setNatureType(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Account Details & Identifiers */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3.5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>2. Account Code & Master Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Account Code (A/C Code) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Account Code (کوڈ نمبر) *</span>
                  {codeHelperInfo && (
                    <span className="text-[10px] text-amber-400 font-mono">
                      {codeHelperInfo}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  value={accountCode}
                  onChange={(e) => {
                    setAccountCode(e.target.value);
                    setCodeHelperInfo('');
                  }}
                  placeholder="e.g. 2111 or 2010030011"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold text-sm tracking-wide focus:border-blue-500 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Unique GL code. Preserves existing hierarchical codes or custom identifiers.
                </p>
              </div>

              {/* Account Name & Title */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Account Name / Title (اکاؤنٹ کا نام) *
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. WAQAS (AHMED) or Guard Salaries Payable"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:border-blue-500 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Official Ledger title printed on balance sheets and vouchers.
                </p>
              </div>

              {/* Effective Date (Date) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Effective Date (تاریخ)
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Location (Location) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Location / Branch (مقام)</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:border-blue-500 focus:outline-hidden"
                >
                  {MSS_LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditional: Employee / Party Type (Only when applicable) */}
              {isEmployeeOrPartySpecific && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Employee / Party Type</span>
                    </span>
                    <span className="text-[10px] text-amber-500 font-semibold">
                      Salary/Payable Context
                    </span>
                  </label>
                  <select
                    value={employeePartyType}
                    onChange={(e) => setEmployeePartyType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-amber-800/80 rounded-lg p-2 text-white font-medium focus:border-amber-500 focus:outline-hidden"
                  >
                    <option value="Staff">STAFF (Admin / Office Personnel)</option>
                    <option value="Guard">GUARD (Operational Force Security Guard)</option>
                    <option value="Officer">OFFICER (Supervisor / Field Inspector)</option>
                    <option value="Vendor">VENDOR (Supplier / Contractor)</option>
                    <option value="Client">CLIENT (Corporate Customer)</option>
                    <option value="General">GENERAL (Other Counterparty)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Categorizes the beneficiary for automated payroll slips and vendor statements.
                  </p>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Active / Inactive Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="Active">Active (فعال - Eligible for Postings)</option>
                  <option value="Inactive">Inactive (غیر فعال - Locked)</option>
                </select>
              </div>

              {/* Opening Balance (Initial Setup) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Initial Opening Balance (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Balance Type (Dr / Cr) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Balance Type (Dr / Cr)
                </label>
                <select
                  value={openingBalanceType}
                  onChange={(e) => setOpeningBalanceType(e.target.value as BalanceType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="Debit">Debit (Dr - نام)</option>
                  <option value="Credit">Credit (Cr - جمع)</option>
                </select>
              </div>

              {/* Description & Notes */}
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Description / Notes (تفصیل و وضاحتی نوٹ)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Operational accounting description, authorized signatory, bank branch details, or contract reference..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-hidden resize-none"
                />
              </div>
            </div>
          </div>

          {/* Action Bar (Save, New, Close) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Double-entry validation enforced. Auto-synchronizes with Chart of Accounts & General Ledger.
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                Close (بند کریں)
              </button>

              {/* New Button (Reset Form) */}
              <button
                type="button"
                onClick={() => resetFormToBlank(category)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                title="Start a fresh blank record"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New (نیا کھاتہ)</span>
              </button>

              {/* Save Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save (محفوظ کریں)'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
