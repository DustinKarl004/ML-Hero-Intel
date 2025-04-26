import axios from 'axios';
import { collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../firebase-config';

// Firebase Cloud Functions base URL - replace with your actual URL when deployed
const FUNCTIONS_BASE_URL = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || 'http://localhost:5001/your-project-id/us-central1';

// Get all heroes from Firestore
export async function getAllHeroes() {
  try {
    const heroesSnapshot = await getDocs(collection(db, 'heroes'));
    const heroes = [];
    
    heroesSnapshot.forEach(doc => {
      heroes.push(doc.data());
    });
    
    return heroes;
  } catch (error) {
    console.error('Error fetching heroes:', error);
    throw error;
  }
}

// Get a specific hero by ID (slug)
export async function getHeroById(heroId) {
  try {
    const heroDoc = await getDoc(doc(db, 'heroes', heroId));
    
    if (!heroDoc.exists()) {
      throw new Error('Hero not found');
    }
    
    return heroDoc.data();
  } catch (error) {
    console.error(`Error fetching hero ${heroId}:`, error);
    throw error;
  }
}

// Get heroes by role
export async function getHeroesByRole(role) {
  try {
    const q = query(
      collection(db, 'heroes'),
      where('role', 'array-contains', role)
    );
    
    const querySnapshot = await getDocs(q);
    const heroes = [];
    
    querySnapshot.forEach(doc => {
      heroes.push(doc.data());
    });
    
    return heroes;
  } catch (error) {
    console.error(`Error fetching heroes with role ${role}:`, error);
    throw error;
  }
}

// Get heroes by tier
export async function getHeroesByTier(tier) {
  try {
    const q = query(
      collection(db, 'heroes'),
      where('tier', '==', tier)
    );
    
    const querySnapshot = await getDocs(q);
    const heroes = [];
    
    querySnapshot.forEach(doc => {
      heroes.push(doc.data());
    });
    
    return heroes;
  } catch (error) {
    console.error(`Error fetching heroes with tier ${tier}:`, error);
    throw error;
  }
}

// Get user's favorite heroes
export async function getUserFavorites(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(doc(db, 'users', userId), {
        favoriteHeroes: []
      });
      return [];
    }
    
    const userData = userDoc.data();
    const favoriteHeroIds = userData.favoriteHeroes || [];
    
    if (favoriteHeroIds.length === 0) {
      return [];
    }
    
    // Get all the hero documents
    const heroes = [];
    
    for (const heroId of favoriteHeroIds) {
      const heroDoc = await getDoc(doc(db, 'heroes', heroId));
      if (heroDoc.exists()) {
        heroes.push({
          ...heroDoc.data(),
          isFavorite: true
        });
      }
    }
    
    return heroes;
  } catch (error) {
    console.error(`Error fetching favorites for user ${userId}:`, error);
    throw error;
  }
}

// Add hero to favorites
export async function addToFavorites(userId, heroId) {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Check if user doc exists
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(userRef, {
        favoriteHeroes: [heroId]
      });
    } else {
      // Add to existing favorites
      await updateDoc(userRef, {
        favoriteHeroes: arrayUnion(heroId)
      });
    }
    
    return true;
  } catch (error) {
    console.error(`Error adding hero ${heroId} to favorites:`, error);
    throw error;
  }
}

// Remove hero from favorites
export async function removeFromFavorites(userId, heroId) {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      favoriteHeroes: arrayRemove(heroId)
    });
    
    return true;
  } catch (error) {
    console.error(`Error removing hero ${heroId} from favorites:`, error);
    throw error;
  }
}

// Trigger manual scraping - requires authentication
export async function triggerScraping() {
  try {
    const token = await auth.currentUser?.getIdToken();
    
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    const response = await axios.post(
      `${FUNCTIONS_BASE_URL}/runScrapers`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error triggering scraping:', error);
    throw error;
  }
}

// Get last scraping metadata
export async function getScrapingMetadata() {
  try {
    const metadataDoc = await getDoc(doc(db, 'metadata', 'scraping'));
    
    if (!metadataDoc.exists()) {
      return { lastSuccessfulScrape: null };
    }
    
    return metadataDoc.data();
  } catch (error) {
    console.error('Error fetching scraping metadata:', error);
    throw error;
  }
}

// Add comment to hero
export async function addHeroComment(heroId, comment) {
  try {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }
    
    const commentData = {
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
      userPhotoURL: auth.currentUser.photoURL || null,
      content: comment,
      timestamp: new Date().toISOString()
    };
    
    const heroRef = doc(db, 'heroes', heroId);
    
    await updateDoc(heroRef, {
      comments: arrayUnion(commentData)
    });
    
    return commentData;
  } catch (error) {
    console.error(`Error adding comment to hero ${heroId}:`, error);
    throw error;
  }
} 