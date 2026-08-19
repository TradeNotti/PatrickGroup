import type { Derived } from '../state/derive';
import { MUT_50, MUT_55 } from '../lib/colors';
import { SearchInput } from './ui/SearchInput';
import { TileGrid } from './ui/TileGrid';
import { Tag } from './ui/Tag';

export function CreditScreen({ d }: { d: Derived }) {
  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ margin: '0 0 2px' }}>Credit</h3>
      <div style={{ fontSize: 12, color: MUT_55, marginBottom: 14 }}>Credit terms: {d.creditTermDays} days</div>

      <TileGrid tiles={d.creditTiles} marginBottom={20} />

      <div style={{ marginBottom: 8 }}>
        <SearchInput value={d.q} onChange={d.setQ} placeholder="Search customer..." />
      </div>

      <div style={{ borderTop: '2px solid var(--color-divider)' }}>
        {d.creditList.map((c) => (
          <div key={c.name} style={{ padding: '12px 2px', borderBottom: '1px solid var(--color-divider)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: MUT_50 }}>{c.dist}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14 }}>{c.balance}</div>
                <Tag cls={c.statusTag} style={{ marginTop: 3 }}>{c.statusLabel}</Tag>
              </div>
            </div>
            {c.overdue && (
              <button onClick={c.onPay} className="btn btn-primary" style={{ marginTop: 9, padding: '6px 12px', fontSize: 12 }}>
                Record payment
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
