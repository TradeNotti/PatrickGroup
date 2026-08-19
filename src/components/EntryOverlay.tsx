import type { Derived } from '../state/derive';
import { MUT_50, MUT_55 } from '../lib/colors';
import { CUSTOMERS, PRODUCTS } from '../data/static';
import { ChevronLeftLgIcon } from './icons';
import { Segmented } from './ui/Segmented';
import { SectionLabel } from './ui/SectionLabel';
import { Tag } from './ui/Tag';

export function EntryOverlay({ d }: { d: Derived }) {
  if (!d.showEntry) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 16px 12px', borderBottom: '2px solid var(--color-divider)' }}>
        <button onClick={d.closeEntry} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-accent)', display: 'flex' }}>
          <ChevronLeftLgIcon />
        </button>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17 }}>Record a sale</div>
          <div style={{ fontSize: 11, color: MUT_55 }}>Type the numbers — they post to Today, Credit &amp; the ledger</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Product</label>
          <select className="input" value={d.form.product} onChange={(e) => d.setProduct(e.target.value)}>
            {PRODUCTS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Quantity (units)</label>
            <input className="input" type="number" inputMode="numeric" value={d.form.qty} onChange={(e) => d.setQty(e.target.value)} placeholder="0" />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Unit price (TSh)</label>
            <input className="input" type="number" inputMode="numeric" value={d.form.price} onChange={(e) => d.setPrice(e.target.value)} />
          </div>
        </div>

        <div className="field" style={{ marginBottom: 14 }}>
          <label>Customer / distributor</label>
          <select className="input" value={d.form.customer} onChange={(e) => d.setCustomer(e.target.value)}>
            {CUSTOMERS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="field" style={{ marginBottom: 6 }}>
          <label>Payment</label>
          <Segmented
            name="pay"
            options={[
              { label: 'Cash', checked: d.payCash, onChange: d.setPayCash },
              { label: 'Credit', checked: d.payCredit, onChange: d.setPayCredit },
            ]}
          />
        </div>

        {d.payCredit && (
          <div className="field" style={{ marginTop: 12 }}>
            <label>Payment period (days)</label>
            <input className="input" type="number" inputMode="numeric" value={d.form.terms} onChange={(e) => d.setTerms(e.target.value)} placeholder="e.g. 10" />
            <div style={{ fontSize: 11, color: MUT_55, marginTop: 4 }}>Due {d.formDueLabel}</div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--color-divider)', borderBottom: '2px solid var(--color-divider)', padding: '14px 0', margin: '16px 0' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 12 }}>Order total</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24 }}>{d.formEntryTotal}</span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={d.closeEntry} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button onClick={d.saveEntry} disabled={d.saveDisabled} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>Save entry</button>
        </div>

        {d.hasEntries && (
          <>
            <SectionLabel margin="26px 0 6px">Recorded today</SectionLabel>
            <div style={{ borderTop: '2px solid var(--color-divider)' }}>
              {d.recentEntries.map((r, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 2px', borderBottom: '1px solid var(--color-divider)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13 }}>{r.product} × {r.qty}</div>
                    <div style={{ fontSize: 11, color: MUT_50 }}>{r.customer}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13 }}>{r.total}</div>
                    <Tag cls={r.tag}>{r.pay}</Tag>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
