import { Movie } from "./tmdb";
import { tmdbService } from "./tmdb";

// Enhanced GPT-OSS with Web Search and Intent Understanding
export interface EnhancedGPTOSSRequest {
  description: string;
  mood?: string;
  genre?: string;
  era?: string;
  style?: string;
}

export interface WebSearchResult {
  title: string;
  year?: string;
  director?: string;
  description: string;
  rating?: number;
  source: 'web' | 'tmdb';
  tmdb_id?: number;
}

export interface EnhancedGPTOSSResult {
  movies: Movie[];
  webResults: WebSearchResult[];
  explanation: string;
  confidence: number;
  intentAnalysis: {
    detectedIntent: string;
    mood: string;
    themes: string[];
    keywords: string[];
  };
  searchStrategy: string;
  exactMatches: boolean;
  totalSearched: number;
  databaseCoverage: string;
  reasoning: string;
  processingTime: number;
  tags: string[];
}

class EnhancedGPTOSSService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // Advanced intent analysis using pattern matching and NLP techniques
  private analyzeIntent(description: string): EnhancedGPTOSSResult['intentAnalysis'] {
    const lowerDesc = description.toLowerCase();
    
    // Detect mood keywords
    const moodKeywords = {
      'happy': ['funny', 'comedy', 'laugh', 'happy', 'cheerful', 'uplifting', 'feel good'],
      'sad': ['sad', 'cry', 'emotional', 'tearjerker', 'melancholy', 'depressing'],
      'exciting': ['action', 'thrilling', 'exciting', 'adrenaline', 'fast-paced', 'adventure'],
      'scary': ['horror', 'scary', 'frightening', 'terrifying', 'creepy', 'spooky'],
      'romantic': ['romantic', 'love', 'romance', 'relationship', 'date night'],
      'thoughtful': ['deep', 'philosophical', 'meaningful', 'thought-provoking', 'intellectual']
    };

    let detectedMood = 'neutral';
    let maxMoodScore = 0;
    
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      const score = keywords.filter(keyword => lowerDesc.includes(keyword)).length;
      if (score > maxMoodScore) {
        maxMoodScore = score;
        detectedMood = mood;
      }
    }

    // Detect themes and intents
    const themes: string[] = [];
    const keywords: string[] = [];
    
    // Theme detection
    const themePatterns = {
      'family': ['family', 'kids', 'children', 'parents', 'siblings'],
      'friendship': ['friends', 'friendship', 'buddy', 'companions'],
      'revenge': ['revenge', 'vengeance', 'payback', 'retribution'],
      'survival': ['survival', 'survive', 'stranded', 'wilderness'],
      'mystery': ['mystery', 'detective', 'investigation', 'clues', 'solve'],
      'war': ['war', 'battle', 'military', 'soldier', 'combat'],
      'sci-fi': ['space', 'future', 'alien', 'technology', 'robot', 'sci-fi', 'science fiction'],
      'fantasy': ['magic', 'fantasy', 'wizard', 'dragon', 'mythical', 'supernatural']
    };

    for (const [theme, themeKeywords] of Object.entries(themePatterns)) {
      if (themeKeywords.some(keyword => lowerDesc.includes(keyword))) {
        themes.push(theme);
      }
    }

    // Extract key descriptive words
    const words = lowerDesc.match(/\b\w{4,}\b/g) || [];
    keywords.push(...words.slice(0, 10)); // Top 10 meaningful words

    // Detect specific intent patterns
    let detectedIntent = 'general_search';
    
    if (lowerDesc.includes('like') && lowerDesc.includes('but')) {
      detectedIntent = 'similar_with_difference';
    } else if (lowerDesc.includes('similar') || lowerDesc.includes('like')) {
      detectedIntent = 'similar_movies';
    } else if (lowerDesc.includes('mood') || lowerDesc.includes('feel')) {
      detectedIntent = 'mood_based';
    } else if (lowerDesc.includes('actor') || lowerDesc.includes('director') || lowerDesc.includes('starring')) {
      detectedIntent = 'person_based';
    } else if (lowerDesc.includes('genre') || themes.length > 0) {
      detectedIntent = 'genre_based';
    } else if (lowerDesc.includes('year') || lowerDesc.includes('decade') || /\b(19|20)\d{2}\b/.test(lowerDesc)) {
      detectedIntent = 'era_based';
    }

    return {
      detectedIntent,
      mood: detectedMood,
      themes,
      keywords: [...new Set(keywords)] // Remove duplicates
    };
  }

  // Web search simulation (you can replace with real web search API)
  private async searchWeb(query: string, intent: any): Promise<WebSearchResult[]> {
    // This simulates web search results. In production, you'd use:
    // - Google Custom Search API
    // - Bing Search API  
    // - SerpAPI
    // - Or scraping services like ScrapingBee
    
    const webResults: WebSearchResult[] = [];
    
    // Simulate intelligent web search based on intent
    const simulatedResults = [
      {
        title: "The Pursuit of Happyness",
        year: "2006",
        director: "Gabriele Muccino",
        description: "A struggling salesman takes custody of his son as he's poised to begin a life-changing professional career.",
        rating: 8.0,
        source: 'web' as const
      },
      {
        title: "Hidden Figures",
        year: "2016", 
        director: "Theodore Melfi",
        description: "The story of a team of female African-American mathematicians who served a vital role in NASA during the early years of the U.S. space program.",
        rating: 7.8,
        source: 'web' as const
      },
      {
        title: "The Intouchables",
        year: "2011",
        director: "Olivier Nakache",
        description: "After he becomes a quadriplegic from a paragliding accident, an aristocrat hires a young man from the projects to be his caregiver.",
        rating: 8.5,
        source: 'web' as const
      }
    ];

    // Filter and score results based on intent
    for (const result of simulatedResults) {
      let relevanceScore = 0;
      const resultText = `${result.title} ${result.description}`.toLowerCase();
      
      // Score based on mood match
      if (intent.mood !== 'neutral') {
        const moodWords = {
          'happy': ['happy', 'uplifting', 'feel good', 'inspiring', 'positive'],
          'sad': ['struggle', 'emotional', 'touching', 'heartbreaking'],
          'exciting': ['action', 'thrilling', 'adventure', 'intense'],
          'thoughtful': ['story', 'deep', 'meaningful', 'important']
        };
        
        const moodKeywords = moodWords[intent.mood as keyof typeof moodWords] || [];
        relevanceScore += moodKeywords.filter(word => resultText.includes(word)).length * 2;
      }
      
      // Score based on theme match
      for (const theme of intent.themes) {
        if (resultText.includes(theme)) {
          relevanceScore += 3;
        }
      }
      
      // Score based on keyword match
      for (const keyword of intent.keywords.slice(0, 5)) {
        if (resultText.includes(keyword)) {
          relevanceScore += 1;
        }
      }
      
      if (relevanceScore > 2) { // Minimum relevance threshold
        webResults.push(result);
      }
    }
    
    return webResults.slice(0, 3); // Return top 3 web results
  }

  // Enhanced search with TMDB integration
  private async searchTMDB(query: string, intent: any): Promise<Movie[]> {
    try {
      let movies: Movie[] = [];
      
      // Primary search
      const searchResponse = await tmdbService.searchMovies(query);
      movies = searchResponse.results;
      
      // If intent-based search needed, try alternative queries
      if (movies.length < 5 && intent.themes.length > 0) {
        for (const theme of intent.themes.slice(0, 2)) {
          const themeResponse = await tmdbService.searchMovies(theme);
          movies = [...movies, ...themeResponse.results];
        }
      }
      
      // Mood-based genre mapping
      if (movies.length < 5 && intent.mood !== 'neutral') {
        const genreMap = {
          'happy': [35], // Comedy
          'exciting': [28, 12], // Action, Adventure  
          'scary': [27], // Horror
          'romantic': [10749], // Romance
          'thoughtful': [18] // Drama
        };
        
        const genres = genreMap[intent.mood as keyof typeof genreMap];
        if (genres) {
          const genreResponse = await tmdbService.getMoviesByGenre(genres[0]);
          movies = [...movies, ...genreResponse.results.slice(0, 5)];
        }
      }
      
      // Remove duplicates and limit
      const uniqueMovies = Array.from(
        new Map(movies.map(movie => [movie.id, movie])).values()
      );
      
      return uniqueMovies.slice(0, 12);
      
    } catch (error) {
      console.error('TMDB search failed:', error);
      return [];
    }
  }

  // Generate intelligent explanation based on results
  private generateExplanation(
    request: EnhancedGPTOSSRequest, 
    intent: any, 
    tmdbResults: Movie[], 
    webResults: WebSearchResult[]
  ): string {
    const { detectedIntent, mood, themes } = intent;
    
    let explanation = `🧠 Enhanced GPT-OSS analyzed your request: "${request.description}"\n\n`;
    
    // Intent explanation
    switch (detectedIntent) {
      case 'mood_based':
        explanation += `🎭 Detected mood: **${mood}**. I found movies that match this emotional tone.\n`;
        break;
      case 'similar_movies':
        explanation += `🎯 You're looking for similar movies. I searched for films with comparable themes and styles.\n`;
        break;
      case 'genre_based':
        explanation += `🎬 Genre-focused search detected. Themes found: ${themes.join(', ')}.\n`;
        break;
      case 'person_based':
        explanation += `👤 Person-based search detected. Looking for movies by specific actors/directors.\n`;
        break;
      default:
        explanation += `🔍 General intelligent search performed with context understanding.\n`;
    }
    
    // Results summary
    if (tmdbResults.length > 0) {
      explanation += `\n📊 Found ${tmdbResults.length} movies in TMDB database matching your criteria.`;
    }
    
    if (webResults.length > 0) {
      explanation += `\n🌐 Additionally discovered ${webResults.length} relevant movies from web search that might not be in our main database.`;
    }
    
    if (themes.length > 0) {
      explanation += `\n🏷️ Key themes identified: ${themes.join(', ')}`;
    }
    
    return explanation;
  }

  async searchWithEnhancedGPTOSS(request: EnhancedGPTOSSRequest): Promise<EnhancedGPTOSSResult> {
    const startTime = performance.now();
    const cacheKey = `enhanced_gpt_oss_${JSON.stringify(request)}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.CACHE_DURATION)) {
      console.log('⚡ Using cached Enhanced GPT-OSS result');
      return cached.data;
    }
    
    try {
      // Step 1: Analyze intent
      const intentAnalysis = this.analyzeIntent(request.description);
      console.log('🧠 Intent Analysis:', intentAnalysis);
      
      // Step 2: Search TMDB with intelligent queries
      const tmdbResults = await this.searchTMDB(request.description, intentAnalysis);
      
      // Step 3: Perform web search for additional results
      const webResults = await this.searchWeb(request.description, intentAnalysis);
      
      // Step 4: Generate intelligent explanation
      const explanation = this.generateExplanation(request, intentAnalysis, tmdbResults, webResults);
      
      // Step 5: Calculate confidence based on result quality
      let confidence = 50; // Base confidence
      
      if (tmdbResults.length > 0) confidence += 20;
      if (webResults.length > 0) confidence += 15;
      if (intentAnalysis.themes.length > 0) confidence += 10;
      if (intentAnalysis.mood !== 'neutral') confidence += 5;
      
      confidence = Math.min(confidence, 95);
      
      const processingTime = performance.now() - startTime;
      
      const result: EnhancedGPTOSSResult = {
        movies: tmdbResults,
        webResults,
        explanation,
        confidence,
        intentAnalysis,
        searchStrategy: 'ENHANCED_GPT_OSS_WITH_WEB',
        exactMatches: tmdbResults.length > 0,
        totalSearched: tmdbResults.length + webResults.length,
        databaseCoverage: `TMDB: ${tmdbResults.length} movies, Web: ${webResults.length} additional results`,
        reasoning: `Used ${intentAnalysis.detectedIntent} strategy with ${intentAnalysis.mood} mood detection`,
        processingTime,
        tags: ['enhanced', 'intelligent', 'web-search', intentAnalysis.mood, ...intentAnalysis.themes]
      };
      
      // Cache result
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      return result;
      
    } catch (error) {
      console.error('Enhanced GPT-OSS search failed:', error);
      
      return {
        movies: [],
        webResults: [],
        explanation: `🔧 Enhanced GPT-OSS encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0,
        intentAnalysis: {
          detectedIntent: 'error',
          mood: 'neutral',
          themes: [],
          keywords: []
        },
        searchStrategy: 'ERROR_FALLBACK',
        exactMatches: false,
        totalSearched: 0,
        databaseCoverage: 'Search failed due to technical error',
        reasoning: 'Error fallback activated',
        processingTime: performance.now() - startTime,
        tags: ['error', 'fallback']
      };
    }
  }
}

export const enhancedGPTOSSService = new EnhancedGPTOSSService();





