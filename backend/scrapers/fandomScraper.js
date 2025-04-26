const axios = require('axios');
const cheerio = require('cheerio');

// Base URL for MLBB Fandom wiki
const BASE_URL = 'https://mobile-legends.fandom.com/wiki/List_of_heroes';

// Function to scrape hero list from Fandom
const scrapeHeroList = async () => {
  try {
    console.log('Scraping hero list from Fandom...');
    const response = await axios.get(`${BASE_URL}/wiki/List_of_heroes`);
    const $ = cheerio.load(response.data);
    
    const heroes = [];
    
    // Find the hero tables
    $('.article-table').each((i, table) => {
      $(table).find('tr').each((j, row) => {
        // Skip header row
        if (j === 0) return;
        
        const cells = $(row).find('td');
        if (cells.length >= 3) {
          const nameCell = $(cells[1]);
          const nameLink = nameCell.find('a').first();
          const name = nameLink.text().trim();
          const link = nameLink.attr('href');
          
          // Get role from the table
          const roleCell = $(cells[2]);
          const role = roleCell.text().trim().split('/').map(r => r.trim());
          
          if (name && link) {
            heroes.push({
              name,
              role,
              link
            });
          }
        }
      });
    });
    
    console.log(`Found ${heroes.length} heroes on Fandom`);
    return heroes;
  } catch (error) {
    console.error('Error scraping hero list from Fandom:', error);
    return [];
  }
};

// Function to scrape detailed hero info
const scrapeHeroDetails = async (hero) => {
  try {
    console.log(`Scraping details for ${hero.name} from Fandom...`);
    const response = await axios.get(`${BASE_URL}${hero.link}`);
    const $ = cheerio.load(response.data);
    
    // Extract counters - this varies by wiki page format
    const counters = [];
    $('.mw-parser-output h2, .mw-parser-output h3').each((i, header) => {
      const headerText = $(header).text().toLowerCase();
      if (headerText.includes('counter') || headerText.includes('weakness')) {
        let counterSection = $(header).next();
        while (counterSection.length && !counterSection.is('h2, h3')) {
          if (counterSection.is('ul, ol')) {
            counterSection.find('li').each((j, item) => {
              const counterText = $(item).text().trim();
              if (counterText.length > 0) {
                const counterHero = counterText.split(' ')[0]; // Simple extraction, might need refinement
                if (counterHero.length > 2) { // Basic validation
                  counters.push(counterHero);
                }
              }
            });
          }
          counterSection = counterSection.next();
        }
      }
    });
    
    // Extract builds - also varies by wiki format
    const builds = [];
    $('.mw-parser-output h2, .mw-parser-output h3').each((i, header) => {
      const headerText = $(header).text().toLowerCase();
      if (headerText.includes('build') || headerText.includes('item')) {
        let buildSection = $(header).next();
        let buildItems = [];
        
        while (buildSection.length && !buildSection.is('h2, h3')) {
          if (buildSection.is('ul, ol')) {
            buildSection.find('li').each((j, item) => {
              const buildText = $(item).text().trim();
              if (buildText.length > 0) {
                buildItems.push(buildText);
              }
            });
            
            if (buildItems.length > 0) {
              builds.push({
                name: headerText.replace(/[^a-zA-Z0-9 ]/g, '').trim(),
                items: buildItems
              });
              buildItems = [];
            }
          }
          buildSection = buildSection.next();
        }
      }
    });
    
    // Try to extract tier/meta information if available
    let tier = 'Unknown';
    $('.mw-parser-output').find('b, strong').each((i, elem) => {
      const text = $(elem).text().toLowerCase();
      if (text.includes('tier') || text.includes('meta')) {
        const tierText = $(elem).parent().text().trim();
        const tierMatch = tierText.match(/tier\s*[:-]?\s*([SABCDEF][+-]?)/i);
        if (tierMatch && tierMatch[1]) {
          tier = tierMatch[1].toUpperCase();
        }
      }
    });
    
    // Merge the details with the basic hero info
    return {
      ...hero,
      counters,
      builds,
      tier,
      emblems: [], // Not typically found on Fandom
      patchChanges: [] // Could be extracted if needed
    };
  } catch (error) {
    console.error(`Error scraping details for ${hero.name} from Fandom:`, error);
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
    console.error('Error in Fandom scraper:', error);
    return [];
  }
};

module.exports = { scrape }; 