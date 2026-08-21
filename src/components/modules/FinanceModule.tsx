import { useState } from 'react';
import { MUT_50, MUT_55 } from '../../lib/colors';
import { money, moneyM, todayStr } from '../../lib/format';
import { useDeleteLedgerEntry, useFinanceSummary, useLedger, useRecordLedgerEntry } from '../../state/queries';
import { useRole } from '../../state/role';
import { DeleteButton } from '../ui/DeleteButton';
import { SectionLabel } from '../ui/SectionLabel';
import { TileGrid } from '../ui/TileGrid';
import { Tag } from '../ui/Tag';

export function FinanceModule() {
  const { data: summary } = useFinanceSummary();
  const { data: ledger } = useLedger();
  const recordEntry = useRecordLedgerEntry();
  const deleteEntry = useDeleteLedgerEntry();
  const { canEdit } = useRole();

  const [debitAccount, setDebitAccount] = useState('');
  const [creditAccount, setCreditAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState(todayStr());

  const maxRevenue = summary ? Math.max(1, ...summary.monthlyRevenue.map((m) => m.revenue)) : 1;
  const balanced = ledger ? Math.abs(ledger.totalDebit - ledger.totalCredit) < 0.01 : true;
  const amountN = parseFloat(amount) || 0;
  const canSave = debitAccount.trim() && creditAccount.trim() && amountN > 0 && date;

  function save() {
    if (!canSave) return;
    recordEntry.mutate(
      { debitAccount: debitAccount.trim(), creditAccount: creditAccount.trim(), amount: amountN, memo: memo.trim() || undefined, date },
      { onSuccess: () => { setDebitAccount(''); setCreditAccount(''); setAmount(''); setMemo(''); setDate(todayStr()); } },
    );
  }

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

      {canEdit && (
        <div style={{ border: '1px solid var(--color-divider)', background: 'var(--color-surface)', padding: 12, marginBottom: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 10 }}>
            Record ledger entry
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Debit account</label>
              <input className="input" value={debitAccount} onChange={(e) => setDebitAccount(e.target.value)} placeholder="e.g. Utilities expense" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Credit account</label>
              <input className="input" value={creditAccount} onChange={(e) => setCreditAccount(e.target.value)} placeholder="e.g. Cash" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Amount (TSh)</label>
              <input className="input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Date</label>
              <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="field" style={{ marginBottom: 10 }}>
            <label>Memo</label>
            <input className="input" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Optional" />
          </div>
          <button onClick={save} disabled={!canSave} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Save entry
          </button>
        </div>
      )}

      <SectionLabel margin="0 0 8px">General ledger · double-entry (TSh)</SectionLabel>
      {ledger && ledger.entries.length === 0 ? (
        <div style={{ fontSize: 13, color: MUT_50 }}>No ledger entries yet — record a sale, purchase, payment, or an entry above.</div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Account</th><th style={{ textAlign: 'right' }}>Debit</th><th style={{ textAlign: 'right' }}>Credit</th>{canEdit && <th></th>}</tr>
            </thead>
            <tbody>
              {ledger?.entries.map((j) => (
                <tr key={j.id}>
                  <td style={{ fontSize: 12, color: MUT_55, whiteSpace: 'nowrap' }}>{new Date(j.entry_date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 600 }}>{j.account}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{j.debit ? money(j.debit) : '—'}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{j.credit ? money(j.credit) : '—'}</td>
                  {canEdit && <td style={{ textAlign: 'right' }}><DeleteButton label="ledger entry" onConfirm={() => deleteEntry.mutate(j.id)} /></td>}
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid var(--color-divider)' }}>
                <td></td>
                <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 12 }}>Total</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-heading)', fontWeight: 800, whiteSpace: 'nowrap' }}>{money(ledger?.totalDebit ?? 0)}</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-heading)', fontWeight: 800, whiteSpace: 'nowrap' }}>{money(ledger?.totalCredit ?? 0)}</td>
                {canEdit && <td></td>}
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
