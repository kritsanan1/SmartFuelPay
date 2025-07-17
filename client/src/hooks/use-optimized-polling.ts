import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface OptimizedPollingOptions<T> extends Omit<UseQueryOptions<T>, 'refetchInterval'> {
  baseInterval?: number;
  activeInterval?: number;
  idleInterval?: number;
  errorRetryLimit?: number;
  backoffMultiplier?: number;
  maxRetryDelay?: number;
}

/**
 * Custom hook for optimized API polling
 * Adjusts polling frequency based on data state and reduces unnecessary requests
 */
export function useOptimizedPolling<T>(
  queryKey: string[],
  options: OptimizedPollingOptions<T> = {}
) {
  const {
    baseInterval = 3000,
    activeInterval = 1000,
    idleInterval = 5000,
    errorRetryLimit = 3,
    backoffMultiplier = 2,
    maxRetryDelay = 30000,
    ...queryOptions
  } = options;

  return useQuery<T>({
    queryKey,
    refetchInterval: (data: any, query) => {
      // Stop polling if query has been disabled due to errors
      if (query.state.error?.message?.includes('404')) {
        return false;
      }

      // Determine polling interval based on data state
      if (data?.status === 'dispensing' || data?.status === 'active') {
        return activeInterval;
      } else if (data?.status === 'idle') {
        return idleInterval;
      }

      return baseInterval;
    },
    retry: (failureCount, error: any) => {
      // Don't retry for 404 errors (resource doesn't exist)
      if (error?.message?.includes('404') || error?.status === 404) {
        return false;
      }
      
      // Don't retry for 403 errors (forbidden)
      if (error?.status === 403) {
        return false;
      }

      return failureCount < errorRetryLimit;
    },
    retryDelay: (attemptIndex) => 
      Math.min(baseInterval * (backoffMultiplier ** attemptIndex), maxRetryDelay),
    
    // Reduce background refetching
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    
    // Stale time to reduce unnecessary requests
    staleTime: baseInterval / 2,
    
    ...queryOptions,
  });
}

/**
 * Hook specifically for pump status monitoring
 * Uses optimized polling with pump-specific intervals
 */
export function usePumpStatus(pumpId: string) {
  return useOptimizedPolling<any>(
    [`/api/hardware/pump/${pumpId}/status`],
    {
      activeInterval: 1000,  // 1 second for active pumps
      idleInterval: 5000,    // 5 seconds for idle pumps
      baseInterval: 3000,    // 3 seconds default
      errorRetryLimit: 2,    // Reduce retries for pump status
    }
  );
}

/**
 * Hook for system-wide monitoring
 * Uses longer intervals for overview data
 */
export function useSystemStatus() {
  return useOptimizedPolling<any>(
    ['/api/system/status'],
    {
      baseInterval: 10000,   // 10 seconds for system overview
      idleInterval: 15000,   // 15 seconds when system is idle
      activeInterval: 5000,  // 5 seconds when system is active
    }
  );
}