import { MUT_45, MUT_50, MUT_55 } from '../lib/colors';
import { litres, money, moneyM } from '../lib/format';
import { useDashboard } from '../state/queries';
import { useRole } from '../state/role';
import { Segmented } from './ui/Segmented';
import { SectionLabel } from './ui/SectionLabel';
import type { Range } from '../types';

interface Props {
  range: Range;
  setRange: (r: Range) => void;
  onOpenEntry: () => void;
}

export function HomeScreen({ range, setRange, onOpenEntry }: Props) {
  const { data, isLoading } = useDashboard(range);
  const { canEdit } = useRole();

  const metrics = data
    ? [
        { label: 'Sales', value: money(data.sales), sub: 'TSh', color: 'inherit' },
        { label: 'Orders', value: String(data.orders), sub: 'orders', color: 'inherit' },
        { label: 'Collections', value: money(data.collections), sub: 'TSh', color: 'inherit' },
        { label: 'Outstanding credit', value: money(data.outstandingCredit), sub: 'TSh', color: 'var(--color-accent)' },
        { label: 'Stock (oil)', value: litres(data.stockLitres), sub: 'litres', color: 'inherit' },
        { label: 'Production', value: litres(data.productionLitres), sub: 'litres', color: 'inherit' },
        { label: 'Oil margin', value: Math.round(data.oilMargin) + '%', sub: '%', color: 'inherit' },
        { label: 'Cash position', value: money(data.cashPosition), sub: 'TSh', color: 'inherit' },
      ]
    : [];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2 }}>
        <h3 style={{ margin: 0 }}>Today's overview</h3>
      </div>
      <div style={{ fontSize: 12, color: MUT_55, marginBottom: 12 }}>Patrick Group</div>

      <Segmented
        name="rng"
        style={{ marginBottom: 16 }}
        options={[
          { label: 'Today', checked: range === 'today', onChange: () => setRange('today') },
          { label: 'This week', checked: range === 'week', onChange: () => setRange('week') },
          { label: 'This month', checked: range === 'month', onChange: () => setRange('month') },
        ]}
      />

      {canEdit && (
        <button onClick={onOpenEntry} className="btn btn-primary btn-block" style={{ margin: '0 0 14px' }}>+ Record a sale</button>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--color-divider)', border: '1px solid var(--color-divider)', marginBottom: 24 }}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ background: 'var(--color-bg)', padding: '13px 12px', minHeight: 62 }} />)
          : metrics.map((m, i) => (
              <div key={i} style={{ background: 'var(--color-bg)', padding: '13px 12px' }}>
                <div style={{ fontSize: 10, letterSpacing: '0.09em', textTransform: 'uppercase', color: MUT_55 }}>{m.label}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 21, lineHeight: 1.05, marginTop: 6, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 10, color: MUT_45, marginTop: 3 }}>{m.sub}</div>
              </div>
            ))}
      </div>

      <SectionLabel>Top-selling products</SectionLabel>
      <div style={{ borderTop: '2px solid var(--color-divider)', marginBottom: 26 }}>
        {data && data.topProducts.length === 0 && (
          <div style={{ padding: '14px 2px', fontSize: 13, color: MUT_50 }}>No sales recorded yet for this range.</div>
        )}
        {data?.topProducts.map((p) => (
          <div key={p.product} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 2px', borderBottom: '1px solid var(--color-divider)' }}>
            <div style={{ flex: 1, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>{p.product}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14 }}>{moneyM(p.value)}</div>
          </div>
        ))}
      </div>

      <SectionLabel>Top distributors</SectionLabel>
      <div style={{ borderTop: '2px solid var(--color-divider)', marginBottom: 26 }}>
        {data && data.topDistributors.length === 0 && (
          <div style={{ padding: '14px 2px', fontSize: 13, color: MUT_50 }}>No sales tagged to a distributor yet for this range.</div>
        )}
        {data?.topDistributors.map((d) => (
          <div key={d.distributor} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 2px', borderBottom: '1px solid var(--color-divider)' }}>
            <div style={{ flex: 1, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>{d.distributor}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14 }}>{moneyM(d.value)}</div>
          </div>
        ))}
      </div>

      <SectionLabel color="var(--color-accent)" margin="0 0 8px">Overdue customers</SectionLabel>
      <div style={{ borderTop: '2px solid var(--color-divider)', marginBottom: 8 }}>
        {data && data.overdue.length === 0 && (
          <div style={{ padding: '14px 2px', fontSize: 13, color: MUT_50 }}>Nothing overdue.</div>
        )}
        {data?.overdue.map((o) => (
          <div key={o.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 2px', borderBottom: '1px solid var(--color-divider)' }}>
            <div style={{ flex: 1, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>{o.name}</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14 }}>{moneyM(o.amount)}</div>
              <div style={{ fontSize: 11, color: 'var(--color-accent)' }}>{o.days} days overdue</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
