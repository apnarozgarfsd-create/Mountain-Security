import {
  Account,
  AuditLog,
  Client,
  ClientInvoice,
  CompanySettings,
  FiscalYearOpeningBatch,
  Guard,
  GuardAssignmentHistory,
  GuardAttendanceRecord,
  GuardIssuedItem,
  OpeningBalance,
  OpeningBalanceAudit,
  Product,
  SalarySlip,
  Site,
  StockTransaction,
  Voucher,
  Weapon,
  WeaponAssignmentHistory,
} from "../types";

export const initialCompanySettings: CompanySettings = {
  "companyName": "MOUNTAIN SECURITY SERVICES",
  "subTitle": "PVT ( LTD ).",
  "securityInCharge": "ALI AKBAR",
  "phone1": "0329-9200-111",
  "phone2": "0329-7200-222",
  "officeAddress": "General Bus Stand, Arshad Center, 2nd Floor, Faisalabad.",
  "onlinePaymentAccountName": "Akbar Ali",
  "onlinePaymentAccountNo": "0300 – 786 37 99",
  "onlinePaymentBank": "JazzCash",
  "chiefExecutive": "Muhammad Rafiq Jam",
  "chiefExecutiveTitle": "Colonel ( ART )",
  "tiktokHandle": "Apna Rozgar",
  "facebookHandle": "Punjab Security Services",
  "instagramHandle": "Punjab Security Services"
};

export const initialClients: Client[] = [];
export const initialSites: Site[] = [];
export const initialGuards: Guard[] = [];
export const initialGuardAssignments: GuardAssignmentHistory[] = [];
export const initialWeapons: Weapon[] = [];
export const initialWeaponAssignments: WeaponAssignmentHistory[] = [];
export const initialProducts: Product[] = [];
export const initialStockTransactions: StockTransaction[] = [];
export const initialGuardIssuedItems: GuardIssuedItem[] = [];

export const initialAccounts: Account[] = [
  {
    "id": "ACC-1010",
    "accountCode": "1010",
    "accountName": "Cash in Hand (Office Drawer)",
    "category": "Asset",
    "subcategory": "Current Assets / Cash",
    "openingBalance": 0,
    "openingBalanceType": "Debit",
    "currentBalance": 0,
    "isSystem": true,
    "status": "Active",
    "description": "Main operational cash counter held at Faisalabad Head Office."
  },
  {
    "id": "ACC-1020",
    "accountCode": "1020",
    "accountName": "Meezan Bank Ltd (A/C: 0102-998811)",
    "category": "Asset",
    "subcategory": "Bank Accounts",
    "openingBalance": 0,
    "openingBalanceType": "Debit",
    "currentBalance": 0,
    "isSystem": true,
    "status": "Active",
    "description": "Primary corporate business account."
  },
  {
    "id": "ACC-1025",
    "accountCode": "1025",
    "accountName": "JazzCash Merchant (0300-7863799)",
    "category": "Asset",
    "subcategory": "Digital Wallets",
    "openingBalance": 0,
    "openingBalanceType": "Debit",
    "currentBalance": 0,
    "isSystem": false,
    "status": "Active",
    "description": "Online collection wallet for client retainers and quick payments."
  },
  {
    "id": "ACC-1030",
    "accountCode": "1030",
    "accountName": "Client Accounts Receivable",
    "category": "Asset",
    "subcategory": "Receivables",
    "openingBalance": 0,
    "openingBalanceType": "Debit",
    "currentBalance": 0,
    "isSystem": true,
    "status": "Active",
    "description": "Billed security services fees pending receipt from clients."
  },
  {
    "id": "ACC-1040",
    "accountCode": "1040",
    "accountName": "Inventory & Armoury Asset Stock",
    "category": "Asset",
    "subcategory": "Inventory",
    "openingBalance": 0,
    "openingBalanceType": "Debit",
    "currentBalance": 0,
    "isSystem": true,
    "status": "Active",
    "description": "Cost valuation of uniforms, equipment, weapons, and ammunition in store."
  },
  {
    "id": "ACC-1050",
    "accountCode": "1050",
    "accountName": "Guard Advances / Prepayments",
    "category": "Asset",
    "subcategory": "Staff Receivables",
    "openingBalance": 0,
    "openingBalanceType": "Debit",
    "currentBalance": 0,
    "isSystem": false,
    "status": "Active",
    "description": "Advances given to guards deductible on monthly salary slip."
  },
  {
    "id": "ACC-2010",
    "accountCode": "2010",
    "accountName": "Guard Salaries Payable",
    "category": "Liability",
    "subcategory": "Current Liabilities",
    "openingBalance": 0,
    "openingBalanceType": "Credit",
    "currentBalance": 0,
    "isSystem": true,
    "status": "Active",
    "description": "Accrued net guard wages payable at end of monthly billing cycle."
  },
  {
    "id": "ACC-2020",
    "accountCode": "2020",
    "accountName": "Vendor / Supplier Payables",
    "category": "Liability",
    "subcategory": "Accounts Payable",
    "openingBalance": 0,
    "openingBalanceType": "Credit",
    "currentBalance": 0,
    "isSystem": true,
    "status": "Active",
    "description": "Uniform tailors, ammunition depot, and equipment suppliers."
  },
  {
    "id": "ACC-3010",
    "accountCode": "3010",
    "accountName": "Owner Capital / Retained Earnings",
    "category": "Equity",
    "subcategory": "Equity",
    "openingBalance": 0,
    "openingBalanceType": "Credit",
    "currentBalance": 0,
    "isSystem": true,
    "status": "Active",
    "description": "Initial invested capital of Mountain Security Services Pvt. Ltd."
  },
  {
    "id": "ACC-4010",
    "accountCode": "4010",
    "accountName": "Security Services Invoicing Income",
    "category": "Income",
    "subcategory": "Operating Revenue",
    "openingBalance": 0,
    "currentBalance": 0,
    "isSystem": true,
    "status": "Active",
    "description": "Monthly client security guarding billing fees."
  },
  {
    "id": "ACC-4020",
    "accountCode": "4020",
    "accountName": "Weapon Rent & Escort Services Income",
    "category": "Income",
    "subcategory": "Other Revenue",
    "openingBalance": 0,
    "currentBalance": 0,
    "isSystem": false,
    "status": "Active",
    "description": "Special VIP escort, cash-in-transit, and weapon surcharge revenue."
  },
  {
    "id": "ACC-5010",
    "accountCode": "5010",
    "accountName": "Guard Salaries & Allowances Expense",
    "category": "Expense",
    "subcategory": "Direct Labor",
    "openingBalance": 0,
    "currentBalance": 0,
    "isSystem": true,
    "status": "Active",
    "description": "Wages, overtime, bonuses, and per-day compensation paid to guards."
  },
  {
    "id": "ACC-5020",
    "accountCode": "5020",
    "accountName": "Office Rent & Utilities Expense",
    "category": "Expense",
    "subcategory": "Administrative Expenses",
    "openingBalance": 0,
    "currentBalance": 0,
    "isSystem": false,
    "status": "Active",
    "description": "General Bus Stand Arshad Center office rent, electricity & phone bills."
  },
  {
    "id": "ACC-5030",
    "accountCode": "5030",
    "accountName": "Uniform & Tactical Gear Expense",
    "category": "Expense",
    "subcategory": "Operational Expenses",
    "openingBalance": 0,
    "currentBalance": 0,
    "isSystem": false,
    "status": "Active",
    "description": "Depreciation, damage replacements, and tailors stitching expenses."
  },
  {
    "id": "ACC-5040",
    "accountCode": "5040",
    "accountName": "Vehicle Fuel & Site Inspection Expense",
    "category": "Expense",
    "subcategory": "Field Expenses",
    "openingBalance": 0,
    "currentBalance": 0,
    "isSystem": false,
    "status": "Active",
    "description": "Motorbike and patrolling vehicle fuel for supervisors."
  },
  {
    "id": "ACC-5050",
    "accountCode": "5050",
    "accountName": "Weapon Maintenance & Armoury Supplies",
    "category": "Expense",
    "subcategory": "Maintenance",
    "openingBalance": 0,
    "currentBalance": 0,
    "isSystem": false,
    "status": "Active",
    "description": "Gunsmith servicing, gun oil, and renewal licenses."
  }
];

export const initialVouchers: Voucher[] = [];
export const initialSalarySlips: SalarySlip[] = [];
export const initialClientInvoices: ClientInvoice[] = [];
export const initialAuditLogs: AuditLog[] = [];
export const initialAttendanceRecords: GuardAttendanceRecord[] = [];
export const initialOpeningBatches: FiscalYearOpeningBatch[] = [
  {
    "fiscalYear": "2026-27",
    "startDate": "2026-07-01",
    "endDate": "2027-06-30",
    "status": "Draft"
  },
  {
    "fiscalYear": "2025-26",
    "startDate": "2025-07-01",
    "endDate": "2026-06-30",
    "status": "Draft"
  },
  {
    "fiscalYear": "2027-28",
    "startDate": "2027-07-01",
    "endDate": "2028-06-30",
    "status": "Draft"
  }
];
export const initialOpeningBalances: OpeningBalance[] = [];
export const initialOpeningBalanceAudits: OpeningBalanceAudit[] = [];
