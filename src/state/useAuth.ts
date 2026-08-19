import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../lib/api';

export function useAuth() {
  const qc = useQueryClient();

  const status = useQuery({
    queryKey: ['auth'],
    queryFn: () => api.get<{ authed: boolean }>('/auth'),
    retry: false,
  });

  const login = useMutation({
    mutationFn: (password: string) => api.post<{ ok: true }>('/auth', { action: 'login', password }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth'] }),
  });

  const logout = useMutation({
    mutationFn: () => api.post<{ ok: true }>('/auth', { action: 'logout' }),
    onSuccess: () => qc.invalidateQueries(),
  });

  return {
    authed: !!status.data?.authed,
    loading: status.isLoading,
    login,
    logout,
    loginError: login.error instanceof ApiError ? login.error.message : null,
  };
}
