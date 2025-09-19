import { useState, useEffect, useCallback } from 'react';
import { Movie, tmdbService } from '@/lib/tmdb';

interface UseInfiniteScrollProps {
  initialMovies: Movie[];
  searchQuery?: string;
  currentView: 'trending' | 'search' | 'featured' | 'ai';
}

export const useInfiniteScroll = ({ 
  initialMovies, 
  searchQuery, 
  currentView 
}: UseInfiniteScrollProps) => {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);

  // Reset when dependencies change
  useEffect(() => {
    setMovies(initialMovies);
    setCurrentPage(1);
    setHasMorePages(true);
  }, [initialMovies, searchQuery, currentView]);

  const loadMoreMovies = useCallback(async () => {
    if (isLoadingMore || !hasMorePages || currentView === 'featured' || currentView === 'ai') {
      return;
    }

    setIsLoadingMore(true);
    
    try {
      const nextPage = currentPage + 1;
      let response;

      if (currentView === 'search' && searchQuery) {
        response = await tmdbService.searchMovies(searchQuery, nextPage);
      } else if (currentView === 'trending') {
        response = await tmdbService.getTrendingMovies('week', nextPage);
      } else {
        return;
      }

      const newMovies = response.results.filter(
        newMovie => !movies.some(existingMovie => existingMovie.id === newMovie.id)
      );

      if (newMovies.length > 0) {
        setMovies(prev => [...prev, ...newMovies]);
        setCurrentPage(nextPage);
      }

      // Check if we've reached the last page
      if (nextPage >= response.total_pages || newMovies.length === 0) {
        setHasMorePages(false);
      }
    } catch (error) {
      console.error('Error loading more movies:', error);
      setHasMorePages(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, movies, searchQuery, currentView, isLoadingMore, hasMorePages]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= 
          document.documentElement.offsetHeight - 1000) {
        loadMoreMovies();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreMovies]);

  return {
    movies,
    isLoadingMore,
    hasMorePages,
    loadMoreMovies,
    setMovies
  };
};