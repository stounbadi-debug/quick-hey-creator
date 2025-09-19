import { useState, useEffect, useCallback } from "react";
import { Brain, Sparkles, Send, Lightbulb, TrendingUp, Heart, Zap, Shield, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Movie } from "@/lib/tmdb";
import { aiRecommendationEngine, RecommendationResult } from "@/lib/ai-recommendations";
import { superIntelligentAI, SuperRecommendationResult } from "@/lib/super-intelligent-ai";
import { fullDatabaseAI, FullDatabaseResult } from "@/lib/full-database-ai";
import { gptOSSMovieAI, GPTOSSResult } from "@/lib/gpt-oss-ai";
// import { professionalAI, ProfessionalAIRequest, ProfessionalAIResponse } from "@/lib/professional-ai-engine";
import EnhancedMovieCard from "./EnhancedMovieCard";

interface AIRecommendationsProps {
  onMoviesFound: (movies: Movie[], title: string) => void;
}

const AIRecommendations = ({ onMoviesFound }: AIRecommendationsProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GPTOSSResult | null>(null);
  const [aiEngine, setAIEngine] = useState<'gpt-oss' | 'full-database' | 'gemini'>('gpt-oss');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [performanceStats, setPerformanceStats] = useState<any>(null);

  const suggestions = [
    "🎬 Movie about a man who ages backwards",
    "📺 TV shows about criminal investigations", 
    "🚀 Sci-fi films with time travel plots",
    "💝 Romantic comedies from the 90s",
    "🔍 Dark crime thrillers like Seven",
    "🎭 Movies that make you cry",
    "⚡ Action movies with car chases",
    "🎪 Feel-good Disney animated films",
    "🤖 Movies about artificial intelligence",
    "🏰 Fantasy adventures like Lord of the Rings",
    "👻 Horror movies from the 80s",
    "🕵️ Detective shows like Sherlock Holmes"
  ];

  const moodButtons = [
    { mood: "dark", icon: "🌙", label: "Dark & Mysterious" },
    { mood: "uplifting", icon: "☀️", label: "Uplifting & Fun" },
    { mood: "thoughtful", icon: "🧠", label: "Thoughtful & Deep" },
    { mood: "exciting", icon: "⚡", label: "Exciting & Thrilling" }
  ];

  // Enhanced search with better AI and performance tracking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const startTime = performance.now();
    setIsLoading(true);
    setShowSuggestions(false);
    
    try {
      let recommendation;
      
      // Use selected AI engine
      if (aiEngine === 'gpt-oss') {
        console.log('🚀 Using GPT-OSS-20B for superior reasoning...');
        recommendation = await gptOSSMovieAI.searchWithGPTOSS({
          description: query.trim()
        });
      } else if (aiEngine === 'full-database') {
        console.log('🔍 Using Full Database AI...');
        recommendation = await fullDatabaseAI.searchFullDatabase({
          description: query.trim()
        });
      } else {
        console.log('🧠 Using Gemini AI fallback...');
        const geminiResult = await aiRecommendationEngine.analyzeQuery({
          description: query.trim()
        });
        // Convert to GPTOSSResult format
        recommendation = {
          ...geminiResult,
          searchStrategy: 'GEMINI_FALLBACK',
          exactMatches: false,
          totalSearched: geminiResult.movies?.length || 0,
          databaseCoverage: 'Gemini AI with limited database access',
          reasoning: 'Using Gemini AI as fallback engine',
          processingTime: performance.now() - startTime
        };
      }
      
      const searchTime = performance.now() - startTime;
      
      setResult(recommendation);
      onMoviesFound(
        recommendation.movies, 
        `${recommendation.exactMatches ? '🎯 GPT-OSS Exact Matches' : '🧠 GPT-OSS Intelligent Search'} (${recommendation.totalSearched} movies analyzed)`
      );
      
      console.log('🚀 GPT-OSS Search Results:', {
        engine: aiEngine,
        query: query.trim(),
        strategy: recommendation.searchStrategy,
        exactMatches: recommendation.exactMatches,
        confidence: recommendation.confidence,
        resultsFound: recommendation.movies.length,
        totalSearched: recommendation.totalSearched,
        reasoning: recommendation.reasoning,
        processingTime: recommendation.processingTime,
        searchTime: Math.round(searchTime) + 'ms'
      });
      
      // Track performance stats
      setPerformanceStats({
        searchTime: Math.round(searchTime),
        confidence: recommendation.confidence,
        resultsCount: recommendation.movies.length,
        strategy: aiEngine
      });
      
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      // Fallback to ensure the app doesn't break
      setResult({
        movies: [],
        explanation: "🔧 GPT-OSS search encountered an issue. Please try a different query or check your connection.",
        confidence: 0,
        tags: ['error', 'fallback'],
        searchStrategy: 'ERROR_FALLBACK',
        exactMatches: false,
        totalSearched: 0,
        databaseCoverage: 'Search failed - all AI engines unavailable',
        reasoning: 'Error fallback activated',
        processingTime: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic search suggestions
  const generateSearchSuggestions = useCallback(async (partialQuery: string) => {
    if (partialQuery.length > 2) {
      try {
        const suggestions = await aiRecommendationEngine.getSearchSuggestions(partialQuery);
        setSearchSuggestions(suggestions || []);
      } catch (error) {
        console.error('Failed to get search suggestions:', error);
        setSearchSuggestions([]);
      }
    } else {
      setSearchSuggestions([]);
    }
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length > 2) {
        generateSearchSuggestions(query);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, generateSearchSuggestions]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion.substring(2)); // Remove emoji
    setShowSuggestions(false);
  };

  const handleMoodClick = async (mood: string) => {
    const startTime = performance.now();
    setIsLoading(true);
    setShowSuggestions(false);
    
    try {
      console.log('🎯 Enhanced Mood Search for:', mood);
      
      // Use enhanced mood-based recommendations
      const moodMovies = await aiRecommendationEngine.getMoodBasedRecommendations(mood);
      const searchTime = performance.now() - startTime;
      
      // Create enhanced result with GPTOSSResult format
      const moodResult: GPTOSSResult = {
        movies: moodMovies,
        explanation: `Perfect ${mood} movies curated just for you. These selections are carefully filtered to match your mood preferences.`,
        confidence: 85,
        tags: [mood, 'mood-based', 'curated'],
        searchStrategy: 'MOOD_BASED',
        exactMatches: false,
        totalSearched: moodMovies.length,
        databaseCoverage: `Mood-based search: ${moodMovies.length} ${mood} movies selected`,
        reasoning: `Applied ${mood} mood analysis with enhanced filtering for optimal recommendations`,
        processingTime: Math.round(searchTime)
      };
      
      setResult(moodResult);
      onMoviesFound(moodMovies, `${mood.charAt(0).toUpperCase() + mood.slice(1)} - Enhanced Recommendations`);
      
      // Update performance stats
      setPerformanceStats({
        searchTime: Math.round(searchTime),
        confidence: 85,
        resultsCount: moodMovies.length,
        strategy: 'enhanced-mood'
      });
      
      console.log('✅ Enhanced Mood Analysis completed:', {
        mood,
        resultsFound: moodMovies.length,
        confidence: 85,
        searchTime: Math.round(searchTime) + 'ms'
      });
      
    } catch (error) {
      console.error('Error getting mood recommendations:', error);
      
      // Fallback to ensure the app doesn't break
      setResult({
        movies: [],
        explanation: `Sorry, couldn't find ${mood} movies right now. Please try again.`,
        confidence: 0,
        tags: [mood, 'error'],
        searchStrategy: 'MOOD_ERROR',
        exactMatches: false,
        totalSearched: 0,
        databaseCoverage: 'Mood search failed',
        reasoning: 'Error occurred during mood-based search',
        processingTime: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* AI Search Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-card backdrop-blur-lg rounded-full border border-primary/40 shadow-glow">
          <div className="relative">
            <Brain className="w-6 h-6 text-primary animate-pulse" />
            <div className="absolute inset-0 blur-md bg-primary/50 rounded-full" />
          </div>
          <span className="text-lg font-semibold gradient-text">AI Movie Discovery</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-black gradient-text glow-text">
          Enhanced AI Movie Discovery
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Advanced AI algorithms that understand your mood and preferences. 
          Smart filtering ensures perfect matches every time.
        </p>
        
        {/* Performance & Intelligence Indicators */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/40">
            <Brain className="w-3 h-3 mr-1" />
            ML Intelligence
          </Badge>
          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/40">
            <Zap className="w-3 h-3 mr-1" />
            Smart Filtering
          </Badge>
          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/40">
            <Heart className="w-3 h-3 mr-1" />
            Mood Aware
          </Badge>
        </div>
      </div>

      {/* AI Search Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="relative group">
          <Input
            type="text"
            placeholder="e.g., 'movie about a man who ages backwards' or 'TV show about serial killers' or 'that sci-fi film with the spinning hallway'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input w-full pl-6 pr-16 py-4 rounded-2xl text-foreground font-medium text-lg min-h-[60px]"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 neon-button px-4 py-2 rounded-xl"
          >
            {isLoading ? (
              <Brain className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        
        {/* FIXED: Dynamic Search Suggestions with proper positioning */}
        {searchSuggestions.length > 0 && query.length > 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-card backdrop-blur-md border border-border/40 rounded-xl shadow-glow z-50">
            <div className="p-3">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Smart suggestions:
              </p>
              {searchSuggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion);
                    setSearchSuggestions([]);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-background/50 text-sm transition-colors border-l-2 border-transparent hover:border-primary/50 flex items-center gap-2"
                >
                  <span className="text-primary">🎬</span>
                  <span className="flex-1">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* AI Engine Selector */}
      <div className="ai-engine-selector mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-sm font-medium text-muted-foreground">AI Engine:</span>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {[
              { key: 'gpt-oss', label: '🚀 GPT-OSS-20B', description: 'Superior reasoning' },
              { key: 'full-database', label: '🔍 Full Database', description: 'Comprehensive search' },
              { key: 'gemini', label: '🧠 Gemini', description: 'Fallback' }
            ].map(engine => (
              <Button
                key={engine.key}
                variant={aiEngine === engine.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setAIEngine(engine.key as any)}
                className="text-xs"
                title={engine.description}
              >
                {engine.label}
              </Button>
            ))}
          </div>
        </div>
        
        {aiEngine === 'gpt-oss' && (
          <div className="text-center">
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              🚀 Using OpenAI's GPT-OSS-20B for revolutionary movie intelligence
            </Badge>
          </div>
        )}
      </div>

      {/* Quick Mood Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        {moodButtons.map((item) => (
          <Button
            key={item.mood}
            variant="outline"
            onClick={() => handleMoodClick(item.mood)}
            disabled={isLoading}
            className="bg-gradient-card backdrop-blur-md border-border/60 hover:border-primary/60 transition-all duration-300"
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </Button>
        ))}
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <Card className="bg-gradient-card backdrop-blur-md border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Lightbulb className="w-5 h-5 text-electric" />
              Try These Exact Searches
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Describe any movie plot or character - I'll find the exact title from 1M+ movies & TV shows
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left p-3 rounded-xl bg-background/50 hover:bg-background/80 border border-border/40 hover:border-primary/60 transition-all duration-300 text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Statistics */}
      {performanceStats && (
        <Card className="bg-gradient-card backdrop-blur-md border-border/40 shadow-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Zap className="w-5 h-5 text-primary" />
              Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{performanceStats.searchTime}ms</div>
                <div className="text-xs text-muted-foreground">Search Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{performanceStats.confidence}%</div>
                <div className="text-xs text-muted-foreground">Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{performanceStats.resultsCount}</div>
                <div className="text-xs text-muted-foreground">Results</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{performanceStats.strategy}</div>
                <div className="text-xs text-muted-foreground">AI Engine</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Results */}
      {result && (
        <Card className="bg-gradient-card backdrop-blur-md border-border/40 shadow-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              Advanced AI Analysis Results
              <Badge variant="outline" className="ml-auto">
                {result.confidence}% match
              </Badge>
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                Strategy: {result.searchStrategy}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Processing: {result.processingTime}ms
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Engine: {aiEngine}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Analyzed: {result.totalSearched} movies
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {result.explanation}
            </p>
            
            {/* GPT-OSS Reasoning Display */}
            {result.reasoning && aiEngine === 'gpt-oss' && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-bold text-purple-800 dark:text-purple-200">
                    GPT-OSS-20B Advanced Reasoning
                  </span>
                  <Badge variant="outline" className="text-xs bg-purple-100 dark:bg-purple-900/40">
                    {result.processingTime}ms
                  </Badge>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                  {result.reasoning}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-purple-600 dark:text-purple-400">
                  <span>🎯 Strategy: {result.searchStrategy}</span>
                  <span>📊 Confidence: {result.confidence}%</span>
                  <span>🔍 Analyzed: {result.totalSearched} movies</span>
                </div>
              </div>
            )}

            {/* Database Coverage Info */}
            {result.databaseCoverage && aiEngine !== 'gpt-oss' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Database Search Coverage
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  {result.databaseCoverage}
                </p>
              </div>
            )}

            {/* Web Search Results Display */}
            {result.webResults && result.webResults.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-bold text-green-800 dark:text-green-200">
                    🌐 Web Search Results - Movies Beyond TMDB Database
                  </span>
                  <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/40">
                    {result.webResults.length} found
                  </Badge>
                </div>
                <div className="space-y-3">
                  {result.webResults.map((webMovie, index) => (
                    <div key={index} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-green-200/50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-green-800 dark:text-green-200">
                          {webMovie.title} {webMovie.year && `(${webMovie.year})`}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(webMovie.confidence * 100)}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                        {webMovie.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-green-500">Source: {webMovie.source}</span>
                        {webMovie.rating && (
                          <span className="text-xs text-green-600">⭐ {webMovie.rating}/10</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-green-600 dark:text-green-400">
                  💡 These movies were found through intelligent web search and may not be available in our main database yet.
                </div>
              </div>
            )}

            {/* Intent Analysis Display */}
            {result.intentAnalysis && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-bold text-blue-800 dark:text-blue-200">
                    🧠 AI Intent Analysis
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Intent:</span>
                    <span className="ml-2 text-blue-800 dark:text-blue-200">{result.intentAnalysis.detectedIntent}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Mood:</span>
                    <span className="ml-2 text-blue-800 dark:text-blue-200">{result.intentAnalysis.mood}</span>
                  </div>
                  {result.intentAnalysis.themes && result.intentAnalysis.themes.length > 0 && (
                    <div className="md:col-span-2">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">Themes:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {result.intentAnalysis.themes.map((theme: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/40">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {result.tags && result.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="bg-primary/20 text-primary border-primary/40"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {result.movies.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  Your Perfect Matches
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.movies.map((movie, index) => (
                    <div
                      key={movie.id}
                      className="animate-scale-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <EnhancedMovieCard movie={movie} showActions={false} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIRecommendations;
