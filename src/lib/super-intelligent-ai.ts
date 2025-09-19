// Super Intelligent AI Engine - Solves accuracy problems with multi-layered search strategy
import { Movie } from "./tmdb";
import { tmdbService } from "./tmdb";

export interface SuperAIQuery {
  description: string;
  mood?: string;
  genre?: string;
  era?: string;
}

export interface SuperRecommendationResult {
  movies: Movie[];
  explanation: string;
  confidence: number;
  tags: string[];
  searchStrategy: string;
  exactMatches: boolean;
}

export interface WebSearchResult {
  title: string;
  snippet: string;
  link: string;
}

const GEMINI_API_KEY = 'AIzaSyCuEpBRbqp64DWdy1QaSUxGPichrgny_uk';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

class SuperIntelligentAI {
  private genreMap: { [key: string]: number } = {
    'action': 28, 'adventure': 12, 'animation': 16, 'comedy': 35, 'crime': 80,
    'documentary': 99, 'drama': 18, 'family': 10751, 'fantasy': 14, 'history': 36,
    'horror': 27, 'music': 10402, 'mystery': 9648, 'romance': 10749, 'science fiction': 878,
    'sci-fi': 878, 'thriller': 53, 'war': 10752, 'western': 37
  };

  // STEP 1: Intelligent Query Analysis with Web Search Integration
  private async analyzeQueryIntelligently(query: string): Promise<any> {
    const prompt = `
      You are a MASTER movie database analyst. Analyze this query for EXACT movie identification:

      User Query: "${query}"

      ANALYSIS PROTOCOL:
      1. EXACT MOVIE DETECTION:
         - If describing a specific plot, identify the EXACT movie title
         - If mentioning actors/directors, list them precisely
         - If describing iconic scenes, identify the movie

      2. SEARCH STRATEGY CLASSIFICATION:
         - EXACT_MATCH: User describes a specific known movie
         - ACTOR_DIRECTOR: User mentions specific people
         - THEMATIC: User wants movies with specific themes/genres
         - MOOD_BASED: User describes feelings/atmosphere
         - EXPLORATORY: Vague request needing broad search

      3. KEYWORD EXTRACTION:
         - PRIMARY (3-5): Core distinctive terms for TMDB search
         - SECONDARY (5-8): Related concepts and synonyms
         - ACTORS/DIRECTORS: Any mentioned names
         - FRANCHISE: Any series/franchise references

      4. WEB SEARCH NEEDED:
         - TRUE if query describes plot but you're unsure of exact title
         - TRUE if mentions recent events/releases
         - FALSE if you're confident in identification

      CRITICAL: Return ONLY this JSON format:
      {
        "exact_movies": ["List exact titles if you're 100% certain"],
        "search_strategy": "EXACT_MATCH|ACTOR_DIRECTOR|THEMATIC|MOOD_BASED|EXPLORATORY",
        "primary_keywords": ["3-5 most distinctive search terms"],
        "secondary_keywords": ["5-8 related terms"],
        "actors": ["Any actor names mentioned"],
        "directors": ["Any director names mentioned"],
        "genres": ["Most relevant genres"],
        "mood": "emotional tone",
        "web_search_needed": true/false,
        "web_search_query": "Specific Google search if needed",
        "confidence": 1-100,
        "explanation": "Why this strategy will find accurate results"
      }
    `;

    try {
      const response = await this.callGeminiAPI(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    // Fallback analysis
    return this.createFallbackAnalysis(query);
  }

  // STEP 2: Web Search Integration for Exact Matches
  private async performWebSearch(searchQuery: string): Promise<WebSearchResult[]> {
    try {
      // Using a free web search API (you can replace with your preferred service)
      const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery + ' movie imdb')}&format=json&no_redirect=1`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      // Extract relevant results
      const results: WebSearchResult[] = [];
      if (data.AbstractText) {
        results.push({
          title: data.Heading || 'Movie Information',
          snippet: data.AbstractText,
          link: data.AbstractURL || ''
        });
      }
      
      return results;
    } catch (error) {
      console.error('Web search failed:', error);
      return [];
    }
  }

  // STEP 3: Multi-Strategy TMDB Search
  private async executeSearchStrategy(analysis: any): Promise<Movie[]> {
    let movies: Movie[] = [];
    const strategy = analysis.search_strategy;

    console.log(`🎯 Executing ${strategy} strategy with confidence ${analysis.confidence}%`);

    // Strategy 1: EXACT_MATCH - Highest Priority
    if (strategy === 'EXACT_MATCH' && analysis.exact_movies?.length > 0) {
      for (const title of analysis.exact_movies) {
        const results = await tmdbService.searchMovies(title);
        if (results.results.length > 0) {
          movies.push(...results.results.slice(0, 3));
        }
      }
    }

    // Strategy 2: ACTOR_DIRECTOR - High Priority
    if ((strategy === 'ACTOR_DIRECTOR' || analysis.actors?.length > 0 || analysis.directors?.length > 0) && movies.length < 5) {
      const people = [...(analysis.actors || []), ...(analysis.directors || [])];
      for (const person of people.slice(0, 2)) {
        const results = await tmdbService.searchMovies(person);
        movies.push(...results.results.slice(0, 3));
      }
    }

    // Strategy 3: PRIMARY KEYWORDS - Core Search
    if (analysis.primary_keywords?.length > 0 && movies.length < 8) {
      const primaryQuery = analysis.primary_keywords.slice(0, 3).join(' ');
      const results = await tmdbService.searchMovies(primaryQuery);
      movies.push(...results.results.slice(0, 6));
    }

    // Strategy 4: GENRE + SECONDARY KEYWORDS
    if (movies.length < 10) {
      const genreIds = analysis.genres?.map((g: string) => this.genreMap[g.toLowerCase()]).filter(Boolean);
      if (genreIds?.length > 0) {
        const genreResults = await tmdbService.getMoviesByGenre(genreIds[0]);
        movies.push(...genreResults.results.slice(0, 8));
      }

      // Also try secondary keywords
      if (analysis.secondary_keywords?.length > 0) {
        const secondaryQuery = analysis.secondary_keywords.slice(0, 2).join(' ');
        const results = await tmdbService.searchMovies(secondaryQuery);
        movies.push(...results.results.slice(0, 4));
      }
    }

    // Strategy 5: FALLBACK - Ensure we always have results
    if (movies.length === 0) {
      console.log('🔄 Using fallback strategy');
      const popularResults = await tmdbService.getPopularMovies();
      movies.push(...popularResults.results.slice(0, 8));
    }

    return movies;
  }

  // STEP 4: Intelligent Result Ranking
  private rankResultsByAccuracy(movies: Movie[], analysis: any, originalQuery: string): Movie[] {
    const queryLower = originalQuery.toLowerCase();
    
    return movies
      .filter((movie, index, self) => index === self.findIndex(m => m.id === movie.id)) // Remove duplicates
      .map(movie => ({
        movie,
        score: this.calculateAccuracyScore(movie, analysis, queryLower)
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.movie);
  }

  private calculateAccuracyScore(movie: Movie, analysis: any, queryLower: string): number {
    let score = 0;
    const titleLower = movie.title.toLowerCase();
    const overviewLower = movie.overview.toLowerCase();

    // EXACT TITLE MATCH - Highest score
    if (analysis.exact_movies?.some((title: string) => titleLower.includes(title.toLowerCase()))) {
      score += 1000;
    }

    // TITLE KEYWORD MATCHES
    const allKeywords = [
      ...(analysis.primary_keywords || []),
      ...(analysis.secondary_keywords || [])
    ].map(k => k.toLowerCase());

    for (const keyword of allKeywords) {
      if (titleLower.includes(keyword)) score += 50;
      if (overviewLower.includes(keyword)) score += 20;
    }

    // DIRECT QUERY MATCHES
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 3);
    for (const word of queryWords) {
      if (titleLower.includes(word)) score += 30;
      if (overviewLower.includes(word)) score += 10;
    }

    // ACTOR/DIRECTOR MATCHES
    for (const actor of (analysis.actors || [])) {
      if (overviewLower.includes(actor.toLowerCase())) score += 40;
    }

    // QUALITY INDICATORS
    score += movie.vote_average * 5; // Higher rated movies get boost
    score += Math.min(movie.popularity / 10, 20); // Popular movies get moderate boost

    // RECENCY BONUS for recent queries
    if (queryLower.includes('recent') || queryLower.includes('new') || queryLower.includes('2024')) {
      const year = parseInt(movie.release_date?.substring(0, 4) || '0');
      if (year >= 2022) score += 30;
    }

    return score;
  }

  // MAIN PUBLIC METHOD
  async getIntelligentRecommendations(query: SuperAIQuery): Promise<SuperRecommendationResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Analyze query intelligently
      const analysis = await this.analyzeQueryIntelligently(query.description);
      
      // Step 2: Web search if needed (for exact identification)
      if (analysis.web_search_needed && analysis.web_search_query) {
        console.log('🌐 Performing web search for exact identification');
        const webResults = await this.performWebSearch(analysis.web_search_query);
        // You could further analyze web results to improve exact_movies identification
      }

      // Step 3: Execute multi-strategy search
      const rawMovies = await this.executeSearchStrategy(analysis);

      // Step 4: Rank by accuracy
      const rankedMovies = this.rankResultsByAccuracy(rawMovies, analysis, query.description);

      // Step 5: Generate intelligent explanation
      const explanation = this.generateSmartExplanation(analysis, rankedMovies.length, Date.now() - startTime);

      return {
        movies: rankedMovies.slice(0, 8),
        explanation,
        confidence: Math.min(analysis.confidence + (rankedMovies.length > 0 ? 15 : -20), 100),
        tags: [
          analysis.search_strategy.toLowerCase(),
          ...(analysis.genres || []).slice(0, 2),
          analysis.mood || 'curated'
        ].filter(Boolean),
        searchStrategy: analysis.search_strategy,
        exactMatches: analysis.search_strategy === 'EXACT_MATCH' && rankedMovies.length > 0
      };

    } catch (error) {
      console.error('Super AI failed:', error);
      return this.getEmergencyFallback(query);
    }
  }

  private generateSmartExplanation(analysis: any, resultCount: number, processingTime: number): string {
    const strategy = analysis.search_strategy;
    
    if (strategy === 'EXACT_MATCH' && resultCount > 0) {
      return `🎯 Found exact matches for your request! ${analysis.explanation} (${processingTime}ms)`;
    } else if (strategy === 'ACTOR_DIRECTOR') {
      return `🎬 Curated movies featuring the actors/directors you mentioned. ${analysis.explanation}`;
    } else if (strategy === 'THEMATIC') {
      return `🎨 Intelligent thematic recommendations based on your preferences. ${analysis.explanation}`;
    } else if (strategy === 'MOOD_BASED') {
      return `💫 Perfect ${analysis.mood} movies selected for your current mood. ${analysis.explanation}`;
    } else {
      return `🔍 Exploratory recommendations based on your interests. ${analysis.explanation}`;
    }
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more accurate responses
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  }

  private createFallbackAnalysis(query: string): any {
    const lowerQuery = query.toLowerCase();
    const words = lowerQuery.split(/\s+/);
    
    // Basic pattern recognition
    let strategy = 'EXPLORATORY';
    let exact_movies = [];
    let primary_keywords = [];
    let genres = [];

    // Check for specific movie patterns
    if (lowerQuery.includes('benjamin button') || (lowerQuery.includes('born old') && lowerQuery.includes('young'))) {
      exact_movies.push('The Curious Case of Benjamin Button');
      strategy = 'EXACT_MATCH';
    }

    // Extract meaningful keywords
    primary_keywords = words.filter(word => 
      word.length > 3 && 
      !['movie', 'film', 'show', 'like', 'want', 'need', 'about', 'with'].includes(word)
    ).slice(0, 5);

    // Basic genre detection
    if (lowerQuery.includes('action')) genres.push('action');
    if (lowerQuery.includes('comedy')) genres.push('comedy');
    if (lowerQuery.includes('horror')) genres.push('horror');
    if (lowerQuery.includes('romance')) genres.push('romance');

    return {
      exact_movies,
      search_strategy: strategy,
      primary_keywords,
      secondary_keywords: [],
      actors: [],
      directors: [],
      genres: genres.length > 0 ? genres : ['drama'],
      mood: 'neutral',
      web_search_needed: false,
      confidence: 60,
      explanation: 'Using pattern-based analysis for your request.'
    };
  }

  private async getEmergencyFallback(query: SuperAIQuery): Promise<SuperRecommendationResult> {
    const popularResults = await tmdbService.getPopularMovies();
    
    return {
      movies: popularResults.results.slice(0, 6),
      explanation: "🔧 AI service temporarily unavailable. Here are popular movies you might enjoy!",
      confidence: 50,
      tags: ['popular', 'fallback'],
      searchStrategy: 'FALLBACK',
      exactMatches: false
    };
  }
}

export const superIntelligentAI = new SuperIntelligentAI();
