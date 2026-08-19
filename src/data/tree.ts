import type { BranchNode, OrderItem, OrderNode, TreeNode } from '../types';

// Same product price list used by the drill-down order generator (mirrors
// the sale-entry PRICE map in data/static.ts, kept separate to match the
// original prototype's two independent literals).
const P = [
  { n: 'Sunflower Oil 20L', p: 78000 },
  { n: 'Sunflower Oil 5L', p: 21000 },
  { n: 'Sunflower Oil 1L', p: 4600 },
  { n: 'Sunflower Oil 500ml', p: 2500 },
  { n: 'Seed cake 25kg', p: 18000 },
];

const ST = ['Paid', 'On credit', 'Overdue'];

// Deterministic pseudo-random generator so the invented drill-down data is
// stable across renders/reloads instead of reshuffling every time.
function rnd(s: number): number {
  const x = Math.sin(s * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const STRUCTURE: { region: string; dists: { name: string; ws: { name: string; retailers: string[] }[] }[] }[] = [
  {
    region: 'Dar es Salaam',
    dists: [
      {
        name: 'Kariakoo Bulk Traders',
        ws: [
          { name: 'Tandale Wholesale', retailers: ['City Mart Kinondoni', 'Rehema Store'] },
          { name: 'Buguruni Depot', retailers: ['Zawadi Supermarket', 'Said General'] },
        ],
      },
    ],
  },
  {
    region: 'Singida',
    dists: [
      {
        name: 'Singida Oil Depot',
        ws: [
          { name: 'Ilongero Wholesale', retailers: ['Hamisi Duka', 'Grace Provisions'] },
          { name: 'Mtinko Traders', retailers: ['Faraja Shop', 'Kito Store'] },
        ],
      },
    ],
  },
  {
    region: 'Dodoma',
    dists: [
      {
        name: 'Mji Mpya Distributors',
        ws: [
          { name: 'Kikuyu Wholesale', retailers: ['Mama Amina Shop', 'Baraka General Store'] },
          { name: 'Majengo Traders', retailers: ['Juma Mini Market', 'Neema Duka'] },
        ],
      },
      {
        name: 'Chamwino Agrovet Supplies',
        ws: [
          { name: 'Chamwino Central Wholesale', retailers: ['Salma Store', 'Upendo Grocers'] },
        ],
      },
    ],
  },
];

function sum(arr: { value: number }[]): number {
  return arr.reduce((a, n) => a + n.value, 0);
}

export function buildTree(): BranchNode {
  let seed = 3;
  let oc = 1000;

  const mkOrder = (code: number): OrderNode => {
    const nItems = 1 + Math.floor(rnd(seed++) * 2);
    const items: OrderItem[] = [];
    let total = 0;
    for (let i = 0; i < nItems; i++) {
      const prod = P[Math.floor(rnd(seed++) * P.length)];
      const qty = 4 + Math.floor(rnd(seed++) * 46);
      const line = qty * prod.p;
      total += line;
      items.push({ name: prod.n, qty, unit: prod.p, total: line });
    }
    const status = ST[Math.floor(rnd(seed++) * 3)];
    const day = 8 + Math.floor(rnd(seed++) * 9);
    return {
      type: 'order',
      name: 'PA-' + code,
      status,
      date: day + ' Aug 2026',
      items,
      value: total,
      sub: day + ' Aug · ' + status,
    };
  };

  const regions: BranchNode[] = STRUCTURE.map((rg) => {
    const dists: BranchNode[] = rg.dists.map((d) => {
      const wss: BranchNode[] = d.ws.map((w) => {
        const rets: BranchNode[] = w.retailers.map((rn) => {
          const orders = [0, 1].map(() => mkOrder(++oc));
          return { type: 'retailer', name: rn, value: sum(orders), sub: orders.length + ' orders · this month', children: orders };
        });
        return { type: 'wholesaler', name: w.name, value: sum(rets), sub: rets.length + ' retailers', children: rets };
      });
      const rc = wss.reduce((a, w) => a + w.children.length, 0);
      return { type: 'distributor', name: d.name, value: sum(wss), sub: wss.length + ' wholesalers · ' + rc + ' retailers', children: wss };
    });
    return { type: 'region', name: rg.region, value: sum(dists), sub: dists.length + ' distributors', children: dists };
  });

  return { type: 'company', name: 'Patrick Group', value: sum(regions), sub: regions.length + ' territories', children: regions };
}

export function isOrderNode(n: TreeNode): n is OrderNode {
  return n.type === 'order';
}
