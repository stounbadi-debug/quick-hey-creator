// Enhanced TMDB Service with Advanced Search Capabilities
// Professional-grade movie database integration

import { Movie, TMDBResponse } from "./tmdb";
import { securityManager } from "./security-manager";

// Extended interfaces for enhanced functionality
export interface AdvancedSearchOptions {
  fromYear?: number;
  toYear?: number;
  minRating?: number;
  maxRating?: number;
  mediaType?: 'movie' | 'tv' | 'both';
  sortBy?: 'popularity' | 'rating' | 'release_date' | 'relevance';
  includeAdult?: boolean;
  region?: string;
  language?: string;
}

export interface SearchAnalytics {
  query: string;
  timestamp: number;
  resultsCount: number;
  processingTime: number;
  strategy: string;
  userId?: string;
}

export interface MovieDetails extends Movie {
  runtime?: number;
  budget?: number;
  revenue?: number;
  status?: string;
  tagline?: string;
  homepage?: string;
  imdb_id?: string;
  belongs_to_collection?: any;
  production_companies?: any[];
  production_countries?: any[];
  spoken_languages?: any[];
  credits?: {
    cast: any[];
    crew: any[];
  };
  videos?: {
    results: any[];
  };
  similar?: {
    results: Movie[];
  };
  recommendations?: {
    results: Movie[];
  };
}

class EnhancedTMDBService {
  private baseUrl = 'https://api.themoviedb.org/3';
  private imageBaseUrl = 'https://image.tmdb.org/t/p/';
  private cache = new Map<string, any>();
  private analytics: SearchAnalytics[] = [];
  private currentSessionId = 'default_session';
  
  private rateLimiter = {
    requests: 0,
    lastReset: Date.now(),
    limit: 40, // TMDB allows 40 requests per 10 seconds
    windowMs: 10000
  };

  constructor() {
    this.initializeService();
  }

  // Initialize service with security
  private initializeService(): void {
    // Create session with security manager
    this.currentSessionId = securityManager.createSession('tmdb_service_' + Date.now()).id;
    console.log('🎬 Enhanced TMDB Service initialized with security');
  }

  // Set session ID for requests
  setSessionId(sessionId: string): void {
    this.currentSessionId = sessionId;
  }

  // Get API key securely
  private getAPIKey(): string {
    return securityManager.getAPIKey('tmdb');
  }

  // Advanced search with multiple keywords and filters
  async advancedSearch(
    keywords: string[], 
    genreIds: number[] = [], 
    options: AdvancedSearchOptions = {}
  ): Promise<TMDBResponse> {
    const startTime = Date.now();
    
    try {
      // Check security and rate limiting
      if (!securityManager.checkRateLimit(this.currentSessionId, 'tmdb')) {
        throw new Error('Rate limit exceeded');
      }
      await this.checkRateLimit();
      
      // Sanitize search query
      const sanitizedKeywords = keywords.map(k => securityManager.sanitizeSearchQuery(k));
      const query = sanitizedKeywords.join(' ').trim();
      if (!query) {
        return { results: [], total_pages: 0, total_results: 0 };
      }

      // Multi-endpoint search strategy
      const searchPromises = [];
      
      // 1. Multi-search for general content
      if (options.mediaType === 'both' || !options.mediaType) {
        searchPromises.push(this.multiSearch(query));
      } else if (options.mediaType === 'movie') {
        searchPromises.push(this.searchMovies(query));
      } else if (options.mediaType === 'tv') {
        searchPromises.push(this.searchTVShows(query));
      }
      
      // 2. Discover based on genres if provided
      if (genreIds.length > 0) {
        searchPromises.push(this.discoverByGenres(genreIds, options));
      }
      
      // 3. Keyword-based discover
      searchPromises.push(this.discoverByKeywords(keywords, options));
      
      const results = await Promise.all(searchPromises);
      
      // Combine and deduplicate results
      let allMovies: Movie[] = [];
      results.forEach(result => {
        if (result && result.results) {
          allMovies.push(...result.results);
        }
      });
      
      // Remove duplicates
      const uniqueMovies = this.removeDuplicates(allMovies);
      
      // Apply advanced filtering
      const filteredMovies = this.applyAdvancedFilters(uniqueMovies, options);
      
      // Sort results
      const sortedMovies = this.sortResults(filteredMovies, options.sortBy || 'relevance', query);
      
      // Log analytics
      this.logSearch(query, sortedMovies.length, Date.now() - startTime, 'advanced');
      
      return {
        results: sortedMovies,
        total_pages: Math.ceil(sortedMovies.length / 20),
        total_results: sortedMovies.length
      };
      
    } catch (error) {
      console.error('Advanced search failed:', error);
      return { results: [], total_pages: 0, total_results: 0 };
    }
  }

  // Multi-search endpoint for movies, TV shows, and people
  async multiSearch(query: string): Promise<TMDBResponse> {
    const cacheKey = `multi_search_${query}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      await this.checkRateLimit();
      
      const response = await fetch(
        `${this.baseUrl}/search/multi?api_key=${this.getAPIKey()}&query=${encodeURIComponent(query)}&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter and normalize results
      const movies = data.results
        .filter((item: any) => item.media_type === 'movie' && item.poster_path)
        .map((item: any) => this.normalizeMovieData(item));
      
      const result = {
        results: movies,
        total_pages: data.total_pages,
        total_results: data.total_results
      };
      
      this.cache.set(cacheKey, result);
      return result;
      
    } catch (error) {
      console.error('Multi-search failed:', error);
      return { results: [], total_pages: 0, total_results: 0 };
    }
  }

  // Enhanced search for TV shows
  async searchTVShows(query: string): Promise<TMDBResponse> {
    const cacheKey = `tv_search_${query}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      await this.checkRateLimit();
      
      const response = await fetch(
        `${this.baseUrl}/search/tv?api_key=${this.getAPIKey()}&query=${encodeURIComponent(query)}&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert TV shows to movie-like format
      const tvShows = data.results
        .filter((show: any) => show.poster_path)
        .map((show: any) => ({
          ...show,
          title: show.name,
          release_date: show.first_air_date,
          overview: show.overview || `TV Series: ${show.name}`
        }));
      
      const result = {
        results: tvShows,
        total_pages: data.total_pages,
        total_results: data.total_results
      };
      
      this.cache.set(cacheKey, result);
      return result;
      
    } catch (error) {
      console.error('TV search failed:', error);
      return { results: [], total_pages: 0, total_results: 0 };
    }
  }

  // Discover movies by genres with advanced options
  async discoverByGenres(genreIds: number[], options: AdvancedSearchOptions = {}): Promise<TMDBResponse> {
    const cacheKey = `discover_genres_${genreIds.join(',')}_${JSON.stringify(options)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      await this.checkRateLimit();
      
      const params = new URLSearchParams({
        api_key: this.getAPIKey(),
        with_genres: genreIds.join(','),
        sort_by: this.mapSortBy(options.sortBy || 'popularity'),
        page: '1'
      });
      
      // Add year filters
      if (options.fromYear) {
        params.append('primary_release_date.gte', `${options.fromYear}-01-01`);
      }
      if (options.toYear) {
        params.append('primary_release_date.lte', `${options.toYear}-12-31`);
      }
      
      // Add rating filters
      if (options.minRating) {
        params.append('vote_average.gte', options.minRating.toString());
      }
      if (options.maxRating) {
        params.append('vote_average.lte', options.maxRating.toString());
      }
      
      // Add other filters
      if (options.region) {
        params.append('region', options.region);
      }
      if (options.language) {
        params.append('with_original_language', options.language);
      }
      if (options.includeAdult !== undefined) {
        params.append('include_adult', options.includeAdult.toString());
      }
      
      const response = await fetch(`${this.baseUrl}/discover/movie?${params}`);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      const result = {
        results: data.results.map((movie: any) => this.normalizeMovieData(movie)),
        total_pages: data.total_pages,
        total_results: data.total_results
      };
      
      this.cache.set(cacheKey, result);
      return result;
      
    } catch (error) {
      console.error('Discover by genres failed:', error);
      return { results: [], total_pages: 0, total_results: 0 };
    }
  }

  // Discover by keywords using TMDB's keyword search
  async discoverByKeywords(keywords: string[], options: AdvancedSearchOptions = {}): Promise<TMDBResponse> {
    try {
      // Search for keyword IDs first
      const keywordIds = await this.findKeywordIds(keywords);
      
      if (keywordIds.length === 0) {
        return { results: [], total_pages: 0, total_results: 0 };
      }
      
      await this.checkRateLimit();
      
      const params = new URLSearchParams({
        api_key: this.getAPIKey(),
        with_keywords: keywordIds.join(','),
        sort_by: this.mapSortBy(options.sortBy || 'popularity'),
        page: '1'
      });
      
      const response = await fetch(`${this.baseUrl}/discover/movie?${params}`);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        results: data.results.map((movie: any) => this.normalizeMovieData(movie)),
        total_pages: data.total_pages,
        total_results: data.total_results
      };
      
    } catch (error) {
      console.error('Discover by keywords failed:', error);
      return { results: [], total_pages: 0, total_results: 0 };
    }
  }

  // Get detailed movie information
  async getMovieDetails(movieId: number): Promise<MovieDetails | null> {
    const cacheKey = `movie_details_${movieId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      await this.checkRateLimit();
      
      const response = await fetch(
        `${this.baseUrl}/movie/${movieId}?api_key=${this.getAPIKey()}&append_to_response=credits,videos,similar,recommendations`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const movieDetails = await response.json();
      this.cache.set(cacheKey, movieDetails);
      return movieDetails;
      
    } catch (error) {
      console.error('Get movie details failed:', error);
      return null;
    }
  }

  // Get trending content with time windows
  async getTrendingContent(mediaType: 'movie' | 'tv' | 'all' = 'movie', timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse> {
    const cacheKey = `trending_${mediaType}_${timeWindow}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      await this.checkRateLimit();
      
      const response = await fetch(
        `${this.baseUrl}/trending/${mediaType}/${timeWindow}?api_key=${this.getAPIKey()}`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      const result = {
        results: data.results.map((item: any) => this.normalizeMovieData(item)),
        total_pages: data.total_pages,
        total_results: data.total_results
      };
      
      this.cache.set(cacheKey, result);
      return result;
      
    } catch (error) {
      console.error('Get trending content failed:', error);
      return { results: [], total_pages: 0, total_results: 0 };
    }
  }

  // Advanced search with autocomplete suggestions
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (query.length < 2) return [];
    
    try {
      const response = await this.multiSearch(query);
      const suggestions = response.results
        .slice(0, limit)
        .map(movie => movie.title)
        .filter(Boolean);
      
      return [...new Set(suggestions)]; // Remove duplicates
      
    } catch (error) {
      console.error('Get search suggestions failed:', error);
      return [];
    }
  }

  // Get comprehensive movie analytics
  getSearchAnalytics(timeframe: number = 24 * 60 * 60 * 1000): SearchAnalytics[] {
    const cutoff = Date.now() - timeframe;
    return this.analytics.filter(entry => entry.timestamp > cutoff);
  }

  // Helper methods
  private async findKeywordIds(keywords: string[]): Promise<number[]> {
    const keywordIds: number[] = [];
    
    for (const keyword of keywords.slice(0, 3)) { // Limit to avoid too many requests
      try {
        await this.checkRateLimit();
        
        const response = await fetch(
          `${this.baseUrl}/search/keyword?api_key=${this.getAPIKey()}&query=${encodeURIComponent(keyword)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            keywordIds.push(data.results[0].id);
          }
        }
      } catch (error) {
        console.error(`Failed to find keyword ID for ${keyword}:`, error);
      }
    }
    
    return keywordIds;
  }

  private removeDuplicates(movies: Movie[]): Movie[] {
    const seen = new Set();
    return movies.filter(movie => {
      if (seen.has(movie.id)) {
        return false;
      }
      seen.add(movie.id);
      return true;
    });
  }

  private applyAdvancedFilters(movies: Movie[], options: AdvancedSearchOptions): Movie[] {
    return movies.filter(movie => {
      // Year filters
      if (options.fromYear || options.toYear) {
        const year = new Date(movie.release_date).getFullYear();
        if (options.fromYear && year < options.fromYear) return false;
        if (options.toYear && year > options.toYear) return false;
      }
      
      // Rating filters
      if (options.minRating && movie.vote_average < options.minRating) return false;
      if (options.maxRating && movie.vote_average > options.maxRating) return false;
      
      // Adult content filter
      if (options.includeAdult === false && movie.adult) return false;
      
      return true;
    });
  }

  private sortResults(movies: Movie[], sortBy: string, query?: string): Movie[] {
    switch (sortBy) {
      case 'rating':
        return movies.sort((a, b) => b.vote_average - a.vote_average);
      case 'release_date':
        return movies.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
      case 'popularity':
        return movies.sort((a, b) => b.popularity - a.popularity);
      case 'relevance':
      default:
        // Custom relevance scoring
        return movies.sort((a, b) => {
          let scoreA = a.popularity * 0.3 + a.vote_average * 10;
          let scoreB = b.popularity * 0.3 + b.vote_average * 10;
          
          // Boost exact title matches
          if (query) {
            const queryLower = query.toLowerCase();
            if (a.title.toLowerCase().includes(queryLower)) scoreA += 100;
            if (b.title.toLowerCase().includes(queryLower)) scoreB += 100;
          }
          
          return scoreB - scoreA;
        });
    }
  }

  private mapSortBy(sortBy: string): string {
    const sortMap: { [key: string]: string } = {
      'popularity': 'popularity.desc',
      'rating': 'vote_average.desc',
      'release_date': 'release_date.desc',
      'relevance': 'popularity.desc'
    };
    
    return sortMap[sortBy] || 'popularity.desc';
  }

  private normalizeMovieData(movie: any): Movie {
    return {
      id: movie.id,
      title: movie.title || movie.name,
      overview: movie.overview || '',
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date || movie.first_air_date || '',
      vote_average: movie.vote_average || 0,
      vote_count: movie.vote_count || 0,
      genre_ids: movie.genre_ids || [],
      adult: movie.adult || false,
      original_language: movie.original_language || 'en',
      popularity: movie.popularity || 0
    };
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now - this.rateLimiter.lastReset > this.rateLimiter.windowMs) {
      this.rateLimiter.requests = 0;
      this.rateLimiter.lastReset = now;
    }
    
    // Check if we need to wait
    if (this.rateLimiter.requests >= this.rateLimiter.limit) {
      const waitTime = this.rateLimiter.windowMs - (now - this.rateLimiter.lastReset);
      if (waitTime > 0) {
        console.log(`Rate limit reached, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.rateLimiter.requests = 0;
        this.rateLimiter.lastReset = Date.now();
      }
    }
    
    this.rateLimiter.requests++;
  }

  private logSearch(query: string, resultsCount: number, processingTime: number, strategy: string): void {
    this.analytics.push({
      query,
      timestamp: Date.now(),
      resultsCount,
      processingTime,
      strategy
    });
    
    // Keep only last 1000 entries
    if (this.analytics.length > 1000) {
      this.analytics = this.analytics.slice(-1000);
    }
  }

  // Legacy compatibility methods
  async searchMovies(query: string): Promise<TMDBResponse> {
    return this.advancedSearch([query], [], { mediaType: 'movie' });
  }

  async getPopularMovies(): Promise<TMDBResponse> {
    return this.discoverByGenres([], { sortBy: 'popularity' });
  }

  async getTrendingMovies(): Promise<TMDBResponse> {
    return this.getTrendingContent('movie', 'week');
  }

  async getMoviesByGenre(genreId: number): Promise<TMDBResponse> {
    return this.discoverByGenres([genreId]);
  }

  // Image URL helpers
  getPosterUrl(posterPath: string, size: string = 'w500'): string {
    return posterPath ? `${this.imageBaseUrl}${size}${posterPath}` : '';
  }

  getBackdropUrl(backdropPath: string, size: string = 'w1280'): string {
    return backdropPath ? `${this.imageBaseUrl}${size}${backdropPath}` : '';
  }
}

export const enhancedTMDBService = new EnhancedTMDBService();
