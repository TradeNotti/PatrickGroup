export function money(n: number): string {
  return 'TSh ' + Math.round(n).toLocaleString('en-US');
}

export function moneyM(n: number): string {
  n = Math.round(n);
  if (n >= 1e6) return 'TSh ' + (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return 'TSh ' + Math.round(n / 1e3) + 'K';
  return 'TSh ' + n;
}

export function litres(n: number): string {
  return Math.round(n).toLocaleString('en-US') + ' L';
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}
