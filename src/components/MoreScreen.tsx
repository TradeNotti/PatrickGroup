import type { Derived } from '../state/derive';
import { MUT_50 } from '../lib/colors';
import { ChevronLeftIcon, ChevronRightLgIcon } from './icons';
import { SalesModule } from './modules/SalesModule';
import { InventoryModule } from './modules/InventoryModule';
import { DistributionModule } from './modules/DistributionModule';
import { ProductionModule } from './modules/ProductionModule';
import { PurchasingModule } from './modules/PurchasingModule';
import { FinanceModule } from './modules/FinanceModule';

export function MoreScreen({ d }: { d: Derived }) {
  return (
    <>
      {d.moduleNone && (
        <div style={{ padding: 16 }}>
          <h3 style={{ margin: '0 0 14px' }}>All modules</h3>
          <div style={{ borderTop: '2px solid var(--color-divider)' }}>
            {d.modules.map((mo) => (
              <button
                key={mo.name}
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
        </div>
      )}

      {d.moduleOpen && (
        <div style={{ padding: 16 }}>
          <button
            onClick={d.moduleBack}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', padding: '0 0 12px', cursor: 'pointer', color: 'var(--color-accent)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            <ChevronLeftIcon />Modules
          </button>
          <h3 style={{ margin: '0 0 16px' }}>{d.moduleTitle}</h3>

          {d.modSales && <SalesModule d={d} />}
          {d.modInventory && <InventoryModule d={d} />}
          {d.modFinance && <FinanceModule d={d} />}
          {d.modDistribution && <DistributionModule d={d} />}
          {d.modProduction && <ProductionModule d={d} />}
          {d.modPurchasing && <PurchasingModule d={d} />}
        </div>
      )}
    </>
  );
}
