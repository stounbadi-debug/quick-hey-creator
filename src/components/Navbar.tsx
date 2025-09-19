import { useState } from "react";
import { Search, Sparkles, Film, Heart, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FavoritesManager, { useFavorites } from "./FavoritesManager";
import APISettings from "./APISettings";

interface NavbarProps {
  onSearch: (query: string) => void;
  onSurpriseMe: () => void;
  isLoading?: boolean;
}

const Navbar = ({ onSearch, onSurpriseMe, isLoading }: NavbarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const { favorites } = useFavorites();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-border/40">
        <div className="particle-bg relative">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Logo Enhanced - Now Clickable! */}
              <button 
                onClick={() => window.location.href = '/app'}
                className="flex items-center gap-3 group cursor-pointer transition-all duration-500 hover:scale-102"
              >
                <div className="relative">
                  <div className="p-2 rounded-xl bg-gradient-button shadow-glow group-hover:shadow-elevated transition-all duration-300">
                    <Film className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="absolute inset-0 blur-md bg-primary/30 rounded-xl group-hover:bg-primary/50 transition-all duration-300" />
                </div>
                <h1 className="text-3xl font-black gradient-text glow-text font-orbitron group-hover:scale-102 transition-transform duration-500">
                  CineDiscover
                </h1>
              </button>

              {/* Search Form Enhanced */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
                <div className="relative group">
                  <Input
                    type="text"
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input w-full pl-12 pr-4 py-3 rounded-2xl text-foreground font-medium text-lg font-inter"
                    disabled={isLoading}
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-glow opacity-0 group-focus-within:opacity-50 pointer-events-none transition-opacity" />
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {/* API Settings Button */}
                <APISettings />

                {/* Favorites Button */}
                <Button
                  onClick={() => setShowFavorites(true)}
                  variant="outline"
                  className="relative px-4 py-3 rounded-2xl bg-background/20 backdrop-blur-md border-border/60 hover:border-primary/60 hover:bg-primary/10 transition-all duration-300"
                >
                  <Heart className={`w-5 h-5 mr-2 ${favorites.length > 0 ? 'text-red-500 fill-current' : ''}`} />
                  <span className="hidden sm:inline">Favorites</span>
                  {favorites.length > 0 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {favorites.length > 99 ? '99+' : favorites.length}
                    </div>
                  )}
                </Button>

                {/* Surprise Button Enhanced */}
                <Button
                  onClick={onSurpriseMe}
                  disabled={isLoading}
                  className="neon-button px-8 py-3 rounded-2xl font-bold text-primary-foreground shadow-glow hover:shadow-elevated transition-all duration-500 font-inter"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Surprise Me</span>
                  <span className="sm:hidden">✨</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <FavoritesManager
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
      />
    </>
  );
};

export default Navbar;