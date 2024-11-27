export function formatCurrency(value: number): string {
  return value.toLocaleString('en-AU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}
