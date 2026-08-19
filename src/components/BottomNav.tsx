import { NavCreditIcon, NavExploreIcon, NavHomeIcon, NavMoreIcon } from './icons';

interface Props {
  homeColor: string; exploreColor: string; creditColor: string; moreColor: string;
  goHome: () => void; goExplore: () => void; goCredit: () => void; goMore: () => void;
}

function NavButton({ color, onClick, icon, label }: { color: string; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '9px 0 11px', background: 'none', border: 'none', cursor: 'pointer', color }}
    >
      {icon}
      <span style={{ fontSize: 9, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{label}</span>
    </button>
  );
}

export function BottomNav({ homeColor, exploreColor, creditColor, moreColor, goHome, goExplore, goCredit, goMore }: Props) {
  return (
    <nav style={{ display: 'flex', borderTop: '2px solid var(--color-divider)', background: 'var(--color-bg)' }}>
      <NavButton color={homeColor} onClick={goHome} icon={<NavHomeIcon />} label="Home" />
      <NavButton color={exploreColor} onClick={goExplore} icon={<NavExploreIcon />} label="Explore" />
      <NavButton color={creditColor} onClick={goCredit} icon={<NavCreditIcon />} label="Credit" />
      <NavButton color={moreColor} onClick={goMore} icon={<NavMoreIcon />} label="More" />
    </nav>
  );
}
