const fs = require('fs').promises;
const path = require('path');
const fandomScraper = require('./fandomScraper');
const mlbbheroScraper = require('./mlbbheroScraper');
const oneesportsScraper = require('./oneesportsScraper');
const dotabuffScraper = require('./dotabuffScraper');

// Output paths
const DATA_DIR = path.join(__dirname, '../../public/data');
const ALL_HEROES_PATH = path.join(DATA_DIR, 'heroes.json');
const HEROES_BY_ID_DIR = path.join(DATA_DIR, 'heroes');
const METADATA_PATH = path.join(DATA_DIR, 'metadata.json');
// Ensure data directory exists for fallback files
const FALLBACK_DATA_DIR = path.join(__dirname, '../../data');

// Function to merge data from different sources
const mergeHeroData = (heroDataArrays) => {
  const mergedData = {};

  // Flatten array of arrays into single array of hero objects
  const allHeroData = heroDataArrays.flat();
  
  // Log the total heroes found from each source
  console.log(`Flattened data contains ${allHeroData.length} total hero entries before merging`);

  // Group by hero name
  allHeroData.forEach(hero => {
    if (!hero || !hero.name) {
      console.warn('Found hero with missing name:', hero);
      return; // Skip heroes with missing name
    }
    
    const heroName = hero.name.toLowerCase();
    
    if (!mergedData[heroName]) {
      mergedData[heroName] = {
        name: hero.name,
        role: hero.role || [],
        tier: hero.tier || 'Unknown',
        counters: hero.counters || [],
        builds: hero.builds || [],
        emblems: hero.emblems || [],
        patchChanges: hero.patchChanges || [],
        attribute: hero.attribute || '', // From Dota heroes
        best_versus: hero.best_versus || [], // From Dota heroes
        lastUpdated: new Date().toISOString(),
        source: hero.source || 'unknown',
        game: hero.game || guessGameFromHero(hero)
      };
    } else {
      // Merge data, preferring non-empty values
      const existing = mergedData[heroName];
      
      if (hero.role && hero.role.length > 0) existing.role = Array.from(new Set([...existing.role, ...hero.role]));
      if (hero.tier && hero.tier !== 'Unknown') existing.tier = hero.tier;
      if (hero.counters && hero.counters.length > 0) existing.counters = Array.from(new Set([...existing.counters, ...hero.counters]));
      if (hero.builds && hero.builds.length > 0) existing.builds = [...existing.builds, ...hero.builds];
      if (hero.emblems && hero.emblems.length > 0) existing.emblems = [...existing.emblems, ...hero.emblems];
      if (hero.patchChanges && hero.patchChanges.length > 0) existing.patchChanges = [...existing.patchChanges, ...hero.patchChanges];
      if (hero.attribute && !existing.attribute) existing.attribute = hero.attribute;
      if (hero.best_versus && hero.best_versus.length > 0) existing.best_versus = Array.from(new Set([...existing.best_versus || [], ...hero.best_versus]));
      
      // Update game if it's not already set
      if (hero.game && !existing.game) existing.game = hero.game;
    }
  });
  
  const result = Object.values(mergedData);
  console.log(`Merged data into ${result.length} unique heroes`);
  return result;
};

// Helper function to guess the game based on hero data
function guessGameFromHero(hero) {
  // Check for Dota 2 specific properties
  if (hero.attribute === 'strength' || hero.attribute === 'agility' || hero.attribute === 'intelligence' || hero.attribute === 'universal') {
    return 'dota2';
  }
  
  // Check for MLBB specific properties
  if (hero.emblems || (hero.builds && hero.builds.some(b => 
    b.items && b.items.some(item => 
      ['Blade of Despair', 'Lightning Truncheon', 'Bloodlust Axe', 'Oracle', 'Athena\'s Shield'].includes(item)
    )))) {
    return 'mlbb';
  }
  
  // Default to MLBB since most heroes are from there
  return 'mlbb';
}

// Save hero data to JSON files
const saveToJSON = async (heroData) => {
  try {
    // Ensure directories exist
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(HEROES_BY_ID_DIR, { recursive: true });
    await fs.mkdir(FALLBACK_DATA_DIR, { recursive: true });
    
    // Save all heroes to one file
    await fs.writeFile(ALL_HEROES_PATH, JSON.stringify(heroData, null, 2));
    console.log(`Saved ${heroData.length} heroes to ${ALL_HEROES_PATH}`);
    
    // Save individual hero files
    for (const hero of heroData) {
      const heroId = hero.name.toLowerCase().replace(/\s+/g, '-');
      const heroPath = path.join(HEROES_BY_ID_DIR, `${heroId}.json`);
      await fs.writeFile(heroPath, JSON.stringify(hero, null, 2));
    }
    console.log(`Saved individual hero files to ${HEROES_BY_ID_DIR}`);
    
    // Save metadata
    const metadata = {
      lastSuccessfulScrape: new Date().toISOString(),
      totalHeroes: heroData.length,
      gameBreakdown: {
        mlbb: heroData.filter(h => h.game === 'mlbb').length,
        dota2: heroData.filter(h => h.game === 'dota2').length
      },
      sources: {
        fandom: { count: 0 },
        mlbbhero: { count: 0 },
        oneesports: { count: 0 },
        dotabuff: { count: 0 }
      }
    };
    await fs.writeFile(METADATA_PATH, JSON.stringify(metadata, null, 2));
    console.log(`Saved scraping metadata to ${METADATA_PATH}`);
    
    return true;
  } catch (error) {
    console.error('Error saving hero data to JSON:', error.message);
    throw error;
  }
};

// Main function to run all scrapers
const runAllScrapers = async () => {
  try {
    console.log('Starting all scrapers...');
    
    // Run each scraper with error handling
    let fandomData = [];
    let mlbbheroData = [];
    let oneesportsData = [];
    let dotabuffData = [];
    
    try {
      console.log('Starting Fandom scraper...');
      fandomData = await fandomScraper.scrape();
      // Tag source and game
      fandomData = fandomData.map(hero => ({...hero, source: 'fandom', game: 'mlbb'}));
      console.log(`Fandom scraper completed with ${fandomData.length} heroes`);
    } catch (error) {
      console.error('Fandom scraper failed:', error.message);
    }
    
    try {
      console.log('Starting MLBB Hero scraper...');
      mlbbheroData = await mlbbheroScraper.scrape();
      // Tag source and game
      mlbbheroData = mlbbheroData.map(hero => ({...hero, source: 'mlbbhero', game: 'mlbb'}));
      console.log(`MLBB Hero scraper completed with ${mlbbheroData.length} heroes`);
    } catch (error) {
      console.error('MLBB Hero scraper failed:', error.message);
    }
    
    try {
      console.log('Starting OneEsports scraper...');
      oneesportsData = await oneesportsScraper.scrape();
      // Tag source and game
      oneesportsData = oneesportsData.map(hero => ({...hero, source: 'oneesports', game: 'mlbb'}));
      console.log(`OneEsports scraper completed with ${oneesportsData.length} heroes`);
    } catch (error) {
      console.error('OneEsports scraper failed:', error.message);
    }
    
    try {
      console.log('Starting Dotabuff scraper...');
      dotabuffData = await dotabuffScraper.scrape();
      // Tag source and game
      dotabuffData = dotabuffData.map(hero => ({...hero, source: 'dotabuff', game: 'dota2'}));
      console.log(`Dotabuff scraper completed with ${dotabuffData.length} heroes`);
    } catch (error) {
      console.error('Dotabuff scraper failed:', error.message);
    }

    console.log(`Data collected: ${fandomData.length} heroes from Fandom, ${mlbbheroData.length} heroes from MLBBHero, ${oneesportsData.length} heroes from OneEsports, ${dotabuffData.length} heroes from Dotabuff`);
    
    // If no heroes were found from any source, log a warning
    if (fandomData.length === 0 && mlbbheroData.length === 0 && oneesportsData.length === 0 && dotabuffData.length === 0) {
      console.warn('WARNING: No heroes found from any source. Check that the scrapers are working correctly.');
    }
    
    // Merge data from all sources
    const mergedData = mergeHeroData([fandomData, mlbbheroData, oneesportsData, dotabuffData]);
    
    // Save to JSON files
    await saveToJSON(mergedData);
    
    console.log('All scrapers completed successfully');
    return mergedData;
  } catch (error) {
    console.error('Error running scrapers:', error.message);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  runAllScrapers()
    .then(() => console.log('Scraping completed'))
    .catch(err => console.error('Scraping failed:', err));
}

module.exports = { runAllScrapers }; 