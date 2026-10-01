import {
  CashTransaction,
  ExpenseCategory,
  FinanceAccount,
  Party,
} from '../types';

export const initialFinanceAccounts: FinanceAccount[] = [];

export const initialExpenseCategories: ExpenseCategory[] = [
  {
    id: 'CAT-OPENING',
    name: 'Opening',
    type: 'INCOME',
    subcategories: [
      { id: 'SUB-OP-1', name: 'Initial Balance', parentCategoryId: 'CAT-OPENING' },
      { id: 'SUB-OP-2', name: 'Capital Inflow', parentCategoryId: 'CAT-OPENING' },
    ],
    color: '#10b981',
  },
  {
    id: 'CAT-BANK-IN',
    name: 'Bank In.',
    type: 'INCOME',
    subcategories: [
      { id: 'SUB-BIN-1', name: 'Client Invoice Payment (Online/Cheque)', parentCategoryId: 'CAT-BANK-IN' },
      { id: 'SUB-BIN-2', name: 'Direct Deposit / Pay Order', parentCategoryId: 'CAT-BANK-IN' },
      { id: 'SUB-BIN-3', name: 'Bank Profit / Return', parentCategoryId: 'CAT-BANK-IN' },
    ],
    color: '#3b82f6',
  },
  {
    id: 'CAT-CASH-IN',
    name: 'Cash In.',
    type: 'INCOME',
    subcategories: [
      { id: 'SUB-CIN-1', name: 'Client Cash Collection', parentCategoryId: 'CAT-CASH-IN' },
      { id: 'SUB-CIN-2', name: 'Guard Uniform Security Deposit', parentCategoryId: 'CAT-CASH-IN' },
      { id: 'SUB-CIN-3', name: 'Form Fee / Registration Received', parentCategoryId: 'CAT-CASH-IN' },
      { id: 'SUB-CIN-4', name: 'Loan / Advance Repayment', parentCategoryId: 'CAT-CASH-IN' },
    ],
    color: '#06b6d4',
  },
  {
    id: 'CAT-SALARY',
    name: 'Salary [Month]',
    type: 'EXPENSE',
    subcategories: [
      { id: 'SUB-SAL-1', name: 'Guard Monthly Wages', parentCategoryId: 'CAT-SALARY' },
      { id: 'SUB-SAL-2', name: 'Supervisor / Field Staff Salary', parentCategoryId: 'CAT-SALARY' },
      { id: 'SUB-SAL-3', name: 'Office Staff & Admin Pay', parentCategoryId: 'CAT-SALARY' },
      { id: 'SUB-SAL-4', name: 'Overtime & Double Duty Bonus', parentCategoryId: 'CAT-SALARY' },
    ],
    color: '#ef4444',
  },
  {
    id: 'CAT-ADVANCE',
    name: 'Adv. [Month]',
    type: 'EXPENSE',
    subcategories: [
      { id: 'SUB-ADV-1', name: 'Guard Salary Advance', parentCategoryId: 'CAT-ADVANCE' },
      { id: 'SUB-ADV-2', name: 'Staff Emergency Advance', parentCategoryId: 'CAT-ADVANCE' },
      { id: 'SUB-ADV-3', name: 'Supervisor Fuel / Travel Advance', parentCategoryId: 'CAT-ADVANCE' },
    ],
    color: '#f97316',
  },
  {
    id: 'CAT-FUEL',
    name: 'Bike Fuel',
    type: 'EXPENSE',
    subcategories: [
      { id: 'SUB-FUEL-1', name: 'Supervisor Inspection Petrol', parentCategoryId: 'CAT-FUEL' },
      { id: 'SUB-FUEL-2', name: 'Night Patrolling Mobile Fuel', parentCategoryId: 'CAT-FUEL' },
      { id: 'SUB-FUEL-3', name: 'Office Messenger Bike Fuel', parentCategoryId: 'CAT-FUEL' },
    ],
    color: '#eab308',
  },
  {
    id: 'CAT-ENTERTAIN',
    name: 'Entertain.',
    type: 'EXPENSE',
    subcategories: [
      { id: 'SUB-ENT-1', name: 'Daily Office Tea & Refreshment', parentCategoryId: 'CAT-ENTERTAIN' },
      { id: 'SUB-ENT-2', name: 'Client Meeting Hospitality & Lunch', parentCategoryId: 'CAT-ENTERTAIN' },
      { id: 'SUB-ENT-3', name: 'Site Visit Refreshment for Guards', parentCategoryId: 'CAT-ENTERTAIN' },
    ],
    color: '#84cc16',
  },
  {
    id: 'CAT-HOME',
    name: 'Home',
    type: 'EXPENSE',
    subcategories: [
      { id: 'SUB-HOME-1', name: 'Household Utility Bills', parentCategoryId: 'CAT-HOME' },
      { id: 'SUB-HOME-2', name: 'Family Grocery & Provisions', parentCategoryId: 'CAT-HOME' },
      { id: 'SUB-HOME-3', name: 'Personal Draw / Family Expense', parentCategoryId: 'CAT-HOME' },
    ],
    color: '#a855f7',
  },
  {
    id: 'CAT-OFFICE',
    name: 'Office',
    type: 'EXPENSE',
    subcategories: [
      { id: 'SUB-OFF-1', name: 'Office Rent & Building Maintenance', parentCategoryId: 'CAT-OFFICE' },
      { id: 'SUB-OFF-2', name: 'Electricity & Internet Bills', parentCategoryId: 'CAT-OFFICE' },
      { id: 'SUB-OFF-3', name: 'Stationery, Register & Printing', parentCategoryId: 'CAT-OFFICE' },
      { id: 'SUB-OFF-4', name: 'Janitorial & Cleaning Supplies', parentCategoryId: 'CAT-OFFICE' },
    ],
    color: '#6366f1',
  },
  {
    id: 'CAT-FRIEGHT',
    name: 'Frieght',
    type: 'EXPENSE',
    subcategories: [
      { id: 'SUB-FR-1', name: 'Uniform & Shoes Cargo Delivery', parentCategoryId: 'CAT-FRIEGHT' },
      { id: 'SUB-FR-2', name: 'Weapon Ammo Freight / Transport', parentCategoryId: 'CAT-FRIEGHT' },
      { id: 'SUB-FR-3', name: 'Courier, TCS & Postal Documents', parentCategoryId: 'CAT-FRIEGHT' },
    ],
    color: '#ec4899',
  },
  {
    id: 'CAT-MEDICAL',
    name: 'Medical.',
    type: 'EXPENSE',
    subcategories: [
      { id: 'SUB-MED-1', name: 'Guard First-Aid Kit & Bandages', parentCategoryId: 'CAT-MEDICAL' },
      { id: 'SUB-MED-2', name: 'Emergency Clinic & Medical Aid', parentCategoryId: 'CAT-MEDICAL' },
      { id: 'SUB-MED-3', name: 'Guard Medical Fitness Certificate', parentCategoryId: 'CAT-MEDICAL' },
    ],
    color: '#14b8a6',
  },
  {
    id: 'CAT-COMMITIE',
    name: 'Commitie',
    type: 'EXPENSE',
    subcategories: [
      { id: 'SUB-COM-1', name: 'Monthly BC / Committee Installment', parentCategoryId: 'CAT-COMMITIE' },
      { id: 'SUB-COM-2', name: 'Savings Fund Contribution', parentCategoryId: 'CAT-COMMITIE' },
    ],
    color: '#8b5cf6',
  },
  {
    id: 'CAT-FORM-FEES',
    name: 'Form Fees',
    type: 'EXPENSE',
    subcategories: [
      { id: 'SUB-FF-1', name: 'Police Clearance Verification Fee', parentCategoryId: 'CAT-FORM-FEES' },
      { id: 'SUB-FF-2', name: 'NADRA CNIC Verification Biometric', parentCategoryId: 'CAT-FORM-FEES' },
      { id: 'SUB-FF-3', name: 'Security Guard Training & Badge Fee', parentCategoryId: 'CAT-FORM-FEES' },
    ],
    color: '#0284c7',
  },
  {
    id: 'CAT-UNIFORM-EQ',
    name: 'Uniform & Equipment',
    type: 'EXPENSE',
    subcategories: [
      { id: 'SUB-UNI-1', name: 'Uniform Fabric, Stitching & Badges', parentCategoryId: 'CAT-UNIFORM-EQ' },
      { id: 'SUB-UNI-2', name: 'DMS Boots, Belts & Lanyards', parentCategoryId: 'CAT-UNIFORM-EQ' },
      { id: 'SUB-UNI-3', name: 'Metal Detector, Torches & Whistles', parentCategoryId: 'CAT-UNIFORM-EQ' },
    ],
    color: '#d97706',
  },
  {
    id: 'CAT-WEAPON-LIC',
    name: 'Legal & Weapon Licenses',
    type: 'EXPENSE',
    subcategories: [
      { id: 'SUB-WEP-1', name: 'Ammunition Cartridges (12-Bore / 9mm)', parentCategoryId: 'CAT-WEAPON-LIC' },
      { id: 'SUB-WEP-2', name: 'Weapon License Renewal Fee', parentCategoryId: 'CAT-WEAPON-LIC' },
      { id: 'SUB-WEP-3', name: 'Gunsmith Service & Gun Oil', parentCategoryId: 'CAT-WEAPON-LIC' },
    ],
    color: '#475569',
  },
  {
    id: 'CAT-TRANSFER',
    name: 'Account Transfer',
    type: 'TRANSFER',
    subcategories: [
      { id: 'SUB-TR-1', name: 'Bank to Cash Withdrawal', parentCategoryId: 'CAT-TRANSFER' },
      { id: 'SUB-TR-2', name: 'Cash to Bank Deposit', parentCategoryId: 'CAT-TRANSFER' },
      { id: 'SUB-TR-3', name: 'Inter-Account Fund Transfer', parentCategoryId: 'CAT-TRANSFER' },
    ],
    color: '#64748b',
  },
];

export const initialParties: Party[] = [];

export const initialCashTransactions: CashTransaction[] = [];
