import { useState } from 'react';
import { MUT_50 } from '../../lib/colors';
import { money, todayStr } from '../../lib/format';
import { useDeletePurchase, usePurchases, useRecordPurchase } from '../../state/queries';
import { useRole } from '../../state/role';
import { DeleteButton } from '../ui/DeleteButton';
import { SectionLabel } from '../ui/SectionLabel';
import { TileGrid } from '../ui/TileGrid';
import { Tag } from '../ui/Tag';

export function PurchasingModule() {
  const { data: purchases } = usePurchases();
  const recordPurchase = useRecordPurchase();
  const deletePurchase = useDeletePurchase();
  const { canEdit } = useRole();

  const [supplier, setSupplier] = useState('');
  const [item, setItem] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(todayStr());

  function save() {
    if (!supplier.trim() || !item.trim() || !date) return;
    recordPurchase.mutate(
      { supplier: supplier.trim(), item: item.trim(), qty: parseFloat(qty) || 0, price: parseFloat(price) || 0, date },
      { onSuccess: () => { setSupplier(''); setItem(''); setQty(''); setPrice(''); setDate(todayStr()); } },
    );
  }

  const list = purchases ?? [];
  const totalSpent = list.reduce((a, p) => a + p.price, 0);

  return (
    <>
      {canEdit && (
        <div style={{ border: '1px solid var(--color-divider)', background: 'var(--color-surface)', padding: 12, marginBottom: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 10 }}>
            Record purchase
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Supplier</label>
              <input className="input" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Name" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Item</label>
              <input className="input" value={item} onChange={(e) => setItem(e.target.value)} placeholder="Sunflower seeds" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Qty (kg)</label>
              <input className="input" type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Price (TSh)</label>
              <input className="input" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="field" style={{ marginBottom: 10 }}>
            <label>Date</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button onClick={save} disabled={!supplier.trim() || !item.trim() || !date} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Save purchase
          </button>
        </div>
      )}

      <TileGrid
        valueFontSize={18}
        tiles={[
          { label: 'Purchases', value: String(list.length) },
          { label: 'Total spent', value: money(totalSpent) },
        ]}
      />

      <SectionLabel margin="0 0 8px">Recent purchases</SectionLabel>
      <div style={{ borderTop: '2px solid var(--color-divider)' }}>
        {list.length === 0 && <div style={{ padding: '14px 2px', fontSize: 13, color: MUT_50 }}>No purchases recorded yet.</div>}
        {list.map((p) => (
          <div key={p.id} style={{ padding: '12px 2px', borderBottom: '1px solid var(--color-divider)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>{p.supplier}</div>
                <div style={{ fontSize: 11, color: MUT_50 }}>{p.item}{p.qty ? ` · ${p.qty.toLocaleString('en-US')} kg` : ''} · {new Date(p.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13 }}>{money(p.price)}</div>
                <Tag cls="tag-outline" style={{ marginTop: 3 }}>{p.status}</Tag>
              </div>
              {canEdit && <DeleteButton label="purchase" onConfirm={() => deletePurchase.mutate(p.id)} />}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
