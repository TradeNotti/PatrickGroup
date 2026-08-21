import { MUT_50 } from '../lib/colors';
import { moneyM } from '../lib/format';
import { ChevronLeftIcon, ChevronRightLgIcon } from './icons';
import { useCustomers } from '../state/queries';
import { SalesModule } from './modules/SalesModule';
import { InventoryModule } from './modules/InventoryModule';
import { DistributionModule } from './modules/DistributionModule';
import { ProductionModule } from './modules/ProductionModule';
import { PurchasingModule } from './modules/PurchasingModule';
import { FinanceModule } from './modules/FinanceModule';
import type { ModuleKey } from '../types';

interface Props {
  module: ModuleKey | null;
  setModule: (m: ModuleKey | null) => void;
  goCredit: () => void;
  onOpenEntry: () => void;
  onSignOut: () => void;
}

const MODULE_TITLES: Record<ModuleKey, string> = {
  sales: 'Sales', inventory: 'Inventory', distribution: 'Distribution',
  production: 'Production', purchasing: 'Purchasing', finance: 'Finance',
};

export function MoreScreen({ module, setModule, goCredit, onOpenEntry, onSignOut }: Props) {
  const { data: customers } = useCustomers();
  const owed = (customers ?? []).reduce((a, c) => a + (c.balance > 0 ? c.balance : 0), 0);

  const modules: { key: ModuleKey | 'credit'; name: string; stat: string; go: () => void }[] = [
    { key: 'sales', name: 'Sales', stat: 'Orders, customers, targets', go: () => setModule('sales') },
    { key: 'inventory', name: 'Inventory', stat: 'Seeds, oil, packaging, stock movements', go: () => setModule('inventory') },
    { key: 'distribution', name: 'Distribution', stat: 'Distributors and deliveries', go: () => setModule('distribution') },
    { key: 'credit', name: 'Credit', stat: owed > 0 ? `${moneyM(owed)} owed` : 'Balances and overdue payments', go: goCredit },
    { key: 'production', name: 'Production', stat: 'Seed input → oil output', go: () => setModule('production') },
    { key: 'purchasing', name: 'Purchasing', stat: 'Suppliers and purchases', go: () => setModule('purchasing') },
    { key: 'finance', name: 'Finance', stat: 'Revenue, margin, ledger', go: () => setModule('finance') },
  ];

  if (!module) {
    return (
      <div style={{ padding: 16 }}>
        <h3 style={{ margin: '0 0 14px' }}>All modules</h3>
        <div style={{ borderTop: '2px solid var(--color-divider)' }}>
          {modules.map((mo) => (
            <button
              key={mo.key}
              onClick={mo.go}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '15px 2px', background: 'none', border: 'none', borderBottom: '1px solid var(--color-divider)', cursor: 'pointer', textAlign: 'left', color: 'inherit' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16 }}>{mo.name}</div>
                <div style={{ fontSize: 12, color: MUT_50, marginTop: 2 }}>{mo.stat}</div>
              </div>
              <ChevronRightLgIcon />
            </button>
          ))}
        </div>
        <button
          onClick={onSignOut}
          className="btn btn-secondary btn-block"
          style={{ marginTop: 20, justifyContent: 'center' }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <button
        onClick={() => setModule(null)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', padding: '0 0 12px', cursor: 'pointer', color: 'var(--color-accent)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}
      >
        <ChevronLeftIcon />Modules
      </button>
      <h3 style={{ margin: '0 0 16px' }}>{MODULE_TITLES[module]}</h3>

      {module === 'sales' && <SalesModule onOpenEntry={onOpenEntry} />}
      {module === 'inventory' && <InventoryModule />}
      {module === 'finance' && <FinanceModule />}
      {module === 'distribution' && <DistributionModule />}
      {module === 'production' && <ProductionModule />}
      {module === 'purchasing' && <PurchasingModule />}
    </div>
  );
}
