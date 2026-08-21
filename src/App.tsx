import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './state/useAuth';
import { RoleProvider } from './state/role';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { CreditScreen } from './components/CreditScreen';
import { MoreScreen } from './components/MoreScreen';
import { EntryOverlay } from './components/EntryOverlay';
import { LoginScreen } from './components/LoginScreen';
import type { ModuleKey, Range, Tab } from './types';
import type { RoleLabel } from './state/role';

const queryClient = new QueryClient();

const ROLES: { label: RoleLabel; greet: string }[] = [
  { label: 'Owner', greet: 'Patrick' },
  { label: 'Manager', greet: 'Manager' },
];

function AppShell() {
  const { authed, loading, checkError, refetch, logout } = useAuth();
  const [dark, setDark] = useState(false);
  const [roleIdx, setRoleIdx] = useState(0);
  const [tab, setTab] = useState<Tab>('home');
  const [module, setModule] = useState<ModuleKey | null>(null);
  const [range, setRange] = useState<Range>('today');
  const [showEntry, setShowEntry] = useState(false);

  const role = ROLES[roleIdx];
  const acc = 'var(--color-accent)';
  const mut = 'color-mix(in srgb, var(--color-text) 45%, transparent)';

  function goTab(next: Tab) {
    setTab(next);
    setModule(null);
  }

  return (
    <div className={dark ? 'pa-app pa-dark' : 'pa-app'}>
      <div className="pa-frame">
        <TopBar
          darkLabel={dark ? 'Light' : 'Dark'}
          onToggleDark={() => setDark((d) => !d)}
          roleLabel={role.label}
          onCycleRole={() => setRoleIdx((i) => (i + 1) % ROLES.length)}
        />

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 24, fontSize: 13, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>Loading…</div>
          ) : checkError ? (
            <div style={{ padding: 24 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Couldn't reach the server</div>
              <div style={{ fontSize: 13, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)', marginBottom: 14 }}>{checkError}</div>
              <button onClick={() => refetch()} className="btn btn-secondary">Retry</button>
            </div>
          ) : !authed ? (
            <LoginScreen />
          ) : (
            <RoleProvider role={role.label}>
              {tab === 'home' && <HomeScreen range={range} setRange={setRange} onOpenEntry={() => setShowEntry(true)} />}
              {tab === 'credit' && <CreditScreen />}
              {tab === 'more' && (
                <MoreScreen
                  module={module}
                  setModule={setModule}
                  goCredit={() => goTab('credit')}
                  onOpenEntry={() => setShowEntry(true)}
                  onSignOut={() => logout.mutate()}
                />
              )}
            </RoleProvider>
          )}
        </div>

        {authed && (
          <BottomNav
            homeColor={tab === 'home' ? acc : mut}
            creditColor={tab === 'credit' ? acc : mut}
            moreColor={tab === 'more' ? acc : mut}
            goHome={() => goTab('home')}
            goCredit={() => goTab('credit')}
            goMore={() => goTab('more')}
          />
        )}

        {authed && (
          <RoleProvider role={role.label}>
            <EntryOverlay open={showEntry} onClose={() => setShowEntry(false)} />
          </RoleProvider>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}
