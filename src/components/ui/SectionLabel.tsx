import type { CSSProperties, ReactNode } from 'react';
import { MUT_55 } from '../../lib/colors';

export function SectionLabel({ children, color, margin }: { children: ReactNode; color?: string; margin?: string }) {
  const style: CSSProperties = {
    fontSize: 11,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: color || MUT_55,
    fontFamily: 'var(--font-heading)',
    fontWeight: 600,
    margin: margin || '0 0 10px',
  };
  return <div style={style}>{children}</div>;
}
