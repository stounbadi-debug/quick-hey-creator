// TMDB API Service with real API integration

export interface Movie {
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
}

export interface TMDBResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// TMDB API Configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '036c205f43b82d159d2f14d54e074b23';
const TMDB_READ_ACCESS_TOKEN = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMzZjMjA1ZjQzYjgyZDE1OWQyZjE0ZDU0ZTA3NGIyMyIsIm5iZiI6MTc1NDU2NDE4My44MjIsInN1YiI6IjY4OTQ4NjU3YzA2YTkzYzg5ZTY2ZTgwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MP5eSXy-4KEf16YWcTRYWFBUjQ8gXlB0AUaraCXkLcA';

// Fallback mock data for offline/error scenarios
const MOCK_MOVIES: Movie[] = [
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
  }
];

class TMDBService {
  private async makeRequest(endpoint: string, params: Record<string, string | number> = {}): Promise<any> {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    
    // Add API key to params
    params.api_key = TMDB_API_KEY;
    
    // Add all params to URL
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('TMDB API request failed:', error);
      // Return mock data as fallback
      return this.getMockFallback();
    }
  }

  private getMockFallback(): TMDBResponse {
    return {
      page: 1,
      results: [...MOCK_MOVIES].slice(0, 8),
      total_pages: 1,
      total_results: MOCK_MOVIES.length
    };
  }

  async searchMovies(query: string, page: number = 1): Promise<TMDBResponse> {
    if (!query.trim()) {
      return this.getPopularMovies(page);
    }

    const response = await this.makeRequest('/search/movie', {
      query,
      page,
      include_adult: 'false',
      language: 'en-US'
    });

    return {
      page: response.page || page,
      results: response.results || [],
      total_pages: response.total_pages || 1,
      total_results: response.total_results || 0
    };
  }

  async searchTVShows(query: string, page: number = 1): Promise<any> {
    if (!query.trim()) {
      return this.getPopularTVShows(page);
    }

    const response = await this.makeRequest('/search/tv', {
      query,
      page,
      include_adult: 'false',
      language: 'en-US'
    });

    return {
      page: response.page || page,
      results: response.results || [],
      total_pages: response.total_pages || 1,
      total_results: response.total_results || 0
    };
  }

  async searchMulti(query: string, page: number = 1): Promise<any> {
    if (!query.trim()) {
      return { page: 1, results: [], total_pages: 1, total_results: 0 };
    }

    const response = await this.makeRequest('/search/multi', {
      query,
      page,
      include_adult: 'false',
      language: 'en-US'
    });

    return {
      page: response.page || page,
      results: response.results || [],
      total_pages: response.total_pages || 1,
      total_results: response.total_results || 0
    };
  }

  async advancedSearch(
    keywords: string[],
    genres?: number[],
    options?: { fromYear?: number; toYear?: number; mediaType?: 'movie' | 'tv' | 'both' }
  ): Promise<TMDBResponse> {
    try {
      const searchPromises: Promise<any>[] = [];

      // 1) Direct title/multi searches for top keywords (broad)
      for (const keyword of keywords.slice(0, 3)) {
        searchPromises.push(this.searchMovies(keyword));
        searchPromises.push(this.searchMulti(keyword));
      }

      // 2) Combined keywords search
      if (keywords.length > 1) {
        const combinedQuery = keywords.slice(0, 3).join(' ');
        searchPromises.push(this.searchMovies(combinedQuery));
        searchPromises.push(this.searchMulti(combinedQuery));
      }

      // 3) Discover with filters (precise)
      const mediaType = options?.mediaType || 'both';

      // Movies discover
      if (mediaType === 'movie' || mediaType === 'both') {
        const movieDiscoverParams: Record<string, string | number> = {
          page: 1,
          language: 'en-US',
          sort_by: 'popularity.desc',
          include_adult: 'false',
          'vote_count.gte': 50,
        };
        if (genres && genres.length > 0) movieDiscoverParams.with_genres = genres.join(',');
        if (options?.fromYear) movieDiscoverParams['primary_release_date.gte'] = `${options.fromYear}-01-01`;
        if (options?.toYear) movieDiscoverParams['primary_release_date.lte'] = `${options.toYear}-12-31`;
        searchPromises.push(this.makeRequest('/discover/movie', movieDiscoverParams));
      }

      // TV discover
      if (mediaType === 'tv' || mediaType === 'both') {
        const tvDiscoverParams: Record<string, string | number> = {
          page: 1,
          language: 'en-US',
          sort_by: 'popularity.desc',
          'vote_count.gte': 50,
        };
        if (genres && genres.length > 0) tvDiscoverParams.with_genres = genres.join(',');
        if (options?.fromYear) tvDiscoverParams['first_air_date.gte'] = `${options.fromYear}-01-01`;
        if (options?.toYear) tvDiscoverParams['first_air_date.lte'] = `${options.toYear}-12-31`;
        searchPromises.push(this.makeRequest('/discover/tv', tvDiscoverParams));
      }

      // 4) Genre-only discovery as backup
      if (genres && genres.length > 0) {
        searchPromises.push(this.getMoviesByGenre(genres[0]));
      }

      // Execute all searches in parallel
      const results = await Promise.all(searchPromises);

      // Combine and deduplicate results
      const allMovies: Movie[] = [];
      const seenIds = new Set<number>();

      for (const result of results) {
        if (result.results) {
          for (const movie of result.results) {
            if (!seenIds.has(movie.id) && movie.media_type !== 'person') {
              if (movie.media_type === 'tv' || (movie as any).first_air_date) {
                const convertedMovie: Movie = {
                  ...(movie as any),
                  title: (movie as any).name || movie.title,
                  release_date: (movie as any).first_air_date || movie.release_date,
                  genre_ids: movie.genre_ids || [],
                };
                allMovies.push(convertedMovie);
              } else if (movie.media_type === 'movie' || movie.release_date) {
                allMovies.push(movie as Movie);
              }
              seenIds.add(movie.id);
            }
          }
        }
      }

      // Year filter (safety) if provided
      const fromYear = options?.fromYear;
      const toYear = options?.toYear;
      const filteredByYear = (fromYear || toYear)
        ? allMovies.filter((m) => {
            const year = parseInt((m.release_date || '').slice(0, 4), 10);
            if (!year) return false;
            if (fromYear && year < fromYear) return false;
            if (toYear && year > toYear) return false;
            return true;
          })
        : allMovies;

      // Sort by relevance
      filteredByYear.sort((a, b) => {
        const scoreA = (a.popularity || 0) * 0.7 + (a.vote_average || 0) * 0.3;
        const scoreB = (b.popularity || 0) * 0.7 + (b.vote_average || 0) * 0.3;
        return scoreB - scoreA;
      });

      return {
        page: 1,
        results: filteredByYear.slice(0, 20),
        total_pages: Math.ceil(filteredByYear.length / 20),
        total_results: filteredByYear.length,
      };
    } catch (error) {
      console.error('Advanced search failed:', error);
      if (keywords.length > 0) {
        return this.searchMovies(keywords[0]);
      }
      return this.getPopularMovies();
    }
  }

  async getPopularTVShows(page: number = 1): Promise<any> {
    const response = await this.makeRequest('/tv/popular', {
      page,
      language: 'en-US'
    });

    return {
      page: response.page || page,
      results: response.results || [],
      total_pages: response.total_pages || 1,
      total_results: response.total_results || 0
    };
  }

  async getPopularMovies(page: number = 1): Promise<TMDBResponse> {
    const response = await this.makeRequest('/movie/popular', {
      page,
      language: 'en-US'
    });

    return {
      page: response.page || page,
      results: response.results || [],
      total_pages: response.total_pages || 1,
      total_results: response.total_results || 0
    };
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week', page: number = 1): Promise<TMDBResponse> {
    const response = await this.makeRequest(`/trending/movie/${timeWindow}`, {
      page,
      language: 'en-US'
    });

    return {
      page: response.page || page,
      results: response.results || [],
      total_pages: response.total_pages || 1,
      total_results: response.total_results || 0
    };
  }

  async discoverMovies(page: number = 1): Promise<TMDBResponse> {
    const response = await this.makeRequest('/discover/movie', {
      page,
      language: 'en-US',
      sort_by: 'popularity.desc',
      include_adult: 'false',
      include_video: 'false',
      'vote_count.gte': 100
    });

    return {
      page: response.page || page,
      results: response.results || [],
      total_pages: Math.min(response.total_pages || 100, 500), // Limit to 500 pages
      total_results: response.total_results || 0
    };
  }

  async getRandomMovie(): Promise<Movie | null> {
    try {
      // Get a random page from discover movies
      const randomPage = Math.floor(Math.random() * 10) + 1;
      const response = await this.discoverMovies(randomPage);
      
      if (response.results.length === 0) {
        return MOCK_MOVIES[Math.floor(Math.random() * MOCK_MOVIES.length)];
      }
      
      const randomIndex = Math.floor(Math.random() * response.results.length);
      return response.results[randomIndex];
    } catch (error) {
      console.error('Error getting random movie:', error);
      return MOCK_MOVIES[Math.floor(Math.random() * MOCK_MOVIES.length)];
    }
  }

  async getMoviesByGenre(genreId: number, page: number = 1): Promise<TMDBResponse> {
    const response = await this.makeRequest('/discover/movie', {
      page,
      language: 'en-US',
      with_genres: genreId,
      sort_by: 'popularity.desc',
      include_adult: 'false'
    });

    return {
      page: response.page || page,
      results: response.results || [],
      total_pages: response.total_pages || 1,
      total_results: response.total_results || 0
    };
  }

  async getMovieDetails(movieId: number): Promise<Movie | null> {
    try {
      const response = await this.makeRequest(`/movie/${movieId}`, {
        language: 'en-US'
      });

      return {
        id: response.id,
        title: response.title,
        overview: response.overview,
        poster_path: response.poster_path,
        backdrop_path: response.backdrop_path,
        release_date: response.release_date,
        vote_average: response.vote_average,
        vote_count: response.vote_count,
        genre_ids: response.genres?.map((g: any) => g.id) || [],
        adult: response.adult,
        original_language: response.original_language,
        popularity: response.popularity
      };
    } catch (error) {
      console.error('Error getting movie details:', error);
      return null;
    }
  }

  // Helper method to get full image URL
  getImageUrl(path: string | null, size: 'w200' | 'w300' | 'w400' | 'w500' | 'original' = 'w500'): string | null {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}

export const tmdbService = new TMDBService();