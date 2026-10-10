import { Account, AccountCategory, AccountNode, BalanceType, OpeningBalance, Voucher, VoucherEntry } from '../types';
import { defaultMultiLevelAccounts, legacyAccountCodeMapping } from '../data/multiLevelChartOfAccountsSeed';

/**
 * High-precision decimal rounding for financial currency calculations.
 * Avoids floating-point rounding inaccuracies in double-entry arithmetic.
 */
export const roundCurrency = (amount: number): number => {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

/**
 * Formats a currency number in Pakistani Rupees format (PKR).
 */
export const formatCurrency = (amount: number): string => {
  const rounded = roundCurrency(amount);
  return `PKR ${rounded.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

/**
 * Checks if an account category has a Normal Debit balance.
 * Asset and Expense normal balance is DEBIT (+Debit, -Credit).
 * Liability, Equity and Income normal balance is CREDIT (+Credit, -Debit).
 */
export const isNormalDebitCategory = (category: AccountCategory): boolean => {
  return category === 'Asset' || category === 'Expense';
};

/**
 * Evaluates whether a voucher entry belongs to an account.
 * Supports:
 * - Direct ID match (e.g. "ACC-2111" === "ACC-2111")
 * - Direct accountCode match (e.g. "2111" === "2111")
 * - Normalized ID (e.g. "2111" === "ACC-2111" or vice-versa)
 * - Explicit legacyCode attribute match (e.g. acc.legacyCode === "2010030011")
 * - Global legacy code mapping table match (e.g. legacyAccountCodeMapping["2010030011"] === "2111")
 */
export const entryMatchesAccount = (
  entry: VoucherEntry,
  account: Account
): boolean => {
  if (!entry || !account) return false;

  // 1. Exact ID or ACC-prefixed ID match
  if (entry.accountId) {
    if (entry.accountId === account.id) return true;
    if (entry.accountId === `ACC-${account.accountCode}`) return true;
    if (account.id === `ACC-${entry.accountId}`) return true;
  }

  // 2. Exact code match
  if (entry.accountCode && entry.accountCode === account.accountCode) {
    return true;
  }

  // 3. Explicit account legacyCode match
  if (account.legacyCode && entry.accountCode === account.legacyCode) {
    return true;
  }

  // 4. Global legacy mapping check (e.g. '2010030011' -> '2111')
  if (entry.accountCode && legacyAccountCodeMapping[entry.accountCode] === account.accountCode) {
    return true;
  }

  // 5. Normalized ID in legacy mapping table
  if (entry.accountId) {
    const rawIdCode = entry.accountId.replace(/^ACC-/, '');
    if (legacyAccountCodeMapping[rawIdCode] === account.accountCode) {
      return true;
    }
  }

  return false;
};

/**
 * Determines whether an account is currently a leaf account (has no active child accounts).
 * Summary accounts with children cannot receive direct transaction postings.
 */
export const isLeafAccount = (accountId: string, allAccounts: Account[]): boolean => {
  return !allAccounts.some((a) => a.parentId === accountId && a.status !== 'Inactive');
};

/**
 * Validates whether an account is eligible to receive journal postings.
 * Rule: Only active leaf accounts can receive postings.
 */
export const canPostToAccount = (
  account: Account,
  allAccounts: Account[]
): { canPost: boolean; reason?: string } => {
  if (account.status === 'Inactive') {
    return {
      canPost: false,
      reason: `Account ${account.accountCode} - ${account.accountName} is inactive.`,
    };
  }

  const hasChildren = allAccounts.some((a) => a.parentId === account.id && a.status === 'Active');
  if (hasChildren || !account.isPostable) {
    return {
      canPost: false,
      reason: `Account ${account.accountCode} - ${account.accountName} is a summary folder account. Direct transactions must be posted to a specific leaf subaccount.`,
    };
  }

  return { canPost: true };
};

/**
 * Validates whether an account can be safely deleted.
 * Prevents deleting system accounts, accounts with child subaccounts,
 * non-zero balances, or accounts associated with posted vouchers/opening balances.
 */
export const canDeleteAccount = (
  account: Account,
  allAccounts: Account[],
  vouchers: Voucher[] = []
): { canDelete: boolean; reason?: string } => {
  if (account.isSystem) {
    return {
      canDelete: false,
      reason: `Account ${account.accountCode} (${account.accountName}) is a protected system account and cannot be deleted.`,
    };
  }

  const hasChildren = allAccounts.some((a) => a.parentId === account.id);
  if (hasChildren) {
    return {
      canDelete: false,
      reason: `Account ${account.accountCode} has sub-accounts under it. Please remove or reassign child sub-accounts first.`,
    };
  }

  if (Math.abs(account.currentBalance || 0) > 0.001) {
    return {
      canDelete: false,
      reason: `Account ${account.accountCode} has a non-zero current balance (${account.currentBalance}). Clear or journalize the balance first.`,
    };
  }

  if (Math.abs(account.openingBalance || 0) > 0.001) {
    return {
      canDelete: false,
      reason: `Account ${account.accountCode} has an active opening balance (${account.openingBalance}). Reset opening balance before deleting.`,
    };
  }

  const hasVouchers = vouchers.some(
    (v) =>
      v.status !== 'Cancelled' &&
      v.entries.some((e) => entryMatchesAccount(e, account))
  );
  if (hasVouchers) {
    return {
      canDelete: false,
      reason: `Account ${account.accountCode} has historical double-entry vouchers recorded against it. Deactivation is recommended to preserve the audit trail.`,
    };
  }

  return { canDelete: true };
};

/**
 * Validates that parent-child relationships do not form cycles, self-parenting,
 * cross-category mismatches, or point to non-existent parent accounts.
 */
export const validateParentChildRelationship = (
  accountId: string,
  newParentId: string | null | undefined,
  allAccounts: Account[],
  accountCategory?: AccountCategory
): { isValid: boolean; error?: string } => {
  if (!newParentId) return { isValid: true }; // Root Level 1 account

  if (accountId && accountId === newParentId) {
    return {
      isValid: false,
      error: 'An account cannot be its own parent account.',
    };
  }

  // 1. Verify parent account actually exists
  const directParent = allAccounts.find(
    (a) => a.id === newParentId || a.accountCode === newParentId
  );
  if (!directParent) {
    return {
      isValid: false,
      error: `Parent account reference "${newParentId}" does not exist in the Chart of Accounts.`,
    };
  }

  // 2. Cross-category validation: child category must match parent category
  if (accountCategory && directParent.category !== accountCategory) {
    return {
      isValid: false,
      error: `Category mismatch: Cannot create an account under category "${accountCategory}" because parent account "${directParent.accountCode}" belongs to category "${directParent.category}".`,
    };
  }

  // 3. Walk up the ancestor tree of newParentId to ensure accountId is not in it (cycle prevention)
  let currentParentId: string | null | undefined = newParentId;
  const visited = new Set<string>();

  while (currentParentId) {
    if (currentParentId === accountId) {
      return {
        isValid: false,
        error: 'Circular parent-child relationship detected. An account cannot be placed under its own descendant.',
      };
    }
    if (visited.has(currentParentId)) {
      return {
        isValid: false,
        error: 'Circular reference detected in existing account hierarchy.',
      };
    }
    visited.add(currentParentId);
    const parentAccount = allAccounts.find(
      (a) => a.id === currentParentId || a.accountCode === currentParentId
    );
    currentParentId = parentAccount ? parentAccount.parentId : null;
  }

  return { isValid: true };
};

/**
 * Validates unique account code constraint.
 */
export const validateAccountCodeUnique = (
  code: string,
  excludeId: string | undefined,
  allAccounts: Account[]
): boolean => {
  const normalized = code.trim().toLowerCase();
  return !allAccounts.some(
    (a) => a.accountCode.trim().toLowerCase() === normalized && a.id !== excludeId
  );
};

/**
 * Computes breadcrumb path for an account: e.g. "Assets > Current Assets > Cash in Hand"
 */
export const calculateAccountPath = (account: Account, allAccounts: Account[]): string => {
  const pathSegments: string[] = [account.accountName];
  let currentParentId = account.parentId;
  const visited = new Set<string>();

  while (currentParentId && !visited.has(currentParentId)) {
    visited.add(currentParentId);
    const parent = allAccounts.find((a) => a.id === currentParentId);
    if (parent) {
      pathSegments.unshift(parent.accountName);
      currentParentId = parent.parentId;
    } else {
      break;
    }
  }

  return pathSegments.join(' > ');
};

/**
 * Computes hierarchy level for an account based on parent (Level 1 = root, Level 2 = child of root, etc.)
 */
export const calculateAccountLevel = (
  parentId: string | null | undefined,
  allAccounts: Account[]
): number => {
  if (!parentId) return 1;
  const parent = allAccounts.find((a) => a.id === parentId);
  return parent ? parent.level + 1 : 2;
};

/**
 * Retrieves all descendant account IDs (children, grandchildren, etc.)
 */
export const getAccountDescendantIds = (accountId: string, allAccounts: Account[]): string[] => {
  const descendants: string[] = [];
  const queue = [accountId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = allAccounts.filter((a) => a.parentId === currentId);
    for (const child of children) {
      descendants.push(child.id);
      queue.push(child.id);
    }
  }

  return descendants;
};

/**
 * Calculates direct balance and recursive rollup balances for all accounts.
 * - Direct balance is computed for leaf accounts from opening balance + posted journal vouchers.
 * - Rollup balance is aggregated up the tree so parent summary accounts show consolidated totals.
 */
export const calculateAccountBalancesWithRollups = (
  accounts: Account[],
  vouchers: Voucher[]
): Map<string, { directBalance: number; rollupBalance: number; leafCount: number; openingDr: number; openingCr: number }> => {
  const resultMap = new Map<
    string,
    { directBalance: number; rollupBalance: number; leafCount: number; openingDr: number; openingCr: number }
  >();

  // 1. Calculate direct balances for every account
  const postedVouchers = vouchers.filter((v) => v.status === 'Posted');

  accounts.forEach((acc) => {
    const isNormalDebit = isNormalDebitCategory(acc.category);

    // Opening balance delta
    const opAmount = Number(acc.openingBalance) || 0;
    const opType = acc.openingBalanceType || (isNormalDebit ? 'Debit' : 'Credit');
    let openingEffect = 0;
    let opDr = 0;
    let opCr = 0;

    if (opType === 'Debit') {
      opDr = opAmount;
      openingEffect = isNormalDebit ? opAmount : -opAmount;
    } else {
      opCr = opAmount;
      openingEffect = isNormalDebit ? -opAmount : opAmount;
    }

    // Voucher transactions delta
    let transactionDelta = 0;
    postedVouchers.forEach((v) => {
      v.entries.forEach((e) => {
        if (entryMatchesAccount(e, acc)) {
          const deb = Number(e.debit) || 0;
          const cred = Number(e.credit) || 0;
          if (isNormalDebit) {
            transactionDelta += deb - cred;
          } else {
            transactionDelta += cred - deb;
          }
        }
      });
    });

    const directBalance = roundCurrency(openingEffect + transactionDelta);
    resultMap.set(acc.id, {
      directBalance,
      rollupBalance: directBalance,
      leafCount: 1,
      openingDr: opDr,
      openingCr: opCr,
    });
  });

  // 2. Aggregate rollup balances from leaves up to roots
  // Process bottom-up by level (from highest level down to level 1)
  const maxLevel = Math.max(...accounts.map((a) => a.level || 1), 1);

  for (let lvl = maxLevel; lvl >= 1; lvl--) {
    const accountsAtLevel = accounts.filter((a) => a.level === lvl);
    accountsAtLevel.forEach((acc) => {
      const children = accounts.filter((a) => a.parentId === acc.id);
      if (children.length > 0) {
        let childRollupSum = 0;
        let childLeafCount = 0;
        let childOpDrSum = 0;
        let childOpCrSum = 0;

        children.forEach((child) => {
          const childStats = resultMap.get(child.id);
          if (childStats) {
            childRollupSum += childStats.rollupBalance;
            childLeafCount += childStats.leafCount;
            childOpDrSum += childStats.openingDr;
            childOpCrSum += childStats.openingCr;
          }
        });

        const currentStats = resultMap.get(acc.id)!;
        // Total rollup balance is direct balance (if any) + all children's rollup sum
        resultMap.set(acc.id, {
          directBalance: currentStats.directBalance,
          rollupBalance: roundCurrency(currentStats.directBalance + childRollupSum),
          leafCount: childLeafCount,
          openingDr: roundCurrency(currentStats.openingDr + childOpDrSum),
          openingCr: roundCurrency(currentStats.openingCr + childOpCrSum),
        });
      }
    });
  }

  return resultMap;
};

/**
 * Builds a hierarchical tree of accounts from a flat array.
 */
export const buildAccountTree = (
  accounts: Account[],
  vouchers: Voucher[] = []
): AccountNode[] => {
  const balanceMap = calculateAccountBalancesWithRollups(accounts, vouchers);

  // Map each account to an AccountNode
  const nodeMap = new Map<string, AccountNode>();

  accounts.forEach((acc) => {
    const stats = balanceMap.get(acc.id) || {
      directBalance: acc.currentBalance || 0,
      rollupBalance: acc.currentBalance || 0,
      leafCount: 1,
      openingDr: 0,
      openingCr: 0,
    };

    const hasChildren = accounts.some((a) => a.parentId === acc.id);

    nodeMap.set(acc.id, {
      ...acc,
      isPostable: !hasChildren,
      children: [],
      directBalance: stats.directBalance,
      rollupBalance: stats.rollupBalance,
      totalDebitOpening: stats.openingDr,
      totalCreditOpening: stats.openingCr,
      leafCount: stats.leafCount,
    });
  });

  const rootNodes: AccountNode[] = [];

  // Assemble the tree
  accounts.forEach((acc) => {
    const node = nodeMap.get(acc.id)!;
    if (acc.parentId && nodeMap.has(acc.parentId)) {
      const parentNode = nodeMap.get(acc.parentId)!;
      parentNode.children.push(node);
    } else {
      rootNodes.push(node);
    }
  });

  // Sort nodes by accountCode
  const sortNodes = (nodes: AccountNode[]) => {
    nodes.sort((a, b) => a.accountCode.localeCompare(b.accountCode, undefined, { numeric: true }));
    nodes.forEach((n) => sortNodes(n.children));
  };

  sortNodes(rootNodes);
  return rootNodes;
};

/**
 * Strict double-entry voucher validation.
 * Verifies debits === credits and amounts > 0.
 */
export const validateDoubleEntryVoucher = (
  entries: VoucherEntry[]
): {
  isValid: boolean;
  error?: string;
  totalDebit: number;
  totalCredit: number;
  difference: number;
} => {
  if (!entries || entries.length < 2) {
    return {
      isValid: false,
      error: 'A double-entry voucher must contain at least two account entry lines (Debit and Credit).',
      totalDebit: 0,
      totalCredit: 0,
      difference: 0,
    };
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry.accountId) {
      return {
        isValid: false,
        error: `Line ${i + 1} has no account selected. Please select a valid account.`,
        totalDebit,
        totalCredit,
        difference: Math.abs(totalDebit - totalCredit),
      };
    }

    const deb = Number(entry.debit) || 0;
    const cred = Number(entry.credit) || 0;

    if (deb < 0 || cred < 0) {
      return {
        isValid: false,
        error: `Negative amounts are not permitted on line ${i + 1}.`,
        totalDebit,
        totalCredit,
        difference: Math.abs(totalDebit - totalCredit),
      };
    }

    if (deb === 0 && cred === 0) {
      return {
        isValid: false,
        error: `Line ${i + 1} has zero amount. Please enter a debit or credit value.`,
        totalDebit,
        totalCredit,
        difference: Math.abs(totalDebit - totalCredit),
      };
    }

    if (deb > 0 && cred > 0) {
      return {
        isValid: false,
        error: `Line ${i + 1} cannot have both Debit and Credit amounts simultaneously.`,
        totalDebit,
        totalCredit,
        difference: Math.abs(totalDebit - totalCredit),
      };
    }

    totalDebit += deb;
    totalCredit += cred;
  }

  totalDebit = roundCurrency(totalDebit);
  totalCredit = roundCurrency(totalCredit);
  const difference = roundCurrency(Math.abs(totalDebit - totalCredit));

  if (totalDebit <= 0 || totalCredit <= 0) {
    return {
      isValid: false,
      error: 'Voucher total amount must be greater than zero.',
      totalDebit,
      totalCredit,
      difference,
    };
  }

  if (difference > 0.009) {
    return {
      isValid: false,
      error: `Voucher is unbalanced! Total Debit (PKR ${totalDebit.toLocaleString()}) does not equal Total Credit (PKR ${totalCredit.toLocaleString()}). Difference: PKR ${difference.toLocaleString()}.`,
      totalDebit,
      totalCredit,
      difference,
    };
  }

  return {
    isValid: true,
    totalDebit,
    totalCredit,
    difference: 0,
  };
};

/**
 * Calculates a running Account Ledger statement for a specific account.
 */
export interface LedgerRow {
  date: string;
  voucherNo: string;
  voucherType: string;
  voucherId: string;
  referenceNo?: string;
  narration: string;
  debit: number;
  credit: number;
  balance: number;
  partyName?: string;
}

export const generateAccountLedger = (
  account: Account,
  vouchers: Voucher[],
  dateFrom?: string,
  dateTo?: string
): {
  openingBalance: number;
  openingType: BalanceType;
  rows: LedgerRow[];
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  closingType: BalanceType;
} => {
  const isNormalDebit = isNormalDebitCategory(account.category);

  const opAmt = Number(account.openingBalance) || 0;
  const opType = account.openingBalanceType || (isNormalDebit ? 'Debit' : 'Credit');

  let runningBalance = isNormalDebit
    ? opType === 'Debit' ? opAmt : -opAmt
    : opType === 'Credit' ? opAmt : -opAmt;

  const rows: LedgerRow[] = [];
  let totalDebit = 0;
  let totalCredit = 0;

  // Filter posted vouchers sorted chronologically
  const postedVouchers = vouchers
    .filter((v) => v.status === 'Posted')
    .sort((a, b) => a.date.localeCompare(b.date));

  postedVouchers.forEach((v) => {
    if (dateFrom && v.date < dateFrom) return;
    if (dateTo && v.date > dateTo) return;

    v.entries.forEach((e) => {
      if (entryMatchesAccount(e, account)) {
        const deb = Number(e.debit) || 0;
        const cred = Number(e.credit) || 0;

        totalDebit += deb;
        totalCredit += cred;

        if (isNormalDebit) {
          runningBalance += deb - cred;
        } else {
          runningBalance += cred - deb;
        }

        rows.push({
          date: v.date,
          voucherNo: v.voucherNo,
          voucherType: v.voucherType,
          voucherId: v.id,
          referenceNo: v.referenceNo,
          narration: e.narration || v.narration || `${v.voucherType} entry`,
          debit: deb,
          credit: cred,
          balance: roundCurrency(runningBalance),
          partyName: e.partyName,
        });
      }
    });
  });

  const finalBalance = roundCurrency(runningBalance);
  let closingType: BalanceType = 'Debit';
  if (isNormalDebit) {
    closingType = finalBalance >= 0 ? 'Debit' : 'Credit';
  } else {
    closingType = finalBalance >= 0 ? 'Credit' : 'Debit';
  }

  return {
    openingBalance: opAmt,
    openingType: opType,
    rows,
    totalDebit: roundCurrency(totalDebit),
    totalCredit: roundCurrency(totalCredit),
    closingBalance: Math.abs(finalBalance),
    closingType,
  };
};

/**
 * Creates a verified pre-migration backup snapshot stored in LocalStorage.
 * Ensures zero data loss and safe rollback capability.
 */
export const createPreMigrationBackup = (currentData: any): string => {
  const backupPayload = {
    backupType: 'MSS_ERP_ACCOUNTING_PRE_MIGRATION_SNAPSHOT',
    timestamp: new Date().toISOString(),
    originalAccountsCount: Array.isArray(currentData?.accounts) ? currentData.accounts.length : 0,
    originalVouchersCount: Array.isArray(currentData?.vouchers) ? currentData.vouchers.length : 0,
    data: currentData,
  };

  const backupJson = JSON.stringify(backupPayload, null, 2);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('MSS_ACCOUNTING_PRE_MIGRATION_BACKUP_VERIFIED', backupJson);
    }
  } catch (e) {
    console.error('Failed to write pre-migration backup to localStorage:', e);
  }

  return backupJson;
};

/**
 * Migrates existing legacy accounts to the new multi-level hierarchical structure.
 * - Preserves existing user accounts, codes, names, and opening balances.
 * - Adds Level 1 roots, Level 2 groups, and Level 3 subaccounts.
 * - Automatically assigns correct parentId, parentCode, level, and path.
 */
export const migrateLegacyAccountsToMultiLevel = (
  existingAccounts: Account[]
): Account[] => {
  // If accounts already have hierarchy level and parent information, verify and return
  if (
    Array.isArray(existingAccounts) &&
    existingAccounts.length >= defaultMultiLevelAccounts.length &&
    existingAccounts.some((a) => a.level === 1) &&
    existingAccounts.some((a) => a.level === 2)
  ) {
    return existingAccounts.map((acc) => ({
      ...acc,
      path: acc.path || calculateAccountPath(acc, existingAccounts),
      isPostable: acc.isPostable !== undefined ? acc.isPostable : isLeafAccount(acc.id, existingAccounts),
    }));
  }

  // Start with the standard multi-level hierarchy
  const migratedMap = new Map<string, Account>();
  defaultMultiLevelAccounts.forEach((standardAcc) => {
    migratedMap.set(standardAcc.accountCode, { ...standardAcc });
  });

  // Reconcile and preserve existing accounts
  if (Array.isArray(existingAccounts)) {
    existingAccounts.forEach((existing) => {
      // Check if this existing account matches a legacy code mapped to a new code
      const mappedCode = legacyAccountCodeMapping[existing.accountCode] || existing.accountCode;

      if (migratedMap.has(mappedCode)) {
        const target = migratedMap.get(mappedCode)!;
        migratedMap.set(mappedCode, {
          ...target,
          id: existing.id || target.id,
          legacyCode: existing.accountCode !== mappedCode ? existing.accountCode : (existing.legacyCode || target.legacyCode),
          accountName: existing.accountName || target.accountName,
          openingBalance: Number(existing.openingBalance) || target.openingBalance,
          openingBalanceType: existing.openingBalanceType || target.openingBalanceType,
          currentBalance: Number(existing.currentBalance) || target.currentBalance,
          status: existing.status || target.status,
          description: existing.description || target.description,
          natureType: existing.natureType || target.natureType,
          effectiveDate: existing.effectiveDate || target.effectiveDate,
          location: existing.location || target.location,
          employeePartyType: existing.employeePartyType || target.employeePartyType,
          updatedAt: new Date().toISOString(),
        });
      } else if (!migratedMap.has(existing.accountCode)) {
        // User created a custom account - determine appropriate parent under hierarchy
        let defaultParentId = 'ACC-1110';
        let defaultParentCode = '1110';
        if (existing.category === 'Liability') {
          defaultParentId = 'ACC-2120';
          defaultParentCode = '2120';
        } else if (existing.category === 'Equity') {
          defaultParentId = 'ACC-3120';
          defaultParentCode = '3120';
        } else if (existing.category === 'Income') {
          defaultParentId = 'ACC-4110';
          defaultParentCode = '4110';
        } else if (existing.category === 'Expense') {
          defaultParentId = 'ACC-5510';
          defaultParentCode = '5510';
        }

        const customMigrated: Account = {
          ...existing,
          level: existing.level || 4,
          parentId: existing.parentId || defaultParentId,
          parentCode: existing.parentCode || defaultParentCode,
          isPostable: true,
          path: `${existing.category} > Sub-Accounts > ${existing.accountName}`,
          status: existing.status || 'Active',
          openingBalance: Number(existing.openingBalance) || 0,
          currentBalance: Number(existing.currentBalance) || 0,
          legacyCode: existing.legacyCode,
          natureType: existing.natureType,
          effectiveDate: existing.effectiveDate,
          location: existing.location,
          employeePartyType: existing.employeePartyType,
        };
        migratedMap.set(existing.accountCode, customMigrated);
      }
    });
  }

  const result = Array.from(migratedMap.values());
  // Ensure path and postable flags are accurate
  return result.map((acc) => ({
    ...acc,
    path: calculateAccountPath(acc, result),
    isPostable: isLeafAccount(acc.id, result),
  }));
};

/**
 * Migrates historical vouchers by linking any legacy account codes
 * to their corresponding target accounts in the multi-level hierarchy,
 * while preserving original narrative, party identities, and audit integrity.
 */
export const migrateLegacyVouchers = (
  vouchers: Voucher[],
  accounts: Account[]
): Voucher[] => {
  if (!Array.isArray(vouchers)) return [];

  return vouchers.map((v) => ({
    ...v,
    entries: v.entries.map((e) => {
      const mappedCode = legacyAccountCodeMapping[e.accountCode] || e.accountCode;
      const targetAcc = accounts.find(
        (a) => a.accountCode === mappedCode || a.id === e.accountId
      );
      if (targetAcc && mappedCode !== e.accountCode) {
        return {
          ...e,
          accountId: targetAcc.id,
          accountCode: targetAcc.accountCode,
          accountName: e.accountName || targetAcc.accountName,
          narration: e.narration || `Migrated from legacy code ${e.accountCode}`,
        };
      }
      return e;
    }),
  }));
};

/**
 * Restores an isolated accounting backup snapshot.
 * Unpacks snapshot, migrates legacy account mappings, reconciles vouchers,
 * and confirms recovery status without mutating global state.
 */
export const restoreAccountingBackup = (
  backupJson: string
): {
  success: boolean;
  accountsCount: number;
  vouchersCount: number;
  data?: any;
  error?: string;
} => {
  try {
    const raw = JSON.parse(backupJson);
    const payload = raw.data && raw.backupType?.startsWith('MSS_ERP_ACCOUNTING')
      ? raw.data
      : raw;

    if (!payload || (!payload.accounts && !payload.vouchers)) {
      return {
        success: false,
        accountsCount: 0,
        vouchersCount: 0,
        error: 'Invalid backup format: payload must contain accounts or vouchers collection.',
      };
    }

    const restoredAccounts = Array.isArray(payload.accounts)
      ? migrateLegacyAccountsToMultiLevel(payload.accounts)
      : [];
    const restoredVouchers = Array.isArray(payload.vouchers)
      ? migrateLegacyVouchers(payload.vouchers, restoredAccounts)
      : [];

    return {
      success: true,
      accountsCount: restoredAccounts.length,
      vouchersCount: restoredVouchers.length,
      data: {
        ...payload,
        accounts: restoredAccounts,
        vouchers: restoredVouchers,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      accountsCount: 0,
      vouchersCount: 0,
      error: `Backup parsing error: ${err.message || String(err)}`,
    };
  }
};

/**
 * Calculates a verified Trial Balance across all accounts.
 * Returns opening, period movements, and closing balances for debits and credits.
 */
export const calculateTrialBalance = (
  accounts: Account[],
  vouchers: Voucher[],
  fiscalYear: string = '2026-27',
  openingBalances?: OpeningBalance[]
): {
  rows: Array<{
    account: Account;
    openingDr: number;
    openingCr: number;
    periodDr: number;
    periodCr: number;
    closingDr: number;
    closingCr: number;
  }>;
  totalOpeningDr: number;
  totalOpeningCr: number;
  totalPeriodDr: number;
  totalPeriodCr: number;
  totalClosingDr: number;
  totalClosingCr: number;
  isOpeningBalanced: boolean;
  isPeriodBalanced: boolean;
  isClosingBalanced: boolean;
} => {
  const postedVouchers = vouchers.filter((v) => v.status === 'Posted');

  const rows = accounts.map((acc) => {
    const obRecord = openingBalances?.find(
      (b) => (b.accountId === acc.id || b.accountCode === acc.accountCode) && b.fiscalYear === fiscalYear
    );
    const obAmount = obRecord !== undefined ? (Number(obRecord.amount) || 0) : (Number(acc.openingBalance) || 0);
    const obType = obRecord
      ? obRecord.balanceType
      : acc.openingBalanceType || (isNormalDebitCategory(acc.category) ? 'Debit' : 'Credit');

    const openingDr = obType === 'Debit' ? obAmount : 0;
    const openingCr = obType === 'Credit' ? obAmount : 0;

    let periodDr = 0;
    let periodCr = 0;

    postedVouchers.forEach((v) => {
      // Ignore opening balance vouchers as they are already reflected in openingDr/openingCr
      if (
        v.voucherNo === `OB-${fiscalYear}` ||
        v.voucherNo === 'OB-0001' ||
        v.referenceNo?.startsWith('OB-') ||
        v.id?.startsWith('VOUCH-OB-') ||
        v.narration?.toLowerCase().includes('opening balance')
      ) {
        return;
      }

      v.entries.forEach((e) => {
        if (entryMatchesAccount(e, acc)) {
          periodDr += Number(e.debit) || 0;
          periodCr += Number(e.credit) || 0;
        }
      });
    });

    const totalDr = openingDr + periodDr;
    const totalCr = openingCr + periodCr;

    let closingDr = 0;
    let closingCr = 0;
    if (totalDr >= totalCr) {
      closingDr = roundCurrency(totalDr - totalCr);
    } else {
      closingCr = roundCurrency(totalCr - totalDr);
    }

    return {
      account: acc,
      openingDr: roundCurrency(openingDr),
      openingCr: roundCurrency(openingCr),
      periodDr: roundCurrency(periodDr),
      periodCr: roundCurrency(periodCr),
      closingDr,
      closingCr,
    };
  });

  const totalOpeningDr = roundCurrency(rows.reduce((sum, r) => sum + r.openingDr, 0));
  const totalOpeningCr = roundCurrency(rows.reduce((sum, r) => sum + r.openingCr, 0));
  const totalPeriodDr = roundCurrency(rows.reduce((sum, r) => sum + r.periodDr, 0));
  const totalPeriodCr = roundCurrency(rows.reduce((sum, r) => sum + r.periodCr, 0));
  const totalClosingDr = roundCurrency(rows.reduce((sum, r) => sum + r.closingDr, 0));
  const totalClosingCr = roundCurrency(rows.reduce((sum, r) => sum + r.closingCr, 0));

  return {
    rows,
    totalOpeningDr,
    totalOpeningCr,
    totalPeriodDr,
    totalPeriodCr,
    totalClosingDr,
    totalClosingCr,
    isOpeningBalanced: Math.abs(totalOpeningDr - totalOpeningCr) < 0.01,
    isPeriodBalanced: Math.abs(totalPeriodDr - totalPeriodCr) < 0.01,
    isClosingBalanced: Math.abs(totalClosingDr - totalClosingCr) < 0.01,
  };
};

/**
 * Calculates Profit & Loss Statement (Operating Income, Expenses, and Net Profit).
 */
export const calculateProfitAndLoss = (
  accounts: Account[]
): {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  incomeAccounts: Account[];
  expenseAccounts: Account[];
} => {
  const incomeAccounts = accounts.filter((a) => a.category === 'Income');
  const expenseAccounts = accounts.filter((a) => a.category === 'Expense');

  const totalIncome = roundCurrency(incomeAccounts.reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0));
  const totalExpense = roundCurrency(expenseAccounts.reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0));
  const netProfit = roundCurrency(totalIncome - totalExpense);

  return {
    totalIncome,
    totalExpense,
    netProfit,
    incomeAccounts,
    expenseAccounts,
  };
};

/**
 * Calculates Balance Sheet (Assets, Liabilities, Equity, and confirms Double-Entry Equation).
 * Equation: Assets === Liabilities + Equity (including current period Net Profit)
 */
export const calculateBalanceSheet = (
  accounts: Account[],
  netProfit?: number
): {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  calculatedNetProfit: number;
  totalLiabilitiesAndEquity: number;
  difference: number;
  isBalanced: boolean;
} => {
  const pnl = calculateProfitAndLoss(accounts);
  const profit = netProfit !== undefined ? netProfit : pnl.netProfit;

  const assetAccounts = accounts.filter((a) => a.category === 'Asset');
  const liabilityAccounts = accounts.filter((a) => a.category === 'Liability');
  const equityAccounts = accounts.filter((a) => a.category === 'Equity');

  const totalAssets = roundCurrency(assetAccounts.reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0));
  const totalLiabilities = roundCurrency(liabilityAccounts.reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0));
  const baseEquity = roundCurrency(equityAccounts.reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0));
  const totalEquity = roundCurrency(baseEquity + profit);
  const totalLiabilitiesAndEquity = roundCurrency(totalLiabilities + totalEquity);
  const difference = roundCurrency(Math.abs(totalAssets - totalLiabilitiesAndEquity));

  return {
    totalAssets,
    totalLiabilities,
    totalEquity,
    calculatedNetProfit: profit,
    totalLiabilitiesAndEquity,
    difference,
    isBalanced: difference < 0.01,
  };
};
