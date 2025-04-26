const axios = require('axios');
const cheerio = require('cheerio');

// Base URL for MLBBHero website
const BASE_URL = 'https://mlbbhero.com/heroes';

// Function to scrape hero list from MLBBHero
const scrapeHeroList = async () => {
  try {
    console.log('Scraping hero list from MLBBHero...');
    const response = await axios.get(`${BASE_URL}/heroes`);
    const $ = cheerio.load(response.data);
    
    const heroes = [];
    
    // Hero cards are typically in a grid
    $('.hero-card, .hero-list-item').each((i, element) => {
      const heroLink = $(element).find('a').first();
      const heroName = $(element).find('.hero-name, .hero-title').text().trim();
      const link = heroLink.attr('href');
      
      // Extract role if available on the list page
      let role = [];
      $(element).find('.hero-role, .role-label').each((j, roleElement) => {
        const roleText = $(roleElement).text().trim();
        if (roleText) role.push(roleText);
      });
      
      if (heroName && link) {
        heroes.push({
          name: heroName,
          link,
          role
        });
      }
    });
    
    console.log(`Found ${heroes.length} heroes on MLBBHero`);
    return heroes;
  } catch (error) {
    console.error('Error scraping hero list from MLBBHero:', error);
    return [];
  }
};

// Function to scrape detailed hero info
const scrapeHeroDetails = async (hero) => {
  try {
    console.log(`Scraping details for ${hero.name} from MLBBHero...`);
    const fullUrl = hero.link.startsWith('http') ? hero.link : `${BASE_URL}${hero.link}`;
    const response = await axios.get(fullUrl);
    const $ = cheerio.load(response.data);
    
    // Extract roles if not already found
    if (!hero.role || hero.role.length === 0) {
      const roles = [];
      $('.hero-role, .role-tag, .role-label').each((i, element) => {
        const role = $(element).text().trim();
        if (role) roles.push(role);
      });
      hero.role = roles;
    }
    
    // Extract counters
    const counters = [];
    $('.counter-section, .counters-list, .weakness-section').find('.hero-name, .counter-hero').each((i, element) => {
      const counter = $(element).text().trim();
      if (counter) counters.push(counter);
    });
    
    // Extract tier/meta rating
    let tier = 'Unknown';
    $('.hero-tier, .tier-label, .meta-rating').each((i, element) => {
      const tierText = $(element).text().trim();
      if (tierText) {
        // Extract just the tier letter (S, A, B, etc.)
        const tierMatch = tierText.match(/([SABCDEF][+-]?)/i);
        if (tierMatch && tierMatch[1]) {
          tier = tierMatch[1].toUpperCase();
        } else {
          tier = tierText;
        }
      }
    });
    
    // Extract builds
    const builds = [];
    $('.build-section, .recommended-builds').each((i, section) => {
      const buildName = $(section).find('.build-title, .build-name').text().trim() || `Build ${i+1}`;
      const items = [];
      
      $(section).find('.item-name, .build-item').each((j, item) => {
        const itemName = $(item).text().trim();
        if (itemName) items.push(itemName);
      });
      
      if (items.length > 0) {
        builds.push({
          name: buildName,
          items
        });
      }
    });
    
    // Extract emblems
    const emblems = [];
    $('.emblem-section, .recommended-emblems').each((i, section) => {
      const emblemName = $(section).find('.emblem-title, .emblem-name').text().trim() || `Emblem Set ${i+1}`;
      const talents = [];
      
      $(section).find('.talent-name, .emblem-talent').each((j, talent) => {
        const talentName = $(talent).text().trim();
        if (talentName) talents.push(talentName);
      });
      
      if (talents.length > 0 || emblemName) {
        emblems.push({
          name: emblemName,
          talents
        });
      }
    });
    
    // Extract patch changes if available
    const patchChanges = [];
    $('.patch-notes, .update-history').each((i, section) => {
      const patchVersion = $(section).find('.patch-version, .update-version').text().trim();
      const changes = [];
      
      $(section).find('.patch-change, .change-item').each((j, change) => {
        const changeText = $(change).text().trim();
        if (changeText) changes.push(changeText);
      });
      
      if (changes.length > 0 && patchVersion) {
        patchChanges.push({
          version: patchVersion,
          changes
        });
      }
    });
    
    // Return merged hero data
    return {
      ...hero,
      counters,
      tier,
      builds,
      emblems,
      patchChanges
    };
  } catch (error) {
    console.error(`Error scraping details for ${hero.name} from MLBBHero:`, error);
    return hero; // Return basic hero info if details scraping fails
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
    console.error('Error in MLBBHero scraper:', error);
    return [];
  }
};

module.exports = { scrape }; 