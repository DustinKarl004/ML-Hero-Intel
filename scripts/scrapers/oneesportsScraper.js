const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

// Base URL for OneEsports
const BASE_URL = 'https://www.oneesports.gg';

// Fallback data path for when live scraping fails
const FALLBACK_DATA_PATH = path.join(__dirname, '../../data/oneesports_heroes.json');

// Function to scrape tier list and hero details from OneEsports
const scrapeOneEsports = async () => {
  try {
    console.log('Scraping tier list from OneEsports...');
    
    // Try multiple URLs to find hero data
    const possibleURLs = [
      `${BASE_URL}/mobile-legends/full-mobile-legends-hero-guides/`,
      `${BASE_URL}/mobile-legends/mlbb-tier-list-best-heroes/`,
      `${BASE_URL}/mobile-legends/guide-paquito-best-build-emblem/` // Example of a hero guide that might link to others
    ];
    
    let $ = null;
    let foundUrl = '';
    
    // Try each URL until we get a successful response
    for (const url of possibleURLs) {
      try {
        console.log(`Trying URL: ${url}`);
        const response = await axios.get(url, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          }
        });
        $ = cheerio.load(response.data);
        foundUrl = url;
        console.log(`Successfully loaded content from ${url}`);
        break;
      } catch (error) {
        console.log(`Failed to load ${url}: ${error.message}`);
      }
    }
    
    if (!$) {
      throw new Error('All URLs failed to load');
    }
    
    const heroes = [];
    const heroLinks = new Map(); // To store hero guide links
    
    // Look for tables containing hero info
    $('table').each((i, table) => {
      $(table).find('tr').each((j, row) => {
        // Skip header rows
        if (j === 0) return;
        
        const cells = $(row).find('td');
        if (cells.length >= 2) {
          const nameCell = $(cells[0]);
          let name = nameCell.text().trim();
          
          // Clean the name
          name = name.replace(/Mobile Legends\s+/i, '')
                     .replace(/\s+guide/i, '')
                     .replace(/best build/i, '')
                     .trim();
          
          // Find link
          const link = nameCell.find('a').attr('href');
          if (link) {
            heroLinks.set(name, link);
          }
          
          // Only add if we have a name
          if (name && name.length > 0) {
            heroes.push({
              name,
              role: cells.length >= 3 ? $(cells[1]).text().trim().split('/').map(r => r.trim()) : ['Unknown'],
              tier: 'Unknown',
              counters: [],
              builds: [],
              emblems: []
            });
          }
        }
      });
    });
    
    // If no heroes found in tables, look for hero guide links
    if (heroes.length === 0) {
      console.log('No heroes found in tables, looking for hero guide links...');
      
      // Look for links to hero guides
      $('a').each((i, link) => {
        const text = $(link).text().trim();
        const href = $(link).attr('href');
        
        // Check if this might be a hero guide link
        if (href && text && 
            (text.includes('guide') || text.includes('build')) && 
            text.includes('Mobile Legends')) {
          // Extract hero name from text
          let name = text.replace(/Mobile Legends\s+/i, '')
                         .replace(/\s+guide/i, '')
                         .replace(/best build/i, '')
                         .replace(/skills, emblem, combos/i, '')
                         .trim();
          
          if (name && name.length > 0 && !heroes.some(h => h.name.toLowerCase() === name.toLowerCase())) {
            heroes.push({
              name,
              role: ['Unknown'],
              tier: 'Unknown',
              counters: [],
              builds: [],
              emblems: []
            });
            
            if (href) {
              heroLinks.set(name, href);
            }
          }
        }
      });
    }
    
    console.log(`Found ${heroes.length} heroes on OneEsports`);
    
    // If we still don't have any heroes, try looking at all links
    if (heroes.length === 0) {
      console.log('No heroes found in guides, trying to extract from all links...');
      
      // List of common MLBB heroes to check for
      const commonHeroes = [
        'Aldous', 'Alice', 'Alpha', 'Alucard', 'Angela', 'Argus', 'Atlas', 'Aulus', 'Aurora', 
        'Badang', 'Balmond', 'Bane', 'Barats', 'Baxia', 'Beatrix', 'Belerick', 'Benedetta', 'Brody', 'Bruno',
        'Carmilla', 'Cecilion', 'Chang\'e', 'Chou', 'Claude', 'Clint', 'Cyclops',
        'Diggie', 'Dyrroth', 'Esmeralda', 'Estes', 'Eudora', 'Fanny', 'Faramis', 'Franco', 'Fredrinn', 'Freya',
        'Gatotkaca', 'Gloo', 'Gord', 'Granger', 'Grock', 'Guinevere', 'Gusion', 'Hanabi', 'Hanzo', 'Harith',
        'Harley', 'Hayabusa', 'Helcurt', 'Hilda', 'Hylos', 'Irithel', 'Jawhead', 'Johnson', 'Julian', 'Kadita',
        'Kagura', 'Kaja', 'Karrie', 'Khaleed', 'Khufra', 'Kimmy', 'Lancelot', 'Lapu-Lapu', 'Layla', 'Leomord',
        'Lesley', 'Ling', 'Lolita', 'Lunox', 'Luo Yi', 'Lylia', 'Martis', 'Masha', 'Mathilda', 'Melissa',
        'Minotaur', 'Minsitthar', 'Miya', 'Moskov', 'Nana', 'Natalia', 'Natan', 'Odette', 'Paquito', 'Pharsa',
        'Phoveus', 'Popol and Kupa', 'Rafaela', 'Roger', 'Ruby', 'Saber', 'Selena', 'Silvanna', 'Sun',
        'Terizla', 'Thamuz', 'Tigreal', 'Uranus', 'Vale', 'Valentina', 'Valir', 'Vexana', 'Wanwan',
        'X.Borg', 'Xavier', 'Yi Sun-shin', 'Yin', 'Yu Zhong', 'Yve', 'Zhask', 'Zilong'
      ];
      
      // Look for links containing hero names
      $('a').each((i, link) => {
        const text = $(link).text().trim();
        const href = $(link).attr('href');
        
        if (text && href) {
          // Check against our list of common heroes
          for (const heroName of commonHeroes) {
            if (text.includes(heroName) && !heroes.some(h => h.name === heroName)) {
              heroes.push({
                name: heroName,
                role: ['Unknown'],
                tier: 'Unknown',
                counters: [],
                builds: [],
                emblems: []
              });
              
              heroLinks.set(heroName, href);
              break;
            }
          }
        }
      });
    }
    
    // If we still don't have heroes, try to load from fallback data
    if (heroes.length === 0) {
      return await loadFallbackData();
    }
    
    return heroes;
  } catch (error) {
    console.error('Error scraping OneEsports tier list:', error.message);
    console.log('Attempting to load fallback data...');
    return await loadFallbackData();
  }
};

// Function to load fallback data when live scraping fails
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
      name: 'Miya',
      role: ['Marksman'],
      tier: 'B',
      counters: ['Saber', 'Lancelot', 'Gusion'],
      builds: [{ name: 'Standard Build', items: ['Swift Boots', 'Windtalker', 'Berserker\'s Fury', 'Scarlet Phantom', 'Blade of Despair', 'Immortality'] }],
      emblems: []
    },
    {
      name: 'Layla',
      role: ['Marksman'],
      tier: 'B',
      counters: ['Hayabusa', 'Karina', 'Saber'],
      builds: [{ name: 'Standard Build', items: ['Swift Boots', 'Windtalker', 'Berserker\'s Fury', 'Endless Battle', 'Blade of Despair', 'Wind of Nature'] }],
      emblems: []
    },
    {
      name: 'Tigreal',
      role: ['Tank'],
      tier: 'A',
      counters: ['Valir', 'Diggie', 'Kaja'],
      builds: [{ name: 'Standard Build', items: ['Tough Boots', 'Courage Mask', 'Dominance Ice', 'Antique Cuirass', 'Athena\'s Shield', 'Immortality'] }],
      emblems: []
    },
    {
      name: 'Nana',
      role: ['Mage', 'Support'],
      tier: 'S',
      counters: ['Lancelot', 'Helcurt', 'Saber'],
      builds: [{ name: 'Standard Build', items: ['Arcane Boots', 'Lightning Truncheon', 'Clock of Destiny', 'Holy Crystal', 'Divine Glaive', 'Blood Wings'] }],
      emblems: []
    },
    {
      name: 'Hayabusa',
      role: ['Assassin'],
      tier: 'S',
      counters: ['Saber', 'Kaja', 'Franco'],
      builds: [{ name: 'Standard Build', items: ['Warrior Boots', 'Endless Battle', 'War Axe', 'Malefic Roar', 'Hunter Strike', 'Immortality'] }],
      emblems: []
    }
  ];
}

// Function to enhance heroes with additional info from article content
const enhanceWithArticleContent = async (heroes) => {
  try {
    console.log('Enhancing heroes with article content from OneEsports...');
    
    if (heroes.length === 0) {
      console.warn('No heroes to enhance. Skipping enhancement.');
      return heroes;
    }
    
    let enhancedHeroes = [...heroes];
    
    // Try to find a tier list article
    try {
      const tierListURL = `${BASE_URL}/mobile-legends/mlbb-tier-list-best-heroes/`;
      const response = await axios.get(tierListURL, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
      });
      
      const $ = cheerio.load(response.data);
      console.log('Successfully loaded tier list article');
      
      // Look for tier sections
      $('.tier-list-section, .tier-section, h2, h3').each((i, section) => {
        const tierText = $(section).text().trim().toLowerCase();
        let tier = 'Unknown';
        
        // Try to extract tier from headings
        const tierMatch = tierText.match(/tier\s*([SABCDF][+-]?)|([SABCDF][+-]?)\s*tier/i);
        if (tierMatch) {
          tier = (tierMatch[1] || tierMatch[2]).toUpperCase();
          console.log(`Found tier section: ${tier}`);
          
          // Look for heroes in this section
          let nextElem = $(section).next();
          while (nextElem.length && !nextElem.is('h2, h3, .tier-list-section, .tier-section')) {
            const heroNames = nextElem.text().split(',')
              .map(name => name.trim())
              .filter(name => name.length > 0);
            
            heroNames.forEach(name => {
              // Update hero tier if we find a match
              const heroIndex = enhancedHeroes.findIndex(h => 
                h.name.toLowerCase() === name.toLowerCase());
              
              if (heroIndex >= 0) {
                enhancedHeroes[heroIndex].tier = tier;
              }
            });
            
            nextElem = nextElem.next();
          }
        }
      });
    } catch (error) {
      console.error('Error enhancing with tier list article:', error.message);
    }
    
    // Try to find counter information by searching for counter articles
    for (let i = 0; i < Math.min(5, enhancedHeroes.length); i++) {
      const hero = enhancedHeroes[i];
      try {
        const counterSearchURL = `${BASE_URL}/mobile-legends/best-heroes-counter-${hero.name.toLowerCase()}`;
        const response = await axios.get(counterSearchURL, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          }
        });
        
        const $ = cheerio.load(response.data);
        console.log(`Found counter article for ${hero.name}`);
        
        // Look for counter mentions
        $('p, li').each((j, elem) => {
          const text = $(elem).text().toLowerCase();
          if (text.includes('counter') || text.includes('against') || text.includes('beat')) {
            heroes.forEach(otherHero => {
              if (text.includes(otherHero.name.toLowerCase())) {
                if (!enhancedHeroes[i].counters.includes(otherHero.name)) {
                  enhancedHeroes[i].counters.push(otherHero.name);
                }
              }
            });
          }
        });
      } catch (error) {
        // Counter article not found for this hero, that's ok
      }
      
      // Add a small delay between requests
      if (i < Math.min(4, enhancedHeroes.length)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Try to save the enhanced data as our fallback for next time
    try {
      await saveFallbackData(enhancedHeroes);
    } catch (error) {
      console.error('Error saving fallback data:', error.message);
    }
    
    return enhancedHeroes;
  } catch (error) {
    console.error('Error enhancing with article content:', error.message);
    return heroes;
  }
};

// Function to save fallback data for future use
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

// Main scraping function
const scrape = async () => {
  try {
    // Get heroes from tier list
    const heroes = await scrapeOneEsports();
    
    // Enhance with additional info if needed
    const enhancedHeroes = await enhanceWithArticleContent(heroes);
    
    return enhancedHeroes;
  } catch (error) {
    console.error('Error in OneEsports scraper:', error.message);
    return [];
  }
};

module.exports = { scrape }; 