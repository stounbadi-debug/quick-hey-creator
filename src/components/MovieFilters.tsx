import { useState, useCallback, useEffect } from "react";
import { Filter, X, Calendar, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Movie } from "@/lib/tmdb";

interface MovieFiltersProps {
  movies: Movie[];
  onFilteredMovies: (movies: Movie[]) => void;
  isVisible: boolean;
  onToggle: () => void;
}

interface FilterState {
  genres: string[];
  yearRange: [number, number];
  ratingRange: [number, number];
  sortBy: 'rating' | 'year' | 'popularity' | 'title';
}

const MovieFilters = ({ movies, onFilteredMovies, isVisible, onToggle }: MovieFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    genres: [],
    yearRange: [1990, new Date().getFullYear()],
    ratingRange: [0, 10],
    sortBy: 'rating'
  });

  const genreMap: { [key: number]: string } = {
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

  const availableGenres = Array.from(
    new Set(movies.flatMap(movie => movie.genre_ids.map(id => genreMap[id]).filter(Boolean)))
  ).sort();

  const applyFilters = useCallback(() => {
    let filtered = [...movies];

    // Genre filter
    if (filters.genres.length > 0) {
      filtered = filtered.filter(movie => 
        movie.genre_ids.some(genreId => 
          filters.genres.includes(genreMap[genreId])
        )
      );
    }

    // Year filter
    filtered = filtered.filter(movie => {
      const year = new Date(movie.release_date).getFullYear();
      return year >= filters.yearRange[0] && year <= filters.yearRange[1];
    });

    // Rating filter
    filtered = filtered.filter(movie => 
      movie.vote_average >= filters.ratingRange[0] && 
      movie.vote_average <= filters.ratingRange[1]
    );

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return b.vote_average - a.vote_average;
        case 'year':
          return new Date(b.release_date).getFullYear() - new Date(a.release_date).getFullYear();
        case 'popularity':
          return b.popularity - a.popularity;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    onFilteredMovies(filtered);
  }, [movies, filters, onFilteredMovies, genreMap]);

  // Auto-apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const toggleGenre = (genre: string) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const clearFilters = () => {
    setFilters({
      genres: [],
      yearRange: [1990, new Date().getFullYear()],
      ratingRange: [0, 10],
      sortBy: 'rating'
    });
    onFilteredMovies(movies);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        className="fixed top-32 right-6 z-40 bg-gradient-card backdrop-blur-md border-border/60 hover:border-primary/60 rounded-full w-14 h-14 p-0 shadow-glow"
      >
        <Filter className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <div className="fixed top-20 right-0 z-40 w-80 max-w-[90vw] h-[calc(100vh-5rem)] bg-gradient-card backdrop-blur-md border-l border-border/40 p-6 overflow-y-auto animate-slide-in-right">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold gradient-text">Filters</h3>
        <div className="flex gap-2">
          <Button
            onClick={clearFilters}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            Clear
          </Button>
          <Button
            onClick={onToggle}
            size="sm"
            variant="outline"
            className="w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Sort Options */}
        <Card className="bg-background/20 border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-electric" />
              Sort By
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { value: 'rating', label: 'Rating', icon: Star },
              { value: 'year', label: 'Year', icon: Calendar },
              { value: 'popularity', label: 'Popularity', icon: Zap },
              { value: 'title', label: 'Title', icon: Filter }
            ].map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={filters.sortBy === value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, sortBy: value as any }))}
                className="w-full justify-start"
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Genre Filter */}
        <Card className="bg-background/20 border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Genres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map(genre => (
                <Badge
                  key={genre}
                  variant={filters.genres.includes(genre) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Year Range */}
        <Card className="bg-background/20 border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-electric" />
              Release Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground text-center">
                {filters.yearRange[0]} - {filters.yearRange[1]}
              </div>
              <Slider
                value={filters.yearRange}
                onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, yearRange: value as [number, number] }))
                }
                min={1990}
                max={new Date().getFullYear()}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rating Range */}
        <Card className="bg-background/20 border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground text-center">
                {filters.ratingRange[0].toFixed(1)} - {filters.ratingRange[1].toFixed(1)}
              </div>
              <Slider
                value={filters.ratingRange}
                onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, ratingRange: value as [number, number] }))
                }
                min={0}
                max={10}
                step={0.1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filter Status */}
        <div className="text-center text-sm text-muted-foreground">
          Filters apply automatically
        </div>
      </div>
    </div>
  );
};

export default MovieFilters;