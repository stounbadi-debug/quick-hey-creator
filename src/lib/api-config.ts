// API Configuration Management
// Centralized place for all API keys and endpoints

export interface APIConfig {
  tmdb: {
    apiKey: string;
    baseUrl: string;
  };
  scrapingBee: {
    apiKey: string;
    baseUrl: string;
    maxCalls: number;
    callsUsed: number;
  };
  gemini: {
    apiKey: string;
    baseUrl: string;
    maxCalls: number;
    callsUsed: number;
  };
  ollama: {
    baseUrl: string;
    model: string;
  };
}

class APIConfigManager {
  private config: APIConfig;

  constructor() {
    this.config = {
      tmdb: {
        apiKey: import.meta.env.VITE_TMDB_API_KEY || '036c205f43b82d159d2f14d54e074b23',
        baseUrl: 'https://api.themoviedb.org/3'
      },
      scrapingBee: {
        apiKey: import.meta.env.VITE_SCRAPINGBEE_API_KEY || 'Q7IUIGECHH79FWPMIXARKKLES37JV8MVEWJXINIXCJNJDZTKKDZ0YYE1JD6ZEI7T16RBBKUAODRNRSVH',
        baseUrl: 'https://app.scrapingbee.com/api/v1/',
        maxCalls: 1000, // Free tier limit
        callsUsed: 0
      },
      gemini: {
        apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/',
        maxCalls: 1000, // Approximate free tier limit
        callsUsed: 0
      },
      ollama: {
        baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434/api',
        model: import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2:3b'
      }
    };
  }

  // Get API configurations
  getTMDBConfig() {
    return this.config.tmdb;
  }

  getScrapingBeeConfig() {
    return this.config.scrapingBee;
  }

  getGeminiConfig() {
    return this.config.gemini;
  }

  getOllamaConfig() {
    return this.config.ollama;
  }

  // Update API keys (for user configuration)
  updateTMDBKey(apiKey: string) {
    this.config.tmdb.apiKey = apiKey;
    localStorage.setItem('cinediscover_tmdb_key', apiKey);
  }

  updateScrapingBeeKey(apiKey: string) {
    this.config.scrapingBee.apiKey = apiKey;
    localStorage.setItem('cinediscover_scrapingbee_key', apiKey);
  }

  updateGeminiKey(apiKey: string) {
    this.config.gemini.apiKey = apiKey;
    localStorage.setItem('cinediscover_gemini_key', apiKey);
  }

  // Track API usage
  incrementScrapingBeeUsage() {
    this.config.scrapingBee.callsUsed++;
    localStorage.setItem('cinediscover_scrapingbee_usage', this.config.scrapingBee.callsUsed.toString());
  }

  incrementGeminiUsage() {
    this.config.gemini.callsUsed++;
    localStorage.setItem('cinediscover_gemini_usage', this.config.gemini.callsUsed.toString());
  }

  // Check if API has calls remaining
  canUseScrapingBee(): boolean {
    return this.config.scrapingBee.callsUsed < this.config.scrapingBee.maxCalls;
  }

  canUseGemini(): boolean {
    return this.config.gemini.callsUsed < this.config.gemini.maxCalls;
  }

  // Load saved configurations
  loadSavedConfig() {
    const savedTMDB = localStorage.getItem('cinediscover_tmdb_key');
    const savedScrapingBee = localStorage.getItem('cinediscover_scrapingbee_key');
    const savedGemini = localStorage.getItem('cinediscover_gemini_key');
    const savedScrapingBeeUsage = localStorage.getItem('cinediscover_scrapingbee_usage');
    const savedGeminiUsage = localStorage.getItem('cinediscover_gemini_usage');

    if (savedTMDB) this.config.tmdb.apiKey = savedTMDB;
    if (savedScrapingBee) this.config.scrapingBee.apiKey = savedScrapingBee;
    if (savedGemini) this.config.gemini.apiKey = savedGemini;
    if (savedScrapingBeeUsage) this.config.scrapingBee.callsUsed = parseInt(savedScrapingBeeUsage);
    if (savedGeminiUsage) this.config.gemini.callsUsed = parseInt(savedGeminiUsage);
  }

  // Get API status for display
  getAPIStatus() {
    return {
      tmdb: {
        configured: !!this.config.tmdb.apiKey,
        status: 'active'
      },
      scrapingBee: {
        configured: !!this.config.scrapingBee.apiKey,
        remaining: this.config.scrapingBee.maxCalls - this.config.scrapingBee.callsUsed,
        status: this.canUseScrapingBee() ? 'active' : 'limit_reached'
      },
      gemini: {
        configured: !!this.config.gemini.apiKey,
        remaining: this.config.gemini.maxCalls - this.config.gemini.callsUsed,
        status: this.canUseGemini() ? 'active' : 'limit_reached'
      },
      ollama: {
        configured: true,
        status: 'local'
      }
    };
  }
}

export const apiConfig = new APIConfigManager();

// Load saved configuration on startup
apiConfig.loadSavedConfig();
