import { useMemo } from 'react';
import { ACC, MUT, UP } from '../lib/colors';
import { litres, money, moneyM } from '../lib/format';
import {
  AREA_SALES, CHILD_TYPE_LABEL, CREDIT, DIST_LIST, DIST_TILES, FIN_EXP, FIN_REV,
  INV_ITEMS, INV_MOVES, JOURNAL_BASE, PRICE, PROD_BATCHES, PUR_LIST, PUR_TILES,
  RANGE_MULT, ROLES, SALES_REPS, STATUS_TAG, TOP_DISTRIBUTORS, TOP_PRODUCTS, TYPE_LABEL,
} from '../data/static';
import { isOrderNode } from '../data/tree';
import type {
  AppState, BranchNode, DistRecord, InvRecord, OrderNode, ProdRecord, PurRecord,
  SetState, Tab, TreeNode,
} from '../types';

export const CREDIT_TERM_DAYS = 10;

export interface MetricTile { label: string; value: string; sub: string; color: string; }
export interface TrendRow { name: string; value: string; pct: string; trendColor: string; }
export interface DistTrendRow extends TrendRow { region: string; }
export interface AreaBar { region: string; value: string; barW: string; }
export interface OverdueRow { name: string; dist: string; amount: string; days: number; }
export interface Crumb { name: string; sep: string; color: string; onClick: () => void; }
export interface DrillRow { name: string; sub: string; value: string; onOpen: () => void; }
export interface OrderView {
  name: string; date: string; status: string; statusTag: string; total: string; where: string;
  items: { name: string; qty: string; unit: string; total: string }[];
}
export interface CreditTile { label: string; value: string; color: string; }
export interface CreditRow {
  name: string; dist: string; balance: string; statusLabel: string; statusTag: string;
  overdue: boolean; onPay: () => void;
}
export interface ModuleListItem { name: string; stat: string; go: () => void; }
export interface Tile { label: string; value: string; }
export interface RepBar { name: string; area: string; pct: string; barW: string; }
export interface InvMoveRow { item: string; qty: string; dir: string; dirCls: string; ref: string; time: string; }
export interface FinExpRow { name: string; amt: string; barW: string; }
export interface JournalRow { date: string; account: string; debit: string; credit: string; }
export interface DistRow { route: string; driver: string; stops: string; status: string; tag: string; }
export interface ProdBatchRow { id: string; seed: string; oil: string; yield: string; }
export interface PurRow { supplier: string; item: string; qty: string; price: string; status: string; tag: string; }
export interface RecentEntryRow { product: string; qty: string; total: string; pay: string; customer: string; tag: string; }

export interface Derived {
  // shell
  dark: boolean; appClass: string; darkLabel: string; toggleDark: () => void;
  cycleRole: () => void; roleLabel: string; roleScope: string; greet: string;
  goHome: () => void; goExplore: () => void; goCredit: () => void; goMore: () => void;
  homeColor: string; exploreColor: string; creditColor: string; moreColor: string;
  isHome: boolean; isExplore: boolean; isCredit: boolean; isMore: boolean;
  // range
  rToday: boolean; rWiki: boolean; rMwezi: boolean;
  setRangeToday: () => void; setRangeWiki: () => void; setRangeMwezi: () => void;
  // dashboard
  metrics: MetricTile[]; topProducts: TrendRow[]; topDistributors: DistTrendRow[];
  areaBars: AreaBar[]; overdue: OverdueRow[];
  // explore
  crumbs: Crumb[]; drillRows: DrillRow[]; notOrder: boolean; isOrder: boolean; order: OrderView | null;
  drillTitle: string; drillType: string; drillChildType: string; drillValue: string;
  q: string; setQ: (v: string) => void;
  // credit
  creditTermDays: number; creditTiles: CreditTile[]; creditList: CreditRow[];
  // more / modules
  modules: ModuleListItem[]; moduleOpen: boolean; moduleNone: boolean; moduleTitle: string;
  moduleBack: () => void;
  modSales: boolean; modInventory: boolean; modDistribution: boolean;
  modProduction: boolean; modPurchasing: boolean; modFinance: boolean;
  salesTotal: string; salesOrders: string; salesReps: RepBar[];
  invItems: typeof INV_ITEMS; invMoves: InvMoveRow[];
  finTiles: Tile[]; finRev: { m: string; barW: string }[]; finExp: FinExpRow[];
  journal: JournalRow[]; journalDebit: string; journalCredit: string;
  distTiles: Tile[]; distList: DistRow[]; prodBatches: ProdBatchRow[];
  purTiles: Tile[]; purList: PurRow[];
  mrec: AppState['mrec'];
  invItemSet: (v: string) => void; invQtySet: (v: string) => void;
  invDirIn: () => void; invDirOut: () => void; invDirInChk: boolean; invDirOutChk: boolean; saveInv: () => void;
  distRouteSet: (v: string) => void; distDriverSet: (v: string) => void; distStatus: (v: string) => void; saveDist: () => void;
  prodIdSet: (v: string) => void; prodSeedSet: (v: string) => void; prodOilSet: (v: string) => void; saveProd: () => void;
  purSupSet: (v: string) => void; purItemSet: (v: string) => void; purQtySet: (v: string) => void; purPriceSet: (v: string) => void; savePur: () => void;
  // dialog
  dialog: AppState['dialog']; dialogName: string; dialogAmount: string;
  closeDialog: () => void; confirmPay: () => void;
  // data entry
  showEntry: boolean; form: AppState['form']; payCash: boolean; payCredit: boolean;
  formEntryTotal: string; formDueLabel: string; saveDisabled: boolean;
  hasEntries: boolean; entriesCount: string; entriesSum: string; recentEntries: RecentEntryRow[];
  openEntry: () => void; closeEntry: () => void;
  setProduct: (v: string) => void; setQty: (v: string) => void; setPrice: (v: string) => void;
  setCustomer: (v: string) => void; setPayCash: () => void; setPayCredit: () => void;
  setTerms: (v: string) => void; saveEntry: () => void;
}

export function useDerived(state: AppState, set: SetState, tree: BranchNode): Derived {
  return useMemo(() => {
    const S = state;
    const role = ROLES[S.roleIdx];
    const f = role.factor;
    const mult = RANGE_MULT[S.range] || 1;
    const k = f * mult;

    const remaining = CREDIT.filter((c) => !S.paidIds.includes(c.id));
    const outstanding = remaining.reduce((a, c) => a + c.balance, 0);
    const overdueTotal = remaining.filter((c) => c.due < 0).reduce((a, c) => a + c.balance, 0);

    const entries = S.entries;
    const manualCash = entries.filter((e) => e.pay === 'Cash').reduce((a, e) => a + e.total, 0);
    const manualCredit = entries.filter((e) => e.pay === 'Credit').reduce((a, e) => a + e.total, 0);
    const manualTotal = manualCash + manualCredit;

    const sales = 4820000 * k + manualTotal;
    const orders = Math.round(37 * k) + entries.length;
    const dash = '—';
    const metrics: MetricTile[] = [
      { label: 'Sales', value: dash, sub: 'TSh', color: 'inherit' },
      { label: 'Orders', value: dash, sub: 'orders', color: 'inherit' },
      { label: 'Collections', value: dash, sub: 'TSh', color: 'inherit' },
      { label: 'Outstanding credit', value: dash, sub: 'TSh', color: ACC },
      { label: 'Stock (oil)', value: dash, sub: 'litres', color: 'inherit' },
      { label: 'Production', value: dash, sub: 'litres', color: 'inherit' },
      { label: 'Oil margin', value: dash, sub: '%', color: 'inherit' },
      { label: 'Cash position', value: dash, sub: 'TSh', color: 'inherit' },
    ];

    const topProducts: TrendRow[] = TOP_PRODUCTS.map((p) => ({
      name: p[0], value: moneyM(p[1] * k), pct: p[3], trendColor: p[2] ? UP : ACC,
    }));
    const topDistributors: DistTrendRow[] = TOP_DISTRIBUTORS.map((d) => ({
      name: d[0], region: d[1], value: moneyM(d[2] * k), pct: d[4], trendColor: d[3] ? UP : ACC,
    }));
    const maxA = Math.max(...AREA_SALES.map((a) => a[1]));
    const areaBars: AreaBar[] = AREA_SALES.map((a) => ({
      region: a[0], value: moneyM(a[1] * k), barW: Math.round((a[1] / maxA) * 100) + '%',
    }));
    const overdue: OverdueRow[] = remaining.filter((c) => c.due < 0).sort((a, b) => a.due - b.due).slice(0, 4)
      .map((c) => ({ name: c.name, dist: c.dist, amount: moneyM(c.balance), days: Math.abs(c.due) }));

    // ── explore drill ──
    const path = S.path;
    const current: TreeNode = path.length ? path[path.length - 1] : tree;
    const isOrder = isOrderNode(current);
    const chain: TreeNode[] = [tree, ...path];
    const crumbs: Crumb[] = chain.map((n, i) => ({
      name: i === 0 ? 'Company' : n.name,
      sep: i < chain.length - 1 ? '/' : '',
      color: i === chain.length - 1 ? 'var(--color-text)' : ACC,
      onClick: () => set({ path: S.path.slice(0, i), q: '' }),
    }));
    const rawRows = isOrder ? [] : (current as BranchNode).children.filter(
      (c) => !S.q || c.name.toLowerCase().includes(S.q.toLowerCase()),
    );
    const drillRows: DrillRow[] = rawRows.map((c) => ({
      name: c.name, sub: c.sub, value: moneyM(c.value),
      onOpen: () => set((st) => ({ path: [...st.path, c] as TreeNode[], q: '' })),
    }));
    let order: OrderView | null = null;
    if (isOrder) {
      const o = current as OrderNode;
      order = {
        name: 'Order ' + o.name, date: o.date, status: o.status,
        statusTag: STATUS_TAG[o.status] || 'tag-neutral',
        total: money(o.value),
        items: o.items.map((it) => ({ name: it.name, qty: String(it.qty), unit: money(it.unit), total: money(it.total) })),
        where: path.slice(0, 4).map((n) => n.name).join(' · '),
      };
    }

    // ── credit ──
    const creditTiles: CreditTile[] = [
      { label: 'Total owed', value: moneyM(outstanding), color: 'inherit' },
      { label: 'Overdue', value: moneyM(overdueTotal), color: ACC },
      { label: 'Credit customers', value: String(remaining.length), color: 'inherit' },
      { label: 'On-time', value: '82%', color: 'inherit' },
    ];
    const creditList: CreditRow[] = remaining
      .filter((c) => !S.q || c.name.toLowerCase().includes(S.q.toLowerCase()))
      .map((c) => {
        const od = c.due < 0, soon = c.due >= 0 && c.due <= 3;
        return {
          name: c.name, dist: c.dist, balance: money(c.balance),
          statusLabel: od ? (Math.abs(c.due) + ' days overdue') : ('due in ' + c.due + ' days'),
          statusTag: od ? 'tag-outline' : soon ? 'tag-accent' : 'tag-neutral',
          overdue: od,
          onPay: () => set({ dialog: { id: c.id, name: c.name, amount: money(c.balance) } }),
        };
      });

    // ── modules ──
    const modules: ModuleListItem[] = [
      { name: 'Sales', stat: orders + ' orders today', go: () => set({ module: 'sales' }) },
      { name: 'Inventory', stat: litres(42300), go: () => set({ module: 'inventory' }) },
      { name: 'Distribution', stat: '18 deliveries today', go: () => set({ module: 'distribution' }) },
      { name: 'Credit', stat: moneyM(outstanding) + ' owed', go: () => set({ tab: 'credit', module: null, q: '' }) },
      { name: 'Production', stat: litres(6200) + ' today', go: () => set({ module: 'production' }) },
      { name: 'Purchasing', stat: '4 open POs', go: () => set({ module: 'purchasing' }) },
      { name: 'Finance', stat: '24% gross margin', go: () => set({ module: 'finance' }) },
    ];
    const module = S.module;
    const isMore = S.tab === 'more';
    const moduleTitle = ({
      sales: 'Sales', inventory: 'Inventory', distribution: 'Distribution',
      production: 'Production', purchasing: 'Purchasing', finance: 'Finance',
    } as Record<string, string>)[module || ''] || 'Modules';

    const invMovesManual: InvMoveRow[] = S.mlist.inv.map((r) => ({
      item: r.item, qty: (r.dir === 'In' ? '+' : '−') + r.qty + ' units', dir: r.dir,
      dirCls: r.dir === 'In' ? 'tag-neutral' : 'tag-outline', ref: 'Manual entry', time: 'Today',
    }));
    const distListManual: DistRow[] = S.mlist.dist.map((r) => ({
      route: r.route, driver: r.driver, stops: '—', status: r.status,
      tag: r.status === 'Delivered' ? 'tag-neutral' : r.status === 'In transit' ? 'tag-accent' : 'tag-outline',
    }));
    const prodBatchesManual: ProdBatchRow[] = S.mlist.prod.map((r) => {
      const sd = parseFloat(r.seed) || 0, ol = parseFloat(r.oil) || 0;
      const y = sd ? Math.round((ol * 0.92 / sd) * 100) : 0;
      return { id: r.id, seed: sd.toLocaleString('en-US') + ' kg', oil: ol.toLocaleString('en-US') + ' L', yield: y + '%' };
    });
    const purListManual: PurRow[] = S.mlist.pur.map((r) => ({
      supplier: r.supplier, item: r.item, qty: (r.qty || '') + ' kg',
      price: 'TSh ' + (parseFloat(r.price) || 0).toLocaleString('en-US'), status: 'Ordered', tag: 'tag-outline',
    }));

    const finTiles: Tile[] = [
      { label: 'Revenue (month)', value: moneyM(127600000) },
      { label: 'Gross margin', value: '24%' },
      { label: 'Expenses (month)', value: moneyM(96900000) },
      { label: 'Receivables', value: moneyM(outstanding) },
      { label: 'Cash position', value: moneyM(9250000) },
      { label: 'Net profit', value: moneyM(30700000) },
    ];
    const finRev = FIN_REV.map((x) => ({ m: x[0], barW: x[1] }));
    const finExp: FinExpRow[] = FIN_EXP.map((e) => ({ name: e.name, amt: moneyM(e.amt), barW: e.barW }));

    const manualJ: [string, string, number, number][] = [];
    entries.forEach((e) => {
      manualJ.push(['Today', e.pay === 'Cash' ? 'Cash' : 'Accounts receivable', e.total, 0]);
      manualJ.push(['Today', 'Sales revenue', 0, e.total]);
    });
    const allJ = [...manualJ, ...JOURNAL_BASE];
    const jf = (n: number) => (n ? n.toLocaleString('en-US') : '—');
    const journal: JournalRow[] = allJ.map((r) => ({ date: r[0], account: r[1], debit: jf(r[2]), credit: jf(r[3]) }));
    const jd = allJ.reduce((a, r) => a + r[2], 0), jc = allJ.reduce((a, r) => a + r[3], 0);
    const journalDebit = jd.toLocaleString('en-US'), journalCredit = jc.toLocaleString('en-US');

    // ── manual-record form setters ──
    const invItemSet = (v: string) => set((s) => ({ mrec: { ...s.mrec, inv: { ...s.mrec.inv, item: v } } }));
    const invQtySet = (v: string) => set((s) => ({ mrec: { ...s.mrec, inv: { ...s.mrec.inv, qty: v } } }));
    const invDirIn = () => set((s) => ({ mrec: { ...s.mrec, inv: { ...s.mrec.inv, dir: 'In' } } }));
    const invDirOut = () => set((s) => ({ mrec: { ...s.mrec, inv: { ...s.mrec.inv, dir: 'Out' } } }));
    const saveInv = () => set((s) => {
      const r = s.mrec.inv;
      if (![r.item, r.qty].every((v) => String(v || '').trim())) return {};
      const cl: InvRecord = { ...r, item: '', qty: '' };
      return { mlist: { ...s.mlist, inv: [{ ...r }, ...s.mlist.inv] }, mrec: { ...s.mrec, inv: cl } };
    });

    const distRouteSet = (v: string) => set((s) => ({ mrec: { ...s.mrec, dist: { ...s.mrec.dist, route: v } } }));
    const distDriverSet = (v: string) => set((s) => ({ mrec: { ...s.mrec, dist: { ...s.mrec.dist, driver: v } } }));
    const distStatus = (v: string) => set((s) => ({ mrec: { ...s.mrec, dist: { ...s.mrec.dist, status: v } } }));
    const saveDist = () => set((s) => {
      const r = s.mrec.dist;
      if (![r.route, r.driver].every((v) => String(v || '').trim())) return {};
      const cl: DistRecord = { ...r, route: '', driver: '' };
      return { mlist: { ...s.mlist, dist: [{ ...r }, ...s.mlist.dist] }, mrec: { ...s.mrec, dist: cl } };
    });

    const prodIdSet = (v: string) => set((s) => ({ mrec: { ...s.mrec, prod: { ...s.mrec.prod, id: v } } }));
    const prodSeedSet = (v: string) => set((s) => ({ mrec: { ...s.mrec, prod: { ...s.mrec.prod, seed: v } } }));
    const prodOilSet = (v: string) => set((s) => ({ mrec: { ...s.mrec, prod: { ...s.mrec.prod, oil: v } } }));
    const saveProd = () => set((s) => {
      const r = s.mrec.prod;
      if (![r.id, r.seed, r.oil].every((v) => String(v || '').trim())) return {};
      const cl: ProdRecord = { ...r, id: '', seed: '', oil: '' };
      return { mlist: { ...s.mlist, prod: [{ ...r }, ...s.mlist.prod] }, mrec: { ...s.mrec, prod: cl } };
    });

    const purSupSet = (v: string) => set((s) => ({ mrec: { ...s.mrec, pur: { ...s.mrec.pur, supplier: v } } }));
    const purItemSet = (v: string) => set((s) => ({ mrec: { ...s.mrec, pur: { ...s.mrec.pur, item: v } } }));
    const purQtySet = (v: string) => set((s) => ({ mrec: { ...s.mrec, pur: { ...s.mrec.pur, qty: v } } }));
    const purPriceSet = (v: string) => set((s) => ({ mrec: { ...s.mrec, pur: { ...s.mrec.pur, price: v } } }));
    const savePur = () => set((s) => {
      const r = s.mrec.pur;
      if (![r.supplier, r.item].every((v) => String(v || '').trim())) return {};
      const cl: PurRecord = { ...r, supplier: '', item: '' };
      return { mlist: { ...s.mlist, pur: [{ ...r }, ...s.mlist.pur] }, mrec: { ...s.mrec, pur: cl } };
    });

    // ── data entry ──
    const qtyN = parseFloat(S.form.qty) || 0;
    const priceN = parseFloat(S.form.price) || 0;
    const termsN = parseFloat(S.form.terms) || 0;
    const formEntryTotal = money(qtyN * priceN);
    const formDueLabel = termsN > 0 ? 'in ' + termsN + ' days' : 'on receipt';
    const saveDisabled = !(qtyN > 0 && priceN > 0 && (S.form.pay === 'Cash' || termsN > 0));

    const saveEntry = () => {
      const frm = S.form;
      const qty = parseFloat(frm.qty) || 0;
      const price = parseFloat(frm.price) || 0;
      const total = qty * price;
      if (total <= 0) return;
      set((s) => ({
        entries: [{ product: frm.product, qty, price, total, pay: frm.pay, terms: parseFloat(frm.terms) || 0, customer: frm.customer, date: 'Today' }, ...s.entries],
        form: { ...s.form, qty: '' },
        showEntry: false, tab: 'home', module: null,
      }));
    };

    return {
      dark: S.dark, appClass: S.dark ? 'pa-app pa-dark' : 'pa-app', darkLabel: S.dark ? 'Light' : 'Dark',
      toggleDark: () => set({ dark: !S.dark }),
      cycleRole: () => set({ roleIdx: (S.roleIdx + 1) % ROLES.length, path: [], q: '' }),
      roleLabel: role.label, roleScope: role.scope, greet: role.greet,
      goHome: () => set({ tab: 'home' as Tab, module: null }),
      goExplore: () => set({ tab: 'explore' as Tab, module: null }),
      goCredit: () => set({ tab: 'credit' as Tab, module: null, q: '' }),
      goMore: () => set({ tab: 'more' as Tab, module: null }),
      homeColor: S.tab === 'home' ? ACC : MUT,
      exploreColor: S.tab === 'explore' ? ACC : MUT,
      creditColor: S.tab === 'credit' ? ACC : MUT,
      moreColor: S.tab === 'more' ? ACC : MUT,
      isHome: S.tab === 'home', isExplore: S.tab === 'explore', isCredit: S.tab === 'credit', isMore,

      rToday: S.range === 'Today', rWiki: S.range === 'This week', rMwezi: S.range === 'This month',
      setRangeToday: () => set({ range: 'Today' }),
      setRangeWiki: () => set({ range: 'This week' }),
      setRangeMwezi: () => set({ range: 'This month' }),

      metrics, topProducts, topDistributors, areaBars, overdue,

      crumbs, drillRows, notOrder: !isOrder, isOrder, order,
      drillTitle: path.length ? current.name : 'Patrick Group',
      drillType: TYPE_LABEL[current.type], drillChildType: CHILD_TYPE_LABEL[current.type] || '',
      drillValue: moneyM(current.value),
      q: S.q, setQ: (v: string) => set({ q: v }),

      creditTermDays: CREDIT_TERM_DAYS, creditTiles, creditList,

      modules, moduleOpen: isMore && !!module, moduleNone: isMore && !module, moduleTitle,
      moduleBack: () => set({ module: null }),
      modSales: module === 'sales', modInventory: module === 'inventory', modDistribution: module === 'distribution',
      modProduction: module === 'production', modPurchasing: module === 'purchasing', modFinance: module === 'finance',
      salesTotal: moneyM(sales), salesOrders: String(orders), salesReps: SALES_REPS,
      invItems: INV_ITEMS, invMoves: [...invMovesManual, ...INV_MOVES],
      finTiles, finRev, finExp, journal, journalDebit, journalCredit,
      distTiles: DIST_TILES, distList: [...distListManual, ...DIST_LIST],
      prodBatches: [...prodBatchesManual, ...PROD_BATCHES],
      purTiles: PUR_TILES, purList: [...purListManual, ...PUR_LIST],
      mrec: S.mrec,
      invItemSet, invQtySet, invDirIn, invDirOut, invDirInChk: S.mrec.inv.dir === 'In', invDirOutChk: S.mrec.inv.dir === 'Out', saveInv,
      distRouteSet, distDriverSet, distStatus, saveDist,
      prodIdSet, prodSeedSet, prodOilSet, saveProd,
      purSupSet, purItemSet, purQtySet, purPriceSet, savePur,

      dialog: S.dialog, dialogName: S.dialog ? S.dialog.name : '', dialogAmount: S.dialog ? S.dialog.amount : '',
      closeDialog: () => set({ dialog: null }),
      confirmPay: () => set((st) => ({ paidIds: [...st.paidIds, st.dialog!.id], dialog: null })),

      showEntry: S.showEntry, form: S.form, payCash: S.form.pay === 'Cash', payCredit: S.form.pay === 'Credit',
      formEntryTotal, formDueLabel, saveDisabled,
      hasEntries: entries.length > 0, entriesCount: String(entries.length), entriesSum: moneyM(manualTotal),
      recentEntries: entries.map((e) => ({
        product: e.product, qty: String(e.qty), total: money(e.total),
        pay: e.pay === 'Credit' ? 'Credit · ' + e.terms + 'd' : 'Cash',
        customer: e.customer, tag: e.pay === 'Cash' ? 'tag-neutral' : 'tag-accent',
      })),
      openEntry: () => set({ showEntry: true }),
      closeEntry: () => set({ showEntry: false }),
      setProduct: (v: string) => set((s) => ({ form: { ...s.form, product: v, price: String(PRICE[v] || 0) } })),
      setQty: (v: string) => set((s) => ({ form: { ...s.form, qty: v } })),
      setPrice: (v: string) => set((s) => ({ form: { ...s.form, price: v } })),
      setCustomer: (v: string) => set((s) => ({ form: { ...s.form, customer: v } })),
      setPayCash: () => set((s) => ({ form: { ...s.form, pay: 'Cash' } })),
      setPayCredit: () => set((s) => ({ form: { ...s.form, pay: 'Credit' } })),
      setTerms: (v: string) => set((s) => ({ form: { ...s.form, terms: v } })),
      saveEntry,
    };
  }, [state, set, tree]);
}
