import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink, X, Loader2 } from "lucide-react";
import { Movie } from "@/lib/tmdb";

interface TrailerModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

const TrailerModal = ({ movie, isOpen, onClose }: TrailerModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(false);
    }
  }, [isOpen, movie]);

  if (!movie) return null;

  const embedUrl = `https://www.youtube.com/embed/results?search_query=${encodeURIComponent(movie.title + " official trailer")}`;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " trailer")}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-gradient-card border-border/40 rounded-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold gradient-text glow-text">
              {movie.title} - Trailer
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-10 h-10 rounded-full p-0 bg-background/20 backdrop-blur-md border-border/60 hover:bg-destructive hover:border-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          {/* Trailer Container */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-6 group">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-card">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Loading trailer...</p>
                </div>
              </div>
            )}
            
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-card">
                <div className="text-center">
                  <Play className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">Trailer not available</p>
                  <p className="text-sm text-muted-foreground/80 mb-4">
                    We couldn't embed the trailer directly
                  </p>
                  <Button
                    onClick={() => window.open(searchUrl, '_blank')}
                    className="neon-button"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Search on YouTube
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Placeholder for iframe - showing search results instead */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-card">
                  <div className="text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 mx-auto bg-gradient-button rounded-full flex items-center justify-center shadow-glow animate-pulse">
                        <Play className="w-10 h-10 text-primary-foreground" />
                      </div>
                      <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">Watch {movie.title} Trailer</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Click below to watch the official trailer on YouTube
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => window.open(searchUrl, '_blank')}
                        className="neon-button px-6 py-3"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Watch Trailer
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Movie Info */}
          <div className="flex items-start gap-4">
            {movie.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="w-20 h-30 object-cover rounded-lg shadow-card"
              />
            )}
            <div className="flex-1">
              <h4 className="font-bold text-lg text-foreground mb-2">{movie.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {movie.overview}
              </p>
              {movie.release_date && (
                <p className="text-sm text-electric mt-2 font-medium">
                  Released: {new Date(movie.release_date).getFullYear()}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrailerModal;