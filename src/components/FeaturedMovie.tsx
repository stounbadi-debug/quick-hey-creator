import { Star, Play, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Movie } from "@/lib/tmdb";

interface FeaturedMovieProps {
  movie: Movie;
}

const FeaturedMovie = ({ movie }: FeaturedMovieProps) => {
  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : movie.poster_path 
    ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
    : null;
    
  const trailerSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " trailer")}`;
  
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-400 drop-shadow-lg";
    if (rating >= 6.5) return "text-yellow-400 drop-shadow-lg";
    return "text-red-400 drop-shadow-lg";
  };

  return (
    <div className="relative h-[70vh] min-h-[500px] mb-16 rounded-3xl overflow-hidden group animate-fade-in">
      {/* Background Image with Enhanced Effects */}
      {backdropUrl && (
        <div className="absolute inset-0">
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-electric/10" />
        </div>
      )}
      
      {/* Particle Effects */}
      <div className="particle-bg absolute inset-0" />
      
      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-card backdrop-blur-lg rounded-full border border-primary/40 mb-6 animate-slide-up shadow-glow">
              <div className="relative">
                <Star className="w-5 h-5 text-gold fill-current animate-pulse" />
                <div className="absolute inset-0 blur-md bg-gold/50 rounded-full" />
              </div>
              <span className="text-sm font-semibold text-primary-foreground electric-accent">Featured Cinema Pick</span>
            </div>
            
            {/* Title with Enhanced Effects */}
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight animate-scale-in glow-text">
              {movie.title}
            </h1>
            
            {/* Meta Info Enhanced */}
            <div className="flex items-center gap-8 mb-8 text-gray-200">
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="relative">
                  <Star className={`w-6 h-6 fill-current ${getRatingColor(movie.vote_average)}`} />
                  <div className="absolute inset-0 blur-lg bg-current/30 rounded-full" />
                </div>
                <span className={`font-bold text-lg ${getRatingColor(movie.vote_average)}`}>
                  {movie.vote_average.toFixed(1)}
                </span>
                <span className="text-sm text-gray-400 font-medium">
                  ({movie.vote_count.toLocaleString()} votes)
                </span>
              </div>
              {releaseYear && (
                <div className="flex items-center gap-3 animate-fade-in">
                  <Calendar className="w-5 h-5 text-electric" />
                  <span className="font-medium text-lg">{releaseYear}</span>
                </div>
              )}
            </div>
            
            {/* Overview Enhanced */}
            {movie.overview && (
              <p className="text-xl text-gray-100 mb-10 line-clamp-4 leading-relaxed font-light animate-slide-up max-w-2xl">
                {movie.overview}
              </p>
            )}
            
            {/* Premium Action Button */}
            <div className="animate-slide-up">
              <Button
                size="lg"
                className="neon-button px-10 py-4 text-xl font-bold rounded-2xl shadow-elevated hover:shadow-glow transition-all duration-500"
                onClick={() => window.open(trailerSearchUrl, '_blank')}
              >
                <Play className="w-6 h-6 mr-3" />
                Watch Trailer
                <ExternalLink className="w-5 h-5 ml-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedMovie;