import { requireAuth } from './_lib/auth.ts';
import { db } from './_lib/db.ts';
import { sendJson } from './_lib/http.ts';
import { cashPosition, customerBalances } from './_lib/queries.ts';
import type { Req, Res } from './_lib/http.ts';

export default async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'method not allowed' });

  const pool = db();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [revenueRes, expensesRes, monthlyRes, balances, cash] = await Promise.all([
    pool.query(`select coalesce(sum(total),0)::float8 as total from sales_orders where created_at >= $1`, [monthStart]),
    pool.query(`select coalesce(sum(price),0)::float8 as total from purchases where created_at >= $1`, [monthStart]),
    pool.query(`
      select to_char(date_trunc('month', created_at), 'Mon') as m, sum(total)::float8 as revenue
      from sales_orders
      where created_at >= (date_trunc('month', now()) - interval '5 months')
      group by date_trunc('month', created_at)
      order by date_trunc('month', created_at) asc
    `),
    customerBalances(pool),
    cashPosition(pool),
  ]);

  const revenue = revenueRes.rows[0].total;
  const expenses = expensesRes.rows[0].total;
  const receivables = balances.reduce((a, c) => a + (c.balance > 0 ? c.balance : 0), 0);

  sendJson(res, 200, {
    revenue,
    expenses,
    receivables,
    cashPosition: cash,
    grossMarginPct: revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0,
    netProfit: revenue - expenses,
    monthlyRevenue: monthlyRes.rows,
  });
}
