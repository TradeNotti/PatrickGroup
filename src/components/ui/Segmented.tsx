import type { CSSProperties } from 'react';

interface SegOption { label: string; checked: boolean; onChange: () => void; }

export function Segmented({ name, options, style }: { name: string; options: SegOption[]; style?: CSSProperties }) {
  return (
    <div className="seg" role="group" style={style}>
      {options.map((o) => (
        <label className="seg-opt" key={o.label}>
          <input type="radio" name={name} checked={o.checked} onChange={o.onChange} />
          {o.label}
        </label>
      ))}
    </div>
  );
}
