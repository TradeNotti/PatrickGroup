import type { Derived } from '../../state/derive';
import { MUT_55 } from '../../lib/colors';
import { ArrowRightIcon } from '../icons';
import { SectionLabel } from '../ui/SectionLabel';

export function ProductionModule({ d }: { d: Derived }) {
  return (
    <>
      <div style={{ border: '1px solid var(--color-divider)', background: 'var(--color-surface)', padding: 12, marginBottom: 22 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 10 }}>
          Record batch
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Batch</label>
            <input className="input" value={d.mrec.prod.id} onChange={(e) => d.prodIdSet(e.target.value)} placeholder="B-78" />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Seed (kg)</label>
            <input className="input" type="number" value={d.mrec.prod.seed} onChange={(e) => d.prodSeedSet(e.target.value)} placeholder="0" />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Oil (L)</label>
            <input className="input" type="number" value={d.mrec.prod.oil} onChange={(e) => d.prodOilSet(e.target.value)} placeholder="0" />
          </div>
        </div>
        <button onClick={d.saveProd} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Save batch</button>
      </div>

      <SectionLabel>Today's flow</SectionLabel>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, marginBottom: 24 }}>
        <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', padding: 12 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: MUT_55 }}>Seeds</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, marginTop: 4 }}>9,600 kg</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-accent)' }}><ArrowRightIcon /></div>
        <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', padding: 12 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)' }}>Oil</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, marginTop: 4 }}>6,200 L</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-accent)' }}><ArrowRightIcon /></div>
        <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', padding: 12 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: MUT_55 }}>Seed cake</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, marginTop: 4 }}>3,100 kg</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--color-text)', color: 'var(--color-bg)', padding: '12px 14px', marginBottom: 22 }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 12 }}>Oil yield</span>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18 }}>34%</span>
      </div>

      <SectionLabel margin="0 0 8px">Recent batches</SectionLabel>
      <table className="table">
        <thead>
          <tr><th>Batch</th><th style={{ textAlign: 'right' }}>Seeds</th><th style={{ textAlign: 'right' }}>Oil</th><th style={{ textAlign: 'right' }}>%</th></tr>
        </thead>
        <tbody>
          {d.prodBatches.map((b, idx) => (
            <tr key={idx}>
              <td style={{ fontWeight: 600 }}>{b.id}</td>
              <td style={{ textAlign: 'right' }}>{b.seed}</td>
              <td style={{ textAlign: 'right' }}>{b.oil}</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{b.yield}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
