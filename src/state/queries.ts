import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type {
  Customer, DashboardData, Delivery, FinanceSummary, InventoryItem, InventoryMovement,
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
    mutationFn: (input: { customer: string; pay: 'Cash' | 'Credit'; terms: number; items: SaleItemInput[] }) =>
      api.post<{ id: number; total: number }>('/sales', input),
    onSuccess: () => invalidateFinancials(qc),
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

export function useDeliveries() {
  return useQuery({ queryKey: ['deliveries'], queryFn: () => api.get<Delivery[]>('/deliveries') });
}

export function useRecordDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { route: string; driver: string; status: string }) => api.post('/deliveries', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deliveries'] }),
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

export function useLedger() {
  return useQuery({
    queryKey: ['ledger'],
    queryFn: () => api.get<{ entries: LedgerEntry[]; totalDebit: number; totalCredit: number }>('/ledger'),
  });
}

export function useFinanceSummary() {
  return useQuery({ queryKey: ['finance-summary'], queryFn: () => api.get<FinanceSummary>('/finance-summary') });
}
