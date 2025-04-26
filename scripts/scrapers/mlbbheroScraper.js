const axios = require('axios');
const cheerio = require('cheerio');

// Base URL for MLBB Hero website
const BASE_URL = 'https://www.mlbbhero.com';

// Function to scrape hero list from MLBB Hero
const scrapeHeroList = async () => {
  try {
    console.log('Scraping hero list from MLBB Hero...');
    const response = await axios.get(`${BASE_URL}/heroes`);
    const $ = cheerio.load(response.data);
    
    const heroes = [];
    
    // Find hero cards
    $('.hero-card').each((i, card) => {
      const nameElem = $(card).find('.hero-name');
      const name = nameElem.text().trim();
      const link = $(card).attr('href');
      
      // Extract role from the card
      const roleElem = $(card).find('.hero-role');
      const role = roleElem.text().trim().split('/').map(r => r.trim());
      
      if (name && link) {
        heroes.push({
          name,
          role,
          link
        });
      }
    });
    
    console.log(`Found ${heroes.length} heroes on MLBB Hero`);
    return heroes;
  } catch (error) {
    console.error('Error scraping hero list from MLBB Hero:', error);
    return [];
  }
};

// Function to scrape detailed hero info
const scrapeHeroDetails = async (hero) => {
  try {
    console.log(`Scraping details for ${hero.name} from MLBB Hero...`);
    const response = await axios.get(`${BASE_URL}${hero.link}`);
    const $ = cheerio.load(response.data);
    
    // Extract tier
    let tier = 'Unknown';
    $('.hero-tier').each((i, elem) => {
      const tierText = $(elem).text().trim();
      const tierMatch = tierText.match(/Tier\s*:\s*([SABCDEF][+-]?)/i);
      if (tierMatch && tierMatch[1]) {
        tier = tierMatch[1].toUpperCase();
      }
    });
    
    // Extract builds
    const builds = [];
    $('.build-section').each((i, section) => {
      const buildName = $(section).find('.build-title').text().trim();
      const items = [];
      
      $(section).find('.item-name').each((j, item) => {
        items.push($(item).text().trim());
      });
      
      if (items.length > 0) {
        builds.push({
          name: buildName || `Build ${i + 1}`,
          items
        });
      }
    });
    
    // Extract emblems
    const emblems = [];
    $('.emblem-section').each((i, section) => {
      const emblemName = $(section).find('.emblem-name').text().trim();
      const talents = [];
      
      $(section).find('.talent').each((j, talent) => {
        talents.push($(talent).text().trim());
      });
      
      if (emblemName) {
        emblems.push({
          name: emblemName,
          talents
        });
      }
    });
    
    // Extract counters
    const counters = [];
    $('.counter-hero').each((i, elem) => {
      const counterName = $(elem).find('.counter-name').text().trim();
      if (counterName) {
        counters.push(counterName);
      }
    });
    
    // Merge the details with the basic hero info
    return {
      ...hero,
      counters,
      builds,
      tier,
      emblems
    };
  } catch (error) {
    console.error(`Error scraping details for ${hero.name} from MLBB Hero:`, error);
    return hero; // Return original hero info if details scraping fails
  }
};

// Main scraping function
const scrape = async () => {
  try {
    // Get the list of heroes
    const heroes = await scrapeHeroList();
    
    // Get detailed info for each hero (with concurrency limit)
    const heroesWithDetails = [];
    const concurrencyLimit = 5; // Limit concurrent requests
    
    // Process heroes in batches to avoid overwhelming the server
    for (let i = 0; i < heroes.length; i += concurrencyLimit) {
      const batch = heroes.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(
        batch.map(hero => scrapeHeroDetails(hero))
      );
      heroesWithDetails.push(...batchResults);
    }
    
    return heroesWithDetails;
  } catch (error) {
    console.error('Error in MLBB Hero scraper:', error);
    return [];
  }
};

module.exports = { scrape }; 