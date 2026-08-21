import { useState } from 'react';
import { MUT_50 } from '../../lib/colors';
import { todayStr } from '../../lib/format';
import { useDeleteInventoryMovement, useInventoryItems, useInventoryMovements, useRecordMovement } from '../../state/queries';
import { useRole } from '../../state/role';
import { DeleteButton } from '../ui/DeleteButton';
import { SectionLabel } from '../ui/SectionLabel';
import { Segmented } from '../ui/Segmented';
import { Tag } from '../ui/Tag';

export function InventoryModule() {
  const { data: items } = useInventoryItems();
  const { data: moves } = useInventoryMovements(15);
  const recordMovement = useRecordMovement();
  const deleteMovement = useDeleteInventoryMovement();
  const { canEdit } = useRole();

  const [item, setItem] = useState('');
  const [qty, setQty] = useState('');
  const [direction, setDirection] = useState<'In' | 'Out'>('In');
  const [date, setDate] = useState(todayStr());

  function save() {
    const qtyN = parseFloat(qty);
    if (!item.trim() || !(qtyN > 0) || !date) return;
    recordMovement.mutate(
      { item: item.trim(), qty: qtyN, direction, date },
      { onSuccess: () => { setItem(''); setQty(''); setDate(todayStr()); } },
    );
  }

  return (
    <>
      {canEdit && (
        <div style={{ border: '1px solid var(--color-divider)', background: 'var(--color-surface)', padding: 12, marginBottom: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 10 }}>
            Record stock movement
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div className="field" style={{ flex: 2 }}>
              <label>Item</label>
              <input className="input" value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. Oil 20L" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Qty</label>
              <input className="input" type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" />
            </div>
          </div>
          <Segmented
            name="invdir"
            style={{ marginBottom: 10 }}
            options={[
              { label: 'In', checked: direction === 'In', onChange: () => setDirection('In') },
              { label: 'Out', checked: direction === 'Out', onChange: () => setDirection('Out') },
            ]}
          />
          <div className="field" style={{ marginBottom: 10 }}>
            <label>Date</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button onClick={save} disabled={!item.trim() || !(parseFloat(qty) > 0) || !date} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Save movement
          </button>
        </div>
      )}

      <SectionLabel margin="0 0 8px">Stock on hand</SectionLabel>
      {(!items || items.length === 0) ? (
        <div style={{ fontSize: 13, color: MUT_50, marginBottom: 24 }}>No stock recorded yet.</div>
      ) : (
        <table className="table" style={{ marginBottom: 24 }}>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td style={{ fontWeight: 600 }}>{i.name}</td>
                <td style={{ textAlign: 'right' }}>{i.qty.toLocaleString('en-US')} {i.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <SectionLabel margin="0 0 8px">Stock movements</SectionLabel>
      <div style={{ borderTop: '2px solid var(--color-divider)' }}>
        {moves && moves.length === 0 && <div style={{ padding: '14px 2px', fontSize: 13, color: MUT_50 }}>No movements yet.</div>}
        {moves?.map((m) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 2px', borderBottom: '1px solid var(--color-divider)' }}>
            <Tag cls={m.direction === 'In' ? 'tag-neutral' : 'tag-outline'} style={{ width: 52, justifyContent: 'center' }}>{m.direction}</Tag>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13 }}>{m.item_name}</div>
              <div style={{ fontSize: 11, color: MUT_50 }}>{new Date(m.created_at).toLocaleString()}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13 }}>
              {m.direction === 'In' ? '+' : '−'}{m.qty.toLocaleString('en-US')}
            </div>
            {canEdit && <DeleteButton label="movement" onConfirm={() => deleteMovement.mutate(m.id)} />}
          </div>
        ))}
      </div>
    </>
  );
}
