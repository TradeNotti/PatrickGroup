import { useState } from 'react';
import { MUT_50, MUT_55 } from '../../lib/colors';
import { useAddDistributor, useDeliveries, useDistributors, useRecordDelivery } from '../../state/queries';
import { ChevronLeftIcon, ChevronRightLgIcon } from '../icons';
import { SectionLabel } from '../ui/SectionLabel';
import { TileGrid } from '../ui/TileGrid';
import { Tag } from '../ui/Tag';
import type { Distributor } from '../../types';

const STATUS_TAG: Record<string, string> = { Delivered: 'tag-neutral', 'In transit': 'tag-accent', Loading: 'tag-outline' };

function DeliveryForm({ distributorId, onSaved }: { distributorId?: number; onSaved?: () => void }) {
  const recordDelivery = useRecordDelivery();
  const [route, setRoute] = useState('');
  const [driver, setDriver] = useState('');
  const [status, setStatus] = useState('In transit');

  function save() {
    if (!route.trim() || !driver.trim()) return;
    recordDelivery.mutate(
      { distributorId, route: route.trim(), driver: driver.trim(), status },
      { onSuccess: () => { setRoute(''); setDriver(''); setStatus('In transit'); onSaved?.(); } },
    );
  }

  return (
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
  );
}

function DeliveryList({ distributorId }: { distributorId?: number }) {
  const { data: deliveries } = useDeliveries(distributorId);
  const list = deliveries ?? [];
  return (
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
  );
}

function DistributorDetail({ distributor, onBack }: { distributor: Distributor; onBack: () => void }) {
  return (
    <>
      <button
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', padding: '0 0 12px', cursor: 'pointer', color: 'var(--color-accent)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}
      >
        <ChevronLeftIcon />Distributors
      </button>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18 }}>{distributor.name}</div>
        <div style={{ fontSize: 12, color: MUT_55, marginTop: 2 }}>
          {[distributor.territory, distributor.phone].filter(Boolean).join(' · ') || 'No territory or phone on file'}
        </div>
      </div>
      <DeliveryForm distributorId={distributor.id} />
      <SectionLabel margin="0 0 8px">Records</SectionLabel>
      <DeliveryList distributorId={distributor.id} />
    </>
  );
}

export function DistributionModule() {
  const { data: distributors } = useDistributors();
  const { data: allDeliveries } = useDeliveries();
  const addDistributor = useAddDistributor();
  const [selected, setSelected] = useState<Distributor | null>(null);

  const [name, setName] = useState('');
  const [territory, setTerritory] = useState('');
  const [phone, setPhone] = useState('');

  function saveDistributor() {
    if (!name.trim()) return;
    addDistributor.mutate(
      { name: name.trim(), territory: territory.trim() || undefined, phone: phone.trim() || undefined },
      { onSuccess: () => { setName(''); setTerritory(''); setPhone(''); } },
    );
  }

  if (selected) {
    return <DistributorDetail distributor={selected} onBack={() => setSelected(null)} />;
  }

  const distList = distributors ?? [];
  const deliveries = allDeliveries ?? [];
  const tiles = [
    { label: 'Distributors', value: String(distList.length) },
    { label: 'Deliveries', value: String(deliveries.length) },
    { label: 'In transit', value: String(deliveries.filter((d) => d.status === 'In transit').length) },
    { label: 'Delivered', value: String(deliveries.filter((d) => d.status === 'Delivered').length) },
  ];

  return (
    <>
      <div style={{ border: '1px solid var(--color-divider)', background: 'var(--color-surface)', padding: 12, marginBottom: 22 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 10 }}>
          Add distributor
        </div>
        <div className="field" style={{ marginBottom: 10 }}>
          <label>Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kariakoo Bulk Traders" />
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Territory</label>
            <input className="input" value={territory} onChange={(e) => setTerritory(e.target.value)} placeholder="Optional" />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Phone</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <button onClick={saveDistributor} disabled={!name.trim()} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Save distributor
        </button>
      </div>

      <TileGrid tiles={tiles} />

      <SectionLabel margin="0 0 8px">Distributors</SectionLabel>
      <div style={{ borderTop: '2px solid var(--color-divider)', marginBottom: 24 }}>
        {distList.length === 0 && <div style={{ padding: '14px 2px', fontSize: 13, color: MUT_50 }}>No distributors added yet.</div>}
        {distList.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelected(d)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 2px', background: 'none', border: 'none', borderBottom: '1px solid var(--color-divider)', cursor: 'pointer', textAlign: 'left', color: 'inherit' }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>{d.name}</div>
              <div style={{ fontSize: 11, color: MUT_50, marginTop: 2 }}>
                {d.territory ? `${d.territory} · ` : ''}{d.delivery_count} record{d.delivery_count === 1 ? '' : 's'}
              </div>
            </div>
            <ChevronRightLgIcon />
          </button>
        ))}
      </div>

      <SectionLabel margin="0 0 8px">Recent deliveries</SectionLabel>
      <DeliveryList />
    </>
  );
}
