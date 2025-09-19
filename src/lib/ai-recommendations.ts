// AI-Powered Movie Recommendation Engine (Updated to use Gemini AI)
import { Movie } from "./tmdb";
import { geminiAI } from "./gemini-ai";

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
  searchMetadata?: {
    queryProcessingTime: number;
    searchStrategy: string;
    totalResults: number;
    confidenceFactors: string[];
    fallbackUsed: boolean;
    aiModelUsed: string;
    semanticMatchScore: number;
  };
}

export interface UserProfile {
  favoriteGenres: string[];
  watchHistory: Movie[];
  preferences: {
    mood: string[];
    era: string[];
    style: string[];
  };
}

class AIRecommendationEngine {
  private movieDatabase: Movie[] = [
    {
      id: 1,
      title: "The Matrix",
      overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
      poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
      backdrop_path: "/vybQQ7w7vGvF53IsGD0y0JSgIsA.jpg",
      release_date: "1999-03-31",
      vote_average: 8.2,
      vote_count: 23853,
      genre_ids: [28, 878],
      adult: false,
      original_language: "en",
      popularity: 85.423
    },
    {
      id: 2,
      title: "Inception",
      overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      backdrop_path: "/xl5oCFLVMo4d0oK7a8W1GFE4LaO.jpg",
      release_date: "2010-07-16",
      vote_average: 8.4,
      vote_count: 34562,
      genre_ids: [28, 53, 878],
      adult: false,
      original_language: "en",
      popularity: 92.147
    },
    {
      id: 3,
      title: "Interstellar",
      overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      backdrop_path: "/pbEJJuIhx0WJt9pJFICzFufcIYO.jpg",
      release_date: "2014-11-07",
      vote_average: 8.1,
      vote_count: 32946,
      genre_ids: [12, 18, 878],
      adult: false,
      original_language: "en",
      popularity: 78.234
    },
    {
      id: 4,
      title: "The Dark Knight",
      overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
      poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      backdrop_path: "/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
      release_date: "2008-07-18",
      vote_average: 9.0,
      vote_count: 31428,
      genre_ids: [28, 80, 18],
      adult: false,
      original_language: "en",
      popularity: 95.673
    },
    {
      id: 5,
      title: "Pulp Fiction",
      overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",
      poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      backdrop_path: "/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg",
      release_date: "1994-10-14",
      vote_average: 8.9,
      vote_count: 26738,
      genre_ids: [80, 18],
      adult: false,
      original_language: "en",
      popularity: 88.956
    },
    {
      id: 6,
      title: "Avatar",
      overview: "In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following orders and protecting an alien civilization.",
      poster_path: "/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg",
      backdrop_path: "/o0s4XsEDfDlvit5pDRKjzXR4pp2.jpg",
      release_date: "2009-12-18",
      vote_average: 7.6,
      vote_count: 28947,
      genre_ids: [28, 12, 14, 878],
      adult: false,
      original_language: "en",
      popularity: 76.892
    },
    {
      id: 7,
      title: "Avengers: Endgame",
      overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all.",
      poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
      backdrop_path: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
      release_date: "2019-04-26",
      vote_average: 8.3,
      vote_count: 24658,
      genre_ids: [12, 878, 28],
      adult: false,
      original_language: "en",
      popularity: 98.456
    },
    {
      id: 8,
      title: "Dune",
      overview: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.",
      poster_path: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
      backdrop_path: "/iopYFB1b6Bh7FWZh3onQhph1sih.jpg",
      release_date: "2021-10-22",
      vote_average: 8.0,
      vote_count: 12473,
      genre_ids: [12, 18, 878],
      adult: false,
      original_language: "en",
      popularity: 89.234
    },
    // Add more diverse movies for better AI recommendations
    {
      id: 9,
      title: "La La Land",
      overview: "A jazz musician and an aspiring actress fall in love while pursuing their dreams in Los Angeles.",
      poster_path: "/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
      backdrop_path: "/fp6X6yhgcxzxCpmM0EVC6V9B8XB.jpg",
      release_date: "2016-12-25",
      vote_average: 8.0,
      vote_count: 8247,
      genre_ids: [35, 18, 10402],
      adult: false,
      original_language: "en",
      popularity: 45.234
    },
    {
      id: 10,
      title: "The Shawshank Redemption",
      overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      backdrop_path: "/xBKGJQsAIeweesB79KC89FpBrVr.jpg",
      release_date: "1994-09-23",
      vote_average: 9.3,
      vote_count: 26378,
      genre_ids: [18, 80],
      adult: false,
      original_language: "en",
      popularity: 92.845
    }
  ];

  private genreMap: { [key: number]: string } = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western"
  };

  private moodKeywords: { [key: string]: string[] } = {
    dark: ["dark", "noir", "thriller", "horror", "mystery", "crime"],
    uplifting: ["comedy", "adventure", "romance", "family", "music"],
    thoughtful: ["drama", "science fiction", "documentary", "biography"],
    exciting: ["action", "adventure", "thriller", "sci-fi"],
    emotional: ["drama", "romance", "biography", "family"],
    funny: ["comedy", "animated", "family", "parody"]
  };

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async analyzeQuery(query: AIQuery): Promise<RecommendationResult> {
    await this.delay(800); // Simulate AI processing

    const description = query.description.toLowerCase();
    const scores: { [movieId: number]: number } = {};
    const tags: string[] = [];
    
    // Score movies based on description
    this.movieDatabase.forEach(movie => {
      let score = 0;
      
      // Title matching
      if (description.includes(movie.title.toLowerCase())) {
        score += 100;
      }
      
      // Overview/plot matching
      const overviewWords = movie.overview.toLowerCase().split(' ');
      const queryWords = description.split(' ');
      const matchingWords = queryWords.filter(word => 
        word.length > 3 && overviewWords.some(overviewWord => 
          overviewWord.includes(word) || word.includes(overviewWord)
        )
      );
      score += matchingWords.length * 10;
      
      // Genre matching
      movie.genre_ids.forEach(genreId => {
        const genre = this.genreMap[genreId];
        if (genre && description.includes(genre.toLowerCase())) {
          score += 30;
          if (!tags.includes(genre)) tags.push(genre);
        }
      });
      
      // Mood matching
      Object.entries(this.moodKeywords).forEach(([mood, keywords]) => {
        const moodMatches = keywords.some(keyword => description.includes(keyword));
        if (moodMatches) {
          movie.genre_ids.forEach(genreId => {
            const genre = this.genreMap[genreId];
            if (genre && keywords.includes(genre.toLowerCase())) {
              score += 25;
              if (!tags.includes(mood)) tags.push(mood);
            }
          });
        }
      });
      
      // Era/time period matching
      const year = new Date(movie.release_date).getFullYear();
      if (description.includes('90s') && year >= 1990 && year < 2000) score += 20;
      if (description.includes('2000s') && year >= 2000 && year < 2010) score += 20;
      if (description.includes('recent') && year >= 2015) score += 15;
      if (description.includes('classic') && year < 2000) score += 15;
      
      // Rating preference
      if (description.includes('highly rated') && movie.vote_average > 8) score += 20;
      if (description.includes('popular') && movie.popularity > 80) score += 15;
      
      // Random factor for variety
      score += Math.random() * 5;
      
      if (score > 0) {
        scores[movie.id] = score;
      }
    });
    
    // Sort and get top movies
    const sortedMovies = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([id]) => this.movieDatabase.find(m => m.id === parseInt(id))!)
      .filter(Boolean);
    
    // Generate explanation
    const topScore = Math.max(...Object.values(scores));
    const confidence = Math.min(95, Math.max(20, (topScore / 100) * 100));
    
    let explanation = "Based on your description, I found movies that match";
    if (tags.length > 0) {
      explanation += ` your interest in ${tags.slice(0, 3).join(", ")}`;
    }
    explanation += ". These recommendations consider plot themes, genre preferences, and mood indicators from your query.";
    
    return {
      movies: sortedMovies,
      explanation,
      confidence: Math.round(confidence),
      tags
    };
  }

  async getSimilarMovies(movie: Movie): Promise<Movie[]> {
    await this.delay(500);
    
    return this.movieDatabase
      .filter(m => m.id !== movie.id)
      .map(m => ({
        movie: m,
        similarity: this.calculateSimilarity(movie, m)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 4)
      .map(item => item.movie);
  }

  private calculateSimilarity(movie1: Movie, movie2: Movie): number {
    let score = 0;
    
    // Genre similarity
    const commonGenres = movie1.genre_ids.filter(g => movie2.genre_ids.includes(g));
    score += commonGenres.length * 30;
    
    // Rating similarity
    const ratingDiff = Math.abs(movie1.vote_average - movie2.vote_average);
    score += Math.max(0, 20 - ratingDiff * 3);
    
    // Era similarity
    const year1 = new Date(movie1.release_date).getFullYear();
    const year2 = new Date(movie2.release_date).getFullYear();
    const yearDiff = Math.abs(year1 - year2);
    if (yearDiff <= 5) score += 15;
    else if (yearDiff <= 10) score += 10;
    
    return score + Math.random() * 5;
  }

  async getMoodBasedRecommendations(mood: string): Promise<Movie[]> {
    await this.delay(600);
    
    const keywords = this.moodKeywords[mood.toLowerCase()] || [];
    const relevantMovies = this.movieDatabase.filter(movie => {
      return movie.genre_ids.some(genreId => {
        const genre = this.genreMap[genreId];
        return genre && keywords.includes(genre.toLowerCase());
      });
    });
    
    return relevantMovies
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
  }
}

// Legacy engine for fallback
const legacyEngine = new AIRecommendationEngine();

// Enhanced AI recommendation service with improved Gemini AI and robust fallbacks
export const aiRecommendationEngine = {
  async analyzeQuery(query: AIQuery): Promise<RecommendationResult> {
    try {
      // Try enhanced Gemini AI first (most reliable)
      console.log('🧠 Using Enhanced Gemini AI for query:', query.description);
      return await geminiAI.analyzeQuery(query);
    } catch (error) {
      console.error('Gemini AI failed, falling back to local engine:', error);
      try {
        // Fallback to local engine with enhancements
        console.log('🔄 Falling back to enhanced local engine');
        return await legacyEngine.analyzeQuery(query);
      } catch (legacyError) {
        console.error('All AI engines failed, providing basic fallback:', legacyError);
        // Ultimate fallback
        return {
          movies: [],
          explanation: "AI search is temporarily unavailable. Please try a simpler search or check your connection.",
          confidence: 0,
          tags: ['fallback'],
          searchMetadata: {
            queryProcessingTime: 0,
            searchStrategy: 'fallback',
            totalResults: 0,
            confidenceFactors: ['fallback'],
            fallbackUsed: true,
            aiModelUsed: 'fallback',
            semanticMatchScore: 0
          }
        };
      }
    }
  },

  async getSimilarMovies(movie: Movie, userPreferences?: any): Promise<Movie[]> {
    try {
      return await geminiAI.getSimilarMovies(movie);
    } catch (error) {
      console.error('Gemini similar movies failed, using legacy:', error);
      return await legacyEngine.getSimilarMovies(movie);
    }
  },

  async getMoodBasedRecommendations(mood: string): Promise<Movie[]> {
    try {
      return await geminiAI.getMoodBasedRecommendations(mood);
    } catch (error) {
      console.error('Gemini mood recommendations failed, using legacy:', error);
      return await legacyEngine.getMoodBasedRecommendations(mood);
    }
  },

  // Enhanced features that work reliably
  async getSearchSuggestions(partialQuery: string): Promise<string[]> {
    try {
      // Generate intelligent search suggestions based on common patterns
      const baseSuggestions = [
        `${partialQuery} movie`,
        `${partialQuery} TV show`,
        `movies like ${partialQuery}`,
        `${partialQuery} thriller`,
        `${partialQuery} comedy`
      ];
      
      // Add specific suggestions based on partial query content
      const lowerQuery = partialQuery.toLowerCase();
      if (lowerQuery.includes('sci')) {
        baseSuggestions.push('sci-fi movies with time travel');
      }
      if (lowerQuery.includes('hor')) {
        baseSuggestions.push('horror movies from the 80s');
      }
      if (lowerQuery.includes('rom')) {
        baseSuggestions.push('romantic comedies from the 90s');
      }
      
      return baseSuggestions.filter(s => s.length > partialQuery.length).slice(0, 5);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      return [];
    }
  }
};