import type { Derived } from '../../state/derive';
import { MUT_55 } from '../../lib/colors';
import { SectionLabel } from '../ui/SectionLabel';
import { TileGrid } from '../ui/TileGrid';
import { Tag } from '../ui/Tag';

export function FinanceModule({ d }: { d: Derived }) {
  return (
    <>
      <TileGrid tiles={d.finTiles} valueFontSize={19} />

      <SectionLabel>Revenue (6 months)</SectionLabel>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '8px 0 0', borderBottom: '2px solid var(--color-divider)', marginBottom: 6 }}>
        {d.finRev.map((b, idx) => (
          <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
            <div style={{ width: '100%', height: b.barW, background: 'var(--color-accent)' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {d.finRev.map((b, idx) => (
          <div key={idx} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: MUT_55 }}>{b.m}</div>
        ))}
      </div>

      <SectionLabel>Expense breakdown</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {d.finExp.map((e) => (
          <div key={e.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{e.name}</span>
              <span>{e.amt}</span>
            </div>
            <div style={{ height: 8, background: 'var(--color-surface)' }}>
              <div style={{ height: '100%', width: e.barW, background: 'var(--color-neutral-700)' }} />
            </div>
          </div>
        ))}
      </div>

      <SectionLabel margin="26px 0 8px">General ledger · double-entry (TSh)</SectionLabel>
      <table className="table">
        <thead>
          <tr><th>Date</th><th>Account</th><th style={{ textAlign: 'right' }}>Debit</th><th style={{ textAlign: 'right' }}>Credit</th></tr>
        </thead>
        <tbody>
          {d.journal.map((j, idx) => (
            <tr key={idx}>
              <td style={{ fontSize: 12, color: MUT_55, whiteSpace: 'nowrap' }}>{j.date}</td>
              <td style={{ fontWeight: 600 }}>{j.account}</td>
              <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{j.debit}</td>
              <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{j.credit}</td>
            </tr>
          ))}
          <tr style={{ borderTop: '2px solid var(--color-divider)' }}>
            <td></td>
            <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 12 }}>Total</td>
            <td style={{ textAlign: 'right', fontFamily: 'var(--font-heading)', fontWeight: 800, whiteSpace: 'nowrap' }}>{d.journalDebit}</td>
            <td style={{ textAlign: 'right', fontFamily: 'var(--font-heading)', fontWeight: 800, whiteSpace: 'nowrap' }}>{d.journalCredit}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 10 }}>
        <Tag cls="tag-accent">Debits = Credits · balanced</Tag>
      </div>
    </>
  );
}
