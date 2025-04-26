const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Import scrapers
const fandomScraper = require('../scrapers/fandomScraper');
const mlbbheroScraper = require('../scrapers/mlbbheroScraper');
const oneesportsScraper = require('../scrapers/oneesportsScraper');

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

// Cloud Function to trigger scraping manually
exports.runScrapers = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      
      // Get auth token from request
      const idToken = req.headers.authorization?.split('Bearer ')[1];
      
      if (!idToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Verify the token
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('Authenticated user:', decodedToken.uid);
      } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Run the scrapers
      console.log('Manual scraping triggered...');
      await runAllScrapers();
      
      return res.status(200).json({ success: true, message: 'Scraping completed successfully' });
    } catch (error) {
      console.error('Error during scraping:', error);
      return res.status(500).json({ success: false, message: 'Error during scraping', error: error.message });
    }
  });
});

// Cloud Function to run daily at midnight (UTC)
exports.scheduledScraping = functions.pubsub.schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Running scheduled scraping...');
    try {
      await runAllScrapers();
      console.log('Scheduled scraping completed successfully');
      return null;
    } catch (error) {
      console.error('Error during scheduled scraping:', error);
      return null;
    }
  });

// Cloud Function to get all heroes
exports.getAllHeroes = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      
      const heroesSnapshot = await db.collection('heroes').get();
      const heroes = [];
      
      heroesSnapshot.forEach(doc => {
        heroes.push(doc.data());
      });
      
      return res.status(200).json(heroes);
    } catch (error) {
      console.error('Error getting heroes:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});

// Cloud Function to get a specific hero
exports.getHero = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      
      const heroName = req.query.name;
      
      if (!heroName) {
        return res.status(400).json({ error: 'Hero name is required' });
      }
      
      const heroDoc = await db.collection('heroes').doc(heroName.toLowerCase().replace(/\s+/g, '-')).get();
      
      if (!heroDoc.exists) {
        return res.status(404).json({ error: 'Hero not found' });
      }
      
      return res.status(200).json(heroDoc.data());
    } catch (error) {
      console.error('Error getting hero:', error);
      return res.status(500).json({ error: error.message });
    }
  });
}); 