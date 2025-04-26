const { db } = require('../firebase-config');
const fandomScraper = require('./fandomScraper');
const mlbbheroScraper = require('./mlbbheroScraper');
const oneesportsScraper = require('./oneesportsScraper');

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

// Save hero data to Firestore
const saveToFirestore = async (heroData) => {
  const batch = db.batch();
  
  for (const hero of heroData) {
    const heroRef = db.collection('heroes').doc(hero.name.toLowerCase().replace(/\s+/g, '-'));
    batch.set(heroRef, hero, { merge: true });
  }

  await batch.commit();
  console.log(`Saved ${heroData.length} heroes to Firestore`);
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
    
    // Save to Firestore
    await saveToFirestore(mergedData);
    
    // Update timestamp for the last successful scrape
    await db.collection('metadata').doc('scraping').set({
      lastSuccessfulScrape: new Date().toISOString()
    });
    
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