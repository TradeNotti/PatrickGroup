import type { Pool, PoolClient } from 'pg';

/** Accepts either a Pool or a checked-out PoolClient (e.g. inside a transaction). */
export type Queryable = Pool | PoolClient;

export interface CustomerBalanceRow {
  id: number;
  name: string;
  balance: number;
  oldest_credit_at: string | null;
  first_terms_days: number | null;
}

/** Every customer with their running balance (credit sales minus payments)
 *  and the info needed to judge whether they're overdue: the date of their
 *  oldest still-open credit sale and the payment term that sale was given. */
export async function customerBalances(pool: Queryable): Promise<CustomerBalanceRow[]> {
  const { rows } = await pool.query(`
    with credit_agg as (
      select customer_id,
             sum(total) as credit_total,
             min(created_at) as oldest_at,
             (array_agg(terms_days order by created_at asc))[1] as first_terms_days
      from sales_orders
      where pay_method = 'Credit'
      group by customer_id
    ),
    pay_agg as (
      select customer_id, sum(amount) as paid_total from payments group by customer_id
    )
    select c.id, c.name,
      (coalesce(ca.credit_total, 0) - coalesce(pa.paid_total, 0))::float8 as balance,
      ca.oldest_at,
      ca.first_terms_days
    from customers c
    left join credit_agg ca on ca.customer_id = c.id
    left join pay_agg pa on pa.customer_id = c.id
    order by c.name asc
  `);
  return rows;
}

/** Cash-on-hand as recorded in the ledger: every debit to the Cash account
 *  minus every credit to it (cash sales and payments received debit Cash;
 *  cash spent on purchases would credit it). */
export async function cashPosition(pool: Queryable): Promise<number> {
  const { rows } = await pool.query(
    `select coalesce(sum(debit) - sum(credit), 0)::float8 as cash from ledger_entries where account = 'Cash'`,
  );
  return rows[0].cash;
}

export async function upsertCustomer(pool: Queryable, name: string): Promise<number> {
  const { rows } = await pool.query(
    `insert into customers (name) values ($1)
     on conflict (name) do update set name = excluded.name
     returning id`,
    [name],
  );
  return rows[0].id;
}

export function rangeCutoff(range: string): Date {
  const now = new Date();
  if (range === 'week') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (range === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
