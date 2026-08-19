interface TileData { label: string; value: string; sub?: string; color?: string; }

export function TileGrid({ tiles, valueFontSize = 20, marginBottom = 22 }: { tiles: TileData[]; valueFontSize?: number; marginBottom?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--color-divider)', border: '1px solid var(--color-divider)', marginBottom }}>
      {tiles.map((t, i) => (
        <div key={i} style={{ background: 'var(--color-bg)', padding: '13px 12px' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>{t.label}</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: valueFontSize, marginTop: 6, color: t.color || 'inherit' }}>{t.value}</div>
          {t.sub != null && (
            <div style={{ fontSize: 10, color: 'color-mix(in srgb, var(--color-text) 45%, transparent)', marginTop: 3 }}>{t.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}
