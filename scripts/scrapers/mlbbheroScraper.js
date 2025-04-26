const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

// Possible domains to try
const POSSIBLE_DOMAINS = [
  'https://mobile-legends.fandom.com',
  'https://mlbb.ninja',
  'https://mlbb.gg',
  'https://mlwiki.net'
];

// Fallback data path
const FALLBACK_DATA_PATH = path.join(__dirname, '../../data/mlbbhero_heroes.json');

// Function to scrape MLBB Hero
const scrapeMlbbHero = async () => {
  console.log('Attempting to scrape MLBB Hero data...');

  // Try each domain until one works
  for (const domain of POSSIBLE_DOMAINS) {
    try {
      console.log(`Trying domain: ${domain}`);
      
      // Try to fetch the hero list page
      const heroListUrl = `${domain}/heroes` + (domain.includes('fandom') ? '/Mobile_Legends:_Bang_Bang' : '');
      
      const response = await axios.get(heroListUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (response.status === 200) {
        console.log(`Successfully connected to ${domain}`);
        const $ = cheerio.load(response.data);
        const heroes = [];
        
        // Different selector patterns based on domain
        if (domain.includes('fandom')) {
          // Fandom wiki pattern
          console.log('Parsing Fandom wiki format');
          $('.wikia-gallery-item, .article-table tr').each((i, elem) => {
            if (i === 0 && $(elem).find('th').length > 0) return; // Skip header row
            
            const nameElem = $(elem).find('.lightbox-caption a, td:first-child a');
            const name = nameElem.text().trim();
            
            if (name) {
              const roleElem = $(elem).find('small, td:nth-child(2)');
              const roleText = roleElem.text().trim();
              const roles = roleText ? roleText.split('/').map(r => r.trim()) : ['Unknown'];
              
              heroes.push({
                name,
                role: roles,
                tier: 'Unknown',
                counters: [],
                builds: [],
                emblems: []
              });
            }
          });
        } else if (domain.includes('mlbb.ninja') || domain.includes('mlbb.gg')) {
          // MLBB Ninja/GG pattern
          console.log('Parsing MLBB Ninja/GG format');
          $('.hero-card, .hero-item, .hero-list-item').each((i, elem) => {
            const nameElem = $(elem).find('.hero-name, .name, h3');
            const name = nameElem.text().trim();
            
            if (name) {
              const roleElem = $(elem).find('.hero-role, .role, .hero-type');
              const roleText = roleElem.text().trim();
              const roles = roleText ? roleText.split('/').map(r => r.trim()) : ['Unknown'];
              
              heroes.push({
                name,
                role: roles,
                tier: 'Unknown',
                counters: [],
                builds: [],
                emblems: []
              });
            }
          });
        } else {
          // Generic pattern to try to find heroes
          console.log('Using generic hero detection pattern');
          $('a').each((i, elem) => {
            const href = $(elem).attr('href');
            const text = $(elem).text().trim();
            
            // Look for links that are likely to be hero links
            if (href && text && href.includes('/hero/') && text.length > 0 && text.length < 20) {
              // Filter out non-hero links
              if (!text.match(/\d/) && !text.includes('list') && !text.toLowerCase().includes('guide')) {
                heroes.push({
                  name: text,
                  role: ['Unknown'],
                  tier: 'Unknown',
                  counters: [],
                  builds: [],
                  emblems: []
                });
              }
            }
          });
        }
        
        // Check if we found any heroes
        if (heroes.length > 0) {
          console.log(`Found ${heroes.length} heroes from ${domain}`);
          
          // Remove duplicates by name
          const uniqueHeroes = [];
          const heroNames = new Set();
          
          heroes.forEach(hero => {
            if (!heroNames.has(hero.name.toLowerCase())) {
              heroNames.add(hero.name.toLowerCase());
              uniqueHeroes.push(hero);
            }
          });
          
          console.log(`After removing duplicates: ${uniqueHeroes.length} heroes`);
          
          // Try to enhance heroes with tier information
          const enhancedHeroes = await enhanceWithTierInfo(uniqueHeroes, domain);
          
          // Save as fallback data for future use
          await saveFallbackData(enhancedHeroes);
          
          return enhancedHeroes;
        } else {
          console.log(`No heroes found from ${domain}, trying next domain...`);
        }
      }
    } catch (error) {
      console.error(`Error scraping ${domain}: ${error.message}`);
    }
  }
  
  // If all domains fail, try to load from fallback data
  console.log('All domains failed, attempting to load fallback data...');
  return await loadFallbackData();
};

// Function to enhance heroes with tier information
async function enhanceWithTierInfo(heroes, domain) {
  try {
    console.log('Enhancing heroes with tier information...');
    
    // Try to find tier list information
    const tierListUrls = [
      `${domain}/tier-list`,
      `${domain}/tier`,
      `${domain}/heroes/tier-list`
    ];
    
    for (const url of tierListUrls) {
      try {
        const response = await axios.get(url, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        const $ = cheerio.load(response.data);
        let foundTierInfo = false;
        
        // Look for tier sections
        $('.tier, .tier-list, .tier-section, .tier-row').each((i, section) => {
          const tierText = $(section).find('h2, h3, .tier-title').text().trim();
          const tierMatch = tierText.match(/([SABCDEF][+-]?)\s*tier|tier\s*([SABCDEF][+-]?)/i);
          
          if (tierMatch) {
            const tier = (tierMatch[1] || tierMatch[2]).toUpperCase();
            console.log(`Found tier section: ${tier}`);
            
            // Find heroes in this tier
            $(section).find('.hero-card, .hero-item, .hero-name, a').each((j, heroElem) => {
              const heroName = $(heroElem).text().trim();
              
              // Update hero tier if we find a match
              const heroIndex = heroes.findIndex(h => 
                h.name.toLowerCase() === heroName.toLowerCase());
              
              if (heroIndex >= 0) {
                heroes[heroIndex].tier = tier;
                foundTierInfo = true;
              }
            });
          }
        });
        
        if (foundTierInfo) {
          console.log('Successfully enhanced heroes with tier information');
          break;
        }
      } catch (error) {
        console.error(`Error fetching tier list from ${url}: ${error.message}`);
      }
    }
    
    return heroes;
  } catch (error) {
    console.error('Error enhancing heroes with tier information:', error.message);
    return heroes;
  }
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
  console.log('Creating minimal dataset with common heroes');
  
  // Create a minimal set of common heroes
  return [
    { 
      name: 'Ling',
      role: ['Assassin'],
      tier: 'S',
      counters: ['Khufra', 'Franco', 'Kaja'],
      builds: [{ name: 'Standard Build', items: ['Swift Boots', 'Endless Battle', 'Berserker\'s Fury', 'Windtalker', 'Blade of Despair', 'Immortality'] }],
      emblems: []
    },
    { 
      name: 'Cecilion',
      role: ['Mage'],
      tier: 'A',
      counters: ['Lancelot', 'Hayabusa', 'Helcurt'],
      builds: [{ name: 'Standard Build', items: ['Arcane Boots', 'Clock of Destiny', 'Lightning Truncheon', 'Holy Crystal', 'Divine Glaive', 'Blood Wings'] }],
      emblems: []
    },
    { 
      name: 'Esmeralda',
      role: ['Mage', 'Tank'],
      tier: 'S',
      counters: ['Baxia', 'Valir', 'X.Borg'],
      builds: [{ name: 'Standard Build', items: ['Arcane Boots', 'Calamity Reaper', 'Feather of Heaven', 'Oracle', 'Holy Crystal', 'Immortality'] }],
      emblems: [] 
    },
    { 
      name: 'Yu Zhong',
      role: ['Fighter'],
      tier: 'A',
      counters: ['Esmeralda', 'Valir', 'Lunox'],
      builds: [{ name: 'Standard Build', items: ['Warrior Boots', 'Bloodlust Axe', 'Oracle', 'Queen\'s Wings', 'Brute Force Breastplate', 'Immortality'] }],
      emblems: []
    },
    { 
      name: 'Chou',
      role: ['Fighter'],
      tier: 'S',
      counters: ['Khufra', 'Minsitthar', 'Franco'],
      builds: [{ name: 'Standard Build', items: ['Warrior Boots', 'Endless Battle', 'Blade of Despair', 'Blade of the Heptaseas', 'Malefic Roar', 'Immortality'] }],
      emblems: []
    }
  ];
}

// Main scraping function
const scrape = async () => {
  try {
    // Scrape hero data from MLBB Hero
    const heroes = await scrapeMlbbHero();
    return heroes;
  } catch (error) {
    console.error('Error in MLBB Hero scraper:', error.message);
    return [];
  }
};

module.exports = { scrape }; 