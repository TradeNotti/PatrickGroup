import { useCallback, useState } from 'react';
import type { AppState, SetState } from '../types';

export const initialState: AppState = {
  tab: 'home',
  dark: false,
  range: 'Today',
  path: [],
  module: null,
  dialog: null,
  paidIds: [],
  roleIdx: 0,
  q: '',
  showEntry: false,
  entries: [],
  form: { product: 'Sunflower Oil 20L', qty: '', price: '78000', customer: 'Kariakoo Bulk Traders', pay: 'Cash', terms: '10' },
  mrec: {
    inv: { item: '', qty: '', dir: 'In' },
    dist: { route: '', driver: '', status: 'In transit' },
    prod: { id: '', seed: '', oil: '' },
    pur: { supplier: '', item: '', qty: '', price: '' },
  },
  mlist: { inv: [], dist: [], prod: [], pur: [] },
};

export function useAppState(): [AppState, SetState] {
  const [state, setState] = useState<AppState>(initialState);
  const set: SetState = useCallback((update) => {
    setState((prev) => ({ ...prev, ...(typeof update === 'function' ? update(prev) : update) }));
  }, []);
  return [state, set];
}
