const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

// Base URL for Dotabuff
const BASE_URL = 'https://www.dotabuff.com';

// Alternative URLs
const ALTERNATIVE_URLS = [
  'https://www.opendota.com',
  'https://stratz.com',
  'https://dota2protracker.com'
];

// Fallback data path
const FALLBACK_DATA_PATH = path.join(__dirname, '../../data/dotabuff_heroes.json');

// Function to scrape heroes from Dotabuff
const scrapeDotabuff = async () => {
  console.log('Attempting to scrape Dotabuff data...');
  
  try {
    console.log(`Trying Dotabuff: ${BASE_URL}/heroes`);
    const response = await axios.get(`${BASE_URL}/heroes`, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (response.status === 200) {
      console.log('Successfully connected to Dotabuff');
      const $ = cheerio.load(response.data);
      const heroes = [];
      
      // Extract hero information from the page
      $('.hero-grid a').each((i, elem) => {
        const heroLink = $(elem).attr('href');
        const heroName = $(elem).find('.name').text().trim();
        
        if (heroName) {
          const heroRoles = [];
          // Primary attribute (str/agi/int)
          const attributeClass = $(elem).find('.portrait').attr('class') || '';
          let attribute = 'unknown';
          
          if (attributeClass.includes('strength')) {
            attribute = 'strength';
          } else if (attributeClass.includes('agility')) {
            attribute = 'agility';
          } else if (attributeClass.includes('intelligence')) {
            attribute = 'intelligence';
          } else if (attributeClass.includes('universal')) {
            attribute = 'universal';
          }
          
          heroes.push({
            name: heroName,
            link: heroLink,
            attribute,
            roles: heroRoles,
            tier: 'Unknown',
            counters: [],
            best_versus: []
          });
        }
      });
      
      console.log(`Found ${heroes.length} heroes on Dotabuff`);
      
      if (heroes.length > 0) {
        // Enhance heroes with additional data
        const enhancedHeroes = await enhanceHeroDetails(heroes);
        
        // Save fallback data
        await saveFallbackData(enhancedHeroes);
        
        return enhancedHeroes;
      }
    }
  } catch (error) {
    console.error(`Error scraping Dotabuff: ${error.message}`);
  }
  
  // Try alternative sites if Dotabuff fails
  for (const altUrl of ALTERNATIVE_URLS) {
    try {
      console.log(`Trying alternative site: ${altUrl}`);
      const heroesData = await scrapeAlternativeSite(altUrl);
      
      if (heroesData && heroesData.length > 0) {
        console.log(`Successfully scraped ${heroesData.length} heroes from ${altUrl}`);
        
        // Save fallback data
        await saveFallbackData(heroesData);
        
        return heroesData;
      }
    } catch (error) {
      console.error(`Error scraping alternative site ${altUrl}: ${error.message}`);
    }
  }
  
  // If all scraping attempts fail, load from fallback data
  console.log('All scraping attempts failed, attempting to load fallback data...');
  return await loadFallbackData();
};

// Function to scrape from alternative sites
async function scrapeAlternativeSite(siteUrl) {
  try {
    // Different scraping logic based on site
    if (siteUrl.includes('opendota')) {
      return await scrapeOpenDota(siteUrl);
    } else if (siteUrl.includes('stratz')) {
      return await scrapeStratz(siteUrl);
    } else if (siteUrl.includes('dota2protracker')) {
      return await scrapeDota2ProTracker(siteUrl);
    }
    
    return null;
  } catch (error) {
    console.error(`Error in alternative site scraper for ${siteUrl}: ${error.message}`);
    return null;
  }
}

// OpenDota scraper
async function scrapeOpenDota(baseUrl) {
  console.log(`Scraping from OpenDota: ${baseUrl}/heroes`);
  const response = await axios.get(`${baseUrl}/heroes`, {
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  
  if (response.status === 200) {
    const $ = cheerio.load(response.data);
    const heroes = [];
    
    $('.heroes-container .heroes-grid a').each((i, elem) => {
      const name = $(elem).find('.hero-name-wrapper').text().trim();
      const roles = $(elem).find('.hero-roles-wrapper').text().trim().split(',').map(r => r.trim());
      
      if (name) {
        heroes.push({
          name,
          roles,
          attribute: $(elem).find('.attrs img').attr('alt') || 'unknown',
          tier: 'Unknown',
          counters: [],
          best_versus: []
        });
      }
    });
    
    return heroes;
  }
  
  return null;
}

// Stratz scraper
async function scrapeStratz(baseUrl) {
  console.log(`Scraping from Stratz: ${baseUrl}/heroes`);
  const response = await axios.get(`${baseUrl}/heroes`, {
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  
  if (response.status === 200) {
    const $ = cheerio.load(response.data);
    const heroes = [];
    
    $('.heroItem').each((i, elem) => {
      const name = $(elem).find('.name').text().trim();
      
      if (name) {
        heroes.push({
          name,
          roles: [],
          attribute: 'unknown',
          tier: 'Unknown',
          counters: [],
          best_versus: []
        });
      }
    });
    
    return heroes;
  }
  
  return null;
}

// Dota2ProTracker scraper
async function scrapeDota2ProTracker(baseUrl) {
  console.log(`Scraping from Dota2ProTracker: ${baseUrl}/heroes`);
  const response = await axios.get(`${baseUrl}/heroes`, {
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  
  if (response.status === 200) {
    const $ = cheerio.load(response.data);
    const heroes = [];
    
    $('.hero-info').each((i, elem) => {
      const name = $(elem).find('.hero-name').text().trim();
      
      if (name) {
        const winRate = $(elem).find('.hero-win-count').text().trim();
        let tier = 'Unknown';
        
        // Try to determine tier based on win rate
        if (winRate) {
          const winRateNum = parseFloat(winRate);
          if (winRateNum >= 55) {
            tier = 'S';
          } else if (winRateNum >= 52) {
            tier = 'A';
          } else if (winRateNum >= 48) {
            tier = 'B';
          } else if (winRateNum >= 45) {
            tier = 'C';
          } else {
            tier = 'D';
          }
        }
        
        heroes.push({
          name,
          roles: [],
          attribute: 'unknown',
          tier,
          counters: [],
          best_versus: []
        });
      }
    });
    
    return heroes;
  }
  
  return null;
}

// Function to save fallback data
async function saveFallbackData(heroes) {
  try {
    // Ensure the directory exists
    const dirPath = path.dirname(FALLBACK_DATA_PATH);
    await fs.mkdir(dirPath, { recursive: true });
    
    // Write the data
    await fs.writeFile(FALLBACK_DATA_PATH, JSON.stringify(heroes, null, 2));
    console.log(`Saved ${heroes.length} heroes to fallback data file`);
  } catch (error) {
    console.error('Error saving fallback data:', error.message);
  }
}

// Function to load fallback data
async function loadFallbackData() {
  try {
    console.log(`Loading fallback data from ${FALLBACK_DATA_PATH}`);
    
    // Create a minimal dataset if file doesn't exist
    if (!(await fileExists(FALLBACK_DATA_PATH))) {
      console.log('Fallback file not found, creating minimal dataset');
      return createMinimalDataset();
    }
    
    const data = await fs.readFile(FALLBACK_DATA_PATH, 'utf8');
    const heroes = JSON.parse(data);
    console.log(`Loaded ${heroes.length} heroes from fallback data`);
    return heroes;
  } catch (error) {
    console.error('Error loading fallback data:', error.message);
    return createMinimalDataset();
  }
}

// Helper function to check if a file exists
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Function to create a minimal dataset when all else fails
function createMinimalDataset() {
  console.log('Creating minimal dataset with common Dota 2 heroes');
  
  return [
    {
      name: 'Anti-Mage',
      roles: ['Carry', 'Escape', 'Nuker'],
      attribute: 'agility',
      tier: 'B',
      counters: ['Phantom Assassin', 'Legion Commander', 'Bloodseeker'],
      best_versus: ['Medusa', 'Storm Spirit', 'Invoker']
    },
    {
      name: 'Axe',
      roles: ['Initiator', 'Durable', 'Disabler'],
      attribute: 'strength',
      tier: 'B',
      counters: ['Ursa', 'Lifestealer', 'Slark'],
      best_versus: ['Phantom Assassin', 'Phantom Lancer', 'Terrorblade']
    },
    {
      name: 'Crystal Maiden',
      roles: ['Support', 'Disabler', 'Nuker'],
      attribute: 'intelligence',
      tier: 'B',
      counters: ['Pudge', 'Riki', 'Slark'],
      best_versus: ['Phantom Lancer', 'Broodmother', 'Meepo']
    },
    {
      name: 'Invoker',
      roles: ['Carry', 'Nuker', 'Disabler', 'Escape'],
      attribute: 'intelligence',
      tier: 'A',
      counters: ['Anti-Mage', 'Phantom Assassin', 'Storm Spirit'],
      best_versus: ['Meepo', 'Broodmother', 'Phantom Lancer']
    },
    {
      name: 'Juggernaut',
      roles: ['Carry', 'Pusher', 'Escape'],
      attribute: 'agility',
      tier: 'A',
      counters: ['Doom', 'Outworld Destroyer', 'Bane'],
      best_versus: ['Crystal Maiden', 'Shadow Shaman', 'Dazzle']
    }
  ];
}

// Enhance heroes with tier, counters, and matchup data
async function enhanceHeroDetails(heroes) {
  try {
    console.log('Enhancing hero details with tiers and counters...');
    
    // First get meta tiers from meta page
    let tiers = {};
    try {
      const metaResponse = await axios.get(`${BASE_URL}/heroes/meta`, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (metaResponse.status === 200) {
        const $ = cheerio.load(metaResponse.data);
        
        $('table.sortable tbody tr').each((i, row) => {
          const name = $(row).find('td:nth-child(2)').text().trim();
          const winRate = parseFloat($(row).find('td.cell-centered').text().trim());
          
          if (name && !isNaN(winRate)) {
            let tier = 'Unknown';
            if (winRate >= 54) {
              tier = 'S';
            } else if (winRate >= 52) {
              tier = 'A';
            } else if (winRate >= 49) {
              tier = 'B';
            } else if (winRate >= 46) {
              tier = 'C';
            } else {
              tier = 'D';
            }
            
            tiers[name] = tier;
          }
        });
      }
    } catch (error) {
      console.error(`Error fetching meta tiers: ${error.message}`);
    }
    
    // Process up to 5 heroes concurrently to avoid overwhelming the server
    const concurrencyLimit = 5;
    const enhancedHeroes = [...heroes];
    
    for (let i = 0; i < heroes.length; i += concurrencyLimit) {
      const batch = heroes.slice(i, i + concurrencyLimit);
      await Promise.all(
        batch.map(async (hero, index) => {
          const heroIndex = i + index;
          
          // Update tier from meta data if available
          if (tiers[hero.name]) {
            enhancedHeroes[heroIndex].tier = tiers[hero.name];
          }
          
          // Try to get matchups for this hero
          if (hero.link) {
            try {
              const matchupsUrl = `${BASE_URL}${hero.link}/counters`;
              const response = await axios.get(matchupsUrl, {
                timeout: 30000,
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
              });
              
              if (response.status === 200) {
                const $ = cheerio.load(response.data);
                
                // Get counters (heroes that are good against this hero)
                const counters = [];
                $('section:contains("Worst Versus") table tbody tr').slice(0, 5).each((i, row) => {
                  const name = $(row).find('td:nth-child(2)').text().trim();
                  if (name) {
                    counters.push(name);
                  }
                });
                
                // Get heroes this hero is good against
                const bestVersus = [];
                $('section:contains("Best Versus") table tbody tr').slice(0, 5).each((i, row) => {
                  const name = $(row).find('td:nth-child(2)').text().trim();
                  if (name) {
                    bestVersus.push(name);
                  }
                });
                
                // Get hero roles
                $('div.header-content div.class').each((i, elem) => {
                  const roleText = $(elem).text().trim();
                  if (roleText && !enhancedHeroes[heroIndex].roles.includes(roleText)) {
                    enhancedHeroes[heroIndex].roles.push(roleText);
                  }
                });
                
                // Update the hero data
                enhancedHeroes[heroIndex].counters = counters;
                enhancedHeroes[heroIndex].best_versus = bestVersus;
              }
            } catch (error) {
              console.error(`Error fetching matchups for ${hero.name}: ${error.message}`);
            }
          }
        })
      );
      
      // Add a small delay between batches
      if (i + concurrencyLimit < heroes.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return enhancedHeroes;
  } catch (error) {
    console.error(`Error enhancing hero details: ${error.message}`);
    return heroes;
  }
}

// Main scrape function
const scrape = async () => {
  try {
    return await scrapeDotabuff();
  } catch (error) {
    console.error('Error in Dotabuff scraper:', error.message);
    return await loadFallbackData();
  }
};

module.exports = {
  scrape
}; 