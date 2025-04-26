const fs = require('fs').promises;
const path = require('path');
const fandomScraper = require('./fandomScraper');
const mlbbheroScraper = require('./mlbbheroScraper');
const oneesportsScraper = require('./oneesportsScraper');

// Output paths
const DATA_DIR = path.join(__dirname, '../../public/data');
const ALL_HEROES_PATH = path.join(DATA_DIR, 'heroes.json');
const HEROES_BY_ID_DIR = path.join(DATA_DIR, 'heroes');
const METADATA_PATH = path.join(DATA_DIR, 'metadata.json');

// Function to merge data from different sources
const mergeHeroData = (heroDataArrays) => {
  const mergedData = {};

  // Flatten array of arrays into single array of hero objects
  const allHeroData = heroDataArrays.flat();

  // Group by hero name
  allHeroData.forEach(hero => {
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
        lastUpdated: new Date().toISOString()
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
    }
  });

  return Object.values(mergedData);
};

// Save hero data to JSON files
const saveToJSON = async (heroData) => {
  try {
    // Ensure directories exist
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(HEROES_BY_ID_DIR, { recursive: true });
    
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
      totalHeroes: heroData.length
    };
    await fs.writeFile(METADATA_PATH, JSON.stringify(metadata, null, 2));
    console.log(`Saved scraping metadata to ${METADATA_PATH}`);
    
    return true;
  } catch (error) {
    console.error('Error saving hero data to JSON:', error);
    throw error;
  }
};

// Main function to run all scrapers
const runAllScrapers = async () => {
  try {
    console.log('Starting all scrapers...');
    
    // Run all scrapers in parallel
    const [fandomData, mlbbheroData, oneesportsData] = await Promise.all([
      fandomScraper.scrape(),
      mlbbheroScraper.scrape(),
      oneesportsScraper.scrape()
    ]);

    console.log(`Data collected: ${fandomData.length} heroes from Fandom, ${mlbbheroData.length} heroes from MLBBHero, ${oneesportsData.length} heroes from OneEsports`);
    
    // Merge data from all sources
    const mergedData = mergeHeroData([fandomData, mlbbheroData, oneesportsData]);
    
    // Save to JSON files
    await saveToJSON(mergedData);
    
    console.log('All scrapers completed successfully');
    return mergedData;
  } catch (error) {
    console.error('Error running scrapers:', error);
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