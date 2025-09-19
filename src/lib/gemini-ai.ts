// Gemini 2.0 Flash AI Service for Movie Recommendations

import { Movie } from "./tmdb";
import { tmdbService } from "./tmdb";

export interface AIQuery {
  description: string;
  mood?: string;
  genre?: string;
  era?: string;
  style?: string;
}

export interface RecommendationResult {
  movies: Movie[];
  explanation: string;
  confidence: number;
  tags: string[];
}

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyCuEpBRbqp64DWdy1QaSUxGPichrgny_uk';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

class GeminiAIService {
  private genreMap: { [key: string]: number } = {
    'action': 28,
    'adventure': 12,
    'animation': 16,
    'comedy': 35,
    'crime': 80,
    'documentary': 99,
    'drama': 18,
    'family': 10751,
    'fantasy': 14,
    'history': 36,
    'horror': 27,
    'music': 10402,
    'mystery': 9648,
    'romance': 10749,
    'science fiction': 878,
    'sci-fi': 878,
    'tv movie': 10770,
    'thriller': 53,
    'war': 10752,
    'western': 37
  };

  private async callGeminiAPI(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
      console.error('Gemini API request failed:', error);
      throw error;
    }
  }

  async analyzeQuery(query: AIQuery): Promise<RecommendationResult> {
    try {
      const prompt = `
        You are a world-class movie and entertainment expert with deep knowledge of cinema history, genres, themes, and cultural context. Your mission is to provide the most accurate and personalized movie recommendations possible.
        
        User Request: "${query.description}"
        ${query.mood ? `User Mood: ${query.mood}` : ''}
        ${query.genre ? `Preferred Genre: ${query.genre}` : ''}
        ${query.era ? `Time Period: ${query.era}` : ''}
        
        ADVANCED ANALYSIS REQUIRED:
        
        1. CONTEXT UNDERSTANDING:
        - Analyze the emotional context and subtext of the request
        - Identify implicit preferences (tone, pacing, complexity)
        - Detect cultural references or specific filmmaker styles
        - Consider seasonal/situational context (date night, family time, etc.)
        
        2. INTELLIGENT MATCHING:
        - If describing a specific movie plot, identify the EXACT title
        - Find thematic connections beyond surface-level genres
        - Consider director styles, cinematography, narrative structure
        - Account for evolution of genres over different eras
        
        3. PERSONALIZATION FACTORS:
        - Sophistication level (mainstream vs. arthouse)
        - Emotional intensity preferences
        - Cultural and linguistic considerations
        - Rewatchability vs. one-time experience
        
        Provide a comprehensive JSON response with:
        {
          "exact_titles": ["Specific movies if user describes known plots"],
          "genres": ["2-4 most relevant genres with nuanced sub-genres"],
          "primary_keywords": ["3-5 core thematic elements, not just plot keywords"],
          "alternative_keywords": ["5-7 related concepts, director names, similar films"],
          "specific_elements": ["Unique plot devices, character archetypes, visual styles"],
          "mood": "Precise emotional tone (melancholic, exhilarating, contemplative, etc.)",
          "era": "Time period with cultural context",
          "media_type": "movie, tv, or both",
          "sophistication_level": "mainstream, indie, arthouse, or mixed",
          "emotional_intensity": "light, moderate, intense, or variable",
          "viewing_context": "solo, date, family, friends, or any",
          "explanation": "Detailed analysis of why these recommendations fit",
          "confidence": "1-100 based on specificity of request",
          "recommendation_strategy": "exact_match, thematic_similarity, mood_based, or exploratory"
        }
        
        CRITICAL: Be highly specific and nuanced. Generic responses will not suffice.
        Return ONLY valid JSON, no other text.
      `;

      const geminiResponse = await this.callGeminiAPI(prompt);
      
      let aiAnalysis;
      try {
        const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiAnalysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
        aiAnalysis = this.getEnhancedFallbackAnalysis(query.description);
      }

      // SUPER-ENHANCED SEARCH STRATEGY
      let movies: Movie[] = [];
      
      // Smart era parsing with cultural context
      const eraStr = String(aiAnalysis.era || '').toLowerCase();
      let fromYear: number | undefined;
      let toYear: number | undefined;
      const decadeMatch = eraStr.match(/^(19|20)\d0s$/);
      if (decadeMatch) {
        const start = parseInt(eraStr.slice(0, 4), 10);
        fromYear = start;
        toYear = start + 9;
      } else if (eraStr.includes('recent') || eraStr.includes('modern')) {
        const now = new Date().getFullYear();
        fromYear = now - 5; // More recent for "recent"
        toYear = now;
      } else if (eraStr.includes('classic') || eraStr.includes('golden age')) {
        toYear = 1979; // True classic era
      } else if (eraStr.includes('80s') || eraStr.includes('eighties')) {
        fromYear = 1980; toYear = 1989;
      } else if (eraStr.includes('90s') || eraStr.includes('nineties')) {
        fromYear = 1990; toYear = 1999;
      } else if (eraStr.includes('2000s') || eraStr.includes('millennium')) {
        fromYear = 2000; toYear = 2009;
      } else if (eraStr.includes('2010s')) {
        fromYear = 2010; toYear = 2019;
      }

      // Recommendation strategy based on AI analysis
      const strategy = aiAnalysis.recommendation_strategy || 'thematic_similarity';
      console.log(`🎬 Using ${strategy} strategy with confidence ${aiAnalysis.confidence}%`);
      // 1. First try exact title matches if provided
      if (aiAnalysis.exact_titles && aiAnalysis.exact_titles.length > 0) {
        for (const title of aiAnalysis.exact_titles.slice(0, 2)) {
          const exactResults = await tmdbService.searchMovies(title);
          if (exactResults.results.length > 0) {
            movies.push(...exactResults.results.slice(0, 3));
          }
          
          // Also search TV shows if media_type includes TV
          if (aiAnalysis.media_type === 'tv' || aiAnalysis.media_type === 'both') {
            const tvResults = await tmdbService.searchTVShows(title);
            if (tvResults.results.length > 0) {
              // Convert TV shows to movie format
              const convertedTVShows = tvResults.results.slice(0, 2).map((tv: any) => ({
                ...tv,
                title: tv.name,
                release_date: tv.first_air_date,
                genre_ids: tv.genre_ids || []
              }));
              movies.push(...convertedTVShows);
            }
          }
        }
      }

      // 2. Advanced keyword search if no exact matches or need more results
      if (movies.length < 6) {
        const allKeywords = [
          ...(aiAnalysis.primary_keywords || []),
          ...(aiAnalysis.alternative_keywords || []),
          ...(aiAnalysis.specific_elements || [])
        ];

        const genreIds = (aiAnalysis.genres || []).map((g: string) => this.genreMap[g.toLowerCase()]).filter(Boolean);

        const mediaType: 'movie' | 'tv' | 'both' = (aiAnalysis.media_type === 'movie' || aiAnalysis.media_type === 'tv') ? aiAnalysis.media_type : 'both';
        
        // Use multiple search strategies for better results
        const searchPromises = [];
        
        // Search with combined keywords
        if (allKeywords.length > 0) {
          const combinedQuery = allKeywords.slice(0, 3).join(' ');
          searchPromises.push(tmdbService.searchMovies(combinedQuery));
        }
        
        // Search by genre if available
        if (genreIds.length > 0) {
          searchPromises.push(tmdbService.getMoviesByGenre(genreIds[0]));
        }
        
        const searchResults = await Promise.all(searchPromises);
        const allResults = searchResults.reduce((acc, result) => {
          if (result && result.results) {
            acc.push(...result.results);
          }
          return acc;
        }, [] as Movie[]);
        
        movies.push(...allResults.slice(0, 12 - movies.length));
      }

      // 3. Remove duplicates
      let uniqueMovies = movies.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      );

      // 3b. Apply era year filtering when available
      if ((fromYear || toYear) && uniqueMovies.length > 0) {
        uniqueMovies = uniqueMovies.filter((m) => {
          const y = parseInt((m.release_date || '').slice(0, 4), 10);
          if (!y) return false;
          if (fromYear && y < fromYear) return false;
          if (toYear && y > toYear) return false;
          return true;
        });
      }

      // 4. Fallback if still no results
      if (uniqueMovies.length === 0) {
        const fallbackGenre = aiAnalysis.genres?.[0];
        if (fallbackGenre && this.genreMap[fallbackGenre.toLowerCase()]) {
          const genreResults = await tmdbService.getMoviesByGenre(this.genreMap[fallbackGenre.toLowerCase()]);
          uniqueMovies.push(...genreResults.results.slice(0, 8));
        } else {
          const popularResults = await tmdbService.getPopularMovies();
          uniqueMovies.push(...popularResults.results.slice(0, 8));
        }
      }

      // Enhanced result ranking based on AI analysis
      const rankedMovies = this.rankMoviesByRelevance(uniqueMovies, aiAnalysis, query);
      
      // Smart explanation based on strategy and results
      let smartExplanation = aiAnalysis.explanation || "Here are personalized recommendations based on your preferences.";
      
      if (strategy === 'exact_match' && rankedMovies.length > 0) {
        smartExplanation = `Found exact matches for your request! ${aiAnalysis.explanation || ''}`;
      } else if (strategy === 'mood_based') {
        smartExplanation = `Perfect ${aiAnalysis.mood} movies selected for your current mood. ${aiAnalysis.explanation || ''}`;
      } else if (strategy === 'thematic_similarity') {
        smartExplanation = `Curated based on themes and style preferences. ${aiAnalysis.explanation || ''}`;
      }

      return {
        movies: rankedMovies.slice(0, 8),
        explanation: smartExplanation,
        confidence: Math.min(aiAnalysis.confidence || 85, rankedMovies.length > 0 ? 95 : 60),
        tags: [
          ...(aiAnalysis.genres || []),
          ...(aiAnalysis.specific_elements || []).slice(0, 2),
          aiAnalysis.mood || 'curated',
          aiAnalysis.sophistication_level || 'mainstream',
          strategy
        ].filter(Boolean)
      };

    } catch (error) {
      console.error('Error in enhanced AI analysis:', error);
      return this.getFallbackRecommendations(query);
    }
  }

  async getMoodBasedRecommendations(mood: string): Promise<Movie[]> {
    try {
      const prompt = `
        Suggest movie genres and keywords for someone in a "${mood}" mood.
        Return JSON with:
        - "genres": Array of 2-3 matching genres
        - "keywords": Array of 3 search terms
        
        Return ONLY valid JSON.
      `;

      const geminiResponse = await this.callGeminiAPI(prompt);
      
      let moodAnalysis;
      try {
        const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          moodAnalysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch (parseError) {
        moodAnalysis = this.getFallbackMoodAnalysis(mood);
      }

      // Get movies based on mood analysis
      let movies: Movie[] = [];
      
      if (moodAnalysis.genres && moodAnalysis.genres.length > 0) {
        const genreId = this.genreMap[moodAnalysis.genres[0].toLowerCase()];
        if (genreId) {
          const genreResults = await tmdbService.getMoviesByGenre(genreId);
          movies = genreResults.results.slice(0, 6);
        }
      }

      if (movies.length === 0) {
        const trendingResults = await tmdbService.getTrendingMovies();
        movies = trendingResults.results.slice(0, 6);
      }

      return movies;
    } catch (error) {
      console.error('Error getting mood recommendations:', error);
      const trendingResults = await tmdbService.getTrendingMovies();
      return trendingResults.results.slice(0, 6);
    }
  }

  async getSimilarMovies(movie: Movie): Promise<Movie[]> {
    try {
      const prompt = `
        Given this movie: "${movie.title}" (${movie.overview.slice(0, 200)})
        
        Suggest search keywords for finding similar movies.
        Return JSON with "keywords" array of 3-4 terms.
        
        Return ONLY valid JSON.
      `;

      const geminiResponse = await this.callGeminiAPI(prompt);
      
      let similarAnalysis;
      try {
        const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          similarAnalysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch (parseError) {
        // Fallback to genre-based similarity
        if (movie.genre_ids && movie.genre_ids.length > 0) {
          const genreResults = await tmdbService.getMoviesByGenre(movie.genre_ids[0]);
          return genreResults.results.filter(m => m.id !== movie.id).slice(0, 4);
        }
      }

      if (similarAnalysis.keywords && similarAnalysis.keywords.length > 0) {
        const searchQuery = similarAnalysis.keywords.slice(0, 2).join(' ');
        const searchResults = await tmdbService.searchMovies(searchQuery);
        return searchResults.results.filter(m => m.id !== movie.id).slice(0, 4);
      }

      // Fallback to genre-based similarity
      if (movie.genre_ids && movie.genre_ids.length > 0) {
        const genreResults = await tmdbService.getMoviesByGenre(movie.genre_ids[0]);
        return genreResults.results.filter(m => m.id !== movie.id).slice(0, 4);
      }

      return [];
    } catch (error) {
      console.error('Error getting similar movies:', error);
      return [];
    }
  }

  private getEnhancedFallbackAnalysis(description: string): any {
    const lowerDesc = description.toLowerCase();
    const genres = [];
    const primary_keywords = [];
    const alternative_keywords = [];
    const specific_elements = [];
    let mood = 'exciting';
    let media_type = 'movie';
    let exact_titles = [];

    // Detect specific movie references
    if (lowerDesc.includes('benjamin button') || (lowerDesc.includes('born old') && lowerDesc.includes('young'))) {
      exact_titles.push('The Curious Case of Benjamin Button');
    }
    if (lowerDesc.includes('serial killer') || lowerDesc.includes('killer')) {
      genres.push('crime', 'thriller');
      primary_keywords.push('serial killer', 'investigation');
      alternative_keywords.push('murder', 'detective', 'psychological');
      mood = 'dark';
    }
    if (lowerDesc.includes('tv show') || lowerDesc.includes('series')) {
      media_type = 'tv';
    }
    if (lowerDesc.includes('action') || lowerDesc.includes('fight')) {
      genres.push('action');
      primary_keywords.push('action', 'fight');
      alternative_keywords.push('adventure', 'hero');
    }
    if (lowerDesc.includes('romance') || lowerDesc.includes('love')) {
      genres.push('romance');
      primary_keywords.push('romance', 'love');
      alternative_keywords.push('relationship', 'couple');
      mood = 'emotional';
    }
    if (lowerDesc.includes('comedy') || lowerDesc.includes('funny')) {
      genres.push('comedy');
      primary_keywords.push('comedy', 'funny');
      alternative_keywords.push('humor', 'laugh');
      mood = 'funny';
    }
    if (lowerDesc.includes('horror') || lowerDesc.includes('scary')) {
      genres.push('horror');
      primary_keywords.push('horror', 'scary');
      alternative_keywords.push('thriller', 'fear');
      mood = 'dark';
    }
    if (lowerDesc.includes('sci-fi') || lowerDesc.includes('science fiction') || lowerDesc.includes('space')) {
      genres.push('science fiction');
      primary_keywords.push('sci-fi', 'science fiction');
      alternative_keywords.push('space', 'future', 'technology');
    }

    // Extract specific elements from description
    const words = lowerDesc.split(/\s+/);
    for (const word of words) {
      if (word.length > 4 && !['movie', 'film', 'show', 'series', 'about', 'with', 'that', 'have', 'been', 'this', 'they', 'will', 'from'].includes(word)) {
        specific_elements.push(word);
      }
    }

    return {
      exact_titles,
      genres: genres.length > 0 ? genres : ['drama'],
      primary_keywords: primary_keywords.length > 0 ? primary_keywords : specific_elements.slice(0, 3),
      alternative_keywords: alternative_keywords.length > 0 ? alternative_keywords : ['popular', 'acclaimed'],
      specific_elements: specific_elements.slice(0, 5),
      mood,
      media_type,
      era: 'any',
      explanation: "Analyzed your request and searching across the full movie and TV database.",
      confidence: 75
    };
  }

  private getFallbackMoodAnalysis(mood: string): any {
    const moodMap: { [key: string]: { genres: string[], keywords: string[] } } = {
      'dark': { genres: ['thriller', 'horror', 'crime'], keywords: ['dark', 'thriller', 'mystery'] },
      'uplifting': { genres: ['comedy', 'adventure', 'family'], keywords: ['feel good', 'comedy', 'adventure'] },
      'thoughtful': { genres: ['drama', 'science fiction'], keywords: ['drama', 'thoughtful', 'deep'] },
      'exciting': { genres: ['action', 'adventure'], keywords: ['action', 'exciting', 'adventure'] },
      'emotional': { genres: ['drama', 'romance'], keywords: ['emotional', 'drama', 'touching'] },
      'funny': { genres: ['comedy'], keywords: ['comedy', 'funny', 'hilarious'] }
    };

    return moodMap[mood.toLowerCase()] || moodMap['exciting'];
  }

  private rankMoviesByRelevance(movies: Movie[], aiAnalysis: any, query: AIQuery): Movie[] {
    return movies.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Boost recent movies if user wants "recent"
      const currentYear = new Date().getFullYear();
      const yearA = parseInt(a.release_date?.substring(0, 4) || '0');
      const yearB = parseInt(b.release_date?.substring(0, 4) || '0');
      
      if (aiAnalysis.era?.includes('recent')) {
        scoreA += Math.max(0, 10 - (currentYear - yearA));
        scoreB += Math.max(0, 10 - (currentYear - yearB));
      }

      // Boost higher rated movies for sophisticated requests
      if (aiAnalysis.sophistication_level === 'arthouse' || aiAnalysis.sophistication_level === 'indie') {
        scoreA += Math.min(a.vote_average * 2, 20);
        scoreB += Math.min(b.vote_average * 2, 20);
      } else {
        // For mainstream, balance rating with popularity
        scoreA += a.vote_average + (a.popularity / 100);
        scoreB += b.vote_average + (b.popularity / 100);
      }

      // Boost movies that match specific keywords in title/overview
      const allKeywords = [
        ...(aiAnalysis.primary_keywords || []),
        ...(aiAnalysis.alternative_keywords || [])
      ].map(k => k.toLowerCase());

      for (const keyword of allKeywords) {
        if (a.title.toLowerCase().includes(keyword) || a.overview.toLowerCase().includes(keyword)) {
          scoreA += 5;
        }
        if (b.title.toLowerCase().includes(keyword) || b.overview.toLowerCase().includes(keyword)) {
          scoreB += 5;
        }
      }

      return scoreB - scoreA;
    });
  }

  private async getFallbackRecommendations(query: AIQuery): Promise<RecommendationResult> {
    const popularResults = await tmdbService.getPopularMovies();
    
    return {
      movies: popularResults.results.slice(0, 6),
      explanation: "Here are some popular movies that might interest you. Our AI service is currently unavailable, but these are great options!",
      confidence: 60,
      tags: ['popular', 'trending']
    };
  }
}

export const geminiAI = new GeminiAIService();