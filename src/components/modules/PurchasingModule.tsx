import type { Derived } from '../../state/derive';
import { MUT_50 } from '../../lib/colors';
import { SectionLabel } from '../ui/SectionLabel';
import { TileGrid } from '../ui/TileGrid';
import { Tag } from '../ui/Tag';

export function PurchasingModule({ d }: { d: Derived }) {
  return (
    <>
      <div style={{ border: '1px solid var(--color-divider)', background: 'var(--color-surface)', padding: 12, marginBottom: 22 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 10 }}>
          Record purchase
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Supplier</label>
            <input className="input" value={d.mrec.pur.supplier} onChange={(e) => d.purSupSet(e.target.value)} placeholder="Name" />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Item</label>
            <input className="input" value={d.mrec.pur.item} onChange={(e) => d.purItemSet(e.target.value)} placeholder="Sunflower seeds" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Qty (kg)</label>
            <input className="input" type="number" value={d.mrec.pur.qty} onChange={(e) => d.purQtySet(e.target.value)} placeholder="0" />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Price (TSh)</label>
            <input className="input" type="number" value={d.mrec.pur.price} onChange={(e) => d.purPriceSet(e.target.value)} placeholder="0" />
          </div>
        </div>
        <button onClick={d.savePur} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Save purchase</button>
      </div>

      <TileGrid tiles={d.purTiles} valueFontSize={18} />

      <SectionLabel margin="0 0 8px">Recent purchases</SectionLabel>
      <div style={{ borderTop: '2px solid var(--color-divider)' }}>
        {d.purList.map((p, idx) => (
          <div key={idx} style={{ padding: '12px 2px', borderBottom: '1px solid var(--color-divider)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>{p.supplier}</div>
                <div style={{ fontSize: 11, color: MUT_50 }}>{p.item} · {p.qty}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13 }}>{p.price}</div>
                <Tag cls={p.tag} style={{ marginTop: 3 }}>{p.status}</Tag>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
