import { useState, useEffect } from 'react';
import { Brain, Sparkles, Filter, Zap, Search, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedHeroProps {
  onSearch: (query: string) => void;
  onShowFilters: () => void;
  onAIRecommendations: () => void;
  onTrending: () => void;
  showFilters: boolean;
}

const EnhancedHero = ({ 
  onSearch, 
  onShowFilters, 
  onAIRecommendations, 
  onTrending, 
  showFilters 
}: EnhancedHeroProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSuggestion, setCurrentSuggestion] = useState(0);

  const suggestions = [
    "action movies with robots",
    "romantic comedies from the 90s",
    "psychological thrillers",
    "space adventure movies",
    "feel-good animated movies",
    "movies like Inception",
    "best films of 2023",
    "underrated sci-fi gems"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % suggestions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    onSearch(suggestion);
  };

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
        {/* Main Title */}
        <div className="animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6 animate-scale-in">
            CineDiscover
          </h1>
          <p className="text-2xl text-slate-300 mb-4 animate-slide-in">
            Your AI-powered gateway to cinematic excellence
          </p>
          <p className="text-lg text-slate-400 mb-12 animate-slide-in delay-200">
            Discover movies that match your mood, taste, and moment
          </p>
        </div>

        {/* Enhanced Search Section */}
        <div className="animate-fade-in delay-300 mb-12">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">
            {/* Main Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Try: "${suggestions[currentSuggestion]}"`}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-lg transition-all duration-300"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 text-lg"
              >
                Search Movies
              </Button>
            </div>

            {/* Quick Search Suggestions */}
            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-3">Quick searches:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-slate-300 hover:text-white text-sm transition-all duration-300 hover:scale-105"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={onShowFilters}
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Smart Filters'}
              </Button>
              <Button 
                onClick={onAIRecommendations}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Recommendations
              </Button>
              <Button 
                onClick={onTrending}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending Now
              </Button>
            </div>
          </div>
        </div>

        {/* Stats or Features */}
        <div className="animate-fade-in delay-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300">
              <Brain className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">AI-Powered</h3>
              <p className="text-slate-400 text-sm">Smart recommendations based on your preferences</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300">
              <Sparkles className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Personalized</h3>
              <p className="text-slate-400 text-sm">Curated just for your taste and mood</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Instant</h3>
              <p className="text-slate-400 text-sm">Lightning-fast search and discovery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHero;

