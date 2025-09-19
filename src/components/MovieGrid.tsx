import { Movie } from "@/lib/tmdb";
import EnhancedMovieCard from "./EnhancedMovieCard";
import SkeletonMovieCard from "./SkeletonMovieCard";
import { Film } from "lucide-react";
import { aiRecommendationEngine } from "@/lib/ai-recommendations";

interface MovieGridProps {
  movies: Movie[];
  isLoading: boolean;
  title?: string | null;
  onSimilarMovies?: (movies: Movie[]) => void;
}

const MovieGrid = ({ movies, isLoading, title, onSimilarMovies }: MovieGridProps) => {
  
  const handleGetSimilar = async (movie: Movie) => {
    if (onSimilarMovies) {
      try {
        const similarMovies = await aiRecommendationEngine.getSimilarMovies(movie);
        onSimilarMovies(similarMovies);
      } catch (error) {
        console.error('Error getting similar movies:', error);
      }
    }
  };
  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12 animate-fade-in">
        {title && (
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-black gradient-text glow-text mb-4 font-orbitron">
              {title}
            </h2>
            <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full shadow-glow" />
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="animate-scale-in"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <SkeletonMovieCard />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="text-center animate-scale-in">
          <Film className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
          <h2 className="text-3xl font-bold text-muted-foreground mb-4">No movies found</h2>
          <p className="text-lg text-muted-foreground/80">
            Try searching for something else or click "Surprise Me"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 animate-fade-in">
      {title && (
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-black gradient-text glow-text mb-4 font-orbitron">
            {title}
          </h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full shadow-glow" />
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
        {movies.map((movie, index) => (
          <div
            key={movie.id}
            className="animate-scale-in"
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
            >
              <EnhancedMovieCard movie={movie} onGetSimilar={handleGetSimilar} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default MovieGrid;