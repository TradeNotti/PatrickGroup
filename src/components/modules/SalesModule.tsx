import { MUT_50 } from '../../lib/colors';
import { money } from '../../lib/format';
import { useDashboard, useSales } from '../../state/queries';
import { useRole } from '../../state/role';
import { SectionLabel } from '../ui/SectionLabel';
import { TileGrid } from '../ui/TileGrid';
import { Tag } from '../ui/Tag';

export function SalesModule({ onOpenEntry }: { onOpenEntry: () => void }) {
  const { data: today } = useDashboard('today');
  const { data: orders } = useSales(15);
  const { canEdit } = useRole();

  return (
    <>
      {canEdit && (
        <button onClick={onOpenEntry} className="btn btn-primary btn-block" style={{ margin: '0 0 18px' }}>+ Record a sale</button>
      )}

      <TileGrid
        tiles={[
          { label: 'Sales today', value: today ? money(today.sales) : '—' },
          { label: 'Orders today', value: today ? String(today.orders) : '—' },
        ]}
      />

      <SectionLabel margin="0 0 8px">Recent orders</SectionLabel>
      <div style={{ borderTop: '2px solid var(--color-divider)' }}>
        {orders && orders.length === 0 && (
          <div style={{ padding: '14px 2px', fontSize: 13, color: MUT_50 }}>No sales recorded yet.</div>
        )}
        {orders?.map((o) => (
          <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 2px', borderBottom: '1px solid var(--color-divider)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>{o.customer}</div>
              <div style={{ fontSize: 11, color: MUT_50 }}>
                {o.distributor ? `${o.distributor} · ` : ''}{new Date(o.created_at).toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13 }}>{money(o.total)}</div>
              <Tag cls={o.pay === 'Cash' ? 'tag-neutral' : 'tag-accent'} style={{ marginTop: 3 }}>
                {o.pay === 'Credit' ? `Credit · ${o.terms}d` : 'Cash'}
              </Tag>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
