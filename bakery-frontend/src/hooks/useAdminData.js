import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import { useApi } from './useApi';

/**
 * useAdminData - Hook for admin dashboard operations
 */
export function useAdminData(type = 'orders') {
  const apiFunc = type === 'users' ? adminAPI.getUsers : adminAPI.getOrders;
  const { data, loading, error, execute } = useApi(apiFunc);
  const [params, setParams] = useState({ page: 1, limit: 20 });

  const fetchData = useCallback(() => {
    execute(params);
  }, [execute, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  return {
    items: data?.data || [],
    meta: data?.meta || {},
    loading,
    error,
    params,
    setParams: updateParams,
    refresh: fetchData
  };
}
