import type { CreditCustomer } from '../types';

export interface Role {
  label: string;
  scope: string;
  factor: number;
  greet: string;
}

export const ROLES: Role[] = [
  { label: 'Owner', scope: 'Whole company', factor: 1, greet: 'Patrick' },
  { label: 'Manager', scope: 'Operations · all regions', factor: 1, greet: 'Manager' },
];

export const CREDIT: CreditCustomer[] = [
  { id: 1, name: 'Kariakoo Bulk Traders', dist: 'Dar es Salaam', balance: 6200000, due: -3 },
  { id: 2, name: 'Mji Mpya Distributors', dist: 'Dodoma', balance: 3450000, due: 2 },
  { id: 3, name: 'Singida Oil Depot', dist: 'Singida', balance: 4100000, due: -7 },
  { id: 4, name: 'Zawadi Supermarket', dist: 'Dar es Salaam', balance: 980000, due: -1 },
  { id: 5, name: 'Chamwino Agrovet Supplies', dist: 'Dodoma', balance: 1250000, due: 5 },
  { id: 6, name: 'Grace Provisions', dist: 'Singida', balance: 640000, due: 8 },
  { id: 7, name: 'City Mart Kinondoni', dist: 'Dar es Salaam', balance: 1520000, due: -12 },
  { id: 8, name: 'Baraka General Store', dist: 'Dodoma', balance: 500000, due: 4 },
];

export const PRODUCTS = ['Sunflower Oil 20L', 'Sunflower Oil 5L', 'Sunflower Oil 1L', 'Sunflower Oil 500ml', 'Seed Cake 25kg'];

export const PRICE: Record<string, number> = {
  'Sunflower Oil 20L': 78000,
  'Sunflower Oil 5L': 21000,
  'Sunflower Oil 1L': 4600,
  'Sunflower Oil 500ml': 2500,
  'Seed Cake 25kg': 18000,
};

export const CUSTOMERS = [
  'Kariakoo Bulk Traders',
  'Singida Oil Depot',
  'Mji Mpya Distributors',
  'Chamwino Agrovet Supplies',
  'Zawadi Supermarket',
  'City Mart Kinondoni',
];

export const TOP_PRODUCTS: [string, number, boolean, string][] = [
  ['Sunflower Oil 20L', 1900000, true, '+8%'],
  ['Sunflower Oil 5L', 1240000, true, '+3%'],
  ['Sunflower Oil 1L', 860000, false, '-2%'],
  ['Sunflower Oil 500ml', 410000, true, '+5%'],
  ['Seed cake 25kg', 290000, true, '+11%'],
];

export const TOP_DISTRIBUTORS: [string, string, number, boolean, string][] = [
  ['Kariakoo Bulk Traders', 'Dar es Salaam', 2180000, true, '+12%'],
  ['Singida Oil Depot', 'Singida', 1640000, true, '+6%'],
  ['Mji Mpya Distributors', 'Dodoma', 1000000, false, '-4%'],
];

export const AREA_SALES: [string, number][] = [
  ['Dar es Salaam', 1850000],
  ['Singida', 1620000],
  ['Dodoma', 1350000],
];

export const SALES_REPS = [
  { name: 'Juma S.', area: 'Dar es Salaam', pct: '94%', barW: '94%' },
  { name: 'Baraka M.', area: 'Dodoma', pct: '86%', barW: '86%' },
  { name: 'Neema K.', area: 'Singida', pct: '72%', barW: '72%' },
  { name: 'Asha R.', area: 'Dar es Salaam', pct: '61%', barW: '61%' },
];

export const INV_ITEMS = [
  { name: 'Sunflower seeds (raw)', qty: '120,000 kg', tag: 'OK', tagCls: 'tag-neutral' },
  { name: 'Crude oil (tank)', qty: '8,400 L', tag: 'OK', tagCls: 'tag-neutral' },
  { name: 'Oil 20L', qty: '620 units', tag: 'OK', tagCls: 'tag-neutral' },
  { name: 'Oil 5L', qty: '1,450 units', tag: 'OK', tagCls: 'tag-neutral' },
  { name: 'Oil 1L', qty: '3,900 units', tag: 'OK', tagCls: 'tag-neutral' },
  { name: 'Oil 500ml', qty: '5,200 units', tag: 'OK', tagCls: 'tag-neutral' },
  { name: 'Seed cake 25kg', qty: '210 bags', tag: 'OK', tagCls: 'tag-neutral' },
  { name: 'Bottles / packaging', qty: '12,000 units', tag: 'Low', tagCls: 'tag-outline' },
];

export const INV_MOVES = [
  { item: 'Oil 20L', qty: '−80 units', dir: 'Out', dirCls: 'tag-outline', ref: 'Order PA-1042', time: '09:20' },
  { item: 'Crude oil', qty: '+2,100 L', dir: 'In', dirCls: 'tag-neutral', ref: 'Batch B-77', time: '08:05' },
  { item: 'Sunflower seeds', qty: '+15,000 kg', dir: 'In', dirCls: 'tag-neutral', ref: 'PO-231', time: 'Yesterday' },
  { item: 'Oil 5L', qty: '−140 units', dir: 'Out', dirCls: 'tag-outline', ref: 'Order PA-1039', time: 'Yesterday' },
];

export const FIN_REV: [string, string][] = [
  ['Mar', '52%'], ['Apr', '61%'], ['May', '58%'], ['Jun', '72%'], ['Jul', '80%'], ['Aug', '100%'],
];

export const FIN_EXP = [
  { name: 'Seeds & raw materials', amt: 58000000, barW: '100%' },
  { name: 'Labour', amt: 14000000, barW: '24%' },
  { name: 'Packaging', amt: 11500000, barW: '20%' },
  { name: 'Transport', amt: 7800000, barW: '13%' },
  { name: 'Utilities', amt: 3200000, barW: '6%' },
  { name: 'Other', amt: 2400000, barW: '4%' },
];

// Base double-entry journal (before any manual sale entries are prepended).
export const JOURNAL_BASE: [string, string, number, number][] = [
  ['15 Aug', 'Cash', 3150000, 0],
  ['15 Aug', 'Sales revenue', 0, 3150000],
  ['15 Aug', 'Accounts receivable', 1670000, 0],
  ['15 Aug', 'Sales revenue', 0, 1670000],
  ['14 Aug', 'Inventory – seeds', 17250000, 0],
  ['14 Aug', 'Accounts payable', 0, 17250000],
  ['14 Aug', 'Labour expense', 620000, 0],
  ['14 Aug', 'Cash', 0, 620000],
];

export const DIST_TILES = [
  { label: 'Deliveries today', value: '18' },
  { label: 'In transit', value: '5' },
  { label: 'Territories', value: '3' },
  { label: 'Active retailers', value: '62' },
];

export const DIST_LIST = [
  { route: 'Dodoma — Katikati', driver: 'Emmanuel', stops: '7 stops', status: 'Delivered', tag: 'tag-neutral' },
  { route: 'Singida — Ilongero', driver: 'Rashid', stops: '5 stops', status: 'In transit', tag: 'tag-accent' },
  { route: 'Dar — Kinondoni', driver: 'Fatuma', stops: '9 stops', status: 'In transit', tag: 'tag-accent' },
  { route: 'Dar — Buguruni', driver: 'Peter', stops: '6 stops', status: 'Loading', tag: 'tag-outline' },
];

export const PROD_BATCHES = [
  { id: 'B-77', seed: '3,200 kg', oil: '2,100 L', yield: '34%' },
  { id: 'B-76', seed: '3,400 kg', oil: '2,150 L', yield: '33%' },
  { id: 'B-75', seed: '3,000 kg', oil: '1,950 L', yield: '34%' },
];

export const PUR_TILES = [
  { label: 'Suppliers', value: '11' },
  { label: 'Open POs', value: '4' },
  { label: 'Seed price', value: 'TSh 1,150/kg' },
  { label: 'Incoming', value: '32,000 kg' },
];

export const PUR_LIST = [
  { supplier: 'Singida Farmers Coop', item: 'Sunflower seeds', qty: '15,000 kg', price: 'TSh 17.25M', status: 'Received', tag: 'tag-neutral' },
  { supplier: 'Iramba Growers', item: 'Sunflower seeds', qty: '12,000 kg', price: 'TSh 13.8M', status: 'In transit', tag: 'tag-accent' },
  { supplier: 'PackCo Ltd', item: 'Bottles 1L', qty: '20,000 units', price: 'TSh 4.2M', status: 'Ordered', tag: 'tag-outline' },
  { supplier: 'Manyoni Traders', item: 'Sunflower seeds', qty: '5,000 kg', price: 'TSh 5.75M', status: 'Received', tag: 'tag-neutral' },
];

export const RANGE_MULT: Record<string, number> = { Today: 1, 'This week': 6.2, 'This month': 26.5 };

export const TYPE_LABEL: Record<string, string> = {
  company: 'Company', region: 'Territory', distributor: 'Distributor',
  wholesaler: 'Wholesaler', retailer: 'Retailer', order: 'Order',
};

export const CHILD_TYPE_LABEL: Record<string, string> = {
  company: 'Territories', region: 'Distributors', distributor: 'Wholesalers',
  wholesaler: 'Retailers', retailer: 'Orders',
};

export const STATUS_TAG: Record<string, string> = {
  Paid: 'tag-accent', 'On credit': 'tag-neutral', Overdue: 'tag-outline',
};
