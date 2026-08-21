import { useState } from 'react';
import { MUT_50, MUT_55 } from '../../lib/colors';
import { ArrowRightIcon } from '../icons';
import { useDeleteProductionBatch, useProductionBatches, useRecordBatch } from '../../state/queries';
import { useRole } from '../../state/role';
import { DeleteButton } from '../ui/DeleteButton';
import { SectionLabel } from '../ui/SectionLabel';

function yieldPct(seedKg: number, oilL: number): number {
  return seedKg > 0 ? (oilL * 0.92 / seedKg) * 100 : 0;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function ProductionModule() {
  const { data: batches } = useProductionBatches(20);
  const recordBatch = useRecordBatch();
  const deleteBatch = useDeleteProductionBatch();
  const { canEdit } = useRole();

  const [id, setId] = useState('');
  const [seed, setSeed] = useState('');
  const [oil, setOil] = useState('');

  function save() {
    const seedN = parseFloat(seed), oilN = parseFloat(oil);
    if (!id.trim() || !(seedN > 0) || !(oilN > 0)) return;
    recordBatch.mutate(
      { id: id.trim(), seed: seedN, oil: oilN },
      { onSuccess: () => { setId(''); setSeed(''); setOil(''); } },
    );
  }

  const list = batches ?? [];
  const todays = list.filter((b) => isToday(b.created_at));
  const seedToday = todays.reduce((a, b) => a + b.seed_kg, 0);
  const oilToday = todays.reduce((a, b) => a + b.oil_l, 0);
  const seedAll = list.reduce((a, b) => a + b.seed_kg, 0);
  const oilAll = list.reduce((a, b) => a + b.oil_l, 0);
  const overallYield = yieldPct(seedAll, oilAll);

  return (
    <>
      {canEdit && (
        <div style={{ border: '1px solid var(--color-divider)', background: 'var(--color-surface)', padding: 12, marginBottom: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 10 }}>
            Record batch
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Batch</label>
              <input className="input" value={id} onChange={(e) => setId(e.target.value)} placeholder="B-1" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Seed (kg)</label>
              <input className="input" type="number" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="0" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Oil (L)</label>
              <input className="input" type="number" value={oil} onChange={(e) => setOil(e.target.value)} placeholder="0" />
            </div>
          </div>
          <button onClick={save} disabled={!id.trim() || !(parseFloat(seed) > 0) || !(parseFloat(oil) > 0)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Save batch
          </button>
        </div>
      )}

      <SectionLabel>Today's flow</SectionLabel>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, marginBottom: 24 }}>
        <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', padding: 12 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: MUT_55 }}>Seeds</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, marginTop: 4 }}>{seedToday.toLocaleString('en-US')} kg</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-accent)' }}><ArrowRightIcon /></div>
        <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', padding: 12 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)' }}>Oil</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, marginTop: 4 }}>{oilToday.toLocaleString('en-US')} L</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--color-text)', color: 'var(--color-bg)', padding: '12px 14px', marginBottom: 22 }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 12 }}>Oil yield (overall)</span>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18 }}>{list.length ? Math.round(overallYield) + '%' : '—'}</span>
      </div>

      <SectionLabel margin="0 0 8px">Recent batches</SectionLabel>
      {list.length === 0 ? (
        <div style={{ fontSize: 13, color: MUT_50 }}>No batches recorded yet.</div>
      ) : (
        <table className="table">
          <thead><tr><th>Batch</th><th style={{ textAlign: 'right' }}>Seeds</th><th style={{ textAlign: 'right' }}>Oil</th><th style={{ textAlign: 'right' }}>%</th>{canEdit && <th></th>}</tr></thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600 }}>{b.batch_code}</td>
                <td style={{ textAlign: 'right' }}>{b.seed_kg.toLocaleString('en-US')} kg</td>
                <td style={{ textAlign: 'right' }}>{b.oil_l.toLocaleString('en-US')} L</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{Math.round(yieldPct(b.seed_kg, b.oil_l))}%</td>
                {canEdit && <td style={{ textAlign: 'right' }}><DeleteButton label="batch" onConfirm={() => deleteBatch.mutate(b.id)} /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
