const axios = require('axios');
const cheerio = require('cheerio');

// Base URL for MLBB Fandom wiki
const BASE_URL = 'https://mobile-legends.fandom.com';

// Function to scrape hero list from Fandom
const scrapeHeroList = async () => {
  try {
    console.log('Scraping hero list from Fandom...');
    // Using axios with a timeout and headers to mimic a browser
    const response = await axios.get(`${BASE_URL}/wiki/List_of_heroes`, {
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    const $ = cheerio.load(response.data);
    console.log('Loaded Fandom page successfully');
    
    const heroes = [];
    
    // Find the main list table - this is the large table with all heroes
    console.log('Searching for hero tables...');
    
    // Find all article tables - one of them should contain the hero list
    $('.article-table').each((i, table) => {
      console.log(`Examining table ${i+1}...`);
      const rows = $(table).find('tr');
      console.log(`Found ${rows.length} rows in table ${i+1}`);
      
      // If table has enough rows, it's likely the hero table
      if (rows.length > 5) {
        rows.each((j, row) => {
          // Skip header row
          if (j === 0) return;
          
          const cells = $(row).find('td');
          if (cells.length >= 3) {
            // Hero column is typically column 1 (index 1)
            const nameCell = $(cells[1]);
            const nameLink = nameCell.find('a').first();
            const name = nameLink.text().trim();
            const link = nameLink.attr('href');
            
            // Role column is typically column 2 (index 2)
            const roleCell = $(cells[2]);
            let role = ['Unknown'];
            if (roleCell.text().trim()) {
              role = roleCell.text().trim().split('/').map(r => r.trim());
            }
            
            if (name && link) {
              heroes.push({
                name,
                role,
                link
              });
              console.log(`Found hero: ${name} - ${role.join('/')}`);
            }
          }
        });
      }
    });
    
    // If no heroes found in tables, try alternative approach - look for links in the hero section
    if (heroes.length === 0) {
      console.log('No heroes found in tables, trying alternative approach...');
      
      // Look for hero links in the main content area
      $('.hero-grid a, .hero-list a, .mw-parser-output a').each((i, link) => {
        const name = $(link).text().trim();
        const href = $(link).attr('href');
        
        // Check if this link points to a hero page
        if (href && href.includes('/wiki/') && name.length > 0 && 
            !href.includes('Category:') && !href.includes('File:') && !href.includes('Template:')) {
          // Basic validation - heroes typically have short names (1-15 chars)
          if (name.length > 0 && name.length < 15) {
            // Check if we already have this hero
            if (!heroes.some(h => h.name.toLowerCase() === name.toLowerCase())) {
              heroes.push({
                name,
                role: ['Unknown'], // Role not available from links
                link: href
              });
              console.log(`Found hero via links: ${name}`);
            }
          }
        }
      });
    }
    
    console.log(`Found ${heroes.length} heroes on Fandom`);
    return heroes;
  } catch (error) {
    console.error('Error scraping hero list from Fandom:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    return [];
  }
};

// Function to scrape detailed hero info
const scrapeHeroDetails = async (hero) => {
  try {
    console.log(`Scraping details for ${hero.name} from Fandom...`);
    const response = await axios.get(`${BASE_URL}${hero.link}`, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Extract counters - this varies by wiki page format
    const counters = [];
    $('.mw-parser-output h2, .mw-parser-output h3, .mw-parser-output h4').each((i, header) => {
      const headerText = $(header).text().toLowerCase();
      if (headerText.includes('counter') || headerText.includes('weakness') || headerText.includes('countered by')) {
        let counterSection = $(header).next();
        let sectionText = '';
        
        // Collect text from all elements until next header
        while (counterSection.length && !counterSection.is('h2, h3, h4')) {
          if (counterSection.is('p, ul, ol')) {
            sectionText += ' ' + counterSection.text().trim();
            
            // Check for list items
            if (counterSection.is('ul, ol')) {
              counterSection.find('li').each((j, item) => {
                const counterText = $(item).text().trim();
                if (counterText.length > 0) {
                  // Try to extract hero names from the text
                  const heroNames = extractHeroNames(counterText);
                  heroNames.forEach(name => {
                    if (!counters.includes(name)) {
                      counters.push(name);
                    }
                  });
                }
              });
            }
          }
          counterSection = counterSection.next();
        }
        
        // If no counters found in lists, try to extract from the section text
        if (counters.length === 0 && sectionText.length > 0) {
          const heroNames = extractHeroNames(sectionText);
          heroNames.forEach(name => {
            if (!counters.includes(name)) {
              counters.push(name);
            }
          });
        }
      }
    });
    
    // Extract builds - also varies by wiki format
    const builds = [];
    $('.mw-parser-output h2, .mw-parser-output h3, .mw-parser-output h4').each((i, header) => {
      const headerText = $(header).text().toLowerCase();
      if (headerText.includes('build') || headerText.includes('item') || headerText.includes('equipment')) {
        let buildSection = $(header).next();
        let buildItems = [];
        let buildName = headerText.replace(/[^a-zA-Z0-9 ]/g, '').trim();
        
        while (buildSection.length && !buildSection.is('h2, h3, h4')) {
          if (buildSection.is('ul, ol')) {
            buildSection.find('li').each((j, item) => {
              const buildText = $(item).text().trim();
              if (buildText.length > 0) {
                buildItems.push(buildText);
              }
            });
          } else if (buildSection.is('p')) {
            // Try to extract item names from paragraphs
            const itemText = buildSection.text().trim();
            const items = itemText.split(/,|;|\.|and/).map(item => item.trim()).filter(item => item.length > 0);
            buildItems.push(...items);
          }
          buildSection = buildSection.next();
        }
        
        if (buildItems.length > 0) {
          builds.push({
            name: buildName || `Build ${builds.length + 1}`,
            items: buildItems
          });
        }
      }
    });
    
    // Try to extract tier/meta information if available
    let tier = 'Unknown';
    $('.mw-parser-output').find('b, strong, .tier, .meta-tier').each((i, elem) => {
      const text = $(elem).text().toLowerCase();
      if (text.includes('tier') || text.includes('meta')) {
        const tierText = $(elem).parent().text().trim();
        const tierMatch = tierText.match(/tier\s*[:-]?\s*([SABCDEF][+-]?)/i);
        if (tierMatch && tierMatch[1]) {
          tier = tierMatch[1].toUpperCase();
        }
      }
    });
    
    // If no role was found, try to extract from infobox
    let role = hero.role;
    if (!role || role.length === 0 || (role.length === 1 && role[0] === 'Unknown')) {
      $('.infobox, .hero-infobox, .portable-infobox').each((i, infobox) => {
        $(infobox).find('tr').each((j, row) => {
          const header = $(row).find('th').text().toLowerCase();
          if (header.includes('role') || header.includes('class')) {
            const roleText = $(row).find('td').text().trim();
            if (roleText) {
              role = roleText.split('/').map(r => r.trim());
            }
          }
        });
      });
    }
    
    // Merge the details with the basic hero info
    return {
      ...hero,
      role,
      counters,
      builds,
      tier,
      emblems: [], // Not typically found on Fandom
      patchChanges: [] // Could be extracted if needed
    };
  } catch (error) {
    console.error(`Error scraping details for ${hero.name} from Fandom:`, error.message);
    return hero; // Return original hero info if details scraping fails
  }
};

// Helper function to extract hero names from text
function extractHeroNames(text) {
  // List of known hero names for better matching
  const knownHeroes = [
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
  
  const heroes = [];
  
  // Try to match known heroes in the text
  knownHeroes.forEach(hero => {
    if (text.toLowerCase().includes(hero.toLowerCase())) {
      heroes.push(hero);
    }
  });
  
  // If no known heroes found, try a more generic approach
  if (heroes.length === 0) {
    // Look for capitalized words that might be hero names
    const words = text.split(/\s+/);
    words.forEach(word => {
      word = word.replace(/[.,;:!?()]/g, '').trim();
      // Basic heuristic: capitalized words of appropriate length might be hero names
      if (word.length > 2 && word.length < 15 && 
          word.charAt(0) === word.charAt(0).toUpperCase() &&
          !['The', 'And', 'With', 'For', 'Against', 'Hero', 'Item'].includes(word)) {
        heroes.push(word);
      }
    });
  }
  
  return heroes;
}

// Main scraping function
const scrape = async () => {
  try {
    // Get the list of heroes
    const heroes = await scrapeHeroList();
    
    if (heroes.length === 0) {
      console.warn('No heroes found on Fandom. Skipping detailed scraping.');
      return [];
    }
    
    // Get detailed info for each hero (with concurrency limit)
    const heroesWithDetails = [];
    const concurrencyLimit = 3; // Reduced limit to be respectful to the server
    
    // Process heroes in batches to avoid overwhelming the server
    for (let i = 0; i < heroes.length; i += concurrencyLimit) {
      const batch = heroes.slice(i, i + concurrencyLimit);
      console.log(`Processing batch ${Math.floor(i/concurrencyLimit) + 1} of ${Math.ceil(heroes.length/concurrencyLimit)}`);
      
      const batchResults = await Promise.all(
        batch.map(hero => scrapeHeroDetails(hero))
      );
      heroesWithDetails.push(...batchResults);
      
      // Add a delay between batches to be respectful
      if (i + concurrencyLimit < heroes.length) {
        console.log('Pausing between batches to avoid overloading the server...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    return heroesWithDetails;
  } catch (error) {
    console.error('Error in Fandom scraper:', error.message);
    return [];
  }
};

module.exports = { scrape }; 