// Database Coverage Test - Verify Full TMDB Access
import { fullDatabaseAI } from './full-database-ai';
import { tmdbService } from './tmdb';

export const testDatabaseCoverage = async () => {
  console.log('🧪 Starting Full Database Coverage Test...');
  
  const testQueries = [
    // Exact movie matches
    "The Curious Case of Benjamin Button",
    "movie about a man who ages backwards",
    
    // Actor searches  
    "Leonardo DiCaprio movies",
    "Tom Hanks films",
    
    // Genre searches
    "horror movies from the 80s",
    "romantic comedies",
    
    // Thematic searches
    "space movies with time travel",
    "movies about artificial intelligence",
    
    // Recent searches
    "best movies of 2023",
    "new superhero movies"
  ];

  const results = [];
  
  for (const query of testQueries) {
    console.log(`\n🔍 Testing: "${query}"`);
    
    try {
      const startTime = Date.now();
      const result = await fullDatabaseAI.searchFullDatabase({ description: query });
      const duration = Date.now() - startTime;
      
      console.log(`✅ Found ${result.movies.length} movies in ${duration}ms`);
      console.log(`📊 Database Coverage: ${result.databaseCoverage}`);
      console.log(`🎯 Strategy: ${result.searchStrategy}`);
      console.log(`💯 Confidence: ${result.confidence}%`);
      
      results.push({
        query,
        moviesFound: result.movies.length,
        totalSearched: result.totalSearched,
        confidence: result.confidence,
        strategy: result.searchStrategy,
        duration,
        success: result.movies.length > 0
      });
      
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
      results.push({
        query,
        moviesFound: 0,
        totalSearched: 0,
        confidence: 0,
        strategy: 'FAILED',
        duration: 0,
        success: false,
        error: error.message
      });
    }
  }
  
  // Summary
  console.log('\n📈 DATABASE COVERAGE TEST SUMMARY:');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success);
  const totalMoviesFound = results.reduce((sum, r) => sum + r.moviesFound, 0);
  const totalSearched = results.reduce((sum, r) => sum + r.totalSearched, 0);
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  
  console.log(`✅ Success Rate: ${successful.length}/${results.length} (${Math.round(successful.length/results.length*100)}%)`);
  console.log(`🎬 Total Movies Found: ${totalMoviesFound}`);
  console.log(`🔍 Total Database Records Searched: ${totalSearched}`);
  console.log(`⚡ Average Search Time: ${Math.round(avgDuration)}ms`);
  
  console.log('\n📋 Detailed Results:');
  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`${status} "${r.query}": ${r.moviesFound} movies (${r.totalSearched} searched) - ${r.strategy} - ${r.duration}ms`);
  });
  
  return {
    successRate: successful.length / results.length,
    totalMoviesFound,
    totalSearched,
    avgDuration,
    results
  };
};

// Quick test for immediate verification
export const quickDatabaseTest = async () => {
  console.log('🚀 Quick Database Test...');
  
  try {
    // Test 1: Search a specific movie
    const result1 = await fullDatabaseAI.searchFullDatabase({
      description: "The Matrix"
    });
    console.log(`Test 1 - "The Matrix": ${result1.movies.length} movies found`);
    
    // Test 2: Search by actor
    const result2 = await fullDatabaseAI.searchFullDatabase({
      description: "Leonardo DiCaprio"
    });
    console.log(`Test 2 - "Leonardo DiCaprio": ${result2.movies.length} movies found`);
    
    // Test 3: Genre search
    const result3 = await fullDatabaseAI.searchFullDatabase({
      description: "horror movies"
    });
    console.log(`Test 3 - "horror movies": ${result3.movies.length} movies found`);
    
    const totalFound = result1.movies.length + result2.movies.length + result3.movies.length;
    const totalSearched = result1.totalSearched + result2.totalSearched + result3.totalSearched;
    
    console.log(`\n✅ Quick Test Summary:`);
    console.log(`🎬 Total Movies Found: ${totalFound}`);
    console.log(`🔍 Total Database Records Searched: ${totalSearched}`);
    console.log(`📊 Database Access: ${totalSearched > 100 ? 'FULL ACCESS ✅' : 'LIMITED ACCESS ❌'}`);
    
    return totalSearched > 100;
    
  } catch (error) {
    console.error('❌ Quick test failed:', error);
    return false;
  }
};
