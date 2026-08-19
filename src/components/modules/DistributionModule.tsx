import type { Derived } from '../../state/derive';
import { MUT_50 } from '../../lib/colors';
import { SectionLabel } from '../ui/SectionLabel';
import { TileGrid } from '../ui/TileGrid';
import { Tag } from '../ui/Tag';

export function DistributionModule({ d }: { d: Derived }) {
  return (
    <>
      <div style={{ border: '1px solid var(--color-divider)', background: 'var(--color-surface)', padding: 12, marginBottom: 22 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 10 }}>
          Record delivery
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Route</label>
            <input className="input" value={d.mrec.dist.route} onChange={(e) => d.distRouteSet(e.target.value)} placeholder="Dar — Central" />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Driver</label>
            <input className="input" value={d.mrec.dist.driver} onChange={(e) => d.distDriverSet(e.target.value)} placeholder="Name" />
          </div>
        </div>
        <div className="field" style={{ marginBottom: 10 }}>
          <label>Status</label>
          <select className="input" value={d.mrec.dist.status} onChange={(e) => d.distStatus(e.target.value)}>
            <option>In transit</option>
            <option>Delivered</option>
            <option>Loading</option>
          </select>
        </div>
        <button onClick={d.saveDist} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Save delivery</button>
      </div>

      <TileGrid tiles={d.distTiles} />

      <SectionLabel margin="0 0 8px">Today's routes</SectionLabel>
      <div style={{ borderTop: '2px solid var(--color-divider)' }}>
        {d.distList.map((r, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 2px', borderBottom: '1px solid var(--color-divider)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>{r.route}</div>
              <div style={{ fontSize: 11, color: MUT_50 }}>{r.driver} · {r.stops}</div>
            </div>
            <Tag cls={r.tag}>{r.status}</Tag>
          </div>
        ))}
      </div>
    </>
  );
}
