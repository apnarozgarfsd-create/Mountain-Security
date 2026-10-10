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

import { defaultMultiLevelAccounts } from "./multiLevelChartOfAccountsSeed";

export const initialAccounts: Account[] = defaultMultiLevelAccounts;

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
