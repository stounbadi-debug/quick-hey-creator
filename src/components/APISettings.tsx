import { useState, useEffect } from "react";
import { Settings, Key, Check, X, Database, Globe, Brain, Zap, Search, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { apiConfig } from "@/lib/api-config";

const APISettings = () => {
  const [tmdbKey, setTmdbKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [scrapingBeeKey, setScrapingBeeKey] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<any>(null);

  useEffect(() => {
    // Load current API configuration
    const config = apiConfig.getTMDBConfig();
    const geminiConfig = apiConfig.getGeminiConfig();
    const scrapingBeeConfig = apiConfig.getScrapingBeeConfig();
    const status = apiConfig.getAPIStatus();
    
    setTmdbKey(config.apiKey || '');
    setGeminiKey(geminiConfig.apiKey || '');
    setScrapingBeeKey(scrapingBeeConfig.apiKey || '');
    setApiStatus(status);
  }, []);

  const handleSave = () => {
    try {
      // Update API configuration
      if (tmdbKey) apiConfig.updateTMDBKey(tmdbKey);
      if (geminiKey) apiConfig.updateGeminiKey(geminiKey);
      if (scrapingBeeKey) apiConfig.updateScrapingBeeKey(scrapingBeeKey);
      
      // Refresh status
      setApiStatus(apiConfig.getAPIStatus());
      
      toast.success("API keys saved successfully!");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to save API keys");
    }
  };

  const testAPIConnection = async (service: 'tmdb' | 'gemini' | 'scrapingbee') => {
    setIsLoading(true);
    
    try {
      if (service === 'tmdb') {
        const response = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${tmdbKey}`);
        const success = response.ok;
        toast[success ? 'success' : 'error'](
          success ? "TMDB connection successful!" : "TMDB connection failed - check your API key"
        );
        return success;
      } else if (service === 'scrapingbee') {
        const testUrl = `https://app.scrapingbee.com/api/v1/?api_key=${scrapingBeeKey}&url=https://httpbin.org/ip`;
        const response = await fetch(testUrl);
        const success = response.ok;
        if (success) {
          apiConfig.incrementScrapingBeeUsage(); // Count test as usage
          setApiStatus(apiConfig.getAPIStatus()); // Refresh status
        }
        toast[success ? 'success' : 'error'](
          success ? "ScrapingBee connection successful!" : "ScrapingBee connection failed - check your API key"
        );
        return success;
      } else if (service === 'gemini') {
        // For Gemini, we can't easily test without making a request, so we just validate the key format
        const success = geminiKey.startsWith('AIza') && geminiKey.length > 20;
        toast[success ? 'success' : 'error'](
          success ? "Gemini API key format valid!" : "Invalid Gemini API key format"
        );
        return success;
      }
    } catch (error) {
      toast.error(`${service.toUpperCase()} connection test failed`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'limit_reached':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'local':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <X className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'limit_reached':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'local':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          API Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Configuration & Status
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="configuration" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="status">Status & Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="space-y-6">
            {/* TMDB Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  TMDB (The Movie Database)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tmdb-key">API Key</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="tmdb-key"
                      type="password"
                      value={tmdbKey}
                      onChange={(e) => setTmdbKey(e.target.value)}
                      placeholder="Enter your TMDB API key"
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      onClick={() => testAPIConnection('tmdb')}
                      disabled={isLoading || !tmdbKey}
                    >
                      Test
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Primary movie database. Get your free API key at{' '}
                    <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      TMDB API Settings
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* ScrapingBee Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-orange-500" />
                  ScrapingBee (IMDB Web Search)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="scrapingbee-key">API Key</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="scrapingbee-key"
                      type="password"
                      value={scrapingBeeKey}
                      onChange={(e) => setScrapingBeeKey(e.target.value)}
                      placeholder="Enter your ScrapingBee API key"
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      onClick={() => testAPIConnection('scrapingbee')}
                      disabled={isLoading || !scrapingBeeKey}
                    >
                      Test
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Web scraping for IMDB data beyond TMDB. Get your free 1000 calls at{' '}
                    <a href="https://app.scrapingbee.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                      ScrapingBee Dashboard
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Gemini Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  Gemini AI (Backup Intelligence)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="gemini-key">API Key</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="gemini-key"
                      type="password"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="Enter your Gemini API key (optional)"
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      onClick={() => testAPIConnection('gemini')}
                      disabled={isLoading || !geminiKey}
                    >
                      Test
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Backup AI for recommendations when Ollama is unavailable. Get your free API key at{' '}
                    <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">
                      Google AI Studio
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Configuration
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            {apiStatus && (
              <>
                {/* TMDB Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-500" />
                        TMDB Status
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(apiStatus.tmdb.status)}
                        <Badge className={getStatusColor(apiStatus.tmdb.status)}>
                          {apiStatus.tmdb.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Primary movie database - No usage limits for free tier
                    </p>
                  </CardContent>
                </Card>

                {/* ScrapingBee Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="w-5 h-5 text-orange-500" />
                        ScrapingBee Status
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(apiStatus.scrapingBee.status)}
                        <Badge className={getStatusColor(apiStatus.scrapingBee.status)}>
                          {apiStatus.scrapingBee.remaining} calls remaining
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Usage</span>
                        <span>{1000 - apiStatus.scrapingBee.remaining}/1000 calls</span>
                      </div>
                      <Progress 
                        value={((1000 - apiStatus.scrapingBee.remaining) / 1000) * 100} 
                        className="h-2"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Used for IMDB web scraping when movies aren't found in TMDB
                    </p>
                  </CardContent>
                </Card>

                {/* Gemini Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-500" />
                        Gemini AI Status
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(apiStatus.gemini.status)}
                        <Badge className={getStatusColor(apiStatus.gemini.status)}>
                          {apiStatus.gemini.configured ? 'Configured' : 'Not Configured'}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Backup AI system when Ollama is unavailable
                    </p>
                  </CardContent>
                </Card>

                {/* Ollama Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-green-500" />
                        Ollama (Local AI)
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(apiStatus.ollama.status)}
                        <Badge className={getStatusColor(apiStatus.ollama.status)}>
                          Local Installation
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Primary AI system running locally with Llama 3.2 3B model
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default APISettings;