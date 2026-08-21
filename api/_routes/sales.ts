import { requireAuth } from '../_lib/auth.js';
import { db } from '../_lib/db.js';
import { parseOptionalDate, readJsonBody, sendJson, withErrors } from '../_lib/http.js';
import { upsertCustomer } from '../_lib/queries.js';
import type { Req, Res } from '../_lib/http.js';

interface SaleItemInput { product: string; qty: number; price: number; }
interface SaleInput {
  customer: string;
  distributorId?: number;
  pay: 'Cash' | 'Credit';
  terms: number;
  items: SaleItemInput[];
  date?: string;
}

async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const limit = Math.min(Number(new URL(req.url ?? '/', 'http://x').searchParams.get('limit')) || 20, 100);
    const { rows } = await db().query(
      `select so.id, c.name as customer, d.name as distributor, so.pay_method as pay, so.terms_days as terms, so.total, so.created_at
       from sales_orders so
       join customers c on c.id = so.customer_id
       left join distributors d on d.id = so.distributor_id
       order by so.created_at desc limit $1`,
      [limit],
    );
    return sendJson(res, 200, rows);
  }

  if (req.method === 'DELETE') {
    const id = Number(new URL(req.url ?? '/', 'http://x').searchParams.get('id'));
    if (!id) return sendJson(res, 400, { error: 'id is required' });
    const pool = db();
    const client = await pool.connect();
    try {
      await client.query('begin');
      await client.query(`delete from ledger_entries where source_type = 'sale' and source_id = $1`, [id]);
      const deleted = await client.query(`delete from sales_orders where id = $1`, [id]);
      await client.query('commit');
      if (deleted.rowCount === 0) return sendJson(res, 404, { error: 'not found' });
      return sendJson(res, 200, { ok: true });
    } catch (err) {
      await client.query('rollback');
      throw err;
    } finally {
      client.release();
    }
  }

  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' });

  const body = await readJsonBody<SaleInput>(req);
  const customerName = String(body.customer || '').trim();
  const distributorId = Number(body.distributorId) || null;
  const items = Array.isArray(body.items) ? body.items : [];
  const pay = body.pay === 'Credit' ? 'Credit' : 'Cash';
  const terms = pay === 'Credit' ? Number(body.terms) || 0 : 0;

  if (!customerName) return sendJson(res, 400, { error: 'customer is required' });
  if (!items.length || items.some((it) => !it.product || !(Number(it.qty) > 0) || !(Number(it.price) > 0))) {
    return sendJson(res, 400, { error: 'at least one valid item is required' });
  }
  if (pay === 'Credit' && !(terms > 0)) return sendJson(res, 400, { error: 'payment period is required for credit sales' });

  const saleDate = parseOptionalDate(body.date);
  if (saleDate === 'invalid') return sendJson(res, 400, { error: 'invalid date' });

  const total = items.reduce((a, it) => a + Number(it.qty) * Number(it.price), 0);

  const pool = db();
  const client = await pool.connect();
  try {
    await client.query('begin');
    const customerId = await upsertCustomer(client, customerName);
    const orderRes = await client.query(
      `insert into sales_orders (customer_id, distributor_id, pay_method, terms_days, total, created_at)
       values ($1, $2, $3, $4, $5, coalesce($6, now())) returning id, created_at`,
      [customerId, distributorId, pay, terms, total, saleDate],
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
      `insert into ledger_entries (entry_date, account, debit, credit, memo, source_type, source_id) values
        (coalesce($5, now()), $1, $2, 0, $3, 'sale', $4),
        (coalesce($5, now()), 'Sales revenue', 0, $2, $3, 'sale', $4)`,
      [revenueAccount, total, `Sale to ${customerName}`, orderId, saleDate],
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

export default withErrors(handler);
