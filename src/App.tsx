import { useMemo } from 'react';
import { buildTree } from './data/tree';
import { useDerived } from './state/derive';
import { useAppState } from './state/useAppState';
import { StatusBar } from './components/StatusBar';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { CreditScreen } from './components/CreditScreen';
import { MoreScreen } from './components/MoreScreen';
import { PaymentDialog } from './components/PaymentDialog';
import { EntryOverlay } from './components/EntryOverlay';

export default function App() {
  const tree = useMemo(() => buildTree(), []);
  const [state, set] = useAppState();
  const d = useDerived(state, set, tree);

  return (
    <div
      className={d.appClass}
      style={{ minHeight: '100vh', background: 'var(--color-neutral-300)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '28px 16px', fontFamily: 'var(--font-body)' }}
    >
      <div style={{ position: 'relative', width: 404, maxWidth: '100%', height: 868, background: 'var(--color-bg)', border: '2px solid var(--color-text)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <StatusBar />
        <TopBar darkLabel={d.darkLabel} onToggleDark={d.toggleDark} roleLabel={d.roleLabel} onCycleRole={d.cycleRole} />

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {d.isHome && <HomeScreen d={d} />}
          {d.isExplore && <ExploreScreen d={d} />}
          {d.isCredit && <CreditScreen d={d} />}
          {d.isMore && <MoreScreen d={d} />}
        </div>

        <BottomNav
          homeColor={d.homeColor} exploreColor={d.exploreColor} creditColor={d.creditColor} moreColor={d.moreColor}
          goHome={d.goHome} goExplore={d.goExplore} goCredit={d.goCredit} goMore={d.goMore}
        />

        <PaymentDialog
          open={!!d.dialog}
          name={d.dialogName}
          amount={d.dialogAmount}
          onCancel={d.closeDialog}
          onConfirm={d.confirmPay}
        />

        <EntryOverlay d={d} />
      </div>
    </div>
  );
}
