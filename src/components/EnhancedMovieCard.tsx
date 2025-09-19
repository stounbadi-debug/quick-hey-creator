import { useState } from "react";
import { Star, Play, Calendar, ExternalLink, Film, Heart, Share2, BookmarkPlus, Zap, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Movie } from "@/lib/tmdb";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "./FavoritesManager";
import MovieDetailsModal from "./MovieDetailsModal";
import TrailerModal from "./TrailerModal";

interface EnhancedMovieCardProps {
  movie: Movie;
  showActions?: boolean;
  onGetSimilar?: (movie: Movie) => void;
}

const EnhancedMovieCard = ({ movie, showActions = true, onGetSimilar }: EnhancedMovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const { toast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();
  
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

  const getRatingBadge = (rating: number) => {
    if (rating >= 8.5) return { text: "Masterpiece", color: "bg-green-500" };
    if (rating >= 8) return { text: "Excellent", color: "bg-green-400" };
    if (rating >= 7) return { text: "Great", color: "bg-yellow-400" };
    if (rating >= 6) return { text: "Good", color: "bg-orange-400" };
    return { text: "Fair", color: "bg-gray-400" };
  };

  const handleLike = () => {
    toggleFavorite(movie);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Removed from watchlist" : "Added to watchlist",
      description: `${movie.title} ${isBookmarked ? "removed from" : "added to"} your watchlist`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: movie.overview,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`Check out ${movie.title}: ${movie.overview}`);
      toast({
        title: "Copied to clipboard",
        description: "Movie details copied to clipboard",
      });
    }
  };

  const ratingBadge = getRatingBadge(movie.vote_average);

  return (
    <>
      <div className="movie-card rounded-2xl overflow-hidden group relative animate-scale-in">
        {/* Rating Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className={`${ratingBadge.color} text-white border-0 shadow-lg font-bold font-mono`}>
            {ratingBadge.text}
          </Badge>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDetails(true)}
              className="w-10 h-10 rounded-full p-0 backdrop-blur-md bg-background/80 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleLike}
              className={`w-10 h-10 rounded-full p-0 backdrop-blur-md transition-all duration-300 ${
                isFavorite(movie.id) ? "bg-red-500 border-red-500 text-white" : "bg-background/80 hover:bg-red-500 hover:border-red-500 hover:text-white"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite(movie.id) ? "fill-current" : ""}`} />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleBookmark}
              className={`w-10 h-10 rounded-full p-0 backdrop-blur-md transition-all duration-300 ${
                isBookmarked ? "bg-primary border-primary text-primary-foreground" : "bg-background/80 hover:bg-primary hover:border-primary hover:text-primary-foreground"
              }`}
            >
              <BookmarkPlus className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="w-10 h-10 rounded-full p-0 backdrop-blur-md bg-background/80 hover:bg-electric hover:text-white transition-all duration-300"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Poster Image Enhanced */}
        <div 
          className="relative aspect-[2/3] bg-gradient-card overflow-hidden cursor-pointer"
          onClick={() => setShowDetails(true)}
        >
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
            <h3 className="text-white font-black text-lg mb-3 line-clamp-2 glow-text font-inter">
              {movie.title}
            </h3>
            
            {/* Overview Enhanced */}
            {movie.overview && (
              <p className="text-gray-200 text-sm line-clamp-3 mb-4 font-light leading-relaxed font-inter">
                {movie.overview}
              </p>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setShowDetails(true)}
                className="flex-1 bg-gradient-card backdrop-blur-md border border-border/60 hover:border-primary/60 text-foreground font-bold rounded-xl transition-all duration-300"
              >
                <Eye className="w-4 h-4 mr-2" />
                Details
              </Button>
              
              <Button
                size="sm"
                className="flex-1 neon-button text-sm font-bold rounded-xl shadow-glow hover:shadow-elevated"
                onClick={() => setShowTrailer(true)}
              >
                <Play className="w-4 h-4 mr-2" />
                Trailer
              </Button>
              
              {onGetSimilar && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onGetSimilar(movie)}
                  className="bg-background/20 backdrop-blur-md border-border/60 hover:border-electric/60 hover:text-electric transition-all duration-300"
                >
                  <Zap className="w-4 h-4" />
                </Button>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
      
      <MovieDetailsModal 
        movie={movie}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
      
      <TrailerModal
        movie={movie}
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
      />
    </>
  );
};

export default EnhancedMovieCard;