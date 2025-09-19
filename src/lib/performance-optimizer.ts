// Enterprise Performance Optimization System
// Advanced caching, lazy loading, and performance monitoring

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  apiResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  throughput: number;
}

export interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  enabled: boolean;
  strategy: 'lru' | 'lfu' | 'ttl';
}

export interface OptimizationConfig {
  caching: {
    images: CacheConfig;
    api: CacheConfig;
    search: CacheConfig;
  };
  lazyLoading: {
    enabled: boolean;
    threshold: number;
    placeholder: string;
  };
  compression: {
    enabled: boolean;
    level: number;
  };
  cdn: {
    enabled: boolean;
    baseUrl: string;
  };
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
}

class PerformanceOptimizer {
  private caches = new Map<string, Map<string, CacheEntry<any>>>();
  private performanceData: PerformanceMetrics[] = [];
  private observers = new Map<string, IntersectionObserver>();
  private config: OptimizationConfig;

  constructor() {
    this.config = this.getDefaultConfig();
    this.initializeOptimizer();
    this.startPerformanceMonitoring();
  }

  private getDefaultConfig(): OptimizationConfig {
    return {
      caching: {
        images: {
          maxSize: 100 * 1024 * 1024, // 100MB
          ttl: 24 * 60 * 60 * 1000, // 24 hours
          enabled: true,
          strategy: 'lru'
        },
        api: {
          maxSize: 50 * 1024 * 1024, // 50MB
          ttl: 5 * 60 * 1000, // 5 minutes
          enabled: true,
          strategy: 'ttl'
        },
        search: {
          maxSize: 10 * 1024 * 1024, // 10MB
          ttl: 15 * 60 * 1000, // 15 minutes
          enabled: true,
          strategy: 'lfu'
        }
      },
      lazyLoading: {
        enabled: true,
        threshold: 200, // pixels
        placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMjI1TDE3NSAyMDBIMTI1TDE1MCAyMjVaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+TG9hZGluZy4uLjwvdGV4dD4KPC9zdmc+'
      },
      compression: {
        enabled: true,
        level: 6
      },
      cdn: {
        enabled: false,
        baseUrl: 'https://cdn.cinediscover.com'
      }
    };
  }

  private initializeOptimizer(): void {
    // Initialize caches
    this.caches.set('images', new Map());
    this.caches.set('api', new Map());
    this.caches.set('search', new Map());

    // Setup lazy loading
    if (this.config.lazyLoading.enabled) {
      this.setupLazyLoading();
    }

    // Setup performance observers
    this.setupPerformanceObservers();

    console.log('⚡ Performance Optimizer initialized');
  }

  // Cache Management
  async cache<T>(
    category: 'images' | 'api' | 'search',
    key: string,
    data: T,
    customTTL?: number
  ): Promise<void> {
    const cacheConfig = this.config.caching[category];
    if (!cacheConfig.enabled) return;

    const cache = this.caches.get(category);
    if (!cache) return;

    const size = this.calculateDataSize(data);
    const ttl = customTTL || cacheConfig.ttl;

    // Check if we need to make room
    await this.evictIfNeeded(category, size);

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      size
    };

    cache.set(key, entry);
  }

  async get<T>(category: 'images' | 'api' | 'search', key: string): Promise<T | null> {
    const cacheConfig = this.config.caching[category];
    if (!cacheConfig.enabled) return null;

    const cache = this.caches.get(category);
    if (!cache) return null;

    const entry = cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.delete(key);
      return null;
    }

    // Update hit count for LFU strategy
    entry.hits++;

    return entry.data;
  }

  // Advanced Image Optimization
  async optimizeImage(
    src: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpg' | 'png';
      lazy?: boolean;
    } = {}
  ): Promise<string> {
    // Check cache first
    const cacheKey = `${src}_${JSON.stringify(options)}`;
    const cached = await this.get('images', cacheKey);
    if (cached) return cached;

    // Apply CDN if enabled
    let optimizedSrc = src;
    if (this.config.cdn.enabled && !src.startsWith('data:')) {
      optimizedSrc = `${this.config.cdn.baseUrl}/optimize?url=${encodeURIComponent(src)}`;
      
      if (options.width) optimizedSrc += `&w=${options.width}`;
      if (options.height) optimizedSrc += `&h=${options.height}`;
      if (options.quality) optimizedSrc += `&q=${options.quality}`;
      if (options.format) optimizedSrc += `&f=${options.format}`;
    }

    // Cache the optimized URL
    await this.cache('images', cacheKey, optimizedSrc);

    return optimizedSrc;
  }

  // Lazy Loading Implementation
  private setupLazyLoading(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
              
              // Add load event for performance tracking
              img.onload = () => {
                this.trackPerformanceMetric('image_load', performance.now());
              };
            }
          }
        });
      },
      {
        rootMargin: `${this.config.lazyLoading.threshold}px`
      }
    );

    this.observers.set('lazyImages', observer);
  }

  observeElement(element: HTMLElement, type: string = 'default'): void {
    const observer = this.observers.get('lazyImages');
    if (observer) {
      observer.observe(element);
    }
  }

  // API Request Optimization
  async optimizedFetch(
    url: string,
    options: RequestInit = {},
    cacheKey?: string
  ): Promise<Response> {
    const startTime = performance.now();
    
    // Check cache for GET requests
    if ((!options.method || options.method === 'GET') && cacheKey) {
      const cached = await this.get('api', cacheKey);
      if (cached) {
        // Return cached response
        return new Response(JSON.stringify(cached), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    try {
      // Add compression headers
      const enhancedOptions: RequestInit = {
        ...options,
        headers: {
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'max-age=300',
          ...options.headers
        }
      };

      const response = await fetch(url, enhancedOptions);
      const responseTime = performance.now() - startTime;

      // Track performance
      this.trackPerformanceMetric('api_response_time', responseTime);

      // Cache successful GET responses
      if (response.ok && (!options.method || options.method === 'GET') && cacheKey) {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        await this.cache('api', cacheKey, data);
      }

      return response;
    } catch (error) {
      this.trackPerformanceMetric('api_error', 1);
      throw error;
    }
  }

  // Search Optimization
  async optimizeSearch(
    query: string,
    searchFunction: () => Promise<any>,
    ttl?: number
  ): Promise<any> {
    const cacheKey = `search_${query.toLowerCase().trim()}`;
    
    // Check cache first
    const cached = await this.get('search', cacheKey);
    if (cached) {
      this.trackPerformanceMetric('search_cache_hit', 1);
      return cached;
    }

    // Perform search
    const startTime = performance.now();
    try {
      const results = await searchFunction();
      const searchTime = performance.now() - startTime;

      // Track performance
      this.trackPerformanceMetric('search_time', searchTime);
      this.trackPerformanceMetric('search_cache_miss', 1);

      // Cache results
      await this.cache('search', cacheKey, results, ttl);

      return results;
    } catch (error) {
      this.trackPerformanceMetric('search_error', 1);
      throw error;
    }
  }

  // Performance Monitoring
  private startPerformanceMonitoring(): void {
    // Monitor navigation timing
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          this.trackPerformanceMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
          this.trackPerformanceMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
          this.trackPerformanceMetric('first_paint', this.getFirstPaintTime());
        }, 0);
      });

      // Monitor memory usage
      setInterval(() => {
        if ((performance as any).memory) {
          const memory = (performance as any).memory;
          this.trackPerformanceMetric('memory_used', memory.usedJSHeapSize);
          this.trackPerformanceMetric('memory_total', memory.totalJSHeapSize);
        }
      }, 30000); // Every 30 seconds
    }
  }

  private getFirstPaintTime(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  trackPerformanceMetric(metric: string, value: number): void {
    const now = Date.now();
    
    // Store individual metrics
    if (!this.performanceData.find(d => d.loadTime === now)) {
      this.performanceData.push({
        loadTime: now,
        renderTime: 0,
        memoryUsage: 0,
        apiResponseTime: 0,
        cacheHitRate: 0,
        errorRate: 0,
        throughput: 0
      });
    }

    // Keep only last 1000 entries
    if (this.performanceData.length > 1000) {
      this.performanceData = this.performanceData.slice(-1000);
    }
  }

  // Resource Preloading
  preloadCriticalResources(urls: string[]): void {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      if (url.includes('.css')) {
        link.as = 'style';
      } else if (url.includes('.js')) {
        link.as = 'script';
      } else if (url.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
        link.as = 'image';
      } else {
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
      }
      
      link.href = url;
      document.head.appendChild(link);
    });
  }

  // Bundle Splitting & Code Splitting
  async loadComponentDynamically<T>(
    importFunction: () => Promise<{ default: T }>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const module = await importFunction();
      const loadTime = performance.now() - startTime;
      
      this.trackPerformanceMetric('dynamic_import_time', loadTime);
      return module.default;
    } catch (error) {
      this.trackPerformanceMetric('dynamic_import_error', 1);
      throw error;
    }
  }

  // Cache Management Helpers
  private async evictIfNeeded(category: string, newEntrySize: number): Promise<void> {
    const cache = this.caches.get(category);
    const config = this.config.caching[category as keyof typeof this.config.caching];
    
    if (!cache || !config) return;

    const currentSize = this.calculateCacheSize(cache);
    
    if (currentSize + newEntrySize > config.maxSize) {
      await this.evictEntries(cache, config.strategy, currentSize + newEntrySize - config.maxSize);
    }
  }

  private async evictEntries(
    cache: Map<string, CacheEntry<any>>,
    strategy: 'lru' | 'lfu' | 'ttl',
    bytesToEvict: number
  ): Promise<void> {
    const entries = Array.from(cache.entries());
    let bytesEvicted = 0;

    // Sort entries based on eviction strategy
    switch (strategy) {
      case 'lru':
        entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
        break;
      case 'lfu':
        entries.sort(([, a], [, b]) => a.hits - b.hits);
        break;
      case 'ttl':
        entries.sort(([, a], [, b]) => (a.timestamp + a.ttl) - (b.timestamp + b.ttl));
        break;
    }

    // Evict entries until we've freed enough space
    for (const [key, entry] of entries) {
      if (bytesEvicted >= bytesToEvict) break;
      
      cache.delete(key);
      bytesEvicted += entry.size;
    }
  }

  private calculateCacheSize(cache: Map<string, CacheEntry<any>>): number {
    let totalSize = 0;
    for (const entry of cache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  private calculateDataSize(data: any): number {
    // Rough estimation of data size in bytes
    const jsonString = JSON.stringify(data);
    return new Blob([jsonString]).size;
  }

  // Performance Analytics
  getPerformanceReport(): any {
    const recent = this.performanceData.slice(-100); // Last 100 measurements
    
    if (recent.length === 0) {
      return {
        status: 'No data available',
        timestamp: Date.now()
      };
    }

    const cacheStats = this.getCacheStatistics();
    
    return {
      timestamp: Date.now(),
      timeframe: '24h',
      metrics: {
        averageLoadTime: this.calculateAverage(recent.map(d => d.loadTime)),
        averageApiResponseTime: this.calculateAverage(recent.map(d => d.apiResponseTime)),
        memoryUsage: recent[recent.length - 1]?.memoryUsage || 0,
        cacheHitRate: cacheStats.hitRate,
        errorRate: this.calculateAverage(recent.map(d => d.errorRate))
      },
      cacheStatistics: cacheStats,
      recommendations: this.generatePerformanceRecommendations(recent)
    };
  }

  private getCacheStatistics(): any {
    const stats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      categories: {} as any
    };

    for (const [category, cache] of this.caches.entries()) {
      const categoryStats = {
        entries: cache.size,
        size: this.calculateCacheSize(cache),
        hits: 0
      };

      for (const entry of cache.values()) {
        categoryStats.hits += entry.hits;
      }

      stats.categories[category] = categoryStats;
      stats.totalEntries += categoryStats.entries;
      stats.totalSize += categoryStats.size;
    }

    return stats;
  }

  private generatePerformanceRecommendations(data: PerformanceMetrics[]): string[] {
    const recommendations = [];
    
    const avgLoadTime = this.calculateAverage(data.map(d => d.loadTime));
    if (avgLoadTime > 3000) {
      recommendations.push('Consider optimizing images and enabling lazy loading');
    }
    
    const avgApiTime = this.calculateAverage(data.map(d => d.apiResponseTime));
    if (avgApiTime > 1000) {
      recommendations.push('API response times are high, consider caching or CDN');
    }
    
    const memoryUsage = data[data.length - 1]?.memoryUsage || 0;
    if (memoryUsage > 100 * 1024 * 1024) { // 100MB
      recommendations.push('High memory usage detected, consider cleaning up unused resources');
    }

    return recommendations;
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  // Configuration Management
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚡ Performance configuration updated');
  }

  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  // Cleanup
  clearAllCaches(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
    console.log('⚡ All caches cleared');
  }

  clearCache(category: 'images' | 'api' | 'search'): void {
    const cache = this.caches.get(category);
    if (cache) {
      cache.clear();
      console.log(`⚡ ${category} cache cleared`);
    }
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();
