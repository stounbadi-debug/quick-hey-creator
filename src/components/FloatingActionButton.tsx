import { useState } from "react";
import { Plus, Heart, History, Sparkles, X, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import FavoritesManager, { useFavorites } from "./FavoritesManager";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onSurpriseMe?: () => void;
  onAIRecommendations?: () => void;
}

const FloatingActionButton = ({ onSurpriseMe, onAIRecommendations }: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const { favorites } = useFavorites();

  const actions = [
    {
      icon: Heart,
      label: "My Favorites",
      color: "bg-red-500 hover:bg-red-600",
      onClick: () => {
        setShowFavorites(true);
        setIsOpen(false);
      },
      badge: favorites.length > 0 ? favorites.length : null,
    },
    {
      icon: Sparkles,
      label: "Surprise Me",
      color: "bg-electric hover:bg-electric-glow",
      onClick: () => {
        onSurpriseMe?.();
        setIsOpen(false);
      },
    },
    {
      icon: Brain,
      label: "AI Recommendations",
      color: "bg-primary hover:bg-primary-dark",
      onClick: () => {
        onAIRecommendations?.();
        setIsOpen(false);
      },
    },
  ];

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Action Buttons */}
        <div className={cn(
          "flex flex-col items-end gap-3 transition-all duration-300 transform origin-bottom",
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}>
          {actions.map((action, index) => (
            <div
              key={action.label}
              className="flex items-center gap-3 group"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Action Label */}
              <div className="px-3 py-2 bg-gradient-card backdrop-blur-md rounded-xl border border-border/40 text-sm font-medium text-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 shadow-glow">
                {action.label}
              </div>
              
              {/* Action Button */}
              <Button
                size="lg"
                onClick={action.onClick}
                className={cn(
                  "relative w-14 h-14 rounded-full p-0 shadow-glow hover:shadow-elevated transition-all duration-300 text-white",
                  action.color
                )}
              >
                <action.icon className="w-6 h-6" />
                
                {/* Badge */}
                {action.badge && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 text-black text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {action.badge > 99 ? '99+' : action.badge}
                  </div>
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Main FAB */}
        <Button
          size="lg"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-16 h-16 rounded-full p-0 neon-button shadow-elevated hover:shadow-glow transition-all duration-500 text-primary-foreground",
            isOpen && "rotate-45"
          )}
        >
          {isOpen ? (
            <X className="w-8 h-8" />
          ) : (
            <Plus className="w-8 h-8" />
          )}
        </Button>
      </div>

      {/* Favorites Modal */}
      <FavoritesManager
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
      />
    </>
  );
};

export default FloatingActionButton;