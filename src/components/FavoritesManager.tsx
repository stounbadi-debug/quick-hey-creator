import { useState, useEffect } from "react";
import { Movie } from "@/lib/tmdb";
import { Heart, X, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface FavoritesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onMovieSelect?: (movie: Movie) => void;
}

const FavoritesManager = ({ isOpen, onClose, onMovieSelect }: FavoritesManagerProps) => {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadFavorites();
  }, [isOpen]);

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem('cineDiscover-favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const removeFavorite = (movieId: number) => {
    try {
      const updated = favorites.filter(movie => movie.id !== movieId);
      setFavorites(updated);
      localStorage.setItem('cineDiscover-favorites', JSON.stringify(updated));
      
      toast({
        title: "Removed from favorites",
        description: "Movie removed from your favorites list",
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const clearAllFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('cineDiscover-favorites');
    toast({
      title: "Favorites cleared",
      description: "All movies removed from favorites",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[80vh] overflow-hidden bg-gradient-card border-border/40 rounded-2xl">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-bold gradient-text glow-text flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-current" />
              My Favorites ({favorites.length})
            </DialogTitle>
            {favorites.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFavorites}
                className="bg-destructive/10 border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pr-2">
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-20 h-20 mx-auto mb-6 text-muted-foreground/30" />
              <h3 className="text-2xl font-bold text-muted-foreground mb-3">No favorites yet</h3>
              <p className="text-muted-foreground">
                Start adding movies to your favorites by clicking the heart icon on any movie card
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((movie) => (
                <div
                  key={movie.id}
                  className="movie-card rounded-xl overflow-hidden group cursor-pointer"
                  onClick={() => onMovieSelect?.(movie)}
                >
                  <div className="relative aspect-[2/3] bg-gradient-card overflow-hidden">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <div className="text-6xl mb-2">🎬</div>
                          <p className="text-sm">No Image</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Remove Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(movie.id);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full p-0 backdrop-blur-md bg-destructive/20 border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>

                    {/* Rating Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm">
                        <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                        {movie.vote_average.toFixed(1)}
                      </Badge>
                    </div>

                    {/* Movie Info Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                          {movie.title}
                        </h3>
                        {movie.release_date && (
                          <div className="flex items-center gap-1 text-gray-300 mb-2">
                            <Calendar className="w-4 h-4 text-electric" />
                            <span className="text-sm">
                              {new Date(movie.release_date).getFullYear()}
                            </span>
                          </div>
                        )}
                        <p className="text-gray-200 text-sm line-clamp-2">
                          {movie.overview}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook for managing favorites
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem('cineDiscover-favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const addToFavorites = (movie: Movie) => {
    try {
      const updated = [...favorites, movie];
      setFavorites(updated);
      localStorage.setItem('cineDiscover-favorites', JSON.stringify(updated));
      
      toast({
        title: "Added to favorites",
        description: `${movie.title} added to your favorites`,
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const removeFromFavorites = (movieId: number) => {
    try {
      const updated = favorites.filter(movie => movie.id !== movieId);
      setFavorites(updated);
      localStorage.setItem('cineDiscover-favorites', JSON.stringify(updated));
      
      const movie = favorites.find(m => m.id === movieId);
      toast({
        title: "Removed from favorites",
        description: `${movie?.title} removed from your favorites`,
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const isFavorite = (movieId: number) => {
    return favorites.some(movie => movie.id === movieId);
  };

  const toggleFavorite = (movie: Movie) => {
    if (isFavorite(movie.id)) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie);
    }
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
  };
};

export default FavoritesManager;