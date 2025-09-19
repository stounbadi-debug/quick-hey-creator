'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Brain, Sparkles, Film, Zap, Search, TrendingUp, Star, Users, Award, Globe } from "lucide-react"

export default function LandingClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = () => {
    setIsLoading(true)
    router.push('/discover')
  }

  return (
    <div className="min-h-screen particle-bg">
      {/* Hero Section */}
      <header className="container mx-auto px-4 sm:px-6 pt-20 pb-16 max-w-7xl">
        <div className="text-center animate-fade-in">
          {/* Logo/Brand */}
          <div className="flex justify-center items-center mb-8">
            <div className="p-4 bg-gradient-button rounded-2xl shadow-glow animate-float">
              <Film className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl font-black gradient-text glow-text mb-8 font-orbitron leading-tight">
            CineDiscover
          </h1>
          
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-6 font-inter">
            AI-Powered Movie Discovery Platform
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-4xl mx-auto font-light leading-relaxed font-inter">
            Harness the power of <span className="text-primary font-semibold">Gemini AI</span> to discover your perfect movie. 
            Advanced recommendations, intelligent search, and cinematic exploration tools designed for movie enthusiasts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button 
              onClick={handleGetStarted}
              disabled={isLoading}
              className="neon-button px-12 py-6 rounded-2xl font-bold text-xl shadow-glow hover:shadow-elevated transition-all duration-500 animate-slide-up font-inter"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                  Loading...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6 mr-2" />
                  Start Discovering
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push('/discover')}
              className="px-12 py-6 bg-gradient-card backdrop-blur-md border border-border/60 text-foreground rounded-2xl font-bold text-xl shadow-card hover:shadow-glow transition-all duration-500 animate-slide-up electric-accent font-inter"
            >
              <Brain className="w-6 h-6 mr-2" />
              Try AI Recommendations
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 py-20 max-w-7xl">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-black gradient-text glow-text mb-6 font-orbitron">
            Powered by Advanced AI
          </h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed font-inter">
            Experience next-generation movie discovery with cutting-edge artificial intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-card backdrop-blur-md border border-border/40 rounded-3xl p-8 shadow-card hover:shadow-glow transition-all duration-500 animate-scale-in">
            <div className="mb-6">
              <div className="p-3 bg-gradient-button rounded-2xl w-fit shadow-glow">
                <Brain className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h4 className="text-2xl font-bold gradient-text mb-4 font-orbitron">Gemini AI Integration</h4>
            <p className="text-muted-foreground leading-relaxed font-inter">
              Powered by Google&apos;s Gemini 2.0 Flash API for intelligent movie analysis and personalized recommendations
            </p>
          </div>

          <div className="bg-gradient-card backdrop-blur-md border border-border/40 rounded-3xl p-8 shadow-card hover:shadow-glow transition-all duration-500 animate-scale-in">
            <div className="mb-6">
              <div className="p-3 bg-gradient-electric rounded-2xl w-fit shadow-glow">
                <Search className="w-8 h-8 text-foreground" />
              </div>
            </div>
            <h4 className="text-2xl font-bold gradient-text mb-4 font-orbitron">Smart Discovery</h4>
            <p className="text-muted-foreground leading-relaxed font-inter">
              Advanced search algorithms that understand context, mood, and preferences for precise recommendations
            </p>
          </div>

          <div className="bg-gradient-card backdrop-blur-md border border-border/40 rounded-3xl p-8 shadow-card hover:shadow-glow transition-all duration-500 animate-scale-in">
            <div className="mb-6">
              <div className="p-3 bg-gradient-accent rounded-2xl w-fit shadow-glow">
                <TrendingUp className="w-8 h-8 text-foreground" />
              </div>
            </div>
            <h4 className="text-2xl font-bold gradient-text mb-4 font-orbitron">Real-Time Data</h4>
            <p className="text-muted-foreground leading-relaxed font-inter">
              Live integration with TMDB database for up-to-date movie information and trending content
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 sm:px-6 py-20 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center animate-scale-in">
            <div className="text-5xl font-black gradient-text glow-text mb-2 font-orbitron">500K+</div>
            <p className="text-muted-foreground font-inter">Movies in Database</p>
          </div>
          <div className="text-center animate-scale-in">
            <div className="text-5xl font-black gradient-text glow-text mb-2 font-orbitron">AI</div>
            <p className="text-muted-foreground font-inter">Powered Recommendations</p>
          </div>
          <div className="text-5xl font-black gradient-text glow-text mb-2 font-orbitron text-center animate-scale-in">
            <Star className="w-12 h-12 mx-auto mb-2" />
            <p className="text-muted-foreground font-inter text-base">Premium Experience</p>
          </div>
          <div className="text-center animate-scale-in">
            <div className="text-5xl font-black gradient-text glow-text mb-2 font-orbitron">24/7</div>
            <p className="text-muted-foreground font-inter">Discovery Available</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl border-t border-border/20">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Film className="w-8 h-8 text-primary mr-3" />
            <span className="text-2xl font-bold gradient-text font-orbitron">CineDiscover</span>
          </div>
          <div className="text-muted-foreground font-inter">
            Powered by <span className="text-primary font-semibold">Lunim</span> • Built with Next.js 14 & Gemini AI
          </div>
        </div>
      </footer>
    </div>
  )
}