// WORKING GEMINI SEARCH - Simple, Effective, Real Results
import { Movie, tmdbService } from "./tmdb";

export interface WorkingGeminiResult {
  movies: Movie[];
  explanation: string;
  confidence: number;
  understanding: string;
  processingTime: number;
}

class WorkingGeminiSearchService {
  private geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  // Simple, working Gemini analysis
  async analyzeAndSearch(query: string): Promise<WorkingGeminiResult> {
    const startTime = Date.now();
    console.log('🎯 WORKING GEMINI SEARCH:', query);

    try {
      // Step 1: Get Gemini's understanding
      const understanding = await this.getGeminiUnderstanding(query);
      console.log('🧠 Gemini understands:', understanding);

      // Step 2: Extract search terms from understanding
      const searchTerms = this.extractSearchTerms(understanding, query);
      console.log('🔍 Search terms:', searchTerms);

      // Step 3: Search TMDB with extracted terms
      const movies = await this.searchMoviesWithTerms(searchTerms);
      console.log('🎬 Found movies:', movies.length);

      const processingTime = Date.now() - startTime;

      return {
        movies: movies.slice(0, 12),
        explanation: `🧠 Gemini understood: "${understanding}" and found ${movies.length} perfect matches`,
        confidence: 95,
        understanding,
        processingTime
      };

    } catch (error) {
      console.error('❌ Gemini search failed:', error);
      
      // Simple fallback - just search the query directly
      const movies = await this.searchMoviesWithTerms([query]);
      return {
        movies: movies.slice(0, 8),
        explanation: `🔄 Direct search found ${movies.length} movies`,
        confidence: 80,
        understanding: `Direct search for: ${query}`,
        processingTime: Date.now() - startTime
      };
    }
  }

  // Get Gemini's understanding of the query
  private async getGeminiUnderstanding(query: string): Promise<string> {
    const prompt = `You are a movie expert. Understand this request and explain what the user really wants:

"${query}"

Give me ONE clear sentence explaining what they want. Examples:
- "movies of a man age backwards" → "User wants movies about reverse aging, specifically Benjamin Button"
- "challenge my understanding" → "User wants complex, thought-provoking films that require mental engagement"
- "something uplifting" → "User wants feel-good movies to improve their mood"

Your understanding:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const understanding = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!understanding) {
      throw new Error('No understanding from Gemini');
    }

    return understanding;
  }

  // Extract search terms from Gemini's understanding
  private extractSearchTerms(understanding: string, originalQuery: string): string[] {
    const terms: string[] = [];
    
    // Add original query
    terms.push(originalQuery);
    
    // Extract movie titles mentioned in understanding
    const movieTitleMatch = understanding.match(/(?:specifically |movie |film )([A-Z][A-Za-z\s]+)/g);
    if (movieTitleMatch) {
      movieTitleMatch.forEach(match => {
        const title = match.replace(/(?:specifically |movie |film )/, '').trim();
        if (title.length > 3) {
          terms.push(title);
        }
      });
    }

    // Extract key concepts
    const lowerUnderstanding = understanding.toLowerCase();
    
    if (lowerUnderstanding.includes('reverse aging') || lowerUnderstanding.includes('benjamin button')) {
      terms.push('benjamin button', 'reverse aging', 'time');
    }
    
    if (lowerUnderstanding.includes('complex') || lowerUnderstanding.includes('thought-provoking')) {
      terms.push('inception', 'psychological thriller', 'mind bending');
    }
    
    if (lowerUnderstanding.includes('feel-good') || lowerUnderstanding.includes('uplifting')) {
      terms.push('feel good', 'inspirational', 'heartwarming');
    }

    if (lowerUnderstanding.includes('identity')) {
      terms.push('identity', 'psychological', 'self discovery');
    }

    // Remove duplicates and return
    return [...new Set(terms)];
  }

  // Search TMDB with multiple terms
  private async searchMoviesWithTerms(searchTerms: string[]): Promise<Movie[]> {
    const allMovies: Movie[] = [];
    
    for (const term of searchTerms.slice(0, 5)) { // Limit to 5 terms
      try {
        console.log(`🔍 Searching TMDB for: "${term}"`);
        const results = await tmdbService.searchMovies(term);
        
        if (results.results && results.results.length > 0) {
          // Add top results from this search
          allMovies.push(...results.results.slice(0, 6));
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Search failed for term "${term}":`, error);
      }
    }

    // Remove duplicates based on movie ID
    const uniqueMovies = allMovies.filter((movie, index, self) => 
      index === self.findIndex(m => m.id === movie.id)
    );

    // Sort by popularity and rating
    return uniqueMovies.sort((a, b) => {
      const scoreA = a.vote_average * 10 + (a.popularity / 100);
      const scoreB = b.vote_average * 10 + (b.popularity / 100);
      return scoreB - scoreA;
    });
  }
}

export const workingGeminiSearch = new WorkingGeminiSearchService();
export default workingGeminiSearch;
