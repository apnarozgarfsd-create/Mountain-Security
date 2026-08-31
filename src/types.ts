export type UserRole = 'Super Admin' | 'Accountant' | 'HR Manager' | 'Armoury Officer' | 'Site Supervisor' | 'Viewer';

export type GuardDesignation = 'Security Guard' | 'Armed Guard' | 'Lady Guard' | 'Site Supervisor' | 'Head Guard' | 'Gunman';
export type GuardStatus = 'Active' | 'On Leave' | 'Suspended' | 'Terminated';
export type WeaponCategory = 'Shotguns' | 'Pistols' | 'Rifles' | 'Automatic' | 'Ammunition' | 'Accessories' | 'Other';
export type WeaponCondition = 'New' | 'Good' | 'Fair' | 'Under Repair' | 'Damaged';

export interface CompanySettings {
  companyName: string;
  name?: string; // compatibility alias
  subTitle: string;
  securityInCharge: string;
  phone1: string;
  phone2: string;
  phone?: string; // alias
  email?: string;
  officeAddress: string;
  address?: string; // alias
  registrationNumber?: string;
  taxNumber?: string;
  bankDetails?: string;
  onlinePaymentAccountName: string;
  onlinePaymentAccountNo: string;
  onlinePaymentBank: string;
  chiefExecutive: string;
  chiefExecutiveTitle: string;
  tiktokHandle: string;
  facebookHandle: string;
  instagramHandle: string;
}

export interface Client {
  id: string;
  clientCode: string;
  clientName: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  cnicOrRegNo?: string;
  contractStartDate: string;
  contractEndDate: string;
  billingMethod: 'Per Guard Monthly' | 'Fixed Lump Sum' | 'Shift Based';
  monthlyBillingAmount: number;
  ratePerGuard: number;
  paymentTerms: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  currentBalance?: number;
  notes?: string;
  createdAt: string;
}

export interface Site {
  id: string;
  siteCode: string;
  clientId: string;
  clientName?: string;
  siteName: string;
  location: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  requiredGuards: number;
  shiftDetails: '12 Hours (2 Shifts)' | '8 Hours (3 Shifts)' | '24 Hours Standby' | 'Day Shift Only';
  siteSupervisor: string;
  status: 'Active' | 'Inactive' | 'Closed';
  monthlyRate: number;
  notes?: string;
  createdAt: string;
}

export interface Guard {
  id: string;
  guardCode: string; // e.g. G-1001
  name: string;
  fatherName: string;
  cnic: string;
  phone: string;
  address: string;
  joiningDate: string;
  designation: 'Security Guard' | 'Armed Guard' | 'Lady Guard' | 'Site Supervisor' | 'Head Guard' | 'Gunman';
  basicSalary: number;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Terminated';
  bloodGroup?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notes?: string;
  photoUrl?: string;
  currentSiteId?: string;
  currentSiteName?: string;
  currentWeaponId?: string;
}

export type AttendanceStatus = 'Full Day' | 'Double Duty' | 'Half Day' | 'Absent' | 'Leave' | 'Short Duty';
export type AttendanceShift = 'Day Shift (12h)' | 'Night Shift (12h)' | '24 Hours Double' | 'General Shift (8h)' | 'Morning Shift (8h)' | 'Evening Shift (8h)';

export interface GuardAttendanceRecord {
  id: string;
  guardId: string;
  guardName: string;
  guardCode: string;
  siteId: string;
  siteName: string;
  clientId?: string;
  clientName?: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  dutyUnits: number; // 1.0 for Full Day, 2.0 for Double Duty, 0.5 for Half Day, 0 for Absent/Leave
  overtimeHours: number; // e.g. 2, 4, 6
  shift: AttendanceShift;
  checkInTime?: string;
  checkOutTime?: string;
  markedBy?: string;
  remarks?: string;
  createdAt: string;
}

export interface AttendanceMonthlySummary {
  guardId: string;
  guardName: string;
  guardCode: string;
  siteName: string;
  monthYear: string; // YYYY-MM
  fullDays: number;
  doubleDuties: number;
  halfDays: number;
  absentDays: number;
  leaveDays: number;
  totalDutyUnits: number; // e.g. 30 full + 15 double = 60 duty days
  totalOvertimeHours: number;
  basicSalary: number;
  perDayRate: number;
  earnedSalary: number;
  overtimeAmount: number;
}

export interface GuardAssignmentHistory {
  id: string;
  guardId: string;
  guardName: string;
  guardCode: string;
  siteId: string;
  siteName: string;
  clientName: string;
  startDate: string;
  endDate?: string;
  shift: string;
  status: 'Active' | 'Transferred' | 'Relieved';
  remarks?: string;
  assignedBy: string;
  assignedAt: string;
}

export type WeaponStatus = 'Available' | 'Issued' | 'Under Maintenance' | 'Lost/Missing' | 'Retired' | 'Transferred';

export interface Weapon {
  id: string;
  weaponCode: string; // e.g. W-001
  weaponType: '12-Bore Shotgun' | '9mm Pistol' | '30-Bore Pistol' | 'Semi-Automatic Rifle' | 'Repeater' | 'MP5 Clone' | 'Other';
  makeModel: string;
  serialNumber: string;
  category: 'Shotguns' | 'Pistols' | 'Rifles' | 'Automatic' | 'Other';
  purchaseDate: string;
  purchaseCost: number;
  condition: 'New' | 'Good' | 'Fair' | 'Under Repair' | 'Damaged';
  currentStatus: WeaponStatus;
  armouryLocation: string;
  notes?: string;
  currentGuardId?: string;
  currentGuardName?: string;
  currentSiteId?: string;
  currentSiteName?: string;
}

export interface WeaponAssignmentHistory {
  id: string;
  weaponId: string;
  weaponCode: string;
  weaponType: string;
  serialNumber: string;
  guardId: string;
  guardName: string;
  guardCode?: string;
  siteId: string;
  siteName: string;
  issueDate: string;
  issuedDate?: string; // alias
  returnDate?: string;
  returnedDate?: string; // alias
  actionType?: 'Issue' | 'Return';
  status: 'Active' | 'Returned';
  issuedBy: string;
  conditionOnIssue?: string;
  conditionOnReturn?: string;
  returnCondition?: string; // alias
  notes?: string;
}

export type ProductCategory = 'Uniform' | 'Uniforms' | 'Equipment' | 'Ammunition' | 'Protective Gear' | 'Footwear' | 'Headwear' | 'Tactical Gear' | 'Communication' | 'Stationery' | 'Other';

export interface Product {
  id: string;
  productCode: string; // e.g. PRD-001
  sku?: string; // alias
  productName: string;
  name?: string; // alias
  category: ProductCategory;
  subcategory?: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  minStockLevel?: number; // alias
  reorderLevel: number;
  unitPrice: number;
  costPrice?: number; // alias
  sellingPrice?: number; // alias
  location?: string;
  description?: string;
  status: 'Active' | 'Inactive';
}

export type ProductItem = Product;

export type StockTransactionType = 'Purchase' | 'Guard Issue' | 'Guard Return' | 'Adjustment' | 'Damaged/Loss';

export interface StockTransaction {
  id: string;
  date: string;
  type: StockTransactionType;
  referenceNo: string;
  productId: string;
  productName: string;
  productCode: string;
  quantityIn: number;
  quantityOut: number;
  balanceAfter: number;
  unitPrice: number;
  totalAmount: number;
  guardId?: string;
  guardName?: string;
  siteId?: string;
  siteName?: string;
  notes?: string;
  performedBy: string;
}

export interface GuardIssuedItem {
  id: string;
  guardId: string;
  guardName: string;
  productId: string;
  productName: string;
  quantity: number;
  issueDate: string;
  returnDate?: string;
  status: 'Issued' | 'Returned' | 'Lost/Damaged';
  conditionOnIssue: string;
  conditionOnReturn?: string;
  issuedBy: string;
  notes?: string;
}

export type AccountCategory = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';

export interface Account {
  id: string;
  accountCode: string; // e.g. 1010, 1020, 4010, 5010
  accountName: string;
  category: AccountCategory;
  subcategory: string;
  openingBalance: number;
  currentBalance: number;
  isSystem: boolean;
  status: 'Active' | 'Inactive';
  description?: string;
}

export type VoucherType = 'General' | 'Receipt' | 'Payment' | 'Journal' | 'Contra';

export interface VoucherEntry {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  narration?: string;
  partyType?: 'Client' | 'Guard' | 'Vendor' | 'Other';
  partyId?: string;
  partyName?: string;
}

export interface Voucher {
  id: string;
  voucherNo: string; // e.g. GV-2026-0001, RV-001, PV-001
  date: string;
  voucherType: VoucherType;
  referenceNo?: string;
  narration: string;
  entries: VoucherEntry[];
  totalDebit: number;
  totalCredit: number;
  createdBy: string;
  status: 'Posted' | 'Cancelled';
  cancelledReason?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface SalarySlip {
  id: string;
  slipNo: string; // e.g. MSS/07/2026/0002 or MSS/06/2026/0007
  monthYear: string; // "2026-07"
  monthName: string; // "July 2026"
  issueDate: string; // "05 August , 2026"
  salaryPeriod: string; // "01 – 31 July , 2026"
  
  // Guard & Customer Info
  guardId: string;
  guardName: string;
  guardCnic: string;
  guardContact: string;
  siteId: string;
  siteName: string;
  customerName: string;
  customerLocation: string;
  customerContact: string;

  // Calculation Breakdown
  basicSalary: number;
  annualSalaryIncrement: number;
  perDaySalary: number;
  attendanceDays: number;
  earnedSalary: number;
  eidBonusDays: number;
  eidBonusAmount: number;
  advances: number;
  deductions: number;
  weaponCharges: number;
  securityGuardCompanyShare: number;
  
  // Final
  netSalary: number;
  amountInWords: string;
  notes?: string;
  status: 'Paid' | 'Pending' | 'Draft';
  createdAt: string;
}

export interface ClientInvoice {
  id: string;
  invoiceNo: string;
  clientId: string;
  clientName: string;
  siteId: string;
  siteName: string;
  billingMonth: string; // "July 2026"
  issueDate: string;
  dueDate: string;
  guardsDeployed: number;
  ratePerGuard: number;
  additionalCharges: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  entity?: string; // alias
  recordReference: string;
  details: string;
}

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Guard' | 'Weapon' | 'Client' | 'Site' | 'Voucher' | 'Product' | 'Salary Slip';
  code: string;
  status?: string;
  targetTab: string;
  targetId: string;
}
