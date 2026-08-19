import type { Derived } from '../../state/derive';
import { MUT_50 } from '../../lib/colors';
import { SectionLabel } from '../ui/SectionLabel';
import { Segmented } from '../ui/Segmented';
import { Tag } from '../ui/Tag';

export function InventoryModule({ d }: { d: Derived }) {
  return (
    <>
      <div style={{ border: '1px solid var(--color-divider)', background: 'var(--color-surface)', padding: 12, marginBottom: 22 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 10 }}>
          Record stock movement
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div className="field" style={{ flex: 2 }}>
            <label>Item</label>
            <input className="input" value={d.mrec.inv.item} onChange={(e) => d.invItemSet(e.target.value)} placeholder="e.g. Oil 20L" />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Qty</label>
            <input className="input" type="number" value={d.mrec.inv.qty} onChange={(e) => d.invQtySet(e.target.value)} placeholder="0" />
          </div>
        </div>
        <Segmented
          name="invdir"
          style={{ marginBottom: 10 }}
          options={[
            { label: 'In', checked: d.invDirInChk, onChange: d.invDirIn },
            { label: 'Out', checked: d.invDirOutChk, onChange: d.invDirOut },
          ]}
        />
        <button onClick={d.saveInv} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Save movement</button>
      </div>

      <SectionLabel margin="0 0 8px">Stock on hand</SectionLabel>
      <table className="table" style={{ marginBottom: 24 }}>
        <tbody>
          {d.invItems.map((i) => (
            <tr key={i.name}>
              <td style={{ fontWeight: 600 }}>{i.name}</td>
              <td style={{ textAlign: 'right' }}>{i.qty}</td>
              <td style={{ textAlign: 'right', width: 64 }}><Tag cls={i.tagCls}>{i.tag}</Tag></td>
            </tr>
          ))}
        </tbody>
      </table>

      <SectionLabel margin="0 0 8px">Stock movements</SectionLabel>
      <div style={{ borderTop: '2px solid var(--color-divider)' }}>
        {d.invMoves.map((m, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 2px', borderBottom: '1px solid var(--color-divider)' }}>
            <Tag cls={m.dirCls} style={{ width: 52, justifyContent: 'center' }}>{m.dir}</Tag>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13 }}>{m.item}</div>
              <div style={{ fontSize: 11, color: MUT_50 }}>{m.ref} · {m.time}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13 }}>{m.qty}</div>
          </div>
        ))}
      </div>
    </>
  );
}
