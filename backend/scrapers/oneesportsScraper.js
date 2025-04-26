const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

// Base URL for OneEsports MLBB articles
const BASE_URL = 'https://www.oneesports.gg/mobile-legends';
const SEARCH_URL = 'https://oneesports.gg/?s=mobile+legends+tier+list';

// Function to get hero list and tier information from tier list articles
const scrapeArticles = async () => {
  try {
    console.log('Scraping OneEsports articles for tier lists...');
    
    // We'll use Puppeteer for this one because the site might have dynamic content
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto(SEARCH_URL, { waitUntil: 'networkidle2' });
    
    // Get the latest tier list articles
    const articleLinks = await page.evaluate(() => {
      const links = [];
      const articles = document.querySelectorAll('.post-item .post-title a');
      
      for (let i = 0; i < Math.min(articles.length, 5); i++) { // Get up to 5 latest articles
        const article = articles[i];
        const title = article.textContent.trim();
        const url = article.href;
        
        // Only get tier list articles
        if (title.toLowerCase().includes('tier list') && title.toLowerCase().includes('mobile legends')) {
          links.push({ title, url });
        }
      }
      
      return links;
    });
    
    const heroData = [];
    
    // Process each tier list article
    for (const article of articleLinks) {
      console.log(`Processing article: ${article.title}`);
      await page.goto(article.url, { waitUntil: 'networkidle2' });
      
      // Extract hero data
      const articleHeroData = await page.evaluate(() => {
        const heroes = [];
        
        // Look for tier sections (S, A, B, C, etc.)
        const tierSections = document.querySelectorAll('h2, h3, h4');
        
        for (const section of tierSections) {
          const sectionText = section.textContent.trim();
          const tierMatch = sectionText.match(/tier\s*:?\s*([SABCDEF][+-]?)/i);
          
          if (tierMatch && tierMatch[1]) {
            const tier = tierMatch[1].toUpperCase();
            let currentElement = section.nextElementSibling;
            
            // Look for hero names in paragraphs or lists after the tier heading
            while (currentElement && !['H2', 'H3', 'H4'].includes(currentElement.tagName)) {
              const text = currentElement.textContent.trim();
              
              // Split by commas, "and", or list items
              const heroNames = text.split(/,|\sand\s|•/).map(name => name.trim());
              
              for (const name of heroNames) {
                // Filter out short strings and non-hero text
                if (name.length > 2 && !name.includes('tier') && !name.match(/^\d/) && !name.match(/^[\W]/)) {
                  heroes.push({
                    name: name.replace(/\(.+\)/, '').trim(), // Remove parentheses content
                    tier,
                    source: document.title,
                    role: []
                  });
                }
              }
              
              currentElement = currentElement.nextElementSibling;
            }
          }
        }
        
        return heroes;
      });
      
      heroData.push(...articleHeroData);
    }
    
    // Close browser
    await browser.close();
    
    // Merge heroes with same name (taking the most recent tier)
    const mergedHeroes = {};
    
    for (const hero of heroData) {
      const heroName = hero.name.toLowerCase();
      
      if (!mergedHeroes[heroName]) {
        mergedHeroes[heroName] = hero;
      }
      // If we already have this hero, keep the tier from the most recent article
      // (We're processing articles from newest to oldest)
    }
    
    console.log(`Found ${Object.keys(mergedHeroes).length} heroes with tier information from OneEsports`);
    return Object.values(mergedHeroes);
  } catch (error) {
    console.error('Error scraping from OneEsports:', error);
    return [];
  }
};

// Function to get additional hero information from hero guide articles
const enrichHeroData = async (heroes) => {
  try {
    console.log('Enriching hero data from OneEsports articles...');
    
    // For each hero, try to find a guide article
    for (let i = 0; i < heroes.length; i++) {
      const hero = heroes[i];
      const searchUrl = `${BASE_URL}/?s=${encodeURIComponent(`mobile legends ${hero.name} guide`)}`;
      
      try {
        const response = await axios.get(searchUrl);
        const $ = cheerio.load(response.data);
        
        // Get the first relevant article
        const articleLink = $('.post-title a').first();
        
        if (articleLink.length > 0) {
          const articleUrl = articleLink.attr('href');
          const articleTitle = articleLink.text().trim();
          
          // Only process if it seems like a relevant guide
          if (articleTitle.toLowerCase().includes(hero.name.toLowerCase())) {
            console.log(`Found guide for ${hero.name}: ${articleTitle}`);
            
            const articleResponse = await axios.get(articleUrl);
            const article$ = cheerio.load(articleResponse.data);
            
            // Extract role if available
            article$('p, li').each((i, element) => {
              const text = article$(element).text().toLowerCase();
              if (text.includes('role:') || text.includes('roles:') || text.includes('hero type:')) {
                const roleMatch = text.match(/role|roles|hero type:?\s*([^.]+)/i);
                if (roleMatch && roleMatch[1]) {
                  const roles = roleMatch[1].split(/[,\/]/).map(r => r.trim());
                  hero.role = roles.filter(r => r.length > 0);
                }
              }
            });
            
            // Extract counters if mentioned
            const counters = [];
            article$('p, li').each((i, element) => {
              const text = article$(element).text().toLowerCase();
              if (text.includes('counter') || text.includes('weak against')) {
                const matches = text.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g);
                if (matches) {
                  // Filter likely hero names (capitalized words)
                  counters.push(...matches.filter(name => name.length > 2));
                }
              }
            });
            
            if (counters.length > 0) {
              hero.counters = counters;
            }
            
            // Look for build information
            const builds = [];
            article$('h2, h3, h4').each((i, header) => {
              const headerText = article$(header).text().toLowerCase();
              if (headerText.includes('build') || headerText.includes('item')) {
                const buildItems = [];
                
                let currentElement = article$(header).next();
                while (currentElement.length && !currentElement.is('h2, h3, h4')) {
                  if (currentElement.is('ul, ol')) {
                    currentElement.find('li').each((j, item) => {
                      buildItems.push(article$(item).text().trim());
                    });
                  }
                  currentElement = currentElement.next();
                }
                
                if (buildItems.length > 0) {
                  builds.push({
                    name: headerText.trim(),
                    items: buildItems
                  });
                }
              }
            });
            
            if (builds.length > 0) {
              hero.builds = builds;
            }
            
            // Look for emblem information
            article$('p, li').each((i, element) => {
              const text = article$(element).text().toLowerCase();
              if (text.includes('emblem') || text.includes('talent')) {
                const emblemMatch = text.match(/emblem:?\s*([^.]+)/i);
                if (emblemMatch && emblemMatch[1]) {
                  hero.emblems = [{
                    name: emblemMatch[1].trim(),
                    talents: []
                  }];
                }
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error enriching data for ${hero.name}:`, error);
        // Continue with next hero
      }
    }
    
    return heroes;
  } catch (error) {
    console.error('Error in OneEsports data enrichment:', error);
    return heroes; // Return original data if enrichment fails
  }
};

// Main scraping function
const scrape = async () => {
  try {
    // Get basic tier list data
    const heroes = await scrapeArticles();
    
    // Enrich with additional data where possible
    // Note: We'll limit to a few heroes to avoid excessive requests
    const heroesToEnrich = heroes.slice(0, 10); // Just enrich the first 10 heroes
    const enrichedHeroes = await enrichHeroData(heroesToEnrich);
    
    // Combine enriched heroes with the rest
    return [...enrichedHeroes, ...heroes.slice(10)];
  } catch (error) {
    console.error('Error in OneEsports scraper:', error);
    return [];
  }
};

module.exports = { scrape }; 