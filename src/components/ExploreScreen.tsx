import type { Derived } from '../state/derive';
import { MUT_35, MUT_50 } from '../lib/colors';
import { ChevronRightIcon } from './icons';
import { SearchInput } from './ui/SearchInput';
import { SectionLabel } from './ui/SectionLabel';
import { Tag } from './ui/Tag';

export function ExploreScreen({ d }: { d: Derived }) {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px 4px', marginBottom: 12 }}>
        {d.crumbs.map((c, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={c.onClick}
              style={{ background: 'none', border: 'none', padding: '2px 0', cursor: 'pointer', fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontWeight: 600, color: c.color }}
            >
              {c.name}
            </button>
            <span style={{ fontSize: 11, color: MUT_35 }}>{c.sep}</span>
          </span>
        ))}
      </div>

      {d.notOrder && (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, borderBottom: '2px solid var(--color-divider)', paddingBottom: 12, marginBottom: 4 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{d.drillType}</div>
              <h3 style={{ margin: '4px 0 0', overflowWrap: 'anywhere' }}>{d.drillTitle}</h3>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUT_50 }}>Sales (month)</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20 }}>{d.drillValue}</div>
            </div>
          </div>
          <SectionLabel color={MUT_50} margin="16px 0 6px">{d.drillChildType}</SectionLabel>
          <div style={{ marginBottom: 6 }}>
            <SearchInput value={d.q} onChange={d.setQ} placeholder="Search..." />
          </div>
          <div style={{ borderTop: '2px solid var(--color-divider)' }}>
            {d.drillRows.map((row) => (
              <button
                key={row.name}
                onClick={row.onOpen}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 2px', background: 'none', border: 'none', borderBottom: '1px solid var(--color-divider)', cursor: 'pointer', textAlign: 'left', color: 'inherit' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>{row.name}</div>
                  <div style={{ fontSize: 11, color: MUT_50, marginTop: 2 }}>{row.sub}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap' }}>{row.value}</div>
                <ChevronRightIcon color={MUT_35} />
              </button>
            ))}
          </div>
        </>
      )}

      {d.isOrder && d.order && (
        <>
          <div style={{ borderBottom: '2px solid var(--color-divider)', paddingBottom: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>Order</div>
              <Tag cls={d.order.statusTag}>{d.order.status}</Tag>
            </div>
            <h3 style={{ margin: '4px 0 0' }}>{d.order.name}</h3>
            <div style={{ fontSize: 11, color: MUT_50, marginTop: 4 }}>{d.order.where}</div>
            <div style={{ fontSize: 11, color: MUT_50 }}>{d.order.date}</div>
          </div>
          <table className="table" style={{ marginBottom: 14 }}>
            <thead>
              <tr><th>Product</th><th style={{ textAlign: 'right' }}>Qty</th><th style={{ textAlign: 'right' }}>Total</th></tr>
            </thead>
            <tbody>
              {d.order.items.map((it, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{it.name}</div>
                    <div style={{ fontSize: 11, color: MUT_50 }}>{it.unit} / unit</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>{it.qty}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{it.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--color-divider)', paddingTop: 12 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Order total</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22 }}>{d.order.total}</span>
          </div>
        </>
      )}
    </div>
  );
}
