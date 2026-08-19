import { MUT_45 } from '../../lib/colors';
import { SearchIcon } from '../icons';

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <SearchIcon style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: MUT_45 }} />
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingLeft: 32 }}
      />
    </div>
  );
}
