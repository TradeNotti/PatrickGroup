import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type {
  Customer, DashboardData, Delivery, Distributor, FinanceSummary, InventoryItem, InventoryMovement,
  LedgerEntry, ProductionBatch, Purchase, Range, SaleItemInput, SaleOrder,
} from '../types';

// Invalidated together because every one of these mutations posts to the
// ledger and/or moves money, so all the money-shaped screens go stale at once.
const FINANCIAL_KEYS = ['dashboard', 'customers', 'sales', 'ledger', 'finance-summary'];

function invalidateFinancials(qc: ReturnType<typeof useQueryClient>) {
  FINANCIAL_KEYS.forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
}

export function useDashboard(range: Range) {
  return useQuery({ queryKey: ['dashboard', range], queryFn: () => api.get<DashboardData>(`/dashboard?range=${range}`) });
}

export function useCustomers() {
  return useQuery({ queryKey: ['customers'], queryFn: () => api.get<Customer[]>('/customers') });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { customerId: number; amount: number }) => api.post('/payments', input),
    onSuccess: () => invalidateFinancials(qc),
  });
}

export function useSales(limit = 20) {
  return useQuery({ queryKey: ['sales', limit], queryFn: () => api.get<SaleOrder[]>(`/sales?limit=${limit}`) });
}

export function useRecordSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { customer: string; distributorId?: number; pay: 'Cash' | 'Credit'; terms: number; items: SaleItemInput[] }) =>
      api.post<{ id: number; total: number }>('/sales', input),
    onSuccess: (_data, vars) => {
      invalidateFinancials(qc);
      if (vars.distributorId) qc.invalidateQueries({ queryKey: ['distributors'] });
    },
  });
}

export function useDeleteSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del(`/sales?id=${id}`),
    onSuccess: () => {
      invalidateFinancials(qc);
      qc.invalidateQueries({ queryKey: ['distributors'] });
    },
  });
}

export function useInventoryItems() {
  return useQuery({ queryKey: ['inventory-items'], queryFn: () => api.get<InventoryItem[]>('/inventory-items') });
}

export function useInventoryMovements(limit = 20) {
  return useQuery({ queryKey: ['inventory-movements', limit], queryFn: () => api.get<InventoryMovement[]>(`/inventory-movements?limit=${limit}`) });
}

export function useRecordMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { item: string; qty: number; direction: 'In' | 'Out' }) => api.post('/inventory-movements', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-items'] });
      qc.invalidateQueries({ queryKey: ['inventory-movements'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteInventoryMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del(`/inventory-movements?id=${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-items'] });
      qc.invalidateQueries({ queryKey: ['inventory-movements'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDistributors() {
  return useQuery({ queryKey: ['distributors'], queryFn: () => api.get<Distributor[]>('/distributors') });
}

export function useAddDistributor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; territory?: string; phone?: string }) => api.post<Distributor>('/distributors', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['distributors'] }),
  });
}

export function useDeleteDistributor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del(`/distributors?id=${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['distributors'] });
      qc.invalidateQueries({ queryKey: ['deliveries'] });
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeliveries(distributorId?: number) {
  return useQuery({
    queryKey: ['deliveries', distributorId ?? null],
    queryFn: () => api.get<Delivery[]>(`/deliveries${distributorId ? `?distributorId=${distributorId}` : ''}`),
  });
}

export function useRecordDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { distributorId?: number; route: string; driver: string; status: string }) => api.post('/deliveries', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deliveries'] });
      qc.invalidateQueries({ queryKey: ['distributors'] });
    },
  });
}

export function useDeleteDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del(`/deliveries?id=${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deliveries'] });
      qc.invalidateQueries({ queryKey: ['distributors'] });
    },
  });
}

export function useProductionBatches(limit = 20) {
  return useQuery({ queryKey: ['production-batches', limit], queryFn: () => api.get<ProductionBatch[]>(`/production-batches?limit=${limit}`) });
}

export function useRecordBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; seed: number; oil: number }) => api.post('/production-batches', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['production-batches'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteProductionBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del(`/production-batches?id=${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['production-batches'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function usePurchases() {
  return useQuery({ queryKey: ['purchases'], queryFn: () => api.get<Purchase[]>('/purchases') });
}

export function useRecordPurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { supplier: string; item: string; qty: number; price: number }) => api.post('/purchases', input),
    onSuccess: () => invalidateFinancials(qc),
  });
}

export function useDeletePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del(`/purchases?id=${id}`),
    onSuccess: () => invalidateFinancials(qc),
  });
}

export function useLedger() {
  return useQuery({
    queryKey: ['ledger'],
    queryFn: () => api.get<{ entries: LedgerEntry[]; totalDebit: number; totalCredit: number }>('/ledger'),
  });
}

export function useRecordLedgerEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { debitAccount: string; creditAccount: string; amount: number; memo?: string; date?: string }) => api.post('/ledger', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ledger'] });
      qc.invalidateQueries({ queryKey: ['finance-summary'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteLedgerEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del(`/ledger?id=${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ledger'] });
      qc.invalidateQueries({ queryKey: ['finance-summary'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useFinanceSummary() {
  return useQuery({ queryKey: ['finance-summary'], queryFn: () => api.get<FinanceSummary>('/finance-summary') });
}
