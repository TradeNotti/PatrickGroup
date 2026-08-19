import { MUT_50, MUT_55 } from '../../lib/colors';
import { money, moneyM } from '../../lib/format';
import { useFinanceSummary, useLedger } from '../../state/queries';
import { SectionLabel } from '../ui/SectionLabel';
import { TileGrid } from '../ui/TileGrid';
import { Tag } from '../ui/Tag';

export function FinanceModule() {
  const { data: summary } = useFinanceSummary();
  const { data: ledger } = useLedger();

  const maxRevenue = summary ? Math.max(1, ...summary.monthlyRevenue.map((m) => m.revenue)) : 1;
  const balanced = ledger ? Math.abs(ledger.totalDebit - ledger.totalCredit) < 0.01 : true;

  return (
    <>
      <TileGrid
        valueFontSize={19}
        tiles={summary ? [
          { label: 'Revenue (month)', value: moneyM(summary.revenue) },
          { label: 'Gross margin', value: Math.round(summary.grossMarginPct) + '%' },
          { label: 'Expenses (month)', value: moneyM(summary.expenses) },
          { label: 'Receivables', value: moneyM(summary.receivables) },
          { label: 'Cash position', value: moneyM(summary.cashPosition) },
          { label: 'Net profit', value: moneyM(summary.netProfit) },
        ] : []}
      />

      <SectionLabel>Revenue by month</SectionLabel>
      {summary && summary.monthlyRevenue.length === 0 ? (
        <div style={{ fontSize: 13, color: MUT_50, marginBottom: 24 }}>No sales recorded yet.</div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '8px 0 0', borderBottom: '2px solid var(--color-divider)', marginBottom: 6 }}>
            {summary?.monthlyRevenue.map((b, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                <div style={{ width: '100%', height: `${Math.max(4, (b.revenue / maxRevenue) * 100)}%`, background: 'var(--color-accent)' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {summary?.monthlyRevenue.map((b, idx) => (
              <div key={idx} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: MUT_55 }}>{b.m}</div>
            ))}
          </div>
        </>
      )}

      <SectionLabel margin="0 0 8px">General ledger · double-entry (TSh)</SectionLabel>
      {ledger && ledger.entries.length === 0 ? (
        <div style={{ fontSize: 13, color: MUT_50 }}>No ledger entries yet — record a sale, purchase, or payment.</div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Account</th><th style={{ textAlign: 'right' }}>Debit</th><th style={{ textAlign: 'right' }}>Credit</th></tr>
            </thead>
            <tbody>
              {ledger?.entries.map((j) => (
                <tr key={j.id}>
                  <td style={{ fontSize: 12, color: MUT_55, whiteSpace: 'nowrap' }}>{new Date(j.entry_date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 600 }}>{j.account}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{j.debit ? money(j.debit) : '—'}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{j.credit ? money(j.credit) : '—'}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid var(--color-divider)' }}>
                <td></td>
                <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 12 }}>Total</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-heading)', fontWeight: 800, whiteSpace: 'nowrap' }}>{money(ledger?.totalDebit ?? 0)}</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-heading)', fontWeight: 800, whiteSpace: 'nowrap' }}>{money(ledger?.totalCredit ?? 0)}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 10 }}>
            <Tag cls={balanced ? 'tag-accent' : 'tag-outline'}>{balanced ? 'Debits = Credits · balanced' : 'Ledger out of balance'}</Tag>
          </div>
        </>
      )}
    </>
  );
}
