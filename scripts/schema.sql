-- Patrick Group operating system — schema.
-- Every statement is idempotent so this file is safe to re-run on every
-- deploy (see scripts/migrate.mjs, wired into the "vercel-build" script).

create table if not exists customers (
  id serial primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists sales_orders (
  id serial primary key,
  customer_id integer not null references customers(id),
  pay_method text not null check (pay_method in ('Cash', 'Credit')),
  terms_days integer not null default 0,
  total numeric not null,
  created_at timestamptz not null default now()
);
create index if not exists sales_orders_customer_idx on sales_orders(customer_id);
create index if not exists sales_orders_created_idx on sales_orders(created_at);

create table if not exists sale_order_items (
  id serial primary key,
  order_id integer not null references sales_orders(id) on delete cascade,
  product text not null,
  qty numeric not null,
  unit_price numeric not null,
  total numeric not null
);
create index if not exists sale_order_items_order_idx on sale_order_items(order_id);

create table if not exists payments (
  id serial primary key,
  customer_id integer not null references customers(id),
  amount numeric not null,
  created_at timestamptz not null default now()
);
create index if not exists payments_customer_idx on payments(customer_id);

create table if not exists inventory_items (
  id serial primary key,
  name text not null unique,
  qty numeric not null default 0,
  unit text not null default 'units'
);

create table if not exists inventory_movements (
  id serial primary key,
  item_id integer not null references inventory_items(id),
  item_name text not null,
  direction text not null check (direction in ('In', 'Out')),
  qty numeric not null,
  reference text,
  created_at timestamptz not null default now()
);
create index if not exists inventory_movements_created_idx on inventory_movements(created_at desc);

create table if not exists distributors (
  id serial primary key,
  name text not null unique,
  territory text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists deliveries (
  id serial primary key,
  distributor_id integer references distributors(id),
  route text not null,
  driver text not null,
  status text not null default 'In transit',
  created_at timestamptz not null default now()
);
alter table deliveries add column if not exists distributor_id integer references distributors(id);
create index if not exists deliveries_created_idx on deliveries(created_at desc);
create index if not exists deliveries_distributor_idx on deliveries(distributor_id);

alter table sales_orders add column if not exists distributor_id integer references distributors(id);
create index if not exists sales_orders_distributor_idx on sales_orders(distributor_id);

create table if not exists production_batches (
  id serial primary key,
  batch_code text not null,
  seed_kg numeric not null,
  oil_l numeric not null,
  created_at timestamptz not null default now()
);
create index if not exists production_batches_created_idx on production_batches(created_at desc);

create table if not exists purchases (
  id serial primary key,
  supplier text not null,
  item text not null,
  qty numeric not null,
  price numeric not null,
  status text not null default 'Ordered',
  created_at timestamptz not null default now()
);
create index if not exists purchases_created_idx on purchases(created_at desc);

create table if not exists ledger_entries (
  id serial primary key,
  entry_date timestamptz not null default now(),
  account text not null,
  debit numeric not null default 0,
  credit numeric not null default 0,
  memo text
);
create index if not exists ledger_entries_date_idx on ledger_entries(entry_date desc);
