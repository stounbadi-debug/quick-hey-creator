// Enterprise Analytics Manager
// Advanced analytics and business intelligence for CineDiscover

export interface AnalyticsEvent {
  id: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  eventType: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata: any;
  userAgent: string;
  referrer: string;
}

export interface SearchMetrics {
  totalSearches: number;
  uniqueUsers: number;
  avgSearchesPerUser: number;
  topQueries: { query: string; count: number }[];
  searchSuccessRate: number;
  avgResponseTime: number;
  popularGenres: { genre: string; count: number }[];
  timeDistribution: { hour: number; count: number }[];
}

export interface UserBehaviorMetrics {
  activeUsers: number;
  sessionDuration: number[];
  pageViews: number;
  bounceRate: number;
  conversionFunnels: any[];
  userRetention: { day: number; retention: number }[];
  demographicData: any;
}

export interface BusinessMetrics {
  revenue: number;
  conversionRate: number;
  customerLifetimeValue: number;
  churnRate: number;
  growthRate: number;
  marketingROI: number;
}

export interface SystemPerformance {
  apiResponseTimes: { service: string; avgTime: number; p95: number; p99: number }[];
  errorRates: { service: string; rate: number }[];
  throughput: { endpoint: string; requestsPerSecond: number }[];
  systemHealth: { cpu: number; memory: number; disk: number };
  uptime: number;
}

class AnalyticsManager {
  private events: AnalyticsEvent[] = [];
  private sessionData = new Map<string, any>();
  private performanceMetrics = new Map<string, number[]>();
  private isAnalyticsEnabled = true;
  private batchSize = 50;
  private flushInterval = 30000; // 30 seconds

  constructor() {
    this.initializeAnalytics();
    this.startDataCollection();
  }

  private initializeAnalytics(): void {
    // Load existing analytics data
    try {
      const savedEvents = localStorage.getItem('analytics_events');
      if (savedEvents) {
        this.events = JSON.parse(savedEvents);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }

    // Setup automatic data flushing
    setInterval(() => this.flushData(), this.flushInterval);
    
    console.log('📊 Analytics Manager initialized');
  }

  private startDataCollection(): void {
    // Collect page performance data
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.trackPerformance('page_load', performance.now());
      });

      // Track user interactions
      document.addEventListener('click', (event) => {
        this.trackEvent({
          eventType: 'user_interaction',
          category: 'click',
          action: 'element_click',
          label: (event.target as HTMLElement)?.tagName || 'unknown',
          metadata: {
            x: event.clientX,
            y: event.clientY,
            element: (event.target as HTMLElement)?.className || ''
          }
        });
      });

      // Track scroll depth
      let maxScrollDepth = 0;
      window.addEventListener('scroll', () => {
        const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollDepth > maxScrollDepth) {
          maxScrollDepth = scrollDepth;
          if (scrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
            this.trackEvent({
              eventType: 'engagement',
              category: 'scroll',
              action: 'scroll_depth',
              value: scrollDepth
            });
          }
        }
      });
    }
  }

  // Track custom events
  trackEvent(event: Partial<AnalyticsEvent>): void {
    if (!this.isAnalyticsEnabled) return;

    const fullEvent: AnalyticsEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      sessionId: event.sessionId || 'default',
      userId: event.userId,
      eventType: event.eventType || 'custom',
      category: event.category || 'general',
      action: event.action || 'unknown',
      label: event.label,
      value: event.value,
      metadata: event.metadata || {},
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    this.events.push(fullEvent);
    this.updateSessionData(fullEvent);

    // Auto-flush if batch size reached
    if (this.events.length >= this.batchSize) {
      this.flushData();
    }
  }

  // Track search events
  trackSearch(query: string, sessionId: string, resultsCount: number, responseTime: number): void {
    this.trackEvent({
      eventType: 'search',
      category: 'movie_search',
      action: 'search_performed',
      label: query,
      value: resultsCount,
      sessionId,
      metadata: {
        query,
        resultsCount,
        responseTime,
        queryLength: query.length,
        hasResults: resultsCount > 0
      }
    });

    this.trackPerformance('search_response_time', responseTime);
  }

  // Track AI recommendation events
  trackAIRecommendation(query: string, sessionId: string, confidence: number, strategy: string): void {
    this.trackEvent({
      eventType: 'ai_recommendation',
      category: 'ai_search',
      action: 'recommendation_generated',
      label: strategy,
      value: confidence,
      sessionId,
      metadata: {
        query,
        confidence,
        strategy,
        aiModel: 'advanced-engine'
      }
    });
  }

  // Track movie interactions
  trackMovieInteraction(movieId: number, action: string, sessionId: string, movieTitle?: string): void {
    this.trackEvent({
      eventType: 'movie_interaction',
      category: 'content',
      action,
      label: movieTitle || `Movie ${movieId}`,
      value: movieId,
      sessionId,
      metadata: {
        movieId,
        movieTitle,
        interactionType: action
      }
    });
  }

  // Track user preferences
  trackUserPreference(preferenceType: string, value: any, sessionId: string): void {
    this.trackEvent({
      eventType: 'user_preference',
      category: 'personalization',
      action: 'preference_set',
      label: preferenceType,
      sessionId,
      metadata: {
        preferenceType,
        value,
        timestamp: Date.now()
      }
    });
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number): void {
    if (!this.performanceMetrics.has(metric)) {
      this.performanceMetrics.set(metric, []);
    }
    
    const values = this.performanceMetrics.get(metric)!;
    values.push(value);
    
    // Keep only last 1000 measurements
    if (values.length > 1000) {
      values.splice(0, values.length - 1000);
    }
  }

  // Track errors
  trackError(error: Error, context: string, sessionId?: string): void {
    this.trackEvent({
      eventType: 'error',
      category: 'system',
      action: 'error_occurred',
      label: error.name,
      sessionId: sessionId || 'unknown',
      metadata: {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        context,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    });
  }

  // Get search metrics
  getSearchMetrics(timeframe: number = 24 * 60 * 60 * 1000): SearchMetrics {
    const cutoff = Date.now() - timeframe;
    const searchEvents = this.events.filter(e => 
      e.eventType === 'search' && e.timestamp > cutoff
    );

    const queryCount = new Map<string, number>();
    const genreCount = new Map<string, number>();
    const hourCount = new Map<number, number>();
    let totalResponseTime = 0;
    let successfulSearches = 0;

    searchEvents.forEach(event => {
      const query = event.metadata.query?.toLowerCase() || '';
      queryCount.set(query, (queryCount.get(query) || 0) + 1);

      if (event.metadata.hasResults) {
        successfulSearches++;
      }

      if (event.metadata.responseTime) {
        totalResponseTime += event.metadata.responseTime;
      }

      const hour = new Date(event.timestamp).getHours();
      hourCount.set(hour, (hourCount.get(hour) || 0) + 1);
    });

    const uniqueUsers = new Set(searchEvents.map(e => e.sessionId)).size;

    return {
      totalSearches: searchEvents.length,
      uniqueUsers,
      avgSearchesPerUser: uniqueUsers > 0 ? searchEvents.length / uniqueUsers : 0,
      topQueries: Array.from(queryCount.entries())
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      searchSuccessRate: searchEvents.length > 0 ? (successfulSearches / searchEvents.length) * 100 : 0,
      avgResponseTime: searchEvents.length > 0 ? totalResponseTime / searchEvents.length : 0,
      popularGenres: [], // Would be populated from genre tracking
      timeDistribution: Array.from(hourCount.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour - b.hour)
    };
  }

  // Get user behavior metrics
  getUserBehaviorMetrics(timeframe: number = 24 * 60 * 60 * 1000): UserBehaviorMetrics {
    const cutoff = Date.now() - timeframe;
    const recentEvents = this.events.filter(e => e.timestamp > cutoff);
    
    const uniqueSessions = new Set(recentEvents.map(e => e.sessionId));
    const sessionDurations: number[] = [];
    
    uniqueSessions.forEach(sessionId => {
      const sessionEvents = recentEvents.filter(e => e.sessionId === sessionId);
      if (sessionEvents.length > 1) {
        const start = Math.min(...sessionEvents.map(e => e.timestamp));
        const end = Math.max(...sessionEvents.map(e => e.timestamp));
        sessionDurations.push(end - start);
      }
    });

    const pageViewEvents = recentEvents.filter(e => e.eventType === 'page_view');
    const bounces = Array.from(uniqueSessions).filter(sessionId => {
      return recentEvents.filter(e => e.sessionId === sessionId).length === 1;
    });

    return {
      activeUsers: uniqueSessions.size,
      sessionDuration: sessionDurations,
      pageViews: pageViewEvents.length,
      bounceRate: uniqueSessions.size > 0 ? (bounces.length / uniqueSessions.size) * 100 : 0,
      conversionFunnels: [], // Would track specific conversion flows
      userRetention: [], // Would track user return patterns
      demographicData: {} // Would include user demographic information
    };
  }

  // Get system performance metrics
  getSystemPerformance(): SystemPerformance {
    const apiMetrics = this.calculatePerformanceStats('search_response_time');
    const pageLoadMetrics = this.calculatePerformanceStats('page_load');
    
    const errorEvents = this.events.filter(e => e.eventType === 'error');
    const totalEvents = this.events.length;
    const errorRate = totalEvents > 0 ? (errorEvents.length / totalEvents) * 100 : 0;

    return {
      apiResponseTimes: [
        { service: 'search', avgTime: apiMetrics.avg, p95: apiMetrics.p95, p99: apiMetrics.p99 },
        { service: 'page_load', avgTime: pageLoadMetrics.avg, p95: pageLoadMetrics.p95, p99: pageLoadMetrics.p99 }
      ],
      errorRates: [
        { service: 'overall', rate: errorRate }
      ],
      throughput: [], // Would track requests per second
      systemHealth: { cpu: 0, memory: 0, disk: 0 }, // Would be populated from system monitoring
      uptime: Date.now() - (this.events[0]?.timestamp || Date.now())
    };
  }

  // Generate analytics dashboard data
  generateDashboard(timeframe: number = 24 * 60 * 60 * 1000): any {
    const searchMetrics = this.getSearchMetrics(timeframe);
    const userMetrics = this.getUserBehaviorMetrics(timeframe);
    const performanceMetrics = this.getSystemPerformance();

    return {
      overview: {
        totalSearches: searchMetrics.totalSearches,
        activeUsers: userMetrics.activeUsers,
        avgResponseTime: searchMetrics.avgResponseTime,
        successRate: searchMetrics.searchSuccessRate
      },
      search: searchMetrics,
      users: userMetrics,
      performance: performanceMetrics,
      timestamp: Date.now(),
      timeframe
    };
  }

  // Export analytics data
  exportData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.convertToCSV(this.events);
    }
    return JSON.stringify(this.events, null, 2);
  }

  // Real-time analytics streaming
  startRealTimeStreaming(callback: (event: AnalyticsEvent) => void): () => void {
    const originalTrackEvent = this.trackEvent.bind(this);
    
    this.trackEvent = (event: Partial<AnalyticsEvent>) => {
      originalTrackEvent(event);
      callback(this.events[this.events.length - 1]);
    };

    // Return cleanup function
    return () => {
      this.trackEvent = originalTrackEvent;
    };
  }

  // Private helper methods
  private updateSessionData(event: AnalyticsEvent): void {
    if (!this.sessionData.has(event.sessionId)) {
      this.sessionData.set(event.sessionId, {
        firstSeen: event.timestamp,
        lastSeen: event.timestamp,
        eventCount: 0,
        searchCount: 0,
        errors: 0
      });
    }

    const session = this.sessionData.get(event.sessionId);
    session.lastSeen = event.timestamp;
    session.eventCount++;

    if (event.eventType === 'search') {
      session.searchCount++;
    } else if (event.eventType === 'error') {
      session.errors++;
    }
  }

  private calculatePerformanceStats(metric: string): { avg: number; p95: number; p99: number } {
    const values = this.performanceMetrics.get(metric) || [];
    if (values.length === 0) {
      return { avg: 0, p95: 0, p99: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const p95Index = Math.floor(sorted.length * 0.95);
    const p99Index = Math.floor(sorted.length * 0.99);

    return {
      avg,
      p95: sorted[p95Index] || 0,
      p99: sorted[p99Index] || 0
    };
  }

  private convertToCSV(events: AnalyticsEvent[]): string {
    if (events.length === 0) return '';

    const headers = ['id', 'timestamp', 'sessionId', 'userId', 'eventType', 'category', 'action', 'label', 'value'];
    const rows = events.map(event => [
      event.id,
      new Date(event.timestamp).toISOString(),
      event.sessionId,
      event.userId || '',
      event.eventType,
      event.category,
      event.action,
      event.label || '',
      event.value || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private flushData(): void {
    try {
      // Save to localStorage (in production, would send to analytics service)
      localStorage.setItem('analytics_events', JSON.stringify(this.events.slice(-1000))); // Keep last 1000 events
      
      // In production, would also send to analytics backend
      // this.sendToAnalyticsService(this.events);
      
      console.log(`📊 Analytics: Flushed ${this.events.length} events`);
    } catch (error) {
      console.error('Failed to flush analytics data:', error);
    }
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Admin methods
  clearData(): void {
    this.events = [];
    this.sessionData.clear();
    this.performanceMetrics.clear();
    localStorage.removeItem('analytics_events');
    console.log('📊 Analytics data cleared');
  }

  setAnalyticsEnabled(enabled: boolean): void {
    this.isAnalyticsEnabled = enabled;
    console.log(`📊 Analytics ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Export singleton instance
export const analyticsManager = new AnalyticsManager();
