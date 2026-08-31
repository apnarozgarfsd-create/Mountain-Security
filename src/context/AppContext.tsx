import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  initialAccounts,
  initialAttendanceRecords,
  initialAuditLogs,
  initialClientInvoices,
  initialClients,
  initialCompanySettings,
  initialGuardAssignments,
  initialGuardIssuedItems,
  initialGuards,
  initialProducts,
  initialSalarySlips,
  initialSites,
  initialStockTransactions,
  initialVouchers,
  initialWeaponAssignments,
  initialWeapons,
} from '../data/initialData';
import {
  initialCashTransactions,
  initialExpenseCategories,
  initialFinanceAccounts,
  initialParties,
} from '../data/multiAccountSeedData';
import {
  Account,
  AttendanceMonthlySummary,
  AttendanceStatus,
  AuditLog,
  CashTransaction,
  Client,
  ClientInvoice,
  CompanySettings,
  DailyReconciliationSummary,
  DEFAULT_ROLE_PASSWORDS,
  ExpenseCategory,
  ExpenseSubcategory,
  FinanceAccount,
  Guard,
  GuardAssignmentHistory,
  GuardAttendanceRecord,
  GuardIssuedItem,
  Party,
  Product,
  RoleSecuritySettings,
  SalarySlip,
  SearchResultItem,
  Site,
  StockTransaction,
  TransactionDirection,
  UserRole,
  Voucher,
  Weapon,
  WeaponAssignmentHistory,
} from '../types';
import { numberToWordsPKR } from '../utils/formatters';


interface PrintDocumentPayload {
  type: 'salary-slip' | 'voucher' | 'weapon-slip' | 'uniform-slip' | 'client-invoice' | 'account-ledger' | 'general-report' | 'attendance-sheet';
  data: any;
  title: string;
}

interface AppContextType {
  // State
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  
  clients: Client[];
  sites: Site[];
  guards: Guard[];
  guardAssignments: GuardAssignmentHistory[];
  weapons: Weapon[];
  weaponAssignments: WeaponAssignmentHistory[];
  products: Product[];
  stockTransactions: StockTransaction[];
  guardIssuedItems: GuardIssuedItem[];
  accounts: Account[];
  vouchers: Voucher[];
  salarySlips: SalarySlip[];
  clientInvoices: ClientInvoice[];
  auditLogs: AuditLog[];
  attendanceRecords: GuardAttendanceRecord[];

  // Multi-Account Expense & Ledger System State
  financeAccounts: FinanceAccount[];
  expenseCategories: ExpenseCategory[];
  parties: Party[];
  cashTransactions: CashTransaction[];

  // Multi-Account Expense & Ledger Actions
  addFinanceAccount: (account: Omit<FinanceAccount, 'id' | 'createdAt'>) => FinanceAccount;
  updateFinanceAccount: (id: string, updates: Partial<FinanceAccount>) => void;
  deleteFinanceAccount: (id: string) => { success: boolean; error?: string };
  addExpenseCategory: (category: Omit<ExpenseCategory, 'id'>) => ExpenseCategory;
  updateExpenseCategory: (id: string, updates: Partial<ExpenseCategory>) => void;
  deleteExpenseCategory: (id: string) => void;
  addParty: (party: Omit<Party, 'id' | 'createdAt'>) => Party;
  updateParty: (id: string, updates: Partial<Party>) => void;
  deleteParty: (id: string) => void;
  addCashTransaction: (txn: Omit<CashTransaction, 'id' | 'createdAt'>) => CashTransaction;
  updateCashTransaction: (id: string, updates: Partial<CashTransaction>) => void;
  deleteCashTransaction: (id: string) => void;
  duplicateCashTransaction: (id: string) => CashTransaction | null;
  executeAccountTransfer: (params: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date: string;
    description: string;
    createdBy: string;
  }) => { outTxn: CashTransaction; inTxn: CashTransaction };
  importTransactionsFromCsv: (parsedRows: any[]) => { successCount: number; errors: string[] };
  getAccountLiveBalance: (accountId: string) => number;
  getAllAccountsLiveBalances: () => Record<string, number>;
  getDailyReconciliation: (date: string, accountId?: string) => DailyReconciliationSummary[];
  getPartyLedger: (partyId: string) => {
    party: Party | undefined;
    transactions: CashTransaction[];
    totalIn: number;
    totalOut: number;
    netBalance: number;
  };

  // Modals & Search
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  printPayload: PrintDocumentPayload | null;
  setPrintPayload: (payload: PrintDocumentPayload | null) => void;
  triggerPrint: (payload: PrintDocumentPayload) => void;
  isPrintModalOpen: boolean;
  closePrintModal: () => void;
  activePrintJob: PrintDocumentPayload | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Role & Security Settings
  securitySettings: RoleSecuritySettings;
  updateSecuritySettings: (settings: Partial<RoleSecuritySettings>) => void;
  updateRolePassword: (role: UserRole, newPass: string) => void;
  verifyRolePassword: (role: UserRole, enteredPass: string) => boolean;
  isSecurityModalOpen: boolean;
  pendingRoleSwitch: UserRole | null;
  requestRoleSwitch: (role: UserRole) => void;
  cancelRoleSwitch: () => void;
  confirmRoleSwitch: (password: string) => { success: boolean; error?: string };
  lockSystem: () => void;
  unlockSystem: (password: string) => { success: boolean; error?: string };

  // Actions - Attendance & Duty Register (Full Day, Double Duty, Half Day, Overtime)
  markAttendance: (record: Omit<GuardAttendanceRecord, 'id' | 'createdAt'>) => GuardAttendanceRecord;
  markBulkAttendance: (records: Omit<GuardAttendanceRecord, 'id' | 'createdAt'>[]) => void;
  updateAttendanceRecord: (id: string, updates: Partial<GuardAttendanceRecord>) => void;
  deleteAttendanceRecord: (id: string) => void;
  getGuardMonthlySummary: (guardId: string, monthYear: string) => AttendanceMonthlySummary;
  getAllGuardsMonthlySummaries: (monthYear: string) => AttendanceMonthlySummary[];
  quickGenerateSalarySlipFromAttendance: (guardId: string, monthYear: string) => SalarySlip | null;

  // Actions - Clients & Sites
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addSite: (site: Omit<Site, 'id' | 'createdAt'>) => Site;
  updateSite: (id: string, site: Partial<Site>) => void;
  deleteSite: (id: string) => void;

  // Actions - Guards & Assignments
  addGuard: (guard: Omit<Guard, 'id'>) => Guard;
  updateGuard: (id: string, guard: Partial<Guard>) => void;
  deleteGuard: (id: string) => void;
  transferGuard: (guardId: string, targetSiteId: string, shift: string, remarks?: string) => void;

  // Actions - Weapons & Assignments
  addWeapon: (weapon: Omit<Weapon, 'id'>) => Weapon;
  updateWeapon: (id: string, weapon: Partial<Weapon>) => void;
  deleteWeapon: (id: string) => void;
  issueWeapon: (weaponId: string, guardId: string, siteId: string, notes?: string) => void;
  returnWeapon: (weaponId: string, condition?: string, notes?: string) => void;

  // Actions - Products & Inventory
  addProduct: (product: Omit<Product, 'id' | 'currentStock'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addStockTransaction: (transaction: Omit<StockTransaction, 'id' | 'balanceAfter' | 'performedBy'>) => void;
  issueItemToGuard: (guardId: string, productId: string, quantity: number, notes?: string) => void;
  returnItemFromGuard: (issueId: string, notes?: string) => void;
  inventoryTransactions: StockTransaction[];
  issueInventoryItem: (params: { productId: string; quantity: number; guardId?: string; guardName?: string; siteId?: string; siteName?: string; notes?: string }) => void;
  receiveInventoryStock: (params: { productId: string; quantity: number; unitCost?: number; supplierName?: string; notes?: string }) => void;

  // Actions - Accounting & Vouchers
  addAccount: (account: Omit<Account, 'id' | 'currentBalance'>) => Account;
  updateAccount: (id: string, account: Partial<Account>) => void;
  createVoucher: (voucher: Omit<Voucher, 'id' | 'createdAt' | 'createdBy' | 'status'>) => { success: boolean; error?: string; voucher?: Voucher };
  cancelVoucher: (id: string, reason: string) => void;
  deleteVoucher: (id: string) => void;

  // Actions - Salary Slips & Invoicing
  generateSalarySlip: (slipData: Omit<SalarySlip, 'id' | 'createdAt' | 'amountInWords'>) => SalarySlip;
  updateSalarySlipStatus: (id: string, status: 'Paid' | 'Pending' | 'Draft') => void;
  deleteSalarySlip: (id: string) => void;
  createClientInvoice: (invoice: Omit<ClientInvoice, 'id'>) => ClientInvoice;
  receiveInvoicePayment: (invoiceId: string, amount: number, accountId: string, notes?: string) => void;
  deleteClientInvoice: (id: string) => void;

  // Global Search
  searchGlobal: (query: string) => SearchResultItem[];

  // Backup & Reset
  exportDatabaseJSON: () => void;
  exportDataJson: () => string;
  importDatabaseJSON: (jsonString: string) => boolean;
  importDataJson: (jsonString: string) => boolean;
  resetToSampleData: () => void;
  resetToInitialData: () => void;
  logAudit: (action: string, module: string, recordReference: string, details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'MOUNTAIN_SECURITY_SGMS_DATA_V1';

const initialSecuritySettings: RoleSecuritySettings = {
  requirePasswordOnSwitch: true,
  passwords: { ...DEFAULT_ROLE_PASSWORDS },
  isLocked: false,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Super Admin');
  const [securitySettings, setSecuritySettings] = useState<RoleSecuritySettings>(initialSecuritySettings);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
  const [pendingRoleSwitch, setPendingRoleSwitch] = useState<UserRole | null>(null);

  const [companySettings, setCompanySettings] = useState<CompanySettings>(initialCompanySettings);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [guards, setGuards] = useState<Guard[]>(initialGuards);
  const [guardAssignments, setGuardAssignments] = useState<GuardAssignmentHistory[]>(initialGuardAssignments);
  const [weapons, setWeapons] = useState<Weapon[]>(initialWeapons);
  const [weaponAssignments, setWeaponAssignments] = useState<WeaponAssignmentHistory[]>(initialWeaponAssignments);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(initialStockTransactions);
  const [guardIssuedItems, setGuardIssuedItems] = useState<GuardIssuedItem[]>(initialGuardIssuedItems);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>(initialSalarySlips);
  const [clientInvoices, setClientInvoices] = useState<ClientInvoice[]>(initialClientInvoices);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [attendanceRecords, setAttendanceRecords] = useState<GuardAttendanceRecord[]>(initialAttendanceRecords);

  // Multi-Account Expense & Ledger System State
  const [financeAccounts, setFinanceAccounts] = useState<FinanceAccount[]>(initialFinanceAccounts);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(initialExpenseCategories);
  const [parties, setParties] = useState<Party[]>(initialParties);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(initialCashTransactions);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [printPayload, setPrintPayload] = useState<PrintDocumentPayload | null>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.clients) setClients(parsed.clients);
        if (parsed.sites) setSites(parsed.sites);
        if (parsed.guards) setGuards(parsed.guards);
        if (parsed.guardAssignments) setGuardAssignments(parsed.guardAssignments);
        if (parsed.weapons) setWeapons(parsed.weapons);
        if (parsed.weaponAssignments) setWeaponAssignments(parsed.weaponAssignments);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.stockTransactions) setStockTransactions(parsed.stockTransactions);
        if (parsed.guardIssuedItems) setGuardIssuedItems(parsed.guardIssuedItems);
        if (parsed.accounts) setAccounts(parsed.accounts);
        if (parsed.vouchers) setVouchers(parsed.vouchers);
        if (parsed.salarySlips) setSalarySlips(parsed.salarySlips);
        if (parsed.clientInvoices) setClientInvoices(parsed.clientInvoices);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.companySettings) setCompanySettings(parsed.companySettings);
        if (parsed.financeAccounts && Array.isArray(parsed.financeAccounts) && parsed.financeAccounts.length > 0) {
          setFinanceAccounts(parsed.financeAccounts);
        }
        if (parsed.expenseCategories && Array.isArray(parsed.expenseCategories) && parsed.expenseCategories.length > 0) {
          setExpenseCategories(parsed.expenseCategories);
        }
        if (parsed.parties && Array.isArray(parsed.parties) && parsed.parties.length > 0) {
          setParties(parsed.parties);
        }
        if (parsed.cashTransactions && Array.isArray(parsed.cashTransactions) && parsed.cashTransactions.length > 0) {
          setCashTransactions(parsed.cashTransactions);
        }
        if (parsed.securitySettings) {
          setSecuritySettings({
            ...initialSecuritySettings,
            ...parsed.securitySettings,
            passwords: {
              ...initialSecuritySettings.passwords,
              ...(parsed.securitySettings.passwords || {}),
            },
            isLocked: false, // Start unlocked
          });
        }
        if (parsed.attendanceRecords && Array.isArray(parsed.attendanceRecords) && parsed.attendanceRecords.length > 0) {
          setAttendanceRecords(parsed.attendanceRecords);
        }
      }
    } catch (e) {
      console.error('Error loading saved state:', e);
    }
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    try {
      const stateToSave = {
        clients,
        sites,
        guards,
        guardAssignments,
        weapons,
        weaponAssignments,
        products,
        stockTransactions,
        guardIssuedItems,
        accounts,
        vouchers,
        salarySlips,
        clientInvoices,
        auditLogs,
        companySettings,
        securitySettings,
        attendanceRecords,
        financeAccounts,
        expenseCategories,
        parties,
        cashTransactions,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [
    clients,
    sites,
    guards,
    guardAssignments,
    weapons,
    weaponAssignments,
    products,
    stockTransactions,
    guardIssuedItems,
    accounts,
    vouchers,
    salarySlips,
    clientInvoices,
    auditLogs,
    companySettings,
    securitySettings,
    attendanceRecords,
    financeAccounts,
    expenseCategories,
    parties,
    cashTransactions,
  ]);

  const logAudit = (action: string, module: string, recordReference: string, details: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString('sv-SE').replace('T', ' '),
      userName: currentUserRole === 'Super Admin' ? 'Admin (Ali Akbar)' : currentUserRole,
      userRole: currentUserRole,
      action,
      module,
      recordReference,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const updateSecuritySettings = (newSettings: Partial<RoleSecuritySettings>) => {
    setSecuritySettings((prev) => ({
      ...prev,
      ...newSettings,
      passwords: {
        ...prev.passwords,
        ...(newSettings.passwords || {}),
      },
    }));
    logAudit('Updated Security Config', 'Security', 'AUTH-SETTINGS', 'Updated role protection and password policies');
  };

  const updateRolePassword = (role: UserRole, newPass: string) => {
    setSecuritySettings((prev) => ({
      ...prev,
      passwords: {
        ...prev.passwords,
        [role]: newPass.trim(),
      },
    }));
    logAudit('Password Changed', 'Security', role, `Updated access password for role: ${role}`);
  };

  const verifyRolePassword = (role: UserRole, enteredPass: string): boolean => {
    const expected = securitySettings.passwords[role] || DEFAULT_ROLE_PASSWORDS[role];
    return enteredPass.trim() === expected.trim();
  };

  const requestRoleSwitch = (targetRole: UserRole) => {
    if (targetRole === currentUserRole) {
      return;
    }
    if (!securitySettings.requirePasswordOnSwitch) {
      setCurrentUserRole(targetRole);
      logAudit('Switched Role', 'Security', targetRole, `Role switched to ${targetRole} without password prompt`);
      return;
    }
    setPendingRoleSwitch(targetRole);
    setIsSecurityModalOpen(true);
  };

  const cancelRoleSwitch = () => {
    setPendingRoleSwitch(null);
    setIsSecurityModalOpen(false);
  };

  const confirmRoleSwitch = (password: string): { success: boolean; error?: string } => {
    if (!pendingRoleSwitch) {
      return { success: false, error: 'No target role selected' };
    }
    const isCorrect = verifyRolePassword(pendingRoleSwitch, password);
    if (!isCorrect) {
      logAudit('Failed Role Switch Attempt', 'Security', pendingRoleSwitch, `Incorrect password attempt for role: ${pendingRoleSwitch}`);
      return { success: false, error: 'Incorrect password for this role. Please try again.' };
    }

    const previousRole = currentUserRole;
    setCurrentUserRole(pendingRoleSwitch);
    logAudit('Role Authenticated', 'Security', pendingRoleSwitch, `Successfully switched from ${previousRole} to ${pendingRoleSwitch}`);
    setIsSecurityModalOpen(false);
    setPendingRoleSwitch(null);
    return { success: true };
  };

  const lockSystem = () => {
    setSecuritySettings((prev) => ({ ...prev, isLocked: true }));
    logAudit('System Locked', 'Security', currentUserRole, 'User manually locked the system screen');
  };

  const unlockSystem = (password: string): { success: boolean; error?: string } => {
    // Can be unlocked by active role's password or Super Admin password
    const isCurrentRoleMatch = verifyRolePassword(currentUserRole, password);
    const isSuperAdminMatch = verifyRolePassword('Super Admin', password);

    if (isCurrentRoleMatch || isSuperAdminMatch) {
      setSecuritySettings((prev) => ({ ...prev, isLocked: false }));
      logAudit('System Unlocked', 'Security', currentUserRole, `System unlocked with credentials for ${currentUserRole}`);
      return { success: true };
    }
    return { success: false, error: 'Invalid password. Enter current role or Super Admin master password.' };
  };

  const updateCompanySettings = (newSettings: Partial<CompanySettings>) => {
    setCompanySettings((prev) => ({ ...prev, ...newSettings }));
    logAudit('Updated Company Profile', 'Settings', 'COMPANY-PROFILE', 'Updated company header, contact or payment details');
  };

  const triggerPrint = (payload: PrintDocumentPayload) => {
    setPrintPayload(payload);
  };

  // --- Clients & Sites ---
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const id = `CL-${String(clients.length + 1).padStart(3, '0')}`;
    const newClient: Client = {
      ...clientData,
      id,
      clientCode: clientData.clientCode || id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients((prev) => [newClient, ...prev]);
    logAudit('Client Created', 'Clients', newClient.clientCode, `Created client profile for ${newClient.companyName}`);
    return newClient;
  };

  const updateClient = (id: string, updated: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
    logAudit('Client Updated', 'Clients', id, `Updated client details for ID: ${id}`);
  };

  const deleteClient = (id: string) => {
    const client = clients.find((c) => c.id === id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    logAudit('Client Deleted', 'Clients', client?.clientCode || id, `Deleted client profile: ${client?.companyName || id}`);
  };

  const addSite = (siteData: Omit<Site, 'id' | 'createdAt'>): Site => {
    const id = `SITE-${String(sites.length + 1).padStart(3, '0')}`;
    const client = clients.find((c) => c.id === siteData.clientId);
    const newSite: Site = {
      ...siteData,
      id,
      siteCode: siteData.siteCode || id,
      clientName: client?.companyName || siteData.clientName || '',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSites((prev) => [newSite, ...prev]);
    logAudit('Site Created', 'Sites', newSite.siteCode, `Added new site ${newSite.siteName} for ${newSite.clientName}`);
    return newSite;
  };

  const updateSite = (id: string, updated: Partial<Site>) => {
    setSites((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
    logAudit('Site Updated', 'Sites', id, `Updated site parameters for ID: ${id}`);
  };

  const deleteSite = (id: string) => {
    const site = sites.find((s) => s.id === id);
    // Unassign guards deployed at this site
    setGuards((prev) =>
      prev.map((g) =>
        g.currentSiteId === id
          ? { ...g, currentSiteId: undefined, currentSiteName: undefined }
          : g
      )
    );
    // Unassign weapons at this site
    setWeapons((prev) =>
      prev.map((w) =>
        w.currentSiteId === id
          ? { ...w, currentSiteId: undefined, currentSiteName: undefined }
          : w
      )
    );
    setSites((prev) => prev.filter((s) => s.id !== id));
    logAudit('Site Deleted', 'Sites', site?.siteCode || id, `Deleted operational site: ${site?.siteName || id}`);
  };

  // --- Guards & Assignments ---
  const addGuard = (guardData: Omit<Guard, 'id'>): Guard => {
    const id = `GRD-${100 + guards.length + 1}`;
    const newGuard: Guard = {
      ...guardData,
      id,
      guardCode: guardData.guardCode || `G-${1000 + guards.length + 1}`,
    };
    setGuards((prev) => [newGuard, ...prev]);
    logAudit('Guard Registered', 'Guards', newGuard.guardCode, `Registered guard ${newGuard.name} (CNIC: ${newGuard.cnic})`);
    return newGuard;
  };

  const updateGuard = (id: string, updated: Partial<Guard>) => {
    setGuards((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updated } : g))
    );
    logAudit('Guard Updated', 'Guards', id, `Updated guard record for ${id}`);
  };

  const deleteGuard = (id: string) => {
    const guard = guards.find((g) => g.id === id);
    // Return / unassign any weapon assigned to this guard
    setWeapons((prev) =>
      prev.map((w) =>
        w.currentGuardId === id || w.assignedGuardId === id
          ? {
              ...w,
              currentStatus: 'Available',
              currentGuardId: undefined,
              currentGuardName: undefined,
              currentSiteId: undefined,
              currentSiteName: undefined,
              assignedGuardId: undefined,
              assignedGuardName: undefined,
              assignedSiteId: undefined,
            }
          : w
      )
    );
    // Close assignments
    setGuardAssignments((prev) =>
      prev.map((a) =>
        a.guardId === id && a.status === 'Active'
          ? { ...a, status: 'Completed', endDate: new Date().toISOString().split('T')[0], remarks: 'Guard removed from system' }
          : a
      )
    );
    setGuards((prev) => prev.filter((g) => g.id !== id));
    logAudit('Guard Deleted', 'Guards', guard?.guardCode || id, `Deleted guard profile: ${guard?.name || id}`);
  };

  const transferGuard = (guardId: string, targetSiteId: string, shift: string, remarks?: string) => {
    const guard = guards.find((g) => g.id === guardId);
    const targetSite = sites.find((s) => s.id === targetSiteId);
    if (!guard || !targetSite) return;

    const oldSiteId = guard.currentSiteId;
    const nowStr = new Date().toLocaleString('sv-SE').replace('T', ' ');
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Close current active assignment in history if any
    setGuardAssignments((prev) =>
      prev.map((asn) =>
        asn.guardId === guardId && asn.status === 'Active'
          ? { ...asn, status: 'Transferred', endDate: todayStr, remarks: remarks || 'Transferred to another site' }
          : asn
      )
    );

    // 2. Add new active assignment
    const newAssignment: GuardAssignmentHistory = {
      id: `ASN-${Date.now()}`,
      guardId: guard.id,
      guardName: guard.name,
      guardCode: guard.guardCode,
      siteId: targetSite.id,
      siteName: targetSite.siteName,
      clientName: targetSite.clientName || 'Client Site',
      startDate: todayStr,
      shift,
      status: 'Active',
      remarks: remarks || `Transferred from ${guard.currentSiteName || 'Headquarters'} to ${targetSite.siteName}`,
      assignedBy: currentUserRole,
      assignedAt: nowStr,
    };

    setGuardAssignments((prev) => [newAssignment, ...prev]);

    // 3. Update Guard master profile with new site
    setGuards((prev) =>
      prev.map((g) =>
        g.id === guardId
          ? {
              ...g,
              currentSiteId: targetSite.id,
              currentSiteName: targetSite.siteName,
            }
          : g
      )
    );

    logAudit(
      'Guard Transferred',
      'Guards',
      guard.guardCode,
      `Guard ${guard.name} transferred to site: ${targetSite.siteName} (${shift})`
    );
  };

  // --- Attendance & Duty Register (Full Day, Double Duty, Half Day, Overtime) ---
  const markAttendance = (data: Omit<GuardAttendanceRecord, 'id' | 'createdAt'>): GuardAttendanceRecord => {
    let calculatedUnits = data.dutyUnits;
    if (calculatedUnits === undefined || calculatedUnits === null) {
      if (data.status === 'Full Day') calculatedUnits = 1.0;
      else if (data.status === 'Double Duty') calculatedUnits = 2.0;
      else if (data.status === 'Half Day') calculatedUnits = 0.5;
      else if (data.status === 'Short Duty') calculatedUnits = 0.5;
      else calculatedUnits = 0.0;
    }

    const existingIndex = attendanceRecords.findIndex(
      (r) => r.guardId === data.guardId && r.date === data.date
    );

    const nowStr = new Date().toLocaleString('sv-SE').replace('T', ' ');
    let finalRecord: GuardAttendanceRecord;

    if (existingIndex >= 0) {
      finalRecord = {
        ...attendanceRecords[existingIndex],
        ...data,
        dutyUnits: calculatedUnits,
      };
      setAttendanceRecords((prev) =>
        prev.map((rec, idx) => (idx === existingIndex ? finalRecord : rec))
      );
    } else {
      finalRecord = {
        ...data,
        id: `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        dutyUnits: calculatedUnits,
        createdAt: nowStr,
      };
      setAttendanceRecords((prev) => [finalRecord, ...prev]);
    }

    logAudit(
      'Attendance Marked',
      'Guard Attendance',
      data.guardCode,
      `Marked ${data.guardName} on ${data.date} as ${data.status} (${calculatedUnits} Duty units, OT: ${data.overtimeHours || 0} hrs)`
    );

    return finalRecord;
  };

  const markBulkAttendance = (records: Omit<GuardAttendanceRecord, 'id' | 'createdAt'>[]) => {
    const nowStr = new Date().toLocaleString('sv-SE').replace('T', ' ');
    setAttendanceRecords((prev) => {
      const updated = [...prev];
      records.forEach((rec) => {
        let dutyUnits = rec.dutyUnits;
        if (dutyUnits === undefined || dutyUnits === null) {
          if (rec.status === 'Full Day') dutyUnits = 1.0;
          else if (rec.status === 'Double Duty') dutyUnits = 2.0;
          else if (rec.status === 'Half Day') dutyUnits = 0.5;
          else if (rec.status === 'Short Duty') dutyUnits = 0.5;
          else dutyUnits = 0.0;
        }

        const idx = updated.findIndex((r) => r.guardId === rec.guardId && r.date === rec.date);
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            ...rec,
            dutyUnits,
          };
        } else {
          updated.unshift({
            ...rec,
            id: `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            dutyUnits,
            createdAt: nowStr,
          });
        }
      });
      return updated;
    });

    logAudit(
      'Bulk Attendance',
      'Guard Attendance',
      `${records.length} Guards`,
      `Updated batch attendance register for ${records.length} guard entries`
    );
  };

  const updateAttendanceRecord = (id: string, updates: Partial<GuardAttendanceRecord>) => {
    setAttendanceRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          let units = updates.dutyUnits !== undefined ? updates.dutyUnits : rec.dutyUnits;
          if (updates.status && updates.dutyUnits === undefined) {
            if (updates.status === 'Full Day') units = 1.0;
            else if (updates.status === 'Double Duty') units = 2.0;
            else if (updates.status === 'Half Day') units = 0.5;
            else if (updates.status === 'Short Duty') units = 0.5;
            else units = 0.0;
          }
          return { ...rec, ...updates, dutyUnits: units };
        }
        return rec;
      })
    );
  };

  const deleteAttendanceRecord = (id: string) => {
    setAttendanceRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const getGuardMonthlySummary = (guardId: string, monthYear: string): AttendanceMonthlySummary => {
    const guard = guards.find((g) => g.id === guardId);
    const guardName = guard ? guard.name : 'Unknown Guard';
    const guardCode = guard ? guard.guardCode : '';
    const siteName = guard ? guard.currentSiteName || 'Headquarters' : '';
    const basicSalary = guard ? guard.basicSalary || 40000 : 40000;
    const perDayRate = Number((basicSalary / 30).toFixed(1));

    const monthRecords = attendanceRecords.filter(
      (r) => r.guardId === guardId && r.date.startsWith(monthYear)
    );

    let fullDays = 0;
    let doubleDuties = 0;
    let halfDays = 0;
    let absentDays = 0;
    let leaveDays = 0;
    let totalDutyUnits = 0;
    let totalOvertimeHours = 0;

    monthRecords.forEach((r) => {
      if (r.status === 'Full Day') fullDays++;
      else if (r.status === 'Double Duty') doubleDuties++;
      else if (r.status === 'Half Day' || r.status === 'Short Duty') halfDays++;
      else if (r.status === 'Absent') absentDays++;
      else if (r.status === 'Leave') leaveDays++;

      totalDutyUnits += r.dutyUnits || 0;
      totalOvertimeHours += r.overtimeHours || 0;
    });

    const earnedSalary = Math.round(perDayRate * totalDutyUnits);
    // Overtime hourly rate ~ perDayRate / 12 hrs * 1.5 multiplier
    const hourlyRate = (perDayRate / 12) * 1.5;
    const overtimeAmount = Math.round(hourlyRate * totalOvertimeHours);

    return {
      guardId,
      guardName,
      guardCode,
      siteName,
      monthYear,
      fullDays,
      doubleDuties,
      halfDays,
      absentDays,
      leaveDays,
      totalDutyUnits: Number(totalDutyUnits.toFixed(1)),
      totalOvertimeHours,
      basicSalary,
      perDayRate,
      earnedSalary,
      overtimeAmount,
    };
  };

  const getAllGuardsMonthlySummaries = (monthYear: string): AttendanceMonthlySummary[] => {
    return guards
      .filter((g) => g.status === 'Active' || g.status === 'On Leave')
      .map((g) => getGuardMonthlySummary(g.id, monthYear));
  };

  const quickGenerateSalarySlipFromAttendance = (guardId: string, monthYear: string): SalarySlip | null => {
    const guard = guards.find((g) => g.id === guardId);
    if (!guard) return null;

    const summary = getGuardMonthlySummary(guardId, monthYear);
    const site = sites.find((s) => s.id === guard.currentSiteId);

    // Formatted dates
    const [year, month] = monthYear.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthLong = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const lastDayOfMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const periodStr = `01 – ${lastDayOfMonth} ${monthLong}`;
    const nextMonthObj = new Date(parseInt(year), parseInt(month), 5);
    const issueDateStr = `${String(nextMonthObj.getDate()).padStart(2, '0')} ${nextMonthObj.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`;

    const slip = generateSalarySlip({
      slipNo: `MSS/${month}/${year}/${String(salarySlips.length + 1).padStart(4, '0')}`,
      monthYear,
      monthName: monthLong,
      issueDate: issueDateStr,
      salaryPeriod: periodStr,
      guardId: guard.id,
      guardName: guard.name,
      guardCnic: guard.cnic,
      guardContact: guard.phone,
      siteId: guard.currentSiteId || 'SITE-001',
      siteName: guard.currentSiteName || 'Dhanola Factory',
      customerName: site?.contactPerson || 'Site In-Charge',
      customerLocation: site?.clientName || site?.siteName || 'Factory Location',
      customerContact: site?.contactPhone || guard.phone,
      basicSalary: guard.basicSalary || 40000,
      annualSalaryIncrement: 0,
      perDaySalary: summary.perDayRate,
      attendanceDays: summary.totalDutyUnits,
      earnedSalary: summary.earnedSalary,
      eidBonusDays: 0,
      eidBonusAmount: 0,
      advances: 0,
      deductions: 0,
      weaponCharges: summary.overtimeAmount,
      securityGuardCompanyShare: 0,
      netSalary: summary.earnedSalary + summary.overtimeAmount,
      notes: `Auto-generated from Attendance Register (${summary.fullDays} Full Days, ${summary.doubleDuties} Double Duties, ${summary.halfDays} Half Days, ${summary.totalOvertimeHours}h Overtime).`,
      status: 'Pending',
    });

    return slip;
  };

  // --- Weapons & Assignments ---
  const addWeapon = (weaponData: Omit<Weapon, 'id'>): Weapon => {
    const id = `WEP-${String(weapons.length + 1).padStart(3, '0')}`;
    const newWeapon: Weapon = {
      ...weaponData,
      id,
      weaponCode: weaponData.weaponCode || `W-${String(weapons.length + 1).padStart(3, '0')}`,
    };
    setWeapons((prev) => [newWeapon, ...prev]);
    logAudit('Weapon Added', 'Armoury', newWeapon.weaponCode, `Added ${newWeapon.weaponType} (S/N: ${newWeapon.serialNumber})`);
    return newWeapon;
  };

  const updateWeapon = (id: string, updated: Partial<Weapon>) => {
    setWeapons((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updated } : w))
    );
    logAudit('Weapon Updated', 'Armoury', id, `Updated weapon asset parameters for ${id}`);
  };

  const deleteWeapon = (id: string) => {
    const weapon = weapons.find((w) => w.id === id);
    if (weapon?.currentGuardId) {
      setGuards((prev) =>
        prev.map((g) => (g.id === weapon.currentGuardId ? { ...g, currentWeaponId: undefined } : g))
      );
    }
    setWeapons((prev) => prev.filter((w) => w.id !== id));
    logAudit('Weapon Deleted', 'Armoury', weapon?.weaponCode || id, `Deleted weapon: ${weapon?.weaponType || id} (${weapon?.weaponCode || ''})`);
  };

  const issueWeapon = (weaponId: string, guardId: string, siteId: string, notes?: string) => {
    const weapon = weapons.find((w) => w.id === weaponId);
    const guard = guards.find((g) => g.id === guardId);
    const site = sites.find((s) => s.id === siteId);
    if (!weapon || !guard || !site) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Create weapon assignment history record
    const newAssignment: WeaponAssignmentHistory = {
      id: `WAS-${Date.now()}`,
      weaponId: weapon.id,
      weaponCode: weapon.weaponCode,
      weaponType: weapon.weaponType,
      serialNumber: weapon.serialNumber,
      guardId: guard.id,
      guardName: guard.name,
      siteId: site.id,
      siteName: site.siteName,
      issueDate: todayStr,
      status: 'Active',
      issuedBy: currentUserRole,
      notes: notes || 'Weapon issued for active duty duty deployment',
    };

    setWeaponAssignments((prev) => [newAssignment, ...prev]);

    // 2. Update weapon state
    setWeapons((prev) =>
      prev.map((w) =>
        w.id === weaponId
          ? {
              ...w,
              currentStatus: 'Issued',
              currentGuardId: guard.id,
              currentGuardName: guard.name,
              currentSiteId: site.id,
              currentSiteName: site.siteName,
            }
          : w
      )
    );

    // 3. Update guard's current weapon
    setGuards((prev) =>
      prev.map((g) => (g.id === guardId ? { ...g, currentWeaponId: weapon.weaponCode } : g))
    );

    logAudit(
      'Weapon Issued',
      'Armoury',
      weapon.weaponCode,
      `Issued ${weapon.weaponType} (${weapon.weaponCode}) to guard ${guard.name} at site ${site.siteName}`
    );
  };

  const returnWeapon = (weaponId: string, condition?: string, notes?: string) => {
    const weapon = weapons.find((w) => w.id === weaponId);
    if (!weapon) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Close weapon assignment record
    setWeaponAssignments((prev) =>
      prev.map((wasn) =>
        wasn.weaponId === weaponId && wasn.status === 'Active'
          ? {
              ...wasn,
              status: 'Returned',
              returnDate: todayStr,
              returnCondition: condition || 'Normal serviceable condition',
              notes: notes ? `${wasn.notes || ''} | Return: ${notes}` : wasn.notes,
            }
          : wasn
      )
    );

    // 2. Clear weapon assignment in weapon master
    const oldGuardId = weapon.currentGuardId;
    setWeapons((prev) =>
      prev.map((w) =>
        w.id === weaponId
          ? {
              ...w,
              currentStatus: 'Available',
              currentGuardId: undefined,
              currentGuardName: undefined,
              currentSiteId: undefined,
              currentSiteName: undefined,
              condition: (condition as any) || w.condition,
            }
          : w
      )
    );

    // 3. Clear guard's weapon reference
    if (oldGuardId) {
      setGuards((prev) =>
        prev.map((g) => (g.id === oldGuardId ? { ...g, currentWeaponId: undefined } : g))
      );
    }

    logAudit(
      'Weapon Returned',
      'Armoury',
      weapon.weaponCode,
      `Weapon ${weapon.weaponCode} returned to Armoury (${condition || 'Good'}).`
    );
  };

  // --- Products & Inventory ---
  const addProduct = (prodData: Omit<Product, 'id' | 'currentStock'>): Product => {
    const id = `PRD-${String(products.length + 1).padStart(3, '0')}`;
    const newProduct: Product = {
      ...prodData,
      id,
      currentStock: 0,
    };
    setProducts((prev) => [newProduct, ...prev]);
    logAudit('Product Created', 'Inventory Master', newProduct.productCode, `Created inventory product: ${newProduct.productName}`);
    return newProduct;
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    logAudit('Product Updated', 'Inventory Master', id, `Updated product settings for ${id}`);
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    logAudit('Product Deleted', 'Inventory Master', prod?.productCode || id, `Deleted inventory item: ${prod?.productName || prod?.name || id}`);
  };

  const addStockTransaction = (txData: Omit<StockTransaction, 'id' | 'balanceAfter' | 'performedBy'>) => {
    const product = products.find((p) => p.id === txData.productId);
    if (!product) return;

    const currentBal = product.currentStock;
    const netChange = txData.quantityIn - txData.quantityOut;
    const newBalance = Math.max(0, currentBal + netChange);

    const transaction: StockTransaction = {
      ...txData,
      id: `STX-${Date.now()}`,
      balanceAfter: newBalance,
      performedBy: currentUserRole,
    };

    // Update Product stock balance
    setProducts((prev) =>
      prev.map((p) => (p.id === txData.productId ? { ...p, currentStock: newBalance } : p))
    );

    // Add transaction to ledger
    setStockTransactions((prev) => [transaction, ...prev]);

    logAudit(
      `Stock ${txData.type}`,
      'Inventory',
      txData.referenceNo,
      `${txData.type}: ${product.productName} (Qty In: ${txData.quantityIn}, Qty Out: ${txData.quantityOut}, New Balance: ${newBalance})`
    );
  };

  const issueItemToGuard = (guardId: string, productId: string, quantity: number, notes?: string) => {
    const guard = guards.find((g) => g.id === guardId);
    const product = products.find((p) => p.id === productId);
    if (!guard || !product || quantity <= 0) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Deduct from inventory stock
    addStockTransaction({
      date: todayStr,
      type: 'Guard Issue',
      referenceNo: `ISS-${Date.now().toString().slice(-6)}`,
      productId: product.id,
      productName: product.productName,
      productCode: product.productCode,
      quantityIn: 0,
      quantityOut: quantity,
      unitPrice: product.unitPrice,
      totalAmount: quantity * product.unitPrice,
      guardId: guard.id,
      guardName: guard.name,
      siteId: guard.currentSiteId,
      siteName: guard.currentSiteName,
      notes: notes || `Issued to Guard ${guard.name}`,
    });

    // 2. Track in Guard Issued Items
    const newIssue: GuardIssuedItem = {
      id: `GII-${Date.now()}`,
      guardId: guard.id,
      guardName: guard.name,
      productId: product.id,
      productName: product.productName,
      quantity,
      issueDate: todayStr,
      status: 'Issued',
      conditionOnIssue: 'Brand New',
      issuedBy: currentUserRole,
      notes: notes || 'Uniform gear issued for site assignment',
    };

    setGuardIssuedItems((prev) => [newIssue, ...prev]);

    logAudit(
      'Guard Item Issued',
      'Inventory',
      product.productCode,
      `Issued ${quantity}x ${product.productName} to ${guard.name}`
    );
  };

  const returnItemFromGuard = (issueId: string, notes?: string) => {
    const issue = guardIssuedItems.find((i) => i.id === issueId);
    if (!issue || issue.status !== 'Issued') return;

    const todayStr = new Date().toISOString().split('T')[0];
    const product = products.find((p) => p.id === issue.productId);

    // 1. Add back to inventory stock
    if (product) {
      addStockTransaction({
        date: todayStr,
        type: 'Guard Return',
        referenceNo: `RET-${Date.now().toString().slice(-6)}`,
        productId: product.id,
        productName: product.productName,
        productCode: product.productCode,
        quantityIn: issue.quantity,
        quantityOut: 0,
        unitPrice: product.unitPrice,
        totalAmount: issue.quantity * product.unitPrice,
        guardId: issue.guardId,
        guardName: issue.guardName,
        notes: notes || `Returned by Guard ${issue.guardName}`,
      });
    }

    // 2. Update issue record
    setGuardIssuedItems((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              status: 'Returned',
              returnDate: todayStr,
              conditionOnReturn: 'Serviceable',
              notes: notes ? `${i.notes || ''} | Returned: ${notes}` : i.notes,
            }
          : i
      )
    );

    logAudit(
      'Guard Item Returned',
      'Inventory',
      issue.productName,
      `Guard ${issue.guardName} returned ${issue.quantity}x ${issue.productName}`
    );
  };

  // --- Accounts & Double-Entry Accounting ---
  const addAccount = (accountData: Omit<Account, 'id' | 'currentBalance'>): Account => {
    const id = `ACC-${accountData.accountCode}`;
    const newAccount: Account = {
      ...accountData,
      id,
      currentBalance: accountData.openingBalance || 0,
    };
    setAccounts((prev) => [...prev, newAccount]);
    logAudit('Account Created', 'Chart of Accounts', newAccount.accountCode, `Added account ${newAccount.accountCode} - ${newAccount.accountName}`);
    return newAccount;
  };

  const updateAccount = (id: string, updated: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
    logAudit('Account Updated', 'Chart of Accounts', id, `Modified account properties for ${id}`);
  };

  const createVoucher = (
    voucherData: Omit<Voucher, 'id' | 'createdAt' | 'createdBy' | 'status'>
  ): { success: boolean; error?: string; voucher?: Voucher } => {
    // 1. Strict Validation: Total Debit MUST Equal Total Credit
    const totalDebit = voucherData.entries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
    const totalCredit = voucherData.entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return {
        success: false,
        error: `Debit (PKR ${totalDebit.toLocaleString()}) does not equal Credit (PKR ${totalCredit.toLocaleString()}). Unbalanced vouchers cannot be posted!`,
      };
    }

    if (totalDebit <= 0) {
      return {
        success: false,
        error: 'Voucher amount must be greater than zero.',
      };
    }

    const id = `VOUCH-${Date.now()}`;
    const newVoucher: Voucher = {
      ...voucherData,
      id,
      totalDebit,
      totalCredit,
      createdBy: currentUserRole,
      status: 'Posted',
      createdAt: new Date().toLocaleString('sv-SE').replace('T', ' '),
    };

    // 2. Post amounts directly to Account balances
    setAccounts((prev) => {
      return prev.map((acc) => {
        const matchingEntries = voucherData.entries.filter((e) => e.accountId === acc.id);
        if (matchingEntries.length === 0) return acc;

        let delta = 0;
        matchingEntries.forEach((entry) => {
          const deb = Number(entry.debit) || 0;
          const cred = Number(entry.credit) || 0;

          // Asset & Expense normal balance is Debit (+Debit, -Credit)
          // Liability, Equity & Income normal balance is Credit (+Credit, -Debit)
          if (acc.category === 'Asset' || acc.category === 'Expense') {
            delta += deb - cred;
          } else {
            delta += cred - deb;
          }
        });

        return {
          ...acc,
          currentBalance: acc.currentBalance + delta,
        };
      });
    });

    setVouchers((prev) => [newVoucher, ...prev]);

    logAudit(
      'Voucher Posted',
      'Accounting',
      newVoucher.voucherNo,
      `Posted ${newVoucher.voucherType} Voucher #${newVoucher.voucherNo} for PKR ${totalDebit.toLocaleString()}`
    );

    return { success: true, voucher: newVoucher };
  };

  const cancelVoucher = (id: string, reason: string) => {
    const voucher = vouchers.find((v) => v.id === id);
    if (!voucher || voucher.status === 'Cancelled') return;

    // 1. Reverse the effect on Account balances
    setAccounts((prev) => {
      return prev.map((acc) => {
        const matchingEntries = voucher.entries.filter((e) => e.accountId === acc.id);
        if (matchingEntries.length === 0) return acc;

        let delta = 0;
        matchingEntries.forEach((entry) => {
          const deb = Number(entry.debit) || 0;
          const cred = Number(entry.credit) || 0;

          // Inverse reversal
          if (acc.category === 'Asset' || acc.category === 'Expense') {
            delta -= deb - cred;
          } else {
            delta -= cred - deb;
          }
        });

        return {
          ...acc,
          currentBalance: acc.currentBalance + delta,
        };
      });
    });

    // 2. Mark voucher as cancelled with audit metadata
    const cancelTimestamp = new Date().toLocaleString('sv-SE').replace('T', ' ');
    setVouchers((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              status: 'Cancelled',
              cancelledReason: reason,
              cancelledAt: cancelTimestamp,
            }
          : v
      )
    );

    logAudit(
      'Voucher Cancelled / Reversed',
      'Accounting',
      voucher.voucherNo,
      `Voucher #${voucher.voucherNo} cancelled. Reason: ${reason}`
    );
  };

  const deleteVoucher = (id: string) => {
    const voucher = vouchers.find((v) => v.id === id);
    if (!voucher) return;

    // If deleting an active posted voucher, reverse the debit/credit effects first
    if (voucher.status === 'Posted') {
      setAccounts((prev) => {
        return prev.map((acc) => {
          const matchingEntries = voucher.entries.filter((e) => e.accountId === acc.id);
          if (matchingEntries.length === 0) return acc;

          let delta = 0;
          matchingEntries.forEach((entry) => {
            const deb = Number(entry.debit) || 0;
            const cred = Number(entry.credit) || 0;

            if (acc.category === 'Asset' || acc.category === 'Expense') {
              delta -= deb - cred;
            } else {
              delta -= cred - deb;
            }
          });

          return {
            ...acc,
            currentBalance: acc.currentBalance + delta,
          };
        });
      });
    }

    setVouchers((prev) => prev.filter((v) => v.id !== id));
    logAudit(
      'Voucher Deleted',
      'Accounting',
      voucher.voucherNo,
      `Permanently deleted ${voucher.voucherType} Voucher #${voucher.voucherNo} (PKR ${voucher.totalDebit.toLocaleString()})`
    );
  };

  // ==========================================================
  // MULTI-ACCOUNT EXPENSE & LEDGER IMPLEMENTATIONS
  // ==========================================================

  const addFinanceAccount = (accountData: Omit<FinanceAccount, 'id' | 'createdAt'>): FinanceAccount => {
    const id = `FA-${Date.now()}`;
    const newAcc: FinanceAccount = {
      ...accountData,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setFinanceAccounts((prev) => [...prev, newAcc]);
    logAudit('Finance Account Added', 'Finance Ledger', newAcc.name, `Created ${newAcc.type.toUpperCase()} account: ${newAcc.name} with opening PKR ${newAcc.openingBalance.toLocaleString()}`);
    return newAcc;
  };

  const updateFinanceAccount = (id: string, updates: Partial<FinanceAccount>) => {
    setFinanceAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    logAudit('Finance Account Updated', 'Finance Ledger', id, `Updated account properties for ID: ${id}`);
  };

  const deleteFinanceAccount = (id: string): { success: boolean; error?: string } => {
    const target = financeAccounts.find((a) => a.id === id);
    if (!target) return { success: false, error: 'Account not found.' };

    const hasTxns = cashTransactions.some((t) => t.accountId === id);
    if (hasTxns) {
      // Archive instead of delete to preserve ledger integrity
      setFinanceAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'archived' } : a))
      );
      logAudit('Finance Account Archived', 'Finance Ledger', target.name, `Archived account ${target.name} because it contains historical transactions.`);
      return { success: true };
    }

    setFinanceAccounts((prev) => prev.filter((a) => a.id !== id));
    logAudit('Finance Account Deleted', 'Finance Ledger', target.name, `Deleted unused account: ${target.name}`);
    return { success: true };
  };

  const addExpenseCategory = (categoryData: Omit<ExpenseCategory, 'id'>): ExpenseCategory => {
    const id = `CAT-${Date.now()}`;
    const newCat: ExpenseCategory = {
      ...categoryData,
      id,
    };
    setExpenseCategories((prev) => [...prev, newCat]);
    logAudit('Category Created', 'Finance Ledger', newCat.name, `Added Head A/C category: ${newCat.name}`);
    return newCat;
  };

  const updateExpenseCategory = (id: string, updates: Partial<ExpenseCategory>) => {
    setExpenseCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    logAudit('Category Updated', 'Finance Ledger', id, `Updated category properties for ${id}`);
  };

  const deleteExpenseCategory = (id: string) => {
    const cat = expenseCategories.find((c) => c.id === id);
    setExpenseCategories((prev) => prev.filter((c) => c.id !== id));
    logAudit('Category Deleted', 'Finance Ledger', cat?.name || id, `Deleted category ${cat?.name || id}`);
  };

  const addParty = (partyData: Omit<Party, 'id' | 'createdAt'>): Party => {
    const id = `PTY-${Date.now()}`;
    const newParty: Party = {
      ...partyData,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setParties((prev) => [...prev, newParty]);
    logAudit('Party Created', 'Party Ledgers', newParty.name, `Added party/person: ${newParty.name} (${newParty.roleRelation})`);
    return newParty;
  };

  const updateParty = (id: string, updates: Partial<Party>) => {
    setParties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    logAudit('Party Updated', 'Party Ledgers', id, `Updated party details for ${id}`);
  };

  const deleteParty = (id: string) => {
    const party = parties.find((p) => p.id === id);
    setParties((prev) => prev.filter((p) => p.id !== id));
    logAudit('Party Deleted', 'Party Ledgers', party?.name || id, `Deleted party ${party?.name || id}`);
  };

  const getAccountLiveBalance = (accountId: string): number => {
    const acc = financeAccounts.find((a) => a.id === accountId);
    if (!acc) return 0;

    let balance = Number(acc.openingBalance) || 0;
    cashTransactions.forEach((txn) => {
      if (txn.accountId === accountId) {
        if (txn.direction === 'IN') {
          balance += Number(txn.amount) || 0;
        } else if (txn.direction === 'OUT') {
          balance -= Number(txn.amount) || 0;
        }
      }
    });
    return balance;
  };

  const getAllAccountsLiveBalances = (): Record<string, number> => {
    const balances: Record<string, number> = {};
    financeAccounts.forEach((acc) => {
      balances[acc.id] = getAccountLiveBalance(acc.id);
    });
    return balances;
  };

  const addCashTransaction = (txnData: Omit<CashTransaction, 'id' | 'createdAt'>): CashTransaction => {
    const id = `TXN-${Date.now()}`;
    const acc = financeAccounts.find((a) => a.id === txnData.accountId);
    const cat = expenseCategories.find((c) => c.id === txnData.categoryId);
    const party = txnData.partyId ? parties.find((p) => p.id === txnData.partyId) : undefined;

    const newTxn: CashTransaction = {
      ...txnData,
      id,
      accountName: acc?.name || txnData.accountName,
      categoryName: cat?.name || txnData.categoryName,
      partyName: party?.name || txnData.partyName,
      createdAt: new Date().toLocaleString('sv-SE').replace('T', ' '),
    };

    setCashTransactions((prev) => [newTxn, ...prev]);
    logAudit(
      'Transaction Added',
      'Finance Ledger',
      newTxn.id,
      `[${newTxn.direction}] PKR ${newTxn.amount.toLocaleString()} in ${acc?.name || 'Account'} (${newTxn.description})`
    );
    return newTxn;
  };

  const updateCashTransaction = (id: string, updates: Partial<CashTransaction>) => {
    setCashTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const acc = updates.accountId ? financeAccounts.find((a) => a.id === updates.accountId) : undefined;
        const cat = updates.categoryId ? expenseCategories.find((c) => c.id === updates.categoryId) : undefined;
        const party = updates.partyId ? parties.find((p) => p.id === updates.partyId) : undefined;

        return {
          ...t,
          ...updates,
          accountName: acc ? acc.name : t.accountName,
          categoryName: cat ? cat.name : t.categoryName,
          partyName: updates.partyId !== undefined ? (party ? party.name : undefined) : t.partyName,
        };
      })
    );
    logAudit('Transaction Updated', 'Finance Ledger', id, `Edited cashbook entry ${id}`);
  };

  const deleteCashTransaction = (id: string) => {
    const txn = cashTransactions.find((t) => t.id === id);
    if (!txn) return;

    if (txn.transferGroupId) {
      // If it's part of an account transfer, delete paired counterpart as well!
      setCashTransactions((prev) => prev.filter((t) => t.transferGroupId !== txn.transferGroupId && t.id !== id));
      logAudit(
        'Transfer Deleted',
        'Finance Ledger',
        txn.id,
        `Deleted paired account transfer #${txn.transferGroupId} (PKR ${txn.amount.toLocaleString()})`
      );
    } else {
      setCashTransactions((prev) => prev.filter((t) => t.id !== id));
      logAudit(
        'Transaction Deleted',
        'Finance Ledger',
        txn.id,
        `Deleted [${txn.direction}] transaction PKR ${txn.amount.toLocaleString()} (${txn.description})`
      );
    }
  };

  const duplicateCashTransaction = (id: string): CashTransaction | null => {
    const existing = cashTransactions.find((t) => t.id === id);
    if (!existing) return null;

    const duplicated: CashTransaction = {
      ...existing,
      id: `TXN-${Date.now()}`,
      date: new Date().toISOString().split('T')[0], // Default to today
      transferGroupId: undefined,
      voucherNo: undefined,
      createdAt: new Date().toLocaleString('sv-SE').replace('T', ' '),
    };

    setCashTransactions((prev) => [duplicated, ...prev]);
    logAudit(
      'Transaction Duplicated',
      'Finance Ledger',
      duplicated.id,
      `Repeated entry: PKR ${duplicated.amount.toLocaleString()} (${duplicated.description})`
    );
    return duplicated;
  };

  const executeAccountTransfer = (params: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date: string;
    description: string;
    createdBy: string;
  }): { outTxn: CashTransaction; inTxn: CashTransaction } => {
    const transferGroupId = `TRF-GRP-${Date.now()}`;
    const fromAcc = financeAccounts.find((a) => a.id === params.fromAccountId);
    const toAcc = financeAccounts.find((a) => a.id === params.toAccountId);

    const outTxn: CashTransaction = {
      id: `TXN-${Date.now()}-OUT`,
      date: params.date,
      accountId: params.fromAccountId,
      accountName: fromAcc?.name || 'Source Account',
      categoryId: 'CAT-TRANSFER',
      categoryName: 'Account Transfer',
      subcategoryId: 'SUB-TR-3',
      subcategoryName: 'Inter-Account Fund Transfer',
      description: `Transfer to ${toAcc?.name || 'Target Account'}: ${params.description}`,
      direction: 'OUT',
      amount: params.amount,
      createdBy: params.createdBy,
      transferGroupId,
      createdAt: new Date().toLocaleString('sv-SE').replace('T', ' '),
    };

    const inTxn: CashTransaction = {
      id: `TXN-${Date.now()}-IN`,
      date: params.date,
      accountId: params.toAccountId,
      accountName: toAcc?.name || 'Target Account',
      categoryId: 'CAT-TRANSFER',
      categoryName: 'Account Transfer',
      subcategoryId: 'SUB-TR-3',
      subcategoryName: 'Inter-Account Fund Transfer',
      description: `Transfer received from ${fromAcc?.name || 'Source Account'}: ${params.description}`,
      direction: 'IN',
      amount: params.amount,
      createdBy: params.createdBy,
      transferGroupId,
      createdAt: new Date().toLocaleString('sv-SE').replace('T', ' '),
    };

    setCashTransactions((prev) => [outTxn, inTxn, ...prev]);
    logAudit(
      'Account Transfer Executed',
      'Finance Ledger',
      transferGroupId,
      `Transferred PKR ${params.amount.toLocaleString()} from ${fromAcc?.name} to ${toAcc?.name}`
    );

    return { outTxn, inTxn };
  };

  const importTransactionsFromCsv = (parsedRows: any[]): { successCount: number; errors: string[] } => {
    const errors: string[] = [];
    let successCount = 0;
    const newTxns: CashTransaction[] = [];

    parsedRows.forEach((row, index) => {
      try {
        const date = row.Date || row.date || new Date().toISOString().split('T')[0];
        const headAc = row['Head A/C'] || row.HeadAC || row.category || 'Office';
        const subHeadAc = row['Sub-Head A/C'] || row.SubHeadAC || row.subcategory || '';
        const description = row.Description || row.description || row.Particulars || 'Imported Entry';
        const accountNameRaw = row.Account || row.account || '';

        const inAmount = Number(row.IN || row.In || row.Receipt || 0);
        const outAmount = Number(row.OUT || row.Out || row.Payment || 0);

        if (inAmount <= 0 && outAmount <= 0) {
          errors.push(`Row ${index + 1}: Amount is missing or zero.`);
          return;
        }

        const direction: TransactionDirection = inAmount > 0 ? 'IN' : 'OUT';
        const amount = inAmount > 0 ? inAmount : outAmount;

        // Match or resolve Account
        let targetAcc = financeAccounts.find(
          (a) => a.name.toLowerCase().includes(accountNameRaw.toLowerCase()) || a.id === accountNameRaw
        );
        if (!targetAcc) {
          targetAcc = financeAccounts[0];
        }

        // Match or resolve Category
        let targetCat = expenseCategories.find(
          (c) => c.name.toLowerCase().includes(headAc.toLowerCase()) || c.id === headAc
        );
        if (!targetCat) {
          targetCat = expenseCategories.find((c) => c.name === 'Office') || expenseCategories[0];
        }

        const newTxn: CashTransaction = {
          id: `TXN-IMP-${Date.now()}-${index}`,
          date,
          accountId: targetAcc.id,
          accountName: targetAcc.name,
          categoryId: targetCat.id,
          categoryName: targetCat.name,
          subcategoryName: subHeadAc,
          description,
          direction,
          amount,
          createdBy: currentUserRole === 'Super Admin' ? 'Ali Akbar' : currentUserRole,
          createdAt: new Date().toLocaleString('sv-SE').replace('T', ' '),
        };

        newTxns.push(newTxn);
        successCount++;
      } catch (err: any) {
        errors.push(`Row ${index + 1}: ${err.message || 'Parsing error'}`);
      }
    });

    if (newTxns.length > 0) {
      setCashTransactions((prev) => [...newTxns, ...prev]);
      logAudit(
        'CSV Data Imported',
        'Finance Ledger',
        `${successCount} rows`,
        `Imported ${successCount} historical cashbook entries from spreadsheet.`
      );
    }

    return { successCount, errors };
  };

  const getDailyReconciliation = (targetDate: string, accountId?: string): DailyReconciliationSummary[] => {
    const targetAccounts = accountId
      ? financeAccounts.filter((a) => a.id === accountId)
      : financeAccounts;

    return targetAccounts.map((acc) => {
      // 1. Opening balance before targetDate
      let opening = Number(acc.openingBalance) || 0;
      let totalIn = 0;
      let totalOut = 0;
      let count = 0;

      cashTransactions.forEach((txn) => {
        if (txn.accountId === acc.id) {
          if (txn.date < targetDate) {
            if (txn.direction === 'IN') opening += Number(txn.amount) || 0;
            if (txn.direction === 'OUT') opening -= Number(txn.amount) || 0;
          } else if (txn.date === targetDate) {
            count++;
            if (txn.direction === 'IN') totalIn += Number(txn.amount) || 0;
            if (txn.direction === 'OUT') totalOut += Number(txn.amount) || 0;
          }
        }
      });

      const closing = opening + totalIn - totalOut;

      return {
        date: targetDate,
        accountId: acc.id,
        accountName: acc.name,
        openingBalance: opening,
        totalIn,
        totalOut,
        closingBalance: closing,
        transactionCount: count,
      };
    });
  };

  const getPartyLedger = (partyId: string) => {
    const party = parties.find((p) => p.id === partyId);
    const txns = cashTransactions.filter((t) => t.partyId === partyId);

    const totalIn = txns
      .filter((t) => t.direction === 'IN')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalOut = txns
      .filter((t) => t.direction === 'OUT')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const openingAdvance = Number(party?.openingAdvanceBalance) || 0;
    // Net balance = opening advance + payments given to party (OUT) - receipts from party (IN)
    const netBalance = openingAdvance + totalOut - totalIn;

    return {
      party,
      transactions: txns,
      totalIn,
      totalOut,
      netBalance,
    };
  };

  // --- Salary Slips & Invoices ---
  const generateSalarySlip = (slipData: Omit<SalarySlip, 'id' | 'createdAt' | 'amountInWords'>): SalarySlip => {
    const id = `SLIP-${Date.now()}`;
    const words = numberToWordsPKR(slipData.netSalary);
    const newSlip: SalarySlip = {
      ...slipData,
      id,
      amountInWords: words,
      createdAt: new Date().toLocaleString('sv-SE').replace('T', ' '),
    };

    setSalarySlips((prev) => [newSlip, ...prev]);

    logAudit(
      'Salary Slip Generated',
      'Payroll',
      newSlip.slipNo,
      `Generated Salary Slip #${newSlip.slipNo} for Guard ${newSlip.guardName} (Net: PKR ${newSlip.netSalary.toLocaleString()})`
    );

    return newSlip;
  };

  const updateSalarySlipStatus = (id: string, status: 'Paid' | 'Pending' | 'Draft') => {
    setSalarySlips((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    logAudit('Salary Slip Status Updated', 'Payroll', id, `Updated slip status to ${status}`);
  };

  const deleteSalarySlip = (id: string) => {
    const slip = salarySlips.find((s) => s.id === id);
    setSalarySlips((prev) => prev.filter((s) => s.id !== id));
    logAudit('Salary Slip Deleted', 'Payroll', slip?.slipNo || id, `Deleted salary slip #${slip?.slipNo || id}`);
  };

  const createClientInvoice = (invoiceData: Omit<ClientInvoice, 'id'>): ClientInvoice => {
    const id = `INV-${Date.now()}`;
    const newInvoice: ClientInvoice = {
      ...invoiceData,
      id,
    };
    setClientInvoices((prev) => [newInvoice, ...prev]);
    logAudit('Invoice Generated', 'Billing', newInvoice.invoiceNo, `Generated invoice for ${newInvoice.clientName} (Amount: PKR ${newInvoice.totalAmount.toLocaleString()})`);
    return newInvoice;
  };

  const deleteClientInvoice = (id: string) => {
    const inv = clientInvoices.find((i) => i.id === id);
    setClientInvoices((prev) => prev.filter((i) => i.id !== id));
    logAudit('Invoice Deleted', 'Billing', inv?.invoiceNo || id, `Deleted client invoice #${inv?.invoiceNo || id}`);
  };

  const receiveInvoicePayment = (invoiceId: string, amount: number, accountId: string, notes?: string) => {
    const invoice = clientInvoices.find((i) => i.id === invoiceId);
    if (!invoice || amount <= 0) return;

    const newPaid = invoice.paidAmount + amount;
    const newBalance = Math.max(0, invoice.totalAmount - newPaid);
    const newStatus = newBalance === 0 ? 'Paid' : 'Partial';

    setClientInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              paidAmount: newPaid,
              balanceAmount: newBalance,
              status: newStatus,
            }
          : i
      )
    );

    // Auto-create Receipt Voucher
    const receiptAcc = accounts.find((a) => a.id === accountId) || accounts[1]; // Meezan Bank
    const recvAcc = accounts.find((a) => a.id === 'ACC-1030') || accounts[3]; // Receivables

    createVoucher({
      voucherNo: `RV-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      voucherType: 'Receipt',
      referenceNo: invoice.invoiceNo,
      narration: `Payment received against invoice ${invoice.invoiceNo} from ${invoice.clientName}. ${notes || ''}`,
      totalDebit: amount,
      totalCredit: amount,
      entries: [
        {
          id: `ENT-${Date.now()}-1`,
          accountId: receiptAcc.id,
          accountCode: receiptAcc.accountCode,
          accountName: receiptAcc.accountName,
          debit: amount,
          credit: 0,
          narration: `Received in ${receiptAcc.accountName}`,
          partyType: 'Client',
          partyId: invoice.clientId,
          partyName: invoice.clientName,
        },
        {
          id: `ENT-${Date.now()}-2`,
          accountId: recvAcc.id,
          accountCode: recvAcc.accountCode,
          accountName: recvAcc.accountName,
          debit: 0,
          credit: amount,
          narration: `Cleared receivable against invoice ${invoice.invoiceNo}`,
          partyType: 'Client',
          partyId: invoice.clientId,
          partyName: invoice.clientName,
        }
      ]
    });

    logAudit(
      'Invoice Payment Received',
      'Billing',
      invoice.invoiceNo,
      `Received PKR ${amount.toLocaleString()} for invoice #${invoice.invoiceNo}`
    );
  };

  // --- Global Search ---
  const searchGlobal = (query: string): SearchResultItem[] => {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();
    const results: SearchResultItem[] = [];

    // Search Guards
    guards.forEach((g) => {
      if (
        g.name.toLowerCase().includes(q) ||
        g.guardCode.toLowerCase().includes(q) ||
        g.cnic.includes(q) ||
        g.phone.includes(q)
      ) {
        results.push({
          id: g.id,
          title: `${g.name} (${g.guardCode})`,
          subtitle: `Guard • ${g.designation} • ${g.currentSiteName || 'Unassigned'} • CNIC: ${g.cnic}`,
          category: 'Guard',
          code: g.guardCode,
          status: g.status,
          targetTab: 'guards',
          targetId: g.id,
        });
      }
    });

    // Search Weapons
    weapons.forEach((w) => {
      if (
        w.weaponCode.toLowerCase().includes(q) ||
        w.serialNumber.toLowerCase().includes(q) ||
        w.makeModel.toLowerCase().includes(q) ||
        w.weaponType.toLowerCase().includes(q)
      ) {
        results.push({
          id: w.id,
          title: `${w.weaponCode} - ${w.weaponType}`,
          subtitle: `Weapon • S/N: ${w.serialNumber} • ${w.makeModel} • Status: ${w.currentStatus}`,
          category: 'Weapon',
          code: w.weaponCode,
          status: w.currentStatus,
          targetTab: 'weapons',
          targetId: w.id,
        });
      }
    });

    // Search Clients
    clients.forEach((c) => {
      if (
        c.clientName.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.clientCode.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.phone.includes(q)
      ) {
        results.push({
          id: c.id,
          title: c.companyName,
          subtitle: `Client • Contact: ${c.contactPerson} (${c.phone}) • ${c.city}`,
          category: 'Client',
          code: c.clientCode,
          status: c.status,
          targetTab: 'clients',
          targetId: c.id,
        });
      }
    });

    // Search Sites
    sites.forEach((s) => {
      if (
        s.siteName.toLowerCase().includes(q) ||
        s.siteCode.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        (s.clientName && s.clientName.toLowerCase().includes(q))
      ) {
        results.push({
          id: s.id,
          title: s.siteName,
          subtitle: `Site • Client: ${s.clientName} • ${s.location} • Guards: ${s.requiredGuards}`,
          category: 'Site',
          code: s.siteCode,
          status: s.status,
          targetTab: 'sites',
          targetId: s.id,
        });
      }
    });

    // Search Vouchers
    vouchers.forEach((v) => {
      if (
        v.voucherNo.toLowerCase().includes(q) ||
        v.narration.toLowerCase().includes(q) ||
        (v.referenceNo && v.referenceNo.toLowerCase().includes(q))
      ) {
        results.push({
          id: v.id,
          title: `Voucher #${v.voucherNo} (${v.voucherType})`,
          subtitle: `Amount: PKR ${v.totalDebit.toLocaleString()} • ${v.narration} • Date: ${v.date}`,
          category: 'Voucher',
          code: v.voucherNo,
          status: v.status,
          targetTab: 'vouchers',
          targetId: v.id,
        });
      }
    });

    // Search Salary Slips
    salarySlips.forEach((s) => {
      if (
        s.slipNo.toLowerCase().includes(q) ||
        s.guardName.toLowerCase().includes(q) ||
        s.customerLocation.toLowerCase().includes(q)
      ) {
        results.push({
          id: s.id,
          title: `Salary Slip ${s.slipNo} - ${s.guardName}`,
          subtitle: `Net: PKR ${s.netSalary.toLocaleString()} • Period: ${s.salaryPeriod} • ${s.customerLocation}`,
          category: 'Salary Slip',
          code: s.slipNo,
          status: s.status,
          targetTab: 'salary-slips',
          targetId: s.id,
        });
      }
    });

    // Search Products
    products.forEach((p) => {
      if (
        p.productName.toLowerCase().includes(q) ||
        p.productCode.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: p.id,
          title: p.productName,
          subtitle: `Product • Code: ${p.productCode} • Category: ${p.category} • Stock: ${p.currentStock} ${p.unit}`,
          category: 'Product',
          code: p.productCode,
          status: p.currentStock <= p.minimumStock ? 'Low Stock' : 'In Stock',
          targetTab: 'inventory',
          targetId: p.id,
        });
      }
    });

    return results.slice(0, 25);
  };

  // --- Export, Import & Reset ---
  const exportDatabaseJSON = () => {
    const stateToExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      companySettings,
      securitySettings,
      clients,
      sites,
      guards,
      guardAssignments,
      weapons,
      weaponAssignments,
      products,
      stockTransactions,
      guardIssuedItems,
      accounts,
      vouchers,
      salarySlips,
      clientInvoices,
      auditLogs,
      attendanceRecords,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(stateToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Mountain_Security_SGMS_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    logAudit('Database Exported', 'Backup & Restore', 'SYSTEM-BACKUP', 'Exported JSON full database snapshot');
  };

  const importDatabaseJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.clients && parsed.guards && parsed.vouchers) {
        if (parsed.companySettings) setCompanySettings(parsed.companySettings);
        if (parsed.securitySettings) {
          setSecuritySettings({
            ...initialSecuritySettings,
            ...parsed.securitySettings,
            passwords: {
              ...initialSecuritySettings.passwords,
              ...(parsed.securitySettings.passwords || {}),
            },
            isLocked: false,
          });
        }
        setClients(parsed.clients);
        setSites(parsed.sites || []);
        setGuards(parsed.guards || []);
        setGuardAssignments(parsed.guardAssignments || []);
        setWeapons(parsed.weapons || []);
        setWeaponAssignments(parsed.weaponAssignments || []);
        setProducts(parsed.products || []);
        setStockTransactions(parsed.stockTransactions || []);
        setGuardIssuedItems(parsed.guardIssuedItems || []);
        setAccounts(parsed.accounts || []);
        setVouchers(parsed.vouchers || []);
        setSalarySlips(parsed.salarySlips || []);
        setClientInvoices(parsed.clientInvoices || []);
        setAuditLogs(parsed.auditLogs || []);
        if (parsed.attendanceRecords && Array.isArray(parsed.attendanceRecords)) {
          setAttendanceRecords(parsed.attendanceRecords);
        }

        logAudit('Database Restored', 'Backup & Restore', 'SYSTEM-RESTORE', 'Restored system database from external JSON file');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failure:', e);
      return false;
    }
  };

  const resetToSampleData = () => {
    setCompanySettings(initialCompanySettings);
    setSecuritySettings(initialSecuritySettings);
    setClients(initialClients);
    setSites(initialSites);
    setGuards(initialGuards);
    setGuardAssignments(initialGuardAssignments);
    setWeapons(initialWeapons);
    setWeaponAssignments(initialWeaponAssignments);
    setProducts(initialProducts);
    setStockTransactions(initialStockTransactions);
    setGuardIssuedItems(initialGuardIssuedItems);
    setAccounts(initialAccounts);
    setVouchers(initialVouchers);
    setSalarySlips(initialSalarySlips);
    setClientInvoices(initialClientInvoices);
    setAuditLogs(initialAuditLogs);
    setAttendanceRecords(initialAttendanceRecords);
    setFinanceAccounts(initialFinanceAccounts);
    setExpenseCategories(initialExpenseCategories);
    setParties(initialParties);
    setCashTransactions(initialCashTransactions);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    logAudit('Factory Reset', 'Settings', 'RESET', 'Restored all master data to default Mountain Security initial dataset');
  };

  const issueInventoryItem = (params: { productId: string; quantity: number; guardId?: string; guardName?: string; siteId?: string; siteName?: string; notes?: string }) => {
    if (params.guardId) {
      issueItemToGuard(params.guardId, params.productId, params.quantity, params.notes);
    } else {
      const prod = products.find((p) => p.id === params.productId);
      if (prod) {
        addStockTransaction({
          date: new Date().toISOString().split('T')[0],
          type: 'Guard Issue',
          referenceNo: `ISS-${Date.now().toString().slice(-6)}`,
          productId: prod.id,
          productName: prod.productName,
          productCode: prod.productCode,
          quantityIn: 0,
          quantityOut: params.quantity,
          unitPrice: prod.unitPrice,
          totalAmount: prod.unitPrice * params.quantity,
          siteId: params.siteId,
          siteName: params.siteName,
          notes: params.notes,
        });
      }
    }
  };

  const receiveInventoryStock = (params: { productId: string; quantity: number; unitCost?: number; supplierName?: string; notes?: string }) => {
    const prod = products.find((p) => p.id === params.productId);
    if (prod) {
      const cost = params.unitCost || prod.unitPrice;
      addStockTransaction({
        date: new Date().toISOString().split('T')[0],
        type: 'Purchase',
        referenceNo: `PO-${Date.now().toString().slice(-6)}`,
        productId: prod.id,
        productName: prod.productName,
        productCode: prod.productCode,
        quantityIn: params.quantity,
        quantityOut: 0,
        unitPrice: cost,
        totalAmount: cost * params.quantity,
        notes: `${params.notes || 'Purchased stock'} (${params.supplierName || 'Vendor'})`,
      });
    }
  };

  const exportDataJson = (): string => {
    const fullBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      companySettings,
      securitySettings,
      clients,
      sites,
      guards,
      guardAssignments,
      weapons,
      weaponAssignments,
      products,
      stockTransactions,
      guardIssuedItems,
      accounts,
      vouchers,
      salarySlips,
      clientInvoices,
      auditLogs,
      attendanceRecords,
      financeAccounts,
      expenseCategories,
      parties,
      cashTransactions,
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const importDataJson = (jsonString: string): boolean => {
    return importDatabaseJSON(jsonString);
  };

  const resetToInitialData = () => {
    resetToSampleData();
  };

  return (
    <AppContext.Provider
      value={{
        currentUserRole,
        setCurrentUserRole,
        securitySettings,
        updateSecuritySettings,
        updateRolePassword,
        verifyRolePassword,
        isSecurityModalOpen,
        pendingRoleSwitch,
        requestRoleSwitch,
        cancelRoleSwitch,
        confirmRoleSwitch,
        lockSystem,
        unlockSystem,
        companySettings,
        updateCompanySettings,
        clients,
        sites,
        guards,
        guardAssignments,
        weapons,
        weaponAssignments,
        products,
        stockTransactions,
        inventoryTransactions: stockTransactions,
        guardIssuedItems,
        accounts,
        vouchers,
        salarySlips,
        clientInvoices,
        auditLogs,
        attendanceRecords,
        financeAccounts,
        expenseCategories,
        parties,
        cashTransactions,
        addFinanceAccount,
        updateFinanceAccount,
        deleteFinanceAccount,
        addExpenseCategory,
        updateExpenseCategory,
        deleteExpenseCategory,
        addParty,
        updateParty,
        deleteParty,
        addCashTransaction,
        updateCashTransaction,
        deleteCashTransaction,
        duplicateCashTransaction,
        executeAccountTransfer,
        importTransactionsFromCsv,
        getAccountLiveBalance,
        getAllAccountsLiveBalances,
        getDailyReconciliation,
        getPartyLedger,
        isSearchOpen,
        setIsSearchOpen,
        printPayload,
        setPrintPayload,
        triggerPrint,
        isPrintModalOpen: printPayload !== null,
        closePrintModal: () => setPrintPayload(null),
        activePrintJob: printPayload,
        activeTab,
        setActiveTab,
        markAttendance,
        markBulkAttendance,
        updateAttendanceRecord,
        deleteAttendanceRecord,
        getGuardMonthlySummary,
        getAllGuardsMonthlySummaries,
        quickGenerateSalarySlipFromAttendance,
        addClient,
        updateClient,
        deleteClient,
        addSite,
        updateSite,
        deleteSite,
        addGuard,
        updateGuard,
        deleteGuard,
        transferGuard,
        addWeapon,
        updateWeapon,
        deleteWeapon,
        issueWeapon,
        returnWeapon,
        addProduct,
        updateProduct,
        deleteProduct,
        addStockTransaction,
        issueItemToGuard,
        returnItemFromGuard,
        issueInventoryItem,
        receiveInventoryStock,
        addAccount,
        updateAccount,
        createVoucher,
        cancelVoucher,
        deleteVoucher,
        generateSalarySlip,
        updateSalarySlipStatus,
        deleteSalarySlip,
        createClientInvoice,
        receiveInvoicePayment,
        deleteClientInvoice,
        searchGlobal,
        exportDatabaseJSON,
        exportDataJson,
        importDatabaseJSON,
        importDataJson,
        resetToSampleData,
        resetToInitialData,
        logAudit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
