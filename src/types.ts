export type Tab = 'home' | 'credit' | 'more';
export type ModuleKey = 'sales' | 'inventory' | 'distribution' | 'production' | 'purchasing' | 'finance';
export type Range = 'today' | 'week' | 'month';
export type PayMethod = 'Cash' | 'Credit';

export interface Customer {
  id: number;
  name: string;
  balance: number;
  oldest_at: string | null;
  first_terms_days: number | null;
}

export interface SaleItemInput {
  product: string;
  qty: number;
  price: number;
}

export interface SaleOrder {
  id: number;
  customer: string;
  distributor: string | null;
  pay: PayMethod;
  terms: number;
  total: number;
  created_at: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  qty: number;
  unit: string;
}

export interface InventoryMovement {
  id: number;
  item_name: string;
  direction: 'In' | 'Out';
  qty: number;
  reference: string | null;
  created_at: string;
}

export interface Delivery {
  id: number;
  distributor_id: number | null;
  route: string;
  driver: string;
  status: string;
  created_at: string;
}

export interface Distributor {
  id: number;
  name: string;
  territory: string | null;
  phone: string | null;
  created_at: string;
  delivery_count: number;
  /** Backs the distributor's private link on the Distributor Rankings
   *  companion site. Null until that site's migration backfills it. */
  access_token: string | null;
}

export interface ProductionBatch {
  id: number;
  batch_code: string;
  seed_kg: number;
  oil_l: number;
  created_at: string;
}

export interface Purchase {
  id: number;
  supplier: string;
  item: string;
  qty: number;
  price: number;
  status: string;
  created_at: string;
}

export interface LedgerEntry {
  id: number;
  entry_date: string;
  account: string;
  debit: number;
  credit: number;
  memo: string | null;
}

export interface DashboardData {
  sales: number;
  orders: number;
  collections: number;
  outstandingCredit: number;
  stockLitres: number;
  productionLitres: number;
  oilMargin: number;
  cashPosition: number;
  topProducts: { product: string; value: number }[];
  topDistributors: { distributor: string; value: number }[];
  overdue: { name: string; amount: number; days: number }[];
}

export interface FinanceSummary {
  revenue: number;
  expenses: number;
  receivables: number;
  cashPosition: number;
  grossMarginPct: number;
  netProfit: number;
  monthlyRevenue: { m: string; revenue: number }[];
}
