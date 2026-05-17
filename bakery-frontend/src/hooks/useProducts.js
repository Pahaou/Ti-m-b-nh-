import { useState, useEffect, useCallback } from 'react';
import { productAPI } from '../services/api';
import { useApi } from './useApi';

/**
 * useProducts - Hook for product listing logic
 * @param {Object} initialParams - Default query params
 */
export function useProducts(initialParams = {}) {
  const cacheKey = `products_${JSON.stringify(initialParams)}`;
  const { data, loading, error, execute } = useApi(productAPI.getAll, cacheKey);
  const [params, setParams] = useState({
    page: 1,
    limit: 12,
    ...initialParams
  });

  const fetchProducts = useCallback(() => {
    execute(params);
  }, [execute, params]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams, page: newParams.page || 1 }));
  }, []);

  const changePage = useCallback((page) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  return {
    products: data?.data || [],
    meta: data?.meta || {},
    loading,
    error,
    params,
    setParams: updateParams,
    changePage,
    refresh: fetchProducts
  };
}
