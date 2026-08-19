import { useState } from 'react';
import { MUT_50, MUT_55 } from '../lib/colors';
import { money } from '../lib/format';
import { useRecordSale, useSales } from '../state/queries';
import { ChevronLeftLgIcon } from './icons';
import { Segmented } from './ui/Segmented';
import { SectionLabel } from './ui/SectionLabel';
import { Tag } from './ui/Tag';

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export function EntryOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const recordSale = useRecordSale();
  const { data: sales } = useSales(15);

  const [product, setProduct] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [customer, setCustomer] = useState('');
  const [pay, setPay] = useState<'Cash' | 'Credit'>('Cash');
  const [terms, setTerms] = useState('10');

  if (!open) return null;

  const qtyN = parseFloat(qty) || 0;
  const priceN = parseFloat(price) || 0;
  const termsN = parseFloat(terms) || 0;
  const total = qtyN * priceN;
  const saveDisabled = !(product.trim() && customer.trim() && qtyN > 0 && priceN > 0 && (pay === 'Cash' || termsN > 0));

  function save() {
    recordSale.mutate(
      { customer: customer.trim(), pay, terms: pay === 'Credit' ? termsN : 0, items: [{ product: product.trim(), qty: qtyN, price: priceN }] },
      { onSuccess: () => { setQty(''); onClose(); } },
    );
  }

  const todaysSales = (sales ?? []).filter((s) => isToday(s.created_at));

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 16px 12px', borderBottom: '2px solid var(--color-divider)' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-accent)', display: 'flex' }}>
          <ChevronLeftLgIcon />
        </button>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17 }}>Record a sale</div>
          <div style={{ fontSize: 11, color: MUT_55 }}>Posts to Today, Credit &amp; the ledger</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Product</label>
          <input className="input" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g. Sunflower Oil 20L" />
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Quantity (units)</label>
            <input className="input" type="number" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Unit price (TSh)</label>
            <input className="input" type="number" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="field" style={{ marginBottom: 14 }}>
          <label>Customer / distributor</label>
          <input className="input" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Name" />
        </div>

        <div className="field" style={{ marginBottom: 6 }}>
          <label>Payment</label>
          <Segmented
            name="pay"
            options={[
              { label: 'Cash', checked: pay === 'Cash', onChange: () => setPay('Cash') },
              { label: 'Credit', checked: pay === 'Credit', onChange: () => setPay('Credit') },
            ]}
          />
        </div>

        {pay === 'Credit' && (
          <div className="field" style={{ marginTop: 12 }}>
            <label>Payment period (days)</label>
            <input className="input" type="number" inputMode="numeric" value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="e.g. 10" />
            <div style={{ fontSize: 11, color: MUT_55, marginTop: 4 }}>Due {termsN > 0 ? `in ${termsN} days` : 'on receipt'}</div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--color-divider)', borderBottom: '2px solid var(--color-divider)', padding: '14px 0', margin: '16px 0' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 12 }}>Order total</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24 }}>{money(total)}</span>
        </div>

        {recordSale.isError && (
          <div style={{ fontSize: 12, color: 'var(--color-accent)', marginBottom: 12 }}>Could not save — check the fields and try again.</div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button onClick={save} disabled={saveDisabled || recordSale.isPending} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
            {recordSale.isPending ? 'Saving…' : 'Save entry'}
          </button>
        </div>

        {todaysSales.length > 0 && (
          <>
            <SectionLabel margin="26px 0 6px">Recorded today</SectionLabel>
            <div style={{ borderTop: '2px solid var(--color-divider)' }}>
              {todaysSales.map((s) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 2px', borderBottom: '1px solid var(--color-divider)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13 }}>{s.customer}</div>
                    <div style={{ fontSize: 11, color: MUT_50 }}>{new Date(s.created_at).toLocaleTimeString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13 }}>{money(s.total)}</div>
                    <Tag cls={s.pay === 'Cash' ? 'tag-neutral' : 'tag-accent'}>{s.pay === 'Credit' ? `Credit · ${s.terms}d` : 'Cash'}</Tag>
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
