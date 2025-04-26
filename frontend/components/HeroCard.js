import { useState } from 'react';
import Link from 'next/link';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from './AuthContext';

export default function HeroCard({ hero }) {
  const { currentUser } = useAuth();
  const [isFavorite, setIsFavorite] = useState(hero.isFavorite || false);
  
  // Default hero image if none provided
  const heroImage = hero.image || `https://via.placeholder.com/100x100?text=${encodeURIComponent(hero.name)}`;
  
  // Convert role array to string
  const roleString = Array.isArray(hero.role) ? hero.role.join(', ') : hero.role || 'Unknown';
  
  // Function to toggle favorite status
  const toggleFavorite = async (e) => {
    e.preventDefault(); // Prevent navigation to hero details
    
    if (!currentUser) {
      alert('Please log in to save favorites');
      return;
    }
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
      if (isFavorite) {
        // Remove from favorites
        await updateDoc(userRef, {
          favoriteHeroes: arrayRemove(hero.name.toLowerCase().replace(/\s+/g, '-'))
        });
      } else {
        // Add to favorites
        await updateDoc(userRef, {
          favoriteHeroes: arrayUnion(hero.name.toLowerCase().replace(/\s+/g, '-'))
        });
      }
      
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };
  
  return (
    <Link href={`/hero/${hero.name.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="hero-card relative h-full">
        {currentUser && (
          <button 
            onClick={toggleFavorite}
            className="absolute top-2 right-2 z-10 text-yellow-500 hover:text-yellow-600 transition-colors"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? <FaStar size={20} /> : <FaRegStar size={20} />}
          </button>
        )}
        
        <div className="hero-card-header flex justify-between items-center">
          <h3 className="text-lg font-bold truncate">{hero.name}</h3>
          <span className={`tier-badge tier-${hero.tier || 'Unknown'}`}>{hero.tier || '?'}</span>
        </div>
        
        <div className="hero-card-body flex flex-col items-center">
          <div className="w-24 h-24 mb-3 overflow-hidden rounded-full border-2 border-primary-200">
            <img 
              src={heroImage} 
              alt={hero.name}
              className="w-full h-full object-cover" 
            />
          </div>
          
          <div className="w-full text-center">
            <div className="mb-2">
              {Array.isArray(hero.role) && hero.role.map((role, index) => (
                <span key={index} className="role-badge">
                  {role}
                </span>
              ))}
              {!Array.isArray(hero.role) && hero.role && (
                <span className="role-badge">{hero.role}</span>
              )}
              {(!hero.role || (Array.isArray(hero.role) && hero.role.length === 0)) && (
                <span className="role-badge">Unknown</span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mt-2">
              {hero.counters && hero.counters.length > 0 ? (
                <span>Countered by: {hero.counters.slice(0, 2).join(', ')}{hero.counters.length > 2 ? ', ...' : ''}</span>
              ) : (
                <span>No counter data available</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
} 