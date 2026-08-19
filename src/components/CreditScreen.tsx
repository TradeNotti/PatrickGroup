import { useState } from 'react';
import { MUT_50, MUT_55 } from '../lib/colors';
import { creditStatus } from '../lib/credit';
import { money, moneyM } from '../lib/format';
import { useCustomers, useRecordPayment } from '../state/queries';
import { PaymentDialog } from './PaymentDialog';
import { SearchInput } from './ui/SearchInput';
import { TileGrid } from './ui/TileGrid';
import { Tag } from './ui/Tag';
import type { Customer } from '../types';

export function CreditScreen() {
  const { data: customers } = useCustomers();
  const recordPayment = useRecordPayment();
  const [q, setQ] = useState('');
  const [dialogCustomer, setDialogCustomer] = useState<Customer | null>(null);

  const owing = (customers ?? []).filter((c) => c.balance > 0);
  const overdueList = owing.filter((c) => creditStatus(c)?.overdue);
  const totalOwed = owing.reduce((a, c) => a + c.balance, 0);
  const overdueTotal = overdueList.reduce((a, c) => a + c.balance, 0);
  const onTimePct = owing.length ? Math.round(((owing.length - overdueList.length) / owing.length) * 100) : 100;

  const filtered = owing.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ margin: '0 0 14px' }}>Credit</h3>

      <TileGrid
        marginBottom={20}
        tiles={[
          { label: 'Total owed', value: moneyM(totalOwed), color: 'inherit' },
          { label: 'Overdue', value: moneyM(overdueTotal), color: 'var(--color-accent)' },
          { label: 'Credit customers', value: String(owing.length), color: 'inherit' },
          { label: 'On-time', value: owing.length ? onTimePct + '%' : '—', color: 'inherit' },
        ]}
      />

      <div style={{ marginBottom: 8 }}>
        <SearchInput value={q} onChange={setQ} placeholder="Search customer..." />
      </div>

      <div style={{ borderTop: '2px solid var(--color-divider)' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '14px 2px', fontSize: 13, color: MUT_50 }}>
            {owing.length === 0 ? 'No outstanding credit.' : 'No matches.'}
          </div>
        )}
        {filtered.map((c) => {
          const status = creditStatus(c);
          const statusLabel = status ? (status.overdue ? `${status.days} days overdue` : `due in ${status.days} days`) : '';
          const statusTag = status?.overdue ? 'tag-outline' : (status && status.days <= 3) ? 'tag-accent' : 'tag-neutral';
          return (
            <div key={c.id} style={{ padding: '12px 2px', borderBottom: '1px solid var(--color-divider)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                  {c.oldest_at && <div style={{ fontSize: 11, color: MUT_55 }}>since {new Date(c.oldest_at).toLocaleDateString()}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14 }}>{money(c.balance)}</div>
                  {statusLabel && <Tag cls={statusTag} style={{ marginTop: 3 }}>{statusLabel}</Tag>}
                </div>
              </div>
              {status?.overdue && (
                <button onClick={() => setDialogCustomer(c)} className="btn btn-primary" style={{ marginTop: 9, padding: '6px 12px', fontSize: 12 }}>
                  Record payment
                </button>
              )}
            </div>
          );
        })}
      </div>

      <PaymentDialog
        open={!!dialogCustomer}
        name={dialogCustomer?.name ?? ''}
        amount={dialogCustomer ? money(dialogCustomer.balance) : ''}
        onCancel={() => setDialogCustomer(null)}
        onConfirm={() => {
          if (!dialogCustomer) return;
          recordPayment.mutate({ customerId: dialogCustomer.id, amount: dialogCustomer.balance });
          setDialogCustomer(null);
        }}
      />
    </div>
  );
}
