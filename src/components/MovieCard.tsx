import { useState } from "react";
import { Star, Play, Calendar, ExternalLink, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Movie } from "@/lib/tmdb";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;
    
  const trailerSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " trailer")}`;
  
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-400 drop-shadow-lg";
    if (rating >= 6.5) return "text-yellow-400 drop-shadow-lg";
    return "text-red-400 drop-shadow-lg";
  };

  return (
    <div className="movie-card rounded-2xl overflow-hidden group relative animate-scale-in hover:animate-bounce-in transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
      {/* Enhanced Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl -z-10"></div>
      
      {/* Poster Image Enhanced */}
      <div className="relative aspect-[2/3] bg-gradient-card overflow-hidden">
        {posterUrl && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 loading-pulse rounded-2xl" />
            )}
            <img
              src={posterUrl}
              alt={movie.title}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-card">
            <div className="text-center text-muted-foreground">
              <Film className="w-16 h-16 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No Image Available</p>
            </div>
          </div>
        )}
        
        {/* Enhanced Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {/* Rating Enhanced */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Star className={`w-5 h-5 fill-current ${getRatingColor(movie.vote_average)}`} />
                  <div className="absolute inset-0 blur-md bg-current/40 rounded-full" />
                </div>
                <span className={`text-sm font-bold ${getRatingColor(movie.vote_average)}`}>
                  {movie.vote_average.toFixed(1)}
                </span>
              </div>
              {releaseYear && (
                <div className="flex items-center gap-1 text-gray-300">
                  <Calendar className="w-4 h-4 text-electric" />
                  <span className="text-sm font-medium">{releaseYear}</span>
                </div>
              )}
            </div>
            
            {/* Title Enhanced */}
            <h3 className="text-white font-black text-lg mb-3 line-clamp-2 glow-text">
              {movie.title}
            </h3>
            
            {/* Overview Enhanced */}
            {movie.overview && (
              <p className="text-gray-200 text-sm line-clamp-3 mb-4 font-light leading-relaxed">
                {movie.overview}
              </p>
            )}
            
            {/* Premium Trailer Button */}
            <Button
              size="sm"
              className="w-full neon-button text-sm font-bold rounded-xl shadow-glow hover:shadow-elevated"
              onClick={() => window.open(trailerSearchUrl, '_blank')}
            >
              <Play className="w-4 h-4 mr-2" />
              Watch Trailer
              <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;