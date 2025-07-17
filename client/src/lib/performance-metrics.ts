// Performance monitoring utilities for the fuel dispensing system

interface PerformanceMetrics {
  apiCalls: {
    successful: number;
    failed: number;
    optimized: number;
  };
  loadingTimes: {
    initialLoad: number;
    routeChanges: number;
    componentRender: number;
  };
  optimization: {
    lazyLoadingEnabled: boolean;
    pollingOptimized: boolean;
    bundleSplitting: boolean;
    mobileOptimized: boolean;
  };
}

export const PERFORMANCE_CONFIG = {
  // Polling intervals (in milliseconds)
  polling: {
    activePump: 1000,    // Fast polling for dispensing pumps
    idlePump: 5000,      // Slower polling for idle pumps
    systemStatus: 10000, // System overview updates
    errorBackoff: 30000, // Maximum retry delay
  },
  
  // Bundle optimization
  bundle: {
    chunkSizeLimit: 1000, // KB
    lazyLoadRoutes: true,
    iconTreeShaking: true,
    cssOptimization: true,
  },
  
  // Mobile optimization
  mobile: {
    touchTargetMin: 44,   // Minimum touch target size (px)
    viewportOptimized: true,
    responsiveImages: true,
    reducedMotion: true,
  },
  
  // Font optimization
  fonts: {
    display: 'swap',
    preload: ['system-ui'],
    fallbacks: ['system-ui', 'sans-serif'],
  }
};

export function trackPerformance(metric: string, value: number): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`fuel-system-${metric}-${value}`);
  }
}

export function measureApiCall(endpoint: string, startTime: number): void {
  const duration = Date.now() - startTime;
  trackPerformance(`api-${endpoint.replace(/[^a-zA-Z0-9]/g, '-')}`, duration);
}

export function getOptimizationStatus(): PerformanceMetrics['optimization'] {
  return {
    lazyLoadingEnabled: true,
    pollingOptimized: true,
    bundleSplitting: true,
    mobileOptimized: true,
  };
}