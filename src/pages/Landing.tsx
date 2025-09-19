import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Search, Brain, Sparkles, Star, Film, Zap, Heart, Eye, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Landing = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    navigate('/app');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/app');
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Discovery",
      description: "Advanced AI recommendations based on your taste, mood, and viewing history",
      color: "bg-primary",
      glow: "shadow-primary/30"
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Find any movie or TV show instantly with intelligent search capabilities",
      color: "bg-electric",
      glow: "shadow-electric/30"
    },
    {
      icon: Heart,
      title: "Personal Collection",
      description: "Build your favorites list and never lose track of must-watch content",
      color: "bg-red-500",
      glow: "shadow-red-500/30"
    },
    {
      icon: Sparkles,
      title: "Surprise Discovery",
      description: "Let our algorithm surprise you with hidden gems you'll love",
      color: "bg-gold",
      glow: "shadow-gold/30"
    },
    {
      icon: Star,
      title: "Detailed Reviews",
      description: "Get comprehensive ratings, reviews, and detailed movie information",
      color: "bg-green-500",
      glow: "shadow-green-500/30"
    },
    {
      icon: Eye,
      title: "Trailer Integration",
      description: "Watch trailers instantly without leaving the platform",
      color: "bg-purple-500",
      glow: "shadow-purple-500/30"
    }
  ];

  const stats = [
    { number: "50M+", label: "Movies & Shows" },
    { number: "99.9%", label: "Accuracy Rate" },
    { number: "1M+", label: "Happy Users" },
    { number: "24/7", label: "Availability" }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center particle-bg">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-electric/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/10 to-transparent rounded-full blur-2xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Logo */}
            <div className="flex items-center justify-center gap-4 mb-8 animate-scale-in">
              <div className="relative">
                <div className="p-4 rounded-2xl bg-gradient-button shadow-glow">
                  <Film className="w-16 h-16 text-primary-foreground" />
                </div>
                <div className="absolute inset-0 blur-xl bg-primary/40 rounded-2xl animate-pulse" />
              </div>
              <h1 className="text-6xl md:text-8xl font-black gradient-text glow-text font-orbitron">
                CineDiscover
              </h1>
            </div>

            {/* Tagline */}
            <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <p className="text-2xl md:text-4xl font-light text-foreground/90 mb-4 leading-relaxed">
                Your <span className="electric-accent font-bold">AI-Powered</span> Gateway to
              </p>
              <p className="text-3xl md:text-5xl font-bold gradient-text glow-text">
                Cinematic Discovery
              </p>
            </div>

            {/* Description */}
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Discover your next favorite movie or TV show with cutting-edge AI recommendations, 
              intelligent search, and personalized curation. Experience entertainment like never before.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12 animate-scale-in" style={{ animationDelay: '0.6s' }}>
              <div className="relative group">
                <Input
                  type="text"
                  placeholder="Search for any movie or TV show..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input w-full pl-16 pr-32 py-6 text-xl rounded-3xl border-border/40 focus:border-primary/60"
                />
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 neon-button px-8 py-3 text-lg rounded-2xl"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 animate-slide-up" style={{ animationDelay: '0.8s' }}>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="neon-button px-12 py-4 text-xl font-bold rounded-2xl shadow-elevated hover:shadow-glow transition-all duration-500"
              >
                <Zap className="w-6 h-6 mr-3" />
                Start Discovering
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-12 py-4 text-xl font-bold rounded-2xl bg-background/20 backdrop-blur-md border-border/60 hover:bg-primary/10 hover:border-primary/60 transition-all duration-500"
              >
                <Eye className="w-6 h-6 mr-3" />
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '1s' }}>
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-black gradient-text glow-text mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="mb-6 px-6 py-2 bg-primary/20 text-primary border-primary/40 text-lg font-bold">
              ✨ Powerful Features
            </Badge>
            <h2 className="text-5xl md:text-6xl font-black gradient-text glow-text mb-6 font-orbitron">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From AI-powered recommendations to personalized collections, 
              we've built the ultimate entertainment discovery platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="movie-card group cursor-pointer animate-scale-in border-border/40"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className={`inline-flex p-4 rounded-2xl ${feature.color} shadow-glow ${feature.glow} group-hover:shadow-elevated transition-all duration-500`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute inset-0 blur-xl bg-current/20 rounded-2xl group-hover:bg-current/40 transition-all duration-500" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Showcase Section */}
      <section className="py-32 relative bg-gradient-card">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-6 px-6 py-2 bg-electric/20 text-electric border-electric/40 text-lg font-bold">
                🤖 AI Technology
              </Badge>
              <h2 className="text-5xl font-black gradient-text glow-text mb-8 font-orbitron">
                Intelligent Discovery
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Our advanced AI analyzes your preferences, viewing history, and mood to deliver 
                personalized recommendations that feel like they were handpicked just for you.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-primary rounded-full shadow-glow animate-pulse" />
                  <span className="text-foreground font-medium">Machine Learning Algorithms</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-electric rounded-full shadow-glow animate-pulse delay-200" />
                  <span className="text-foreground font-medium">Natural Language Processing</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-gold rounded-full shadow-glow animate-pulse delay-400" />
                  <span className="text-foreground font-medium">Behavioral Pattern Analysis</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative bg-gradient-card rounded-3xl p-8 border border-border/40 shadow-elevated">
                <div className="text-center mb-6">
                  <Brain className="w-16 h-16 mx-auto text-primary animate-pulse mb-4" />
                  <h3 className="text-2xl font-bold gradient-text">AI Recommendation Engine</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-foreground">Analyzing viewing patterns...</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-200" />
                    <span className="text-sm text-foreground">Processing genre preferences...</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-400" />
                    <span className="text-sm text-foreground">Generating recommendations...</span>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-electric/10 rounded-full blur-xl animate-pulse delay-1000" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 relative particle-bg">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-black gradient-text glow-text mb-8 font-orbitron">
            Ready to Discover?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Join millions of movie lovers who've already discovered their next favorite film. 
            Your cinematic journey starts here.
          </p>
          
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="neon-button px-16 py-6 text-2xl font-bold rounded-3xl shadow-elevated hover:shadow-glow transition-all duration-500 animate-scale-in"
          >
            <Play className="w-8 h-8 mr-4" />
            Enter CineDiscover
            <Sparkles className="w-8 h-8 ml-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;