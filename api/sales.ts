import { requireAuth } from './_lib/auth.ts';
import { db } from './_lib/db.ts';
import { readJsonBody, sendJson } from './_lib/http.ts';
import { upsertCustomer } from './_lib/queries.ts';
import type { Req, Res } from './_lib/http.ts';

interface SaleItemInput { product: string; qty: number; price: number; }
interface SaleInput {
  customer: string;
  pay: 'Cash' | 'Credit';
  terms: number;
  items: SaleItemInput[];
}

export default async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const limit = Math.min(Number(new URL(req.url ?? '/', 'http://x').searchParams.get('limit')) || 20, 100);
    const { rows } = await db().query(
      `select so.id, c.name as customer, so.pay_method as pay, so.terms_days as terms, so.total, so.created_at
       from sales_orders so join customers c on c.id = so.customer_id
       order by so.created_at desc limit $1`,
      [limit],
    );
    return sendJson(res, 200, rows);
  }

  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' });

  const body = await readJsonBody<SaleInput>(req);
  const customerName = String(body.customer || '').trim();
  const items = Array.isArray(body.items) ? body.items : [];
  const pay = body.pay === 'Credit' ? 'Credit' : 'Cash';
  const terms = pay === 'Credit' ? Number(body.terms) || 0 : 0;

  if (!customerName) return sendJson(res, 400, { error: 'customer is required' });
  if (!items.length || items.some((it) => !it.product || !(Number(it.qty) > 0) || !(Number(it.price) > 0))) {
    return sendJson(res, 400, { error: 'at least one valid item is required' });
  }
  if (pay === 'Credit' && !(terms > 0)) return sendJson(res, 400, { error: 'payment period is required for credit sales' });

  const total = items.reduce((a, it) => a + Number(it.qty) * Number(it.price), 0);

  const pool = db();
  const client = await pool.connect();
  try {
    await client.query('begin');
    const customerId = await upsertCustomer(client, customerName);
    const orderRes = await client.query(
      `insert into sales_orders (customer_id, pay_method, terms_days, total) values ($1, $2, $3, $4) returning id, created_at`,
      [customerId, pay, terms, total],
    );
    const orderId = orderRes.rows[0].id;
    for (const it of items) {
      const lineTotal = Number(it.qty) * Number(it.price);
      await client.query(
        `insert into sale_order_items (order_id, product, qty, unit_price, total) values ($1, $2, $3, $4, $5)`,
        [orderId, it.product, it.qty, it.price, lineTotal],
      );
    }
    const revenueAccount = pay === 'Cash' ? 'Cash' : 'Accounts receivable';
    await client.query(
      `insert into ledger_entries (account, debit, credit, memo) values
        ($1, $2, 0, $3),
        ('Sales revenue', 0, $2, $3)`,
      [revenueAccount, total, `Sale to ${customerName}`],
    );
    await client.query('commit');
    sendJson(res, 201, { id: orderId, total });
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}
