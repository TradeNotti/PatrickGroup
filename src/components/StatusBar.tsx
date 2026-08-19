import { BatteryIcon, WifiIcon } from './icons';

export function StatusBar() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 6px', fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '0.02em' }}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <BatteryIcon />
        <WifiIcon />
      </span>
    </div>
  );
}
