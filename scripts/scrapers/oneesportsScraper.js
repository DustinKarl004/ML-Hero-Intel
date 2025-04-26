const axios = require('axios');
const cheerio = require('cheerio');

// Base URL for OneEsports
const BASE_URL = 'https://oneesports.gg';

// Function to scrape tier list and hero details from OneEsports
const scrapeOneEsports = async () => {
  try {
    console.log('Scraping tier list from OneEsports...');
    // OneEsports MLBB tier list URL (this might need to be updated periodically)
    const tierListURL = `${BASE_URL}/mobile-legends/mlbb-tier-list-best-heroes`;
    
    const response = await axios.get(tierListURL);
    const $ = cheerio.load(response.data);
    
    const heroes = [];
    
    // Find tier sections
    $('.tier-list-section').each((i, section) => {
      const tierHeader = $(section).find('h2, h3').first();
      let tier = 'Unknown';
      
      // Extract tier from header
      if (tierHeader.length) {
        const tierText = tierHeader.text().trim();
        const tierMatch = tierText.match(/Tier\s*([SABCDEF][+-]?)|([SABCDEF][+-]?)\s*Tier/i);
        if (tierMatch) {
          tier = (tierMatch[1] || tierMatch[2]).toUpperCase();
        }
      }
      
      // Extract heroes in this tier
      $(section).find('.hero-card').each((j, card) => {
        const name = $(card).find('.hero-name').text().trim();
        const roleText = $(card).find('.hero-role').text().trim();
        const role = roleText.split('/').map(r => r.trim());
        
        // Extract patch changes if available
        const patchChanges = [];
        $(card).find('.patch-note').each((k, note) => {
          const patchText = $(note).text().trim();
          if (patchText) {
            patchChanges.push(patchText);
          }
        });
        
        if (name) {
          heroes.push({
            name,
            role,
            tier,
            patchChanges,
            counters: [], // Not typically available on tier list
            builds: [], // Not typically available on tier list
            emblems: [] // Not typically available on tier list
          });
        }
      });
    });
    
    console.log(`Found ${heroes.length} heroes on OneEsports tier list`);
    return heroes;
  } catch (error) {
    console.error('Error scraping OneEsports tier list:', error);
    return [];
  }
};

// Function to enhance heroes with additional info from article content
const enhanceWithArticleContent = async (heroes) => {
  try {
    console.log('Enhancing heroes with article content from OneEsports...');
    // This could search for specific hero guides on OneEsports
    // For simplicity, we'll return the heroes as-is
    return heroes;
  } catch (error) {
    console.error('Error enhancing with article content:', error);
    return heroes;
  }
};

// Main scraping function
const scrape = async () => {
  try {
    // Get heroes from tier list
    const heroes = await scrapeOneEsports();
    
    // Enhance with additional info if needed
    const enhancedHeroes = await enhanceWithArticleContent(heroes);
    
    return enhancedHeroes;
  } catch (error) {
    console.error('Error in OneEsports scraper:', error);
    return [];
  }
};

module.exports = { scrape }; 