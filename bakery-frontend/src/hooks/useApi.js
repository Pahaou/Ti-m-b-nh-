import { useState, useCallback, useRef, useEffect } from 'react';

const apiCache = new Map();

/**
 * useApi - Custom hook for managing API calls with built-in caching
 * @param {Function} apiFunc - The API function to call
 * @param {string} cacheKey - Optional key to cache data
 * @returns {Object} { data, loading, error, execute, reset }
 */
export function useApi(apiFunc, cacheKey = null) {
  const [data, setData] = useState(() => (cacheKey ? apiCache.get(cacheKey) : null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  const execute = useCallback(async (...args) => {
    // Cancel previous request if any
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await apiFunc(...args);
      setData(response.data);
      if (cacheKey) {
        apiCache.set(cacheKey, response.data);
      }
      return response.data;
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        console.error('[API Error]:', err);
        const message = err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
        setError(message);
        throw err;
      }
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  return { data, loading, error, execute, reset };
}
