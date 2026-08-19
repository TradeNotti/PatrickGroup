import type { Customer } from '../types';

export interface CreditStatus {
  overdue: boolean;
  days: number; // days overdue if overdue, else days until due
}

const DAY_MS = 86400000;

export function creditStatus(c: Customer): CreditStatus | null {
  if (!c.oldest_at || c.first_terms_days == null) return null;
  const dueAt = new Date(c.oldest_at).getTime() + c.first_terms_days * DAY_MS;
  const diffDays = Math.floor((Date.now() - dueAt) / DAY_MS);
  return diffDays > 0 ? { overdue: true, days: diffDays } : { overdue: false, days: -diffDays };
}
