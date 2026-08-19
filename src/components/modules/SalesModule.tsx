import type { Derived } from '../../state/derive';
import { MUT_55 } from '../../lib/colors';
import { SectionLabel } from '../ui/SectionLabel';
import { TileGrid } from '../ui/TileGrid';

export function SalesModule({ d }: { d: Derived }) {
  return (
    <>
      <button onClick={d.openEntry} className="btn btn-primary btn-block" style={{ margin: '0 0 18px' }}>+ Record a sale</button>

      <TileGrid
        tiles={[
          { label: 'Sales today', value: d.salesTotal },
          { label: 'Order today', value: d.salesOrders },
        ]}
      />

      <SectionLabel>Sales by territory</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {d.areaBars.map((a) => (
          <div key={a.region}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{a.region}</span>
              <span>{a.value}</span>
            </div>
            <div style={{ height: 10, background: 'var(--color-surface)' }}>
              <div style={{ height: '100%', width: a.barW, background: 'var(--color-accent)' }} />
            </div>
          </div>
        ))}
      </div>

      <SectionLabel>Sales reps · targets</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {d.salesReps.map((r) => (
          <div key={r.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{r.name}</span>
              <span style={{ color: MUT_55 }}>{r.area} · {r.pct}</span>
            </div>
            <div style={{ height: 8, background: 'var(--color-surface)' }}>
              <div style={{ height: '100%', width: r.barW, background: 'var(--color-accent)' }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
