import type { Derived } from '../state/derive';
import { MUT_45, MUT_50, MUT_55 } from '../lib/colors';
import { Segmented } from './ui/Segmented';
import { SectionLabel } from './ui/SectionLabel';
import { Tag } from './ui/Tag';

export function HomeScreen({ d }: { d: Derived }) {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2 }}>
        <h3 style={{ margin: 0 }}>Today's overview</h3>
      </div>
      <div style={{ fontSize: 12, color: MUT_55, marginBottom: 12 }}>{d.roleScope} · Hello, {d.greet}</div>

      <Segmented
        name="rng"
        style={{ marginBottom: 16 }}
        options={[
          { label: 'Today', checked: d.rToday, onChange: d.setRangeToday },
          { label: 'This week', checked: d.rWiki, onChange: d.setRangeWiki },
          { label: 'This month', checked: d.rMwezi, onChange: d.setRangeMwezi },
        ]}
      />

      <button onClick={d.openEntry} className="btn btn-primary btn-block" style={{ margin: '0 0 14px' }}>+ Record a sale</button>

      {d.hasEntries && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Tag cls="tag-accent">{d.entriesCount} entries today</Tag>
          <span style={{ fontSize: 12, color: MUT_55 }}>posted +{d.entriesSum} to Today</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--color-divider)', border: '1px solid var(--color-divider)', marginBottom: 24 }}>
        {d.metrics.map((m, i) => (
          <div key={i} style={{ background: 'var(--color-bg)', padding: '13px 12px' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.09em', textTransform: 'uppercase', color: MUT_55 }}>{m.label}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 21, lineHeight: 1.05, marginTop: 6, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 10, color: MUT_45, marginTop: 3 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <SectionLabel>Sales by territory</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 26 }}>
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

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <SectionLabel margin="0">Top-selling products</SectionLabel>
      </div>
      <div style={{ borderTop: '2px solid var(--color-divider)', marginBottom: 26 }}>
        {d.topProducts.map((p) => (
          <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 2px', borderBottom: '1px solid var(--color-divider)' }}>
            <div style={{ flex: 1, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>{p.name}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14 }}>{p.value}</div>
            <div style={{ width: 44, textAlign: 'right', fontSize: 11, color: p.trendColor }}>{p.pct}</div>
          </div>
        ))}
      </div>

      <SectionLabel margin="0 0 8px">Top distributors</SectionLabel>
      <div style={{ borderTop: '2px solid var(--color-divider)', marginBottom: 26 }}>
        {d.topDistributors.map((dt) => (
          <div key={dt.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 2px', borderBottom: '1px solid var(--color-divider)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>{dt.name}</div>
              <div style={{ fontSize: 11, color: MUT_50 }}>{dt.region}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14 }}>{dt.value}</div>
            <div style={{ width: 44, textAlign: 'right', fontSize: 11, color: dt.trendColor }}>{dt.pct}</div>
          </div>
        ))}
      </div>

      <SectionLabel color="var(--color-accent)" margin="0 0 8px">Overdue customers</SectionLabel>
      <div style={{ borderTop: '2px solid var(--color-divider)', marginBottom: 8 }}>
        {d.overdue.map((o) => (
          <div key={o.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 2px', borderBottom: '1px solid var(--color-divider)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>{o.name}</div>
              <div style={{ fontSize: 11, color: MUT_50 }}>{o.dist}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14 }}>{o.amount}</div>
              <div style={{ fontSize: 11, color: 'var(--color-accent)' }}>{o.days} days overdue</div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={d.goExplore} className="btn btn-secondary btn-block" style={{ marginTop: 14 }}>
        Explore business → territory → distributor
      </button>
    </div>
  );
}
