import { useState } from 'react';
import { MUT_50 } from '../../lib/colors';
import { useDeliveries, useRecordDelivery } from '../../state/queries';
import { SectionLabel } from '../ui/SectionLabel';
import { TileGrid } from '../ui/TileGrid';
import { Tag } from '../ui/Tag';

const STATUS_TAG: Record<string, string> = { Delivered: 'tag-neutral', 'In transit': 'tag-accent', Loading: 'tag-outline' };

export function DistributionModule() {
  const { data: deliveries } = useDeliveries();
  const recordDelivery = useRecordDelivery();

  const [route, setRoute] = useState('');
  const [driver, setDriver] = useState('');
  const [status, setStatus] = useState('In transit');

  function save() {
    if (!route.trim() || !driver.trim()) return;
    recordDelivery.mutate(
      { route: route.trim(), driver: driver.trim(), status },
      { onSuccess: () => { setRoute(''); setDriver(''); setStatus('In transit'); } },
    );
  }

  const list = deliveries ?? [];
  const tiles = [
    { label: 'Deliveries', value: String(list.length) },
    { label: 'In transit', value: String(list.filter((d) => d.status === 'In transit').length) },
    { label: 'Delivered', value: String(list.filter((d) => d.status === 'Delivered').length) },
    { label: 'Loading', value: String(list.filter((d) => d.status === 'Loading').length) },
  ];

  return (
    <>
      <div style={{ border: '1px solid var(--color-divider)', background: 'var(--color-surface)', padding: 12, marginBottom: 22 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 10 }}>
          Record delivery
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Route</label>
            <input className="input" value={route} onChange={(e) => setRoute(e.target.value)} placeholder="e.g. Dar — Central" />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Driver</label>
            <input className="input" value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="Name" />
          </div>
        </div>
        <div className="field" style={{ marginBottom: 10 }}>
          <label>Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>In transit</option>
            <option>Delivered</option>
            <option>Loading</option>
          </select>
        </div>
        <button onClick={save} disabled={!route.trim() || !driver.trim()} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Save delivery
        </button>
      </div>

      <TileGrid tiles={tiles} />

      <SectionLabel margin="0 0 8px">Routes</SectionLabel>
      <div style={{ borderTop: '2px solid var(--color-divider)' }}>
        {list.length === 0 && <div style={{ padding: '14px 2px', fontSize: 13, color: MUT_50 }}>No deliveries recorded yet.</div>}
        {list.map((d) => (
          <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 2px', borderBottom: '1px solid var(--color-divider)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>{d.route}</div>
              <div style={{ fontSize: 11, color: MUT_50 }}>{d.driver} · {new Date(d.created_at).toLocaleDateString()}</div>
            </div>
            <Tag cls={STATUS_TAG[d.status] || 'tag-neutral'}>{d.status}</Tag>
          </div>
        ))}
      </div>
    </>
  );
}
