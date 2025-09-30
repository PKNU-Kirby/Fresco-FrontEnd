import { useState, useCallback } from 'react';
import { ApiErrorHandler } from '../utils/errorHandler';
import { ApiUtils } from '../utils/apiUtils';

interface UseApiCallOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  retries?: number;
  timeout?: number;
}

export const useApiCall = <T>(options: UseApiCallOptions<T> = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (apiCall: () => Promise<T>) => {
      setLoading(true);
      setError(null);

      try {
        const timeoutPromise = options.timeout
          ? ApiUtils.createTimeoutPromise(
              ApiUtils.callWithRetry(apiCall, options.retries || 2),
              options.timeout,
            )
          : ApiUtils.callWithRetry(apiCall, options.retries || 2);

        const result = await timeoutPromise;
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        console.error('API 호출 실패:', err);
        ApiErrorHandler.logError(err, 'useApiCall');
        setError(err);
        options.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options],
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
    isSuccess: !loading && !error && data !== null,
    isError: !loading && error !== null,
    errorMessage: error ? ApiErrorHandler.getErrorMessage(error) : null,
  };
};
