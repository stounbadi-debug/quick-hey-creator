// ScrapingBee Pro IMDB Integration - Professional Grade
// Enhanced movie data with IMDB ratings, cast, crew, and metadata

export interface IMDBMovieData {
  imdb_id: string;
  title: string;
  year: number;
  rating: number;
  votes: number;
  runtime: number;
  genres: string[];
  director: string[];
  cast: string[];
  plot: string;
  poster_url: string;
  metascore?: number;
  awards?: string;
  box_office?: string;
  country: string[];
  language: string[];
  trivia?: string[];
  goofs?: string[];
  quotes?: string[];
}

export interface EnhancedMovie {
  // TMDB data
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
  
  // IMDB enhanced data
  imdb_data?: IMDBMovieData;
  enhanced_rating?: number; // Combined TMDB + IMDB rating
  professional_score?: number; // AI-calculated quality score
  intelligence_tags?: string[]; // AI-generated tags
}

class ScrapingBeeIMDBService {
  private readonly API_KEY = import.meta.env.VITE_SCRAPINGBEE_API_KEY || '';
  private readonly BASE_URL = 'https://app.scrapingbee.com/api/v1/';
  private readonly cache = new Map<string, IMDBMovieData>();
  private readonly requestQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  constructor() {
    console.log('🎬 ScrapingBee Pro IMDB Service initialized - Professional grade data access');
  }

  // Professional IMDB data extraction
  async getIMDBData(movieTitle: string, year?: number): Promise<IMDBMovieData | null> {
    const cacheKey = `${movieTitle}_${year || 'any'}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log('📊 IMDB data retrieved from cache:', movieTitle);
      return this.cache.get(cacheKey)!;
    }

    try {
      // Add to queue for rate limiting
      return new Promise((resolve) => {
        this.requestQueue.push(async () => {
          try {
            const imdbData = await this.fetchIMDBData(movieTitle, year);
            if (imdbData) {
              this.cache.set(cacheKey, imdbData);
              console.log('✅ IMDB data fetched successfully:', movieTitle);
            }
            resolve(imdbData);
          } catch (error) {
            console.error('❌ IMDB fetch failed:', error);
            resolve(null);
          }
        });
        
        this.processQueue();
      });
    } catch (error) {
      console.error('ScrapingBee IMDB error:', error);
      return null;
    }
  }

  // Process request queue with intelligent rate limiting
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await request();
        // Professional rate limiting - 2 requests per second
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    this.isProcessingQueue = false;
  }

  // Core IMDB data fetching with ScrapingBee Pro
  private async fetchIMDBData(movieTitle: string, year?: number): Promise<IMDBMovieData | null> {
    try {
      // Construct IMDB search URL
      const searchQuery = year ? `${movieTitle} ${year}` : movieTitle;
      const imdbSearchUrl = `https://www.imdb.com/find?q=${encodeURIComponent(searchQuery)}&s=tt&ttype=ft&ref_=fn_ft`;
      
      // ScrapingBee Pro request
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.API_KEY,
          url: imdbSearchUrl,
          render_js: true,
          premium_proxy: true,
          country_code: 'US',
          wait_for: 'networkidle0',
          timeout: 15000,
          extract_rules: {
            title: '.titleColumn .titleNameWrapper a',
            year: '.titleColumn .secondaryInfo',
            rating: '.ratingColumn strong',
            url: '.titleColumn .titleNameWrapper a@href'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ScrapingBee API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.extracted_data && data.extracted_data.title) {
        // Get detailed movie data from the first result
        const movieUrl = data.extracted_data.url;
        if (movieUrl) {
          return await this.fetchDetailedIMDBData(movieUrl);
        }
      }

      return null;
    } catch (error) {
      console.error('IMDB fetch error:', error);
      return null;
    }
  }

  // Fetch detailed IMDB movie data
  private async fetchDetailedIMDBData(imdbUrl: string): Promise<IMDBMovieData | null> {
    try {
      const fullUrl = imdbUrl.startsWith('http') ? imdbUrl : `https://www.imdb.com${imdbUrl}`;
      
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.API_KEY,
          url: fullUrl,
          render_js: true,
          premium_proxy: true,
          country_code: 'US',
          wait_for: 'networkidle0',
          timeout: 20000,
          extract_rules: {
            title: 'h1[data-testid="hero__pageTitle"] span.sc-afe43def-1',
            year: 'h1[data-testid="hero__pageTitle"] .sc-afe43def-2 a',
            rating: '[data-testid="hero-rating-bar__aggregate-rating__score"] span.sc-bde20123-1',
            votes: '[data-testid="hero-rating-bar__aggregate-rating__score"] .sc-bde20123-3',
            runtime: '[data-testid="title-techspecs_section"] .ipc-metadata-list-item__content-container',
            genres: '[data-testid="genres"] .ipc-chip__text',
            director: '[data-testid="title-pc-principal-credit"]:contains("Director") .ipc-metadata-list-item__list-content-item',
            cast: '[data-testid="title-cast-item__actor"] .sc-bfec09a1-1',
            plot: '[data-testid="plot"] .sc-466bb6c-0',
            poster: '.ipc-media img@src',
            metascore: '.score-meta',
            awards: '[data-testid="awards-section"] .ipc-metadata-list-item__content-container',
            country: '[data-testid="title-details-origin"] .ipc-metadata-list-item__list-content-item',
            language: '[data-testid="title-details-languages"] .ipc-metadata-list-item__list-content-item'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ScrapingBee detailed fetch error: ${response.status}`);
      }

      const data = await response.json();
      const extracted = data.extracted_data;

      if (extracted && extracted.title) {
        return {
          imdb_id: this.extractIMDBId(fullUrl),
          title: extracted.title,
          year: parseInt(extracted.year) || new Date().getFullYear(),
          rating: parseFloat(extracted.rating) || 0,
          votes: this.parseVotes(extracted.votes) || 0,
          runtime: this.parseRuntime(extracted.runtime) || 0,
          genres: Array.isArray(extracted.genres) ? extracted.genres : [extracted.genres].filter(Boolean),
          director: Array.isArray(extracted.director) ? extracted.director : [extracted.director].filter(Boolean),
          cast: Array.isArray(extracted.cast) ? extracted.cast.slice(0, 10) : [extracted.cast].filter(Boolean).slice(0, 10),
          plot: extracted.plot || '',
          poster_url: extracted.poster || '',
          metascore: parseInt(extracted.metascore) || undefined,
          awards: extracted.awards || undefined,
          country: Array.isArray(extracted.country) ? extracted.country : [extracted.country].filter(Boolean),
          language: Array.isArray(extracted.language) ? extracted.language : [extracted.language].filter(Boolean)
        };
      }

      return null;
    } catch (error) {
      console.error('Detailed IMDB fetch error:', error);
      return null;
    }
  }

  // Enhanced movie enrichment with IMDB data
  async enhanceMovieWithIMDB(movie: any): Promise<EnhancedMovie> {
    const enhancedMovie: EnhancedMovie = {
      ...movie,
      intelligence_tags: []
    };

    try {
      // Get IMDB data
      const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : undefined;
      const imdbData = await this.getIMDBData(movie.title, releaseYear);
      
      if (imdbData) {
        enhancedMovie.imdb_data = imdbData;
        
        // Calculate enhanced rating (weighted average of TMDB and IMDB)
        const tmdbRating = movie.vote_average || 0;
        const imdbRating = imdbData.rating || 0;
        enhancedMovie.enhanced_rating = (tmdbRating * 0.4 + imdbRating * 0.6);
        
        // Calculate professional score (considers multiple factors)
        enhancedMovie.professional_score = this.calculateProfessionalScore(movie, imdbData);
        
        // Generate intelligence tags
        enhancedMovie.intelligence_tags = this.generateIntelligenceTags(movie, imdbData);
        
        console.log(`🎯 Enhanced movie: ${movie.title} (Professional Score: ${enhancedMovie.professional_score}/100)`);
      }
    } catch (error) {
      console.error('Movie enhancement error:', error);
    }

    return enhancedMovie;
  }

  // Batch enhance multiple movies
  async enhanceMovies(movies: any[]): Promise<EnhancedMovie[]> {
    console.log(`🚀 Enhancing ${movies.length} movies with IMDB data...`);
    
    const enhancedMovies: EnhancedMovie[] = [];
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < movies.length; i += batchSize) {
      const batch = movies.slice(i, i + batchSize);
      const batchPromises = batch.map(movie => this.enhanceMovieWithIMDB(movie));
      const batchResults = await Promise.all(batchPromises);
      enhancedMovies.push(...batchResults);
      
      // Progress logging
      console.log(`📊 Enhanced ${Math.min(i + batchSize, movies.length)}/${movies.length} movies`);
      
      // Small delay between batches
      if (i + batchSize < movies.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`✅ All ${movies.length} movies enhanced with professional IMDB data!`);
    return enhancedMovies;
  }

  // Calculate professional quality score
  private calculateProfessionalScore(movie: any, imdbData: IMDBMovieData): number {
    let score = 0;
    
    // IMDB rating (40 points max)
    score += (imdbData.rating / 10) * 40;
    
    // TMDB rating (20 points max)
    score += ((movie.vote_average || 0) / 10) * 20;
    
    // Vote count factor (15 points max)
    const totalVotes = (movie.vote_count || 0) + (imdbData.votes || 0);
    score += Math.min(Math.log10(totalVotes) * 3, 15);
    
    // Recency factor (10 points max)
    const currentYear = new Date().getFullYear();
    const movieYear = imdbData.year;
    const yearDiff = Math.max(0, currentYear - movieYear);
    score += Math.max(0, 10 - (yearDiff * 0.2));
    
    // Awards factor (10 points max)
    if (imdbData.awards && imdbData.awards.toLowerCase().includes('oscar')) {
      score += 10;
    } else if (imdbData.awards && imdbData.awards.toLowerCase().includes('golden globe')) {
      score += 7;
    } else if (imdbData.awards) {
      score += 5;
    }
    
    // Metascore factor (5 points max)
    if (imdbData.metascore) {
      score += (imdbData.metascore / 100) * 5;
    }
    
    return Math.min(Math.round(score), 100);
  }

  // Generate AI intelligence tags
  private generateIntelligenceTags(movie: any, imdbData: IMDBMovieData): string[] {
    const tags: string[] = [];
    
    // Quality tags
    if (imdbData.rating >= 8.5) tags.push('masterpiece');
    else if (imdbData.rating >= 8.0) tags.push('excellent');
    else if (imdbData.rating >= 7.5) tags.push('great');
    else if (imdbData.rating >= 7.0) tags.push('good');
    
    // Popularity tags
    if (imdbData.votes > 1000000) tags.push('blockbuster');
    else if (imdbData.votes > 500000) tags.push('popular');
    else if (imdbData.votes < 50000) tags.push('hidden-gem');
    
    // Era tags
    const currentYear = new Date().getFullYear();
    const yearDiff = currentYear - imdbData.year;
    if (yearDiff < 2) tags.push('new-release');
    else if (yearDiff < 5) tags.push('recent');
    else if (yearDiff > 30) tags.push('classic');
    
    // Awards tags
    if (imdbData.awards) {
      if (imdbData.awards.toLowerCase().includes('oscar')) tags.push('oscar-winner');
      if (imdbData.awards.toLowerCase().includes('golden globe')) tags.push('golden-globe');
    }
    
    // Runtime tags
    if (imdbData.runtime > 180) tags.push('epic-length');
    else if (imdbData.runtime < 90) tags.push('short-film');
    
    // Director tags (for famous directors)
    const famousDirectors = ['christopher nolan', 'martin scorsese', 'quentin tarantino', 'steven spielberg', 'ridley scott'];
    const directorNames = imdbData.director.map(d => d.toLowerCase());
    for (const director of famousDirectors) {
      if (directorNames.some(d => d.includes(director))) {
        tags.push('acclaimed-director');
        break;
      }
    }
    
    return tags;
  }

  // Helper methods
  private extractIMDBId(url: string): string {
    const match = url.match(/\/title\/(tt\d+)\//);
    return match ? match[1] : '';
  }

  private parseVotes(votesStr: string): number {
    if (!votesStr) return 0;
    const cleanStr = votesStr.replace(/[^\d.KM]/gi, '');
    if (cleanStr.includes('M')) return parseFloat(cleanStr) * 1000000;
    if (cleanStr.includes('K')) return parseFloat(cleanStr) * 1000;
    return parseInt(cleanStr) || 0;
  }

  private parseRuntime(runtimeStr: string): number {
    if (!runtimeStr) return 0;
    const match = runtimeStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  // Get service statistics
  getStats() {
    return {
      cached_movies: this.cache.size,
      queue_length: this.requestQueue.length,
      is_processing: this.isProcessingQueue,
      api_key_active: !!this.API_KEY,
      service_status: 'professional'
    };
  }
}

export const scrapingBeeIMDB = new ScrapingBeeIMDBService();

