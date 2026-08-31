/**
 * Number to words conversion customized for PKR currency format
 * as seen on Mountain Security Services official salary slips
 */
export function numberToWordsPKR(num: number): string {
  if (num === 0) return 'Rupees Zero Only.';
  if (isNaN(num)) return '';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    const digit = n % 10;
    if (n < 100) return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
    if (n < 1000) {
      return (
        a[Math.floor(n / 100)] +
        ' Hundred' +
        (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '')
      );
    }
    if (n < 100000) {
      return (
        inWords(Math.floor(n / 1000)) +
        ' thousands' +
        (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '')
      );
    }
    if (n < 10000000) {
      return (
        inWords(Math.floor(n / 100000)) +
        ' Lakh' +
        (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '')
      );
    }
    return (
      inWords(Math.floor(n / 10000000)) +
      ' Crore' +
      (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '')
    );
  }

  const rounded = Math.round(num);
  return `Rupees ${inWords(rounded)} Only.`;
}

export function formatCurrency(amount: number, prefix: string = 'PKR '): string {
  if (isNaN(amount) || amount === undefined || amount === null) return `${prefix}0`;
  const formatted = Math.abs(amount).toLocaleString('en-PK', {
    maximumFractionDigits: 0,
  });
  return amount < 0 ? `(${prefix}${formatted})` : `${prefix}${formatted}`;
}

export const formatPKR = (amount: number): string => formatCurrency(amount, 'PKR ');

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatMonthName(monthYear: string): string {
  if (!monthYear) return '';
  const [year, month] = monthYear.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
