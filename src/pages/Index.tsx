import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Brain, Sparkles, Filter, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import MovieGrid from "@/components/MovieGrid";
import FeaturedMovie from "@/components/FeaturedMovie";
import AIRecommendations from "@/components/AIRecommendations";
import MovieFilters from "@/components/MovieFilters";
import FloatingActionButton from "@/components/FloatingActionButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Movie, tmdbService } from "@/lib/tmdb";
import { aiRecommendationEngine } from "@/lib/ai-recommendations";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

const Index = () => {
  const [searchParams] = useSearchParams();
  const [initialMovies, setInitialMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<"trending" | "search" | "featured" | "ai">("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("discover");
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  // Use infinite scroll hook
  const { 
    movies, 
    isLoadingMore, 
    hasMorePages, 
    setMovies 
  } = useInfiniteScroll({
    initialMovies,
    searchQuery,
    currentView
  });

  // Load trending movies on initial load or handle search from URL
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      handleSearch(searchParam);
    } else {
      loadTrendingMovies();
    }
  }, [searchParams]);

  const loadTrendingMovies = async () => {
    setIsLoading(true);
    setCurrentView("trending");
    try {
      const response = await tmdbService.getTrendingMovies('week');
      setInitialMovies(response.results);
      setFilteredMovies(response.results);
      setFeaturedMovie(null);
    } catch (error) {
      console.error('Error loading trending movies:', error);
      toast({
        title: "Error loading movies",
        description: "Unable to fetch trending movies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setCurrentView("search");
    setSearchQuery(query);
    setFeaturedMovie(null);
    
    try {
      const response = await tmdbService.searchMovies(query);
      setInitialMovies(response.results);
      setFilteredMovies(response.results);
      
      if (response.results.length === 0) {
        toast({
          title: "No results found",
          description: `No movies found for "${query}". Try a different search term.`,
        });
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      toast({
        title: "Search failed",
        description: "Unable to search movies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSurpriseMe = async () => {
    setIsLoading(true);
    setCurrentView("featured");
    
    try {
      const randomMovie = await tmdbService.getRandomMovie();
      if (randomMovie) {
        setFeaturedMovie(randomMovie);
        setInitialMovies([]);
        toast({
          title: "🎬 Surprise!",
          description: `Check out "${randomMovie.title}" - your featured pick!`,
        });
      } else {
        throw new Error("No random movie found");
      }
    } catch (error) {
      console.error('Error getting random movie:', error);
      toast({
        title: "Surprise failed",
        description: "Unable to get a random movie. Please try again.",
        variant: "destructive",
      });
      // Fallback to trending movies
      loadTrendingMovies();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIMoviesFound = (aiMovies: Movie[], title: string) => {
    setInitialMovies(aiMovies);
    setFilteredMovies(aiMovies);
    setCurrentView("ai");
    setFeaturedMovie(null);
  };

  const handleSimilarMovies = async (movie: Movie) => {
    setIsLoading(true);
    try {
      const similarMovies = await aiRecommendationEngine.getSimilarMovies(movie);
      setInitialMovies(similarMovies);
      setFilteredMovies(similarMovies);
      setCurrentView("ai");
      setFeaturedMovie(null);
      
      toast({
        title: "Similar Movies Found",
        description: `Found movies similar to "${movie.title}"`,
      });
    } catch (error) {
      console.error('Error getting similar movies:', error);
      toast({
        title: "Error",
        description: "Unable to find similar movies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case "search":
        return `Search Results for "${searchQuery}"`;
      case "trending":
        return "Trending This Week";
      case "featured":
        return null; // Featured movie has its own title
      case "ai":
        return "AI Recommendations";
      default:
        return "Movies";
    }
  };

  // Memoize filtered movies based on current tab and view
  const displayMovies = useMemo(() => {
    return activeTab === "discover" ? filteredMovies : movies;
  }, [activeTab, filteredMovies, movies]);

  return (
    <div className="min-h-screen particle-bg">
      <Navbar 
        onSearch={handleSearch}
        onSurpriseMe={handleSurpriseMe}
        isLoading={isLoading}
      />
      
      <main className="relative">
        {/* Enhanced Navigation Tabs */}
        <div className="container mx-auto px-4 sm:px-6 pt-8 max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-gradient-card backdrop-blur-md border border-border/40 p-1 rounded-2xl shadow-glow">
                <TabsTrigger 
                  value="discover" 
                  className="px-6 py-3 rounded-xl font-bold data-[state=active]:bg-gradient-button data-[state=active]:text-primary-foreground"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Discover
                </TabsTrigger>
                <TabsTrigger 
                  value="ai" 
                  className="px-6 py-3 rounded-xl font-bold data-[state=active]:bg-gradient-button data-[state=active]:text-primary-foreground"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Recommendations
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="discover" className="space-y-8">
              {/* Featured Movie Section Enhanced */}
              {featuredMovie && currentView === "featured" && (
                <FeaturedMovie movie={featuredMovie} />
              )}
              
              {/* Movies Grid Enhanced */}
              {(currentView !== "featured" || !featuredMovie) && (
                <div className="animate-fade-in">
                  <MovieGrid 
                    movies={displayMovies}
                    isLoading={isLoading}
                    title={getTitle()}
                    onSimilarMovies={(movies) => handleAIMoviesFound(movies, "Similar Movies")}
                  />
                  
                  {/* Infinite Scroll Loading */}
                  {isLoadingMore && (
                    <LoadingSpinner 
                      text="Loading more movies..." 
                      size="md" 
                    />
                  )}
                  
                  {/* End of results indicator */}
                  {!isLoadingMore && !hasMorePages && movies.length > 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        🎬 You've seen all available movies!
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Enhanced Empty State for First Load */}
              {!isLoading && displayMovies.length === 0 && !featuredMovie && currentView === "trending" && (
                <div className="py-20 particle-bg">
                  <div className="text-center animate-scale-in">
                    <div className="text-9xl mb-8 animate-float">🎬</div>
                    <h1 className="text-5xl md:text-6xl font-black gradient-text glow-text mb-6 font-orbitron">
                      Welcome to CineDiscover
                    </h1>
                    <p className="text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-light leading-relaxed font-inter">
                      Discover your perfect movie with AI-powered recommendations, intelligent search, and cinematic discovery tools.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                      <button
                        onClick={loadTrendingMovies}
                        className="neon-button px-12 py-4 rounded-2xl font-bold text-lg shadow-glow hover:shadow-elevated transition-all duration-500 animate-slide-up font-inter"
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        Explore Trending Movies
                      </button>
                      <button
                        onClick={handleSurpriseMe}
                        className="px-12 py-4 bg-gradient-card backdrop-blur-md border border-border/60 text-foreground rounded-2xl font-bold text-lg shadow-card hover:shadow-glow transition-all duration-500 animate-slide-up electric-accent font-inter"
                      >
                        ✨ Surprise Me!
                      </button>
                      <button
                        onClick={() => setActiveTab("ai")}
                        className="px-12 py-4 bg-gradient-electric text-foreground rounded-2xl font-bold text-lg shadow-glow hover:shadow-elevated transition-all duration-500 animate-slide-up font-inter"
                      >
                        <Brain className="w-5 h-5 mr-2" />
                        Try AI Discovery
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai" className="space-y-8">
              <AIRecommendations onMoviesFound={handleAIMoviesFound} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Movie Filters */}
        {movies.length > 0 && activeTab === "discover" && (
          <MovieFilters
            movies={movies}
            onFilteredMovies={setFilteredMovies}
            isVisible={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />
        )}

        {/* Floating Action Button */}
        <FloatingActionButton
          onSurpriseMe={handleSurpriseMe}
          onAIRecommendations={() => setActiveTab("ai")}
        />
      </main>
    </div>
  );
};

export default Index;