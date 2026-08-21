import { requireAuth } from './_lib/auth.js';
import { db } from './_lib/db.js';
import { sendJson, withErrors } from './_lib/http.js';
import { cashPosition, customerBalances, rangeCutoff } from './_lib/queries.js';
import type { Req, Res } from './_lib/http.js';

async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'method not allowed' });

  const url = new URL(req.url ?? '/', 'http://x');
  const range = url.searchParams.get('range') || 'today';
  const cutoff = rangeCutoff(range);

  const pool = db();
  const [salesRes, collectionsCashRes, collectionsPayRes, stockRes, prodRes, topProductsRes, topDistributorsRes, balances, cash] = await Promise.all([
    pool.query(
      `select coalesce(sum(total),0)::float8 as total, count(*)::int as orders
       from sales_orders where created_at >= $1`,
      [cutoff],
    ),
    pool.query(`select coalesce(sum(total),0)::float8 as total from sales_orders where pay_method = 'Cash' and created_at >= $1`, [cutoff]),
    pool.query(`select coalesce(sum(amount),0)::float8 as total from payments where created_at >= $1`, [cutoff]),
    pool.query(`select coalesce(sum(qty),0)::float8 as total from inventory_items where unit = 'L'`),
    pool.query(
      `select coalesce(sum(oil_l),0)::float8 as oil, coalesce(sum(seed_kg),0)::float8 as seed
       from production_batches where created_at >= $1`,
      [cutoff],
    ),
    pool.query(
      `select soi.product, sum(soi.total)::float8 as value
       from sale_order_items soi join sales_orders so on so.id = soi.order_id
       where so.created_at >= $1
       group by soi.product order by value desc limit 5`,
      [cutoff],
    ),
    pool.query(
      `select d.name as distributor, sum(so.total)::float8 as value
       from sales_orders so join distributors d on d.id = so.distributor_id
       where so.created_at >= $1
       group by d.id, d.name order by value desc limit 5`,
      [cutoff],
    ),
    customerBalances(pool),
    cashPosition(pool),
  ]);

  const outstanding = balances.reduce((a, c) => a + (c.balance > 0 ? c.balance : 0), 0);
  const now = Date.now();
  const overdue = balances
    .filter((c) => c.balance > 0 && c.oldest_credit_at && c.first_terms_days != null)
    .map((c) => {
      const dueAt = new Date(c.oldest_credit_at as string).getTime() + (c.first_terms_days as number) * 86400000;
      return { ...c, daysOverdue: Math.floor((now - dueAt) / 86400000) };
    })
    .filter((c) => c.daysOverdue > 0)
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 4)
    .map((c) => ({ name: c.name, amount: c.balance, days: c.daysOverdue }));

  const seedTotal = prodRes.rows[0].seed;
  const oilTotal = prodRes.rows[0].oil;
  const margin = seedTotal > 0 ? (oilTotal * 0.92 / seedTotal) * 100 : 0;

  sendJson(res, 200, {
    sales: salesRes.rows[0].total,
    orders: salesRes.rows[0].orders,
    collections: collectionsCashRes.rows[0].total + collectionsPayRes.rows[0].total,
    outstandingCredit: outstanding,
    stockLitres: stockRes.rows[0].total,
    productionLitres: oilTotal,
    oilMargin: margin,
    cashPosition: cash,
    topProducts: topProductsRes.rows,
    topDistributors: topDistributorsRes.rows,
    overdue,
  });
}

export default withErrors(handler);
