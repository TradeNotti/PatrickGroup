import type { CSSProperties, ReactNode } from 'react';

export function Tag({ cls, children, style }: { cls: string; children: ReactNode; style?: CSSProperties }) {
  return <span className={`tag ${cls}`} style={style}>{children}</span>;
}
