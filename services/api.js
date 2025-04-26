import axios from 'axios';

// Get all heroes from JSON files
export async function getAllHeroes() {
  try {
    const response = await fetch('/data/heroes.json');
    if (!response.ok) {
      throw new Error('Failed to fetch heroes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching heroes:', error);
    throw error;
  }
}

// Get a specific hero by ID (slug)
export async function getHeroById(heroId) {
  try {
    const response = await fetch(`/data/heroes/${heroId}.json`);
    if (!response.ok) {
      throw new Error('Hero not found');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching hero ${heroId}:`, error);
    throw error;
  }
}

// Get heroes by role using client-side filtering
export async function getHeroesByRole(role) {
  try {
    const allHeroes = await getAllHeroes();
    return allHeroes.filter(hero => 
      hero.role && hero.role.some(r => r.toLowerCase() === role.toLowerCase())
    );
  } catch (error) {
    console.error(`Error fetching heroes with role ${role}:`, error);
    throw error;
  }
}

// Get heroes by tier using client-side filtering
export async function getHeroesByTier(tier) {
  try {
    const allHeroes = await getAllHeroes();
    return allHeroes.filter(hero => 
      hero.tier && hero.tier.toLowerCase() === tier.toLowerCase()
    );
  } catch (error) {
    console.error(`Error fetching heroes with tier ${tier}:`, error);
    throw error;
  }
}

// Local storage helper for favorites
const localStorageKey = 'mlHeroIntel_favorites';

// Get user's favorite heroes from localStorage
export async function getUserFavorites() {
  try {
    // Check if localStorage is available (client-side only)
    if (typeof window === 'undefined') {
      return [];
    }
    
    const favoriteIds = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
    
    if (favoriteIds.length === 0) {
      return [];
    }
    
    const allHeroes = await getAllHeroes();
    
    const favorites = allHeroes.filter(hero => {
      const heroId = hero.name.toLowerCase().replace(/\s+/g, '-');
      return favoriteIds.includes(heroId);
    }).map(hero => ({
      ...hero,
      isFavorite: true
    }));
    
    return favorites;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
}

// Check if a hero is a favorite
export function isHeroFavorite(heroId) {
  // Check if localStorage is available (client-side only)
  if (typeof window === 'undefined') {
    return false;
  }
  
  const favoriteIds = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
  return favoriteIds.includes(heroId);
}

// Add hero to favorites
export async function addToFavorites(heroId) {
  try {
    // Check if localStorage is available (client-side only)
    if (typeof window === 'undefined') {
      return false;
    }
    
    const favoriteIds = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
    
    if (!favoriteIds.includes(heroId)) {
      favoriteIds.push(heroId);
      localStorage.setItem(localStorageKey, JSON.stringify(favoriteIds));
    }
    
    return true;
  } catch (error) {
    console.error(`Error adding hero ${heroId} to favorites:`, error);
    throw error;
  }
}

// Remove hero from favorites
export async function removeFromFavorites(heroId) {
  try {
    // Check if localStorage is available (client-side only)
    if (typeof window === 'undefined') {
      return false;
    }
    
    let favoriteIds = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
    
    favoriteIds = favoriteIds.filter(id => id !== heroId);
    localStorage.setItem(localStorageKey, JSON.stringify(favoriteIds));
    
    return true;
  } catch (error) {
    console.error(`Error removing hero ${heroId} from favorites:`, error);
    throw error;
  }
}

// Get last scraping metadata
export async function getScrapingMetadata() {
  try {
    const response = await fetch('/data/metadata.json');
    if (!response.ok) {
      return { lastSuccessfulScrape: null };
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching scraping metadata:', error);
    return { lastSuccessfulScrape: null };
  }
} 