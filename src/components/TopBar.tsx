import { ChevronDownIcon, ThemeIcon } from './icons';

export function TopBar({
  darkLabel, onToggleDark, roleLabel, onCycleRole,
}: {
  darkLabel: string; onToggleDark: () => void; roleLabel: string; onCycleRole: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px 12px', borderBottom: '2px solid var(--color-divider)' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, lineHeight: 1 }}>Patrick Group</div>
        <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'color-mix(in srgb, var(--color-text) 50%, transparent)', marginTop: 3 }}>Operating system</div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        <button
          onClick={onToggleDark}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 2, padding: '6px 9px', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', cursor: 'pointer', color: 'inherit' }}
        >
          <ThemeIcon />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{darkLabel}</span>
        </button>
        <button
          onClick={onCycleRole}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, padding: '6px 10px', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', cursor: 'pointer', color: 'inherit', minWidth: 104 }}
        >
          <span style={{ fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'color-mix(in srgb, var(--color-text) 50%, transparent)' }}>Role</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12 }}>
            {roleLabel}
            <ChevronDownIcon />
          </span>
        </button>
      </div>
    </div>
  );
}
