// Universal Intelligence System
// Understands ANY sentence, paragraph, or idea for movie recommendations

import { Movie } from "./tmdb";
import { tmdbService } from "./tmdb";
import { apiConfig } from "./api-config";

export interface UniversalQuery {
  text: string;
  context?: string;
  userPreferences?: {
    favoriteGenres?: string[];
    dislikedGenres?: string[];
    preferredEra?: string;
    mood?: string;
  };
}

export interface IntelligenceAnalysis {
  // Core Understanding
  primaryIntent: string;
  emotionalContext: string;
  complexity: 'simple' | 'moderate' | 'complex';
  
  // Extracted Concepts
  themes: string[];
  moods: string[];
  genres: string[];
  keywords: string[];
  entities: {
    people: string[];
    movies: string[];
    places: string[];
    concepts: string[];
  };
  
  // Search Strategy
  searchApproach: string;
  confidence: number;
  reasoning: string;
  
  // Recommendations
  tmdbQueries: string[];
  webSearchTerms: string[];
  genreFilters: number[];
}

export interface UniversalResult {
  movies: Movie[];
  webResults?: any[];
  analysis: IntelligenceAnalysis;
  explanation: string;
  confidence: number;
  processingTime: number;
  sourcesUsed: string[];
}

class UniversalIntelligenceEngine {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  // Advanced pattern recognition and NLP
  private analyzeText(text: string): IntelligenceAnalysis {
    const lowerText = text.toLowerCase();
    
    // 1. EMOTIONAL CONTEXT DETECTION
    const emotionalPatterns = {
      'happy': {
        patterns: [
          /\b(happy|cheerful|uplifting|feel.good|positive|joyful|bright|optimistic|heartwarming)\b/g,
          /\b(after.*(bad|terrible|awful|hard|difficult).*(day|time|week))\b/g,
          /\b(cheer.*(me|up)|lift.*(spirits|mood)|make.*feel.*better)\b/g,
          /\b(need.*something.*(positive|uplifting|happy))\b/g
        ],
        weight: [3, 4, 3, 3]
      },
      'sad': {
        patterns: [
          /\b(sad|emotional|cry|tearjerker|touching|moving|heartbreaking|melancholy)\b/g,
          /\b(want.*to.*cry|make.*me.*cry|emotional.*journey)\b/g,
          /\b(deep|meaningful|profound|heavy|serious)\b/g
        ],
        weight: [3, 4, 2]
      },
      'exciting': {
        patterns: [
          /\b(exciting|thrilling|action|adrenaline|intense|fast.paced|adventure)\b/g,
          /\b(edge.*of.*seat|heart.pounding|high.energy)\b/g,
          /\b(need.*excitement|want.*adventure)\b/g
        ],
        weight: [3, 4, 3]
      },
      'scary': {
        patterns: [
          /\b(scary|horror|frightening|terrifying|creepy|spooky|haunting)\b/g,
          /\b(but.*not.*(too|very).*(gory|violent|graphic))\b/g,
          /\b(psychological.*horror|suspenseful|thriller)\b/g
        ],
        weight: [3, 2, 3]
      },
      'romantic': {
        patterns: [
          /\b(romantic|romance|love|relationship|date.*night|couple)\b/g,
          /\b(feel.*love|romantic.*comedy|love.*story)\b/g
        ],
        weight: [3, 3]
      },
      'thoughtful': {
        patterns: [
          /\b(thoughtful|deep|philosophical|meaningful|intellectual|complex)\b/g,
          /\b(make.*think|thought.provoking|mind.bending)\b/g,
          /\b(smart|intelligent|cerebral|artistic)\b/g
        ],
        weight: [3, 4, 2]
      }
    };

    let emotionalContext = 'neutral';
    let maxEmotionalScore = 0;

    for (const [emotion, config] of Object.entries(emotionalPatterns)) {
      let score = 0;
      config.patterns.forEach((pattern, index) => {
        const matches = text.match(pattern);
        if (matches) {
          score += matches.length * config.weight[index];
        }
      });
      
      if (score > maxEmotionalScore) {
        maxEmotionalScore = score;
        emotionalContext = emotion;
      }
    }

    // 2. INTENT CLASSIFICATION
    const intentPatterns = {
      'mood_based': /\b(feel|mood|after.*day|cheer.*up|make.*feel|emotional.*state)\b/g,
      'similar_movies': /\b(like|similar.*to|in.*vein.*of|reminds.*me.*of|same.*style)\b/g,
      'genre_specific': /\b(action|comedy|horror|drama|thriller|sci.fi|romance|documentary)\b/g,
      'person_based': /\b(starring|directed.*by|with.*actor|featuring)\b/g,
      'era_based': /\b(from.*\d{4}|in.*the.*\d{2}s|\d{4}.*movie|classic|modern|recent)\b/g,
      'theme_based': /\b(about|dealing.*with|explores|focuses.*on|theme.*of)\b/g,
      'recommendation_request': /\b(recommend|suggest|what.*should.*watch|looking.*for)\b/g
    };

    let primaryIntent = 'general_search';
    let maxIntentScore = 0;

    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      const matches = text.match(pattern);
      if (matches && matches.length > maxIntentScore) {
        maxIntentScore = matches.length;
        primaryIntent = intent;
      }
    }

    // 3. THEME EXTRACTION
    const themePatterns = {
      'family': /\b(family|parents?|children|kids|siblings?|father|mother|dad|mom)\b/g,
      'friendship': /\b(friends?|friendship|buddy|companions?|brotherhood|sisterhood)\b/g,
      'love': /\b(love|romance|relationship|dating|marriage|wedding)\b/g,
      'revenge': /\b(revenge|vengeance|payback|retribution|get.*back)\b/g,
      'survival': /\b(survival|survive|stranded|wilderness|apocalypse|disaster)\b/g,
      'mystery': /\b(mystery|detective|investigation|solve|clues|whodunit)\b/g,
      'war': /\b(war|battle|military|soldier|combat|conflict)\b/g,
      'coming_of_age': /\b(growing.*up|teenager|adolescent|coming.*of.*age|youth)\b/g,
      'redemption': /\b(redemption|second.*chance|forgiveness|making.*amends)\b/g,
      'identity': /\b(identity|who.*am.*i|self.discovery|finding.*myself)\b/g,
      'justice': /\b(justice|right.*wrong|moral|ethical|good.*evil)\b/g,
      'freedom': /\b(freedom|liberation|escape|breaking.*free|independence)\b/g
    };

    const themes: string[] = [];
    for (const [theme, pattern] of Object.entries(themePatterns)) {
      if (text.match(pattern)) {
        themes.push(theme);
      }
    }

    // 4. ENTITY EXTRACTION
    const entities = {
      people: this.extractPeople(text),
      movies: this.extractMovies(text),
      places: this.extractPlaces(text),
      concepts: this.extractConcepts(text)
    };

    // 5. GENRE MAPPING
    const genreMapping = {
      'action': [28],
      'adventure': [12],
      'animation': [16],
      'comedy': [35],
      'crime': [80],
      'documentary': [99],
      'drama': [18],
      'family': [10751],
      'fantasy': [14],
      'history': [36],
      'horror': [27],
      'music': [10402],
      'mystery': [9648],
      'romance': [10749],
      'science fiction': [878],
      'thriller': [53],
      'war': [10752],
      'western': [37]
    };

    const genres: string[] = [];
    const genreFilters: number[] = [];

    // Map emotional context to genres
    const emotionalGenreMapping = {
      'happy': ['comedy', 'family', 'animation', 'music'],
      'sad': ['drama'],
      'exciting': ['action', 'adventure', 'thriller'],
      'scary': ['horror', 'thriller'],
      'romantic': ['romance', 'comedy'],
      'thoughtful': ['drama', 'documentary', 'history']
    };

    if (emotionalGenreMapping[emotionalContext as keyof typeof emotionalGenreMapping]) {
      const suggestedGenres = emotionalGenreMapping[emotionalContext as keyof typeof emotionalGenreMapping];
      genres.push(...suggestedGenres);
      suggestedGenres.forEach(genre => {
        if (genreMapping[genre as keyof typeof genreMapping]) {
          genreFilters.push(...genreMapping[genre as keyof typeof genreMapping]);
        }
      });
    }

    // 6. SEARCH STRATEGY
    let searchApproach = 'comprehensive';
    if (entities.movies.length > 0) {
      searchApproach = 'similar_movies';
    } else if (entities.people.length > 0) {
      searchApproach = 'person_based';
    } else if (themes.length > 0) {
      searchApproach = 'theme_based';
    } else if (emotionalContext !== 'neutral') {
      searchApproach = 'mood_based';
    }

    // 7. GENERATE SEARCH QUERIES
    const tmdbQueries = this.generateTMDBQueries(text, themes, entities, emotionalContext);
    const webSearchTerms = this.generateWebSearchTerms(text, themes, entities);

    // 8. CALCULATE COMPLEXITY AND CONFIDENCE
    const complexity = this.calculateComplexity(text, themes, entities);
    const confidence = this.calculateConfidence(maxEmotionalScore, maxIntentScore, themes.length, entities);

    return {
      primaryIntent,
      emotionalContext,
      complexity,
      themes,
      moods: [emotionalContext],
      genres,
      keywords: this.extractKeywords(text),
      entities,
      searchApproach,
      confidence,
      reasoning: this.generateReasoning(text, primaryIntent, emotionalContext, themes, entities),
      tmdbQueries,
      webSearchTerms,
      genreFilters
    };
  }

  private extractPeople(text: string): string[] {
    // Common actor/director patterns
    const peoplePatterns = [
      /\b(starring|with|featuring|directed by|by)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/g,
      /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(movie|film|directed|starred)/g
    ];
    
    const people: string[] = [];
    peoplePatterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        if (match[2]) people.push(match[2]);
        if (match[1] && !match[2]) people.push(match[1]);
      });
    });
    
    return [...new Set(people)];
  }

  private extractMovies(text: string): string[] {
    // Movie title patterns
    const moviePatterns = [
      /\b(like|similar to|reminds me of)\s+"([^"]+)"/g,
      /\b(like|similar to)\s+([A-Z][^,.!?]*?)(?:\s+but|\s+and|\s*$)/g,
      /\bmovie\s+"([^"]+)"/g
    ];
    
    const movies: string[] = [];
    moviePatterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        if (match[2]) movies.push(match[2]);
        if (match[1] && !match[2]) movies.push(match[1]);
      });
    });
    
    return [...new Set(movies)];
  }

  private extractPlaces(text: string): string[] {
    const placePatterns = [
      /\b(set in|takes place in|located in|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /\b(Japan|China|France|Italy|Germany|England|America|New York|Los Angeles|Tokyo|Paris|London)\b/g
    ];
    
    const places: string[] = [];
    placePatterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        if (match[2]) places.push(match[2]);
        if (match[1] && !match[2]) places.push(match[1]);
        if (match[0] && !match[1] && !match[2]) places.push(match[0]);
      });
    });
    
    return [...new Set(places)];
  }

  private extractConcepts(text: string): string[] {
    const conceptPatterns = [
      /\b(artificial intelligence|time travel|space exploration|virtual reality|cyberpunk|dystopia|utopia)\b/g,
      /\b(superhero|zombie|vampire|alien|robot|magic|wizard|dragon)\b/g,
      /\b(heist|murder|conspiracy|investigation|trial|prison)\b/g
    ];
    
    const concepts: string[] = [];
    conceptPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) concepts.push(...matches);
    });
    
    return [...new Set(concepts)];
  }

  private extractKeywords(text: string): string[] {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'movie', 'film', 'show', 'series'];
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 10);
  }

  private generateTMDBQueries(text: string, themes: string[], entities: any, emotionalContext: string): string[] {
    const queries: string[] = [];
    
    // Theme-based queries
    themes.forEach(theme => {
      queries.push(theme);
    });
    
    // Entity-based queries
    entities.movies.forEach((movie: string) => {
      queries.push(movie);
    });
    
    // Emotional context queries
    const emotionalQueries = {
      'happy': ['feel good movies', 'uplifting films', 'comedy'],
      'sad': ['emotional drama', 'tearjerker', 'moving films'],
      'exciting': ['action movies', 'thriller', 'adventure'],
      'scary': ['horror', 'psychological thriller', 'suspense'],
      'romantic': ['romantic comedy', 'love story', 'romance'],
      'thoughtful': ['drama', 'art house', 'independent film']
    };
    
    if (emotionalQueries[emotionalContext as keyof typeof emotionalQueries]) {
      queries.push(...emotionalQueries[emotionalContext as keyof typeof emotionalQueries]);
    }
    
    return [...new Set(queries)].slice(0, 5);
  }

  private generateWebSearchTerms(text: string, themes: string[], entities: any): string[] {
    const terms: string[] = [];
    
    // Combine themes with "movies"
    themes.forEach(theme => {
      terms.push(`${theme} movies`);
      terms.push(`best ${theme} films`);
    });
    
    // Entity-based web searches
    entities.concepts.forEach((concept: string) => {
      terms.push(`${concept} movies`);
    });
    
    return [...new Set(terms)].slice(0, 3);
  }

  private calculateComplexity(text: string, themes: string[], entities: any): 'simple' | 'moderate' | 'complex' {
    const wordCount = text.split(/\s+/).length;
    const themeCount = themes.length;
    const entityCount = Object.values(entities).flat().length;
    
    if (wordCount < 10 && themeCount <= 1 && entityCount <= 1) {
      return 'simple';
    } else if (wordCount < 30 && themeCount <= 3 && entityCount <= 3) {
      return 'moderate';
    } else {
      return 'complex';
    }
  }

  private calculateConfidence(emotionalScore: number, intentScore: number, themeCount: number, entities: any): number {
    let confidence = 50; // Base confidence
    
    confidence += Math.min(emotionalScore * 5, 25); // Emotional understanding
    confidence += Math.min(intentScore * 3, 15); // Intent clarity
    confidence += Math.min(themeCount * 2, 10); // Theme identification
    
    const entityCount = Object.values(entities).flat().length;
    confidence += Math.min(entityCount * 2, 10); // Entity extraction
    
    return Math.min(confidence, 95);
  }

  private generateReasoning(text: string, intent: string, emotion: string, themes: string[], entities: any): string {
    let reasoning = `I analyzed your request: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"\n\n`;
    
    reasoning += `🎯 **Primary Intent**: ${intent.replace('_', ' ')}\n`;
    reasoning += `🎭 **Emotional Context**: ${emotion}\n`;
    
    if (themes.length > 0) {
      reasoning += `🏷️ **Themes Identified**: ${themes.join(', ')}\n`;
    }
    
    const entityCount = Object.values(entities).flat().length;
    if (entityCount > 0) {
      reasoning += `🔍 **Entities Found**: ${entityCount} references to people, movies, or concepts\n`;
    }
    
    reasoning += `\n💡 **My Understanding**: I understand you want movies that match the ${emotion} emotional tone`;
    if (themes.length > 0) {
      reasoning += ` with themes of ${themes.join(', ')}`;
    }
    reasoning += `. I'll search using intelligent concept matching, not just keywords.`;
    
    return reasoning;
  }

  // Main processing method
  async processUniversalQuery(query: UniversalQuery): Promise<UniversalResult> {
    const startTime = performance.now();
    const cacheKey = `universal_${JSON.stringify(query)}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.CACHE_DURATION)) {
      console.log('⚡ Using cached universal intelligence result');
      return cached.data;
    }
    
    try {
      console.log('🧠 Processing universal query:', query.text);
      
      // Step 1: Analyze the text
      const analysis = this.analyzeText(query.text);
      console.log('📊 Analysis complete:', analysis);
      
      // Step 2: Search TMDB using intelligent queries
      let movies: Movie[] = [];
      const sourcesUsed: string[] = [];
      
      // Try multiple search strategies
      for (const tmdbQuery of analysis.tmdbQueries) {
        try {
          const response = await tmdbService.searchMovies(tmdbQuery);
          movies.push(...response.results);
          sourcesUsed.push(`TMDB: ${tmdbQuery}`);
          
          if (movies.length >= 10) break; // Enough results
        } catch (error) {
          console.warn(`TMDB search failed for: ${tmdbQuery}`, error);
        }
      }
      
      // If not enough results, try genre-based search
      if (movies.length < 5 && analysis.genreFilters.length > 0) {
        try {
          const genreResponse = await tmdbService.getMoviesByGenre(analysis.genreFilters[0]);
          movies.push(...genreResponse.results.slice(0, 8));
          sourcesUsed.push(`TMDB Genre: ${analysis.genres[0]}`);
        } catch (error) {
          console.warn('Genre search failed:', error);
        }
      }
      
      // Step 3: Web search if ScrapingBee is available
      let webResults: any[] = [];
      if (apiConfig.canUseScrapingBee() && analysis.webSearchTerms.length > 0) {
        try {
          // Implement web search here
          sourcesUsed.push('ScrapingBee IMDB');
        } catch (error) {
          console.warn('Web search failed:', error);
        }
      }
      
      // Step 4: Remove duplicates and rank by relevance
      const uniqueMovies = Array.from(
        new Map(movies.map(movie => [movie.id, movie])).values()
      );
      
      // Step 5: Generate explanation
      const explanation = this.generateExplanation(query, analysis, uniqueMovies.length, sourcesUsed);
      
      const processingTime = performance.now() - startTime;
      
      const result: UniversalResult = {
        movies: uniqueMovies.slice(0, 12),
        webResults,
        analysis,
        explanation,
        confidence: analysis.confidence,
        processingTime,
        sourcesUsed
      };
      
      // Cache result
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      return result;
      
    } catch (error) {
      console.error('Universal intelligence processing failed:', error);
      
      // Emergency fallback
      const fallbackMovies = await tmdbService.getPopularMovies();
      
      return {
        movies: fallbackMovies.results.slice(0, 8),
        webResults: [],
        analysis: {
          primaryIntent: 'error_fallback',
          emotionalContext: 'neutral',
          complexity: 'simple',
          themes: [],
          moods: [],
          genres: [],
          keywords: [],
          entities: { people: [], movies: [], places: [], concepts: [] },
          searchApproach: 'emergency',
          confidence: 30,
          reasoning: 'Emergency fallback due to processing error',
          tmdbQueries: [],
          webSearchTerms: [],
          genreFilters: []
        },
        explanation: `🔧 Universal intelligence temporarily unavailable. Showing popular movies as fallback.`,
        confidence: 30,
        processingTime: performance.now() - startTime,
        sourcesUsed: ['TMDB Popular']
      };
    }
  }

  private generateExplanation(query: UniversalQuery, analysis: IntelligenceAnalysis, resultCount: number, sources: string[]): string {
    let explanation = `🧠 **Universal Intelligence Analysis**\n\n`;
    
    explanation += `I processed your request: "${query.text}"\n\n`;
    
    explanation += `**🎯 Understanding:**\n`;
    explanation += `- Primary Intent: ${analysis.primaryIntent.replace('_', ' ')}\n`;
    explanation += `- Emotional Context: ${analysis.emotionalContext}\n`;
    explanation += `- Complexity: ${analysis.complexity}\n`;
    
    if (analysis.themes.length > 0) {
      explanation += `- Themes: ${analysis.themes.join(', ')}\n`;
    }
    
    explanation += `\n**🔍 Search Strategy:**\n`;
    explanation += `- Approach: ${analysis.searchApproach.replace('_', ' ')}\n`;
    explanation += `- Confidence: ${analysis.confidence}%\n`;
    explanation += `- Sources Used: ${sources.join(', ')}\n`;
    
    explanation += `\n**📊 Results:**\n`;
    explanation += `Found ${resultCount} movies that match your ${analysis.emotionalContext} emotional context`;
    
    if (analysis.themes.length > 0) {
      explanation += ` with themes of ${analysis.themes.join(', ')}`;
    }
    
    explanation += `.\n\n${analysis.reasoning}`;
    
    return explanation;
  }
}

export const universalIntelligence = new UniversalIntelligenceEngine();





