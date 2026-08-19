export type NodeType = 'company' | 'region' | 'distributor' | 'wholesaler' | 'retailer' | 'order';

export interface OrderItem {
  name: string;
  qty: number;
  unit: number;
  total: number;
}

export interface OrderNode {
  type: 'order';
  name: string;
  status: string;
  date: string;
  items: OrderItem[];
  value: number;
  sub: string;
}

export interface BranchNode {
  type: Exclude<NodeType, 'order'>;
  name: string;
  value: number;
  sub: string;
  children: TreeNode[];
}

export type TreeNode = OrderNode | BranchNode;

export type Tab = 'home' | 'explore' | 'credit' | 'more';

export type ModuleKey = 'sales' | 'inventory' | 'distribution' | 'production' | 'purchasing' | 'finance';

export type PayMethod = 'Cash' | 'Credit';

export interface SaleForm {
  product: string;
  qty: string;
  price: string;
  customer: string;
  pay: PayMethod;
  terms: string;
}

export interface SaleEntry {
  product: string;
  qty: number;
  price: number;
  total: number;
  pay: PayMethod;
  terms: number;
  customer: string;
  date: string;
}

export interface InvRecord { item: string; qty: string; dir: 'In' | 'Out'; }
export interface DistRecord { route: string; driver: string; status: string; }
export interface ProdRecord { id: string; seed: string; oil: string; }
export interface PurRecord { supplier: string; item: string; qty: string; price: string; }

export interface ManualRecords {
  inv: InvRecord;
  dist: DistRecord;
  prod: ProdRecord;
  pur: PurRecord;
}

export interface ManualLists {
  inv: InvRecord[];
  dist: DistRecord[];
  prod: ProdRecord[];
  pur: PurRecord[];
}

export interface CreditCustomer {
  id: number;
  name: string;
  dist: string;
  balance: number;
  due: number;
}

export interface PaymentDialog {
  id: number;
  name: string;
  amount: string;
}

export interface AppState {
  tab: Tab;
  dark: boolean;
  range: string;
  path: TreeNode[];
  module: ModuleKey | null;
  dialog: PaymentDialog | null;
  paidIds: number[];
  roleIdx: number;
  q: string;
  showEntry: boolean;
  entries: SaleEntry[];
  form: SaleForm;
  mrec: ManualRecords;
  mlist: ManualLists;
}

export type SetState = (update: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => void;
