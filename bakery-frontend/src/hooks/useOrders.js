import { useEffect, useCallback } from 'react';
import { orderAPI } from '../services/api';
import { useApi } from './useApi';

/**
 * useOrders - Hook for managing user orders
 */
export function useOrders() {
  const { data: listData, loading: listLoading, error: listError, execute: fetchOrders } = useApi(orderAPI.getMyOrders);
  const { loading: cancelLoading, execute: cancelOrderApi } = useApi(orderAPI.cancelOrder);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const cancelOrder = useCallback(async (id) => {
    try {
      await cancelOrderApi(id);
      await fetchOrders();
      return true;
    } catch {
      return false;
    }
  }, [cancelOrderApi, fetchOrders]);

  return {
    orders: listData?.data || [],
    loading: listLoading,
    error: listError,
    cancelLoading,
    cancelOrder,
    refresh: fetchOrders
  };
}
