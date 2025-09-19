import { useState } from "react";
import { X, Star, Play, Calendar, Users, Award, ExternalLink, BookmarkPlus, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Movie } from "@/lib/tmdb";
import { useToast } from "@/hooks/use-toast";

interface MovieDetailsModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

const MovieDetailsModal = ({ movie, isOpen, onClose }: MovieDetailsModalProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();

  if (!movie) return null;

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : movie.poster_path 
    ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
    : null;

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const trailerSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " trailer")}`;
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;

  const genreMap: { [key: number]: string } = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 
    878: "Science Fiction", 53: "Thriller", 10752: "War", 37: "Western"
  };

  const movieGenres = movie.genre_ids.map(id => genreMap[id]).filter(Boolean);

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-400";
    if (rating >= 6.5) return "text-yellow-400";
    return "text-red-400";
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 8.5) return "Masterpiece";
    if (rating >= 8) return "Excellent";
    if (rating >= 7) return "Great";
    if (rating >= 6) return "Good";
    return "Fair";
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: `${movie.title} ${isLiked ? "removed from" : "added to"} your favorites`,
    });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-background border-border/40">
        {/* Hero Section with Backdrop */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          {backdropUrl && (
            <div className="absolute inset-0">
              <img
                src={backdropUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
            </div>
          )}
          
          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-md border-border/60"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Movie Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end gap-6">
              {/* Poster */}
              {posterUrl && (
                <div className="hidden md:block">
                  <img
                    src={posterUrl}
                    alt={movie.title}
                    className="w-32 h-48 object-cover rounded-xl shadow-elevated border-2 border-border/40"
                  />
                </div>
              )}
              
              {/* Title and Basic Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl md:text-4xl font-black font-orbitron gradient-text glow-text mb-2 line-clamp-2">
                  {movie.title}
                </h1>
                
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Star className={`w-5 h-5 fill-current ${getRatingColor(movie.vote_average)}`} />
                    <span className={`font-bold font-mono ${getRatingColor(movie.vote_average)}`}>
                      {movie.vote_average.toFixed(1)}
                    </span>
                    <Badge variant="outline" className="ml-2">
                      {getRatingLabel(movie.vote_average)}
                    </Badge>
                  </div>
                  
                  {releaseYear && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-electric" />
                      <span className="font-medium">{releaseYear}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{movie.vote_count.toLocaleString()} votes</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <Button
                    onClick={() => window.open(trailerSearchUrl, '_blank')}
                    className="neon-button font-bold"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Trailer
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                  
                  <Button
                    onClick={handleLike}
                    variant="outline"
                    className={`${isLiked ? "bg-red-500 border-red-500 text-white" : "bg-background/80"}`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                    {isLiked ? "Liked" : "Like"}
                  </Button>
                  
                  <Button
                    onClick={handleBookmark}
                    variant="outline"
                    className={`${isBookmarked ? "bg-primary border-primary text-primary-foreground" : "bg-background/80"}`}
                  >
                    <BookmarkPlus className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                    {isBookmarked ? "Saved" : "Save"}
                  </Button>
                  
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="bg-background/80"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          {/* Genres */}
          {movieGenres.length > 0 && (
            <div>
              <h3 className="text-lg font-bold font-inter mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-electric" />
                Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {movieGenres.map((genre, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="bg-gradient-card border-border/60 text-foreground"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Overview */}
          {movie.overview && (
            <div>
              <h3 className="text-lg font-bold font-inter mb-3">Plot Summary</h3>
              <p className="text-muted-foreground leading-relaxed font-light text-base">
                {movie.overview}
              </p>
            </div>
          )}

          {/* Statistics */}
          <div>
            <h3 className="text-lg font-bold font-inter mb-3">Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-card border border-border/40 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold font-mono gradient-text">
                  {movie.vote_average.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
              
              <div className="bg-gradient-card border border-border/40 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold font-mono text-electric">
                  {movie.vote_count.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Votes</div>
              </div>
              
              <div className="bg-gradient-card border border-border/40 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold font-mono text-gold">
                  {Math.round(movie.popularity)}
                </div>
                <div className="text-sm text-muted-foreground">Popularity</div>
              </div>
              
              <div className="bg-gradient-card border border-border/40 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold font-mono text-primary">
                  {releaseYear}
                </div>
                <div className="text-sm text-muted-foreground">Year</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MovieDetailsModal;