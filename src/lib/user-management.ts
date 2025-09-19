// Enterprise User Management System
// Advanced user profiles, preferences, and personalization

export interface UserProfile {
  id: string;
  email?: string;
  username?: string;
  createdAt: number;
  lastActive: number;
  accountType: 'free' | 'premium' | 'enterprise';
  preferences: UserPreferences;
  stats: UserStats;
  settings: UserSettings;
  subscription?: Subscription;
}

export interface UserPreferences {
  favoriteGenres: number[];
  dislikedGenres: number[];
  preferredLanguages: string[];
  preferredDecades: string[];
  favoriteActors: string[];
  favoriteDirectors: string[];
  contentFilters: {
    includeAdult: boolean;
    minRating: number;
    maxRating: number;
    preferredLength: 'short' | 'medium' | 'long' | 'any';
  };
  aiPersonalization: {
    enabled: boolean;
    learningMode: 'conservative' | 'balanced' | 'aggressive';
    explicitFeedback: boolean;
  };
  privacy: {
    shareWatchHistory: boolean;
    allowRecommendations: boolean;
    marketingConsent: boolean;
    analyticsConsent: boolean;
  };
}

export interface UserStats {
  totalSearches: number;
  totalMoviesViewed: number;
  favoriteMovies: number[];
  watchlist: number[];
  searchHistory: SearchHistoryItem[];
  recommendationFeedback: FeedbackItem[];
  activitySummary: {
    dailyActivity: { date: string; searches: number; views: number }[];
    topGenres: { genre: string; count: number }[];
    discoveryRate: number; // percentage of new vs known content
  };
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  region: string;
  notifications: {
    newRecommendations: boolean;
    weeklyDigest: boolean;
    systemUpdates: boolean;
  };
  interface: {
    compactMode: boolean;
    showAdvancedFilters: boolean;
    autoplayTrailers: boolean;
    gridSize: 'small' | 'medium' | 'large';
  };
  performance: {
    enableCache: boolean;
    preloadImages: boolean;
    reducedAnimations: boolean;
  };
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  resultsCount: number;
  selectedMovie?: number;
  searchType: 'text' | 'ai' | 'filter';
  confidence?: number;
}

export interface FeedbackItem {
  id: string;
  movieId: number;
  timestamp: number;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback: 'love' | 'like' | 'neutral' | 'dislike' | 'hate';
  context: string; // what recommendation led to this
}

export interface Subscription {
  id: string;
  plan: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'canceled' | 'expired' | 'trial';
  startDate: number;
  endDate?: number;
  features: string[];
  limits: {
    searchesPerDay: number;
    aiRecommendationsPerDay: number;
    customLists: number;
    apiAccess: boolean;
  };
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  searchCount: number;
  pageViews: string[];
  deviceInfo: {
    userAgent: string;
    platform: string;
    mobile: boolean;
  };
}

class UserManagementSystem {
  private users = new Map<string, UserProfile>();
  private sessions = new Map<string, UserSession>();
  private currentUser: UserProfile | null = null;
  private currentSession: UserSession | null = null;

  constructor() {
    this.initializeUserSystem();
  }

  private initializeUserSystem(): void {
    // Load existing user data
    this.loadUserData();
    
    // Create anonymous session
    this.createAnonymousSession();
    
    console.log('👤 User Management System initialized');
  }

  // User Registration and Authentication
  createUser(userData: Partial<UserProfile>): UserProfile {
    const userId = this.generateUserId();
    const now = Date.now();

    const newUser: UserProfile = {
      id: userId,
      email: userData.email,
      username: userData.username,
      createdAt: now,
      lastActive: now,
      accountType: 'free',
      preferences: this.getDefaultPreferences(),
      stats: this.getDefaultStats(),
      settings: this.getDefaultSettings(),
      subscription: {
        id: `sub_${userId}`,
        plan: 'free',
        status: 'active',
        startDate: now,
        features: ['basic_search', 'favorites', 'watchlist'],
        limits: {
          searchesPerDay: 100,
          aiRecommendationsPerDay: 10,
          customLists: 3,
          apiAccess: false
        }
      }
    };

    this.users.set(userId, newUser);
    this.saveUserData();

    console.log('👤 New user created:', userId);
    return newUser;
  }

  // Session Management
  createAnonymousSession(): UserSession {
    const sessionId = this.generateSessionId();
    const session: UserSession = {
      sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      searchCount: 0,
      pageViews: [],
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        mobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
      }
    };

    this.sessions.set(sessionId, session);
    this.currentSession = session;
    
    return session;
  }

  loginUser(userId: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    this.currentUser = user;
    user.lastActive = Date.now();

    if (this.currentSession) {
      this.currentSession.userId = userId;
    }

    this.saveUserData();
    console.log('👤 User logged in:', userId);
    return true;
  }

  logoutUser(): void {
    if (this.currentUser) {
      this.currentUser.lastActive = Date.now();
      this.saveUserData();
    }

    this.currentUser = null;
    if (this.currentSession) {
      this.currentSession.userId = undefined;
    }

    console.log('👤 User logged out');
  }

  // User Preferences Management
  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    user.preferences = { ...user.preferences, ...preferences };
    user.lastActive = Date.now();
    this.saveUserData();

    console.log('👤 User preferences updated:', userId);
    return true;
  }

  updateUserSettings(userId: string, settings: Partial<UserSettings>): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    user.settings = { ...user.settings, ...settings };
    user.lastActive = Date.now();
    this.saveUserData();

    return true;
  }

  // Movie Interactions
  addToFavorites(userId: string, movieId: number): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    if (!user.stats.favoriteMovies.includes(movieId)) {
      user.stats.favoriteMovies.push(movieId);
      user.lastActive = Date.now();
      this.saveUserData();
      
      console.log('👤 Added to favorites:', movieId, 'for user:', userId);
      return true;
    }
    return false;
  }

  removeFromFavorites(userId: string, movieId: number): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    const index = user.stats.favoriteMovies.indexOf(movieId);
    if (index > -1) {
      user.stats.favoriteMovies.splice(index, 1);
      user.lastActive = Date.now();
      this.saveUserData();
      return true;
    }
    return false;
  }

  addToWatchlist(userId: string, movieId: number): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    if (!user.stats.watchlist.includes(movieId)) {
      user.stats.watchlist.push(movieId);
      user.lastActive = Date.now();
      this.saveUserData();
      return true;
    }
    return false;
  }

  removeFromWatchlist(userId: string, movieId: number): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    const index = user.stats.watchlist.indexOf(movieId);
    if (index > -1) {
      user.stats.watchlist.splice(index, 1);
      user.lastActive = Date.now();
      this.saveUserData();
      return true;
    }
    return false;
  }

  // Search History
  addSearchToHistory(userId: string, searchData: Omit<SearchHistoryItem, 'id'>): void {
    const user = this.users.get(userId);
    if (!user) return;

    const historyItem: SearchHistoryItem = {
      id: this.generateHistoryId(),
      ...searchData
    };

    user.stats.searchHistory.push(historyItem);
    user.stats.totalSearches++;

    // Keep only last 1000 searches
    if (user.stats.searchHistory.length > 1000) {
      user.stats.searchHistory = user.stats.searchHistory.slice(-1000);
    }

    user.lastActive = Date.now();
    this.saveUserData();
  }

  // Recommendation Feedback
  submitFeedback(userId: string, feedback: Omit<FeedbackItem, 'id'>): void {
    const user = this.users.get(userId);
    if (!user) return;

    const feedbackItem: FeedbackItem = {
      id: this.generateFeedbackId(),
      ...feedback
    };

    user.stats.recommendationFeedback.push(feedbackItem);

    // Keep only last 500 feedback items
    if (user.stats.recommendationFeedback.length > 500) {
      user.stats.recommendationFeedback = user.stats.recommendationFeedback.slice(-500);
    }

    // Update preferences based on feedback
    this.updatePreferencesFromFeedback(user, feedbackItem);

    user.lastActive = Date.now();
    this.saveUserData();
  }

  // Analytics and Insights
  getUserInsights(userId: string): any {
    const user = this.users.get(userId);
    if (!user) return null;

    const recentSearches = user.stats.searchHistory
      .filter(h => h.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      .length;

    const topGenres = this.calculateTopGenres(user);
    const discoveryRate = this.calculateDiscoveryRate(user);
    const engagementScore = this.calculateEngagementScore(user);

    return {
      userId,
      accountAge: Date.now() - user.createdAt,
      totalActivity: user.stats.totalSearches + user.stats.favoriteMovies.length,
      recentActivity: recentSearches,
      preferences: {
        topGenres,
        discoveryRate,
        engagementScore
      },
      achievements: this.calculateAchievements(user),
      recommendations: this.generatePersonalRecommendations(user)
    };
  }

  // Personalization Engine
  getPersonalizedPreferences(userId: string): UserPreferences | null {
    const user = this.users.get(userId);
    if (!user) return null;

    // Apply machine learning insights to enhance preferences
    const enhancedPreferences = { ...user.preferences };

    // Analyze feedback to adjust genre preferences
    const feedbackInsights = this.analyzeFeedbackPatterns(user);
    if (feedbackInsights.stronglyLikedGenres.length > 0) {
      enhancedPreferences.favoriteGenres = [
        ...new Set([...enhancedPreferences.favoriteGenres, ...feedbackInsights.stronglyLikedGenres])
      ];
    }

    if (feedbackInsights.stronglyDislikedGenres.length > 0) {
      enhancedPreferences.dislikedGenres = [
        ...new Set([...enhancedPreferences.dislikedGenres, ...feedbackInsights.stronglyDislikedGenres])
      ];
    }

    return enhancedPreferences;
  }

  // Admin Features
  getUserStats(): any {
    return {
      totalUsers: this.users.size,
      activeUsers: Array.from(this.users.values()).filter(u => 
        u.lastActive > Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length,
      premiumUsers: Array.from(this.users.values()).filter(u => 
        u.accountType === 'premium'
      ).length,
      totalSessions: this.sessions.size,
      usersByAccountType: this.getUsersByAccountType(),
      averageEngagement: this.calculateAverageEngagement()
    };
  }

  exportUserData(userId: string): string | null {
    const user = this.users.get(userId);
    if (!user) return null;

    return JSON.stringify(user, null, 2);
  }

  // Privacy and GDPR Compliance
  deleteUserData(userId: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    // Remove user data
    this.users.delete(userId);
    
    // Remove associated sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
      }
    }

    this.saveUserData();
    console.log('👤 User data deleted for GDPR compliance:', userId);
    return true;
  }

  anonymizeUserData(userId: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    // Remove personally identifiable information
    user.email = undefined;
    user.username = `anonymous_${Date.now()}`;
    
    // Keep behavioral data for analytics but remove personal identifiers
    user.lastActive = Date.now();
    this.saveUserData();

    console.log('👤 User data anonymized:', userId);
    return true;
  }

  // Private Helper Methods
  private getDefaultPreferences(): UserPreferences {
    return {
      favoriteGenres: [],
      dislikedGenres: [],
      preferredLanguages: ['en'],
      preferredDecades: [],
      favoriteActors: [],
      favoriteDirectors: [],
      contentFilters: {
        includeAdult: false,
        minRating: 0,
        maxRating: 10,
        preferredLength: 'any'
      },
      aiPersonalization: {
        enabled: true,
        learningMode: 'balanced',
        explicitFeedback: true
      },
      privacy: {
        shareWatchHistory: false,
        allowRecommendations: true,
        marketingConsent: false,
        analyticsConsent: true
      }
    };
  }

  private getDefaultStats(): UserStats {
    return {
      totalSearches: 0,
      totalMoviesViewed: 0,
      favoriteMovies: [],
      watchlist: [],
      searchHistory: [],
      recommendationFeedback: [],
      activitySummary: {
        dailyActivity: [],
        topGenres: [],
        discoveryRate: 0
      }
    };
  }

  private getDefaultSettings(): UserSettings {
    return {
      theme: 'auto',
      language: 'en',
      region: 'US',
      notifications: {
        newRecommendations: true,
        weeklyDigest: true,
        systemUpdates: true
      },
      interface: {
        compactMode: false,
        showAdvancedFilters: false,
        autoplayTrailers: false,
        gridSize: 'medium'
      },
      performance: {
        enableCache: true,
        preloadImages: true,
        reducedAnimations: false
      }
    };
  }

  private updatePreferencesFromFeedback(user: UserProfile, feedback: FeedbackItem): void {
    // This would implement ML algorithms to update preferences based on feedback
    // For now, simple rules-based approach
    if (feedback.rating >= 4) {
      // Positive feedback - could enhance similar content preferences
    } else if (feedback.rating <= 2) {
      // Negative feedback - could reduce similar content recommendations
    }
  }

  private calculateTopGenres(user: UserProfile): { genre: string; count: number }[] {
    // Analyze user's movie interactions to determine top genres
    return []; // Would implement genre analysis
  }

  private calculateDiscoveryRate(user: UserProfile): number {
    // Calculate how often user discovers new vs known content
    return 0.7; // Placeholder
  }

  private calculateEngagementScore(user: UserProfile): number {
    // Calculate user engagement based on various factors
    const factors = {
      searchFrequency: user.stats.totalSearches / Math.max(1, Date.now() - user.createdAt),
      feedbackGiven: user.stats.recommendationFeedback.length,
      listsCreated: user.stats.favoriteMovies.length + user.stats.watchlist.length
    };

    return (factors.searchFrequency * 0.4 + factors.feedbackGiven * 0.3 + factors.listsCreated * 0.3) * 100;
  }

  private calculateAchievements(user: UserProfile): string[] {
    const achievements = [];
    
    if (user.stats.totalSearches >= 100) achievements.push('Search Explorer');
    if (user.stats.favoriteMovies.length >= 50) achievements.push('Movie Lover');
    if (user.stats.recommendationFeedback.length >= 20) achievements.push('Feedback Champion');
    
    return achievements;
  }

  private generatePersonalRecommendations(user: UserProfile): string[] {
    // Generate personalized content recommendations
    return ['Explore more sci-fi films', 'Try international cinema', 'Discover hidden gems'];
  }

  private analyzeFeedbackPatterns(user: UserProfile): any {
    // Analyze user feedback to identify patterns
    return {
      stronglyLikedGenres: [],
      stronglyDislikedGenres: [],
      preferredEras: [],
      patterns: []
    };
  }

  private getUsersByAccountType(): any {
    const stats = { free: 0, premium: 0, enterprise: 0 };
    for (const user of this.users.values()) {
      stats[user.accountType]++;
    }
    return stats;
  }

  private calculateAverageEngagement(): number {
    if (this.users.size === 0) return 0;
    
    let totalEngagement = 0;
    for (const user of this.users.values()) {
      totalEngagement += this.calculateEngagementScore(user);
    }
    
    return totalEngagement / this.users.size;
  }

  private loadUserData(): void {
    try {
      const userData = localStorage.getItem('user_profiles');
      if (userData) {
        const profiles = JSON.parse(userData);
        for (const [id, profile] of Object.entries(profiles)) {
          this.users.set(id, profile as UserProfile);
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  private saveUserData(): void {
    try {
      const userObject = Object.fromEntries(this.users.entries());
      localStorage.setItem('user_profiles', JSON.stringify(userObject));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateHistoryId(): string {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFeedbackId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Getters
  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  getUser(userId: string): UserProfile | null {
    return this.users.get(userId) || null;
  }
}

// Export singleton instance
export const userManager = new UserManagementSystem();
