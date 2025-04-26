import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaStar, FaRegStar, FaArrowLeft } from 'react-icons/fa';
import Layout from '../../components/Layout';
import HeroDetailTabs from '../../components/HeroDetailTabs';
import Loading from '../../components/Loading';
import { getHeroById, addToFavorites, removeFromFavorites, getUserFavorites } from '../../services/api';
import { useAuth } from '../../components/AuthContext';

export default function HeroDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { currentUser } = useAuth();
  
  // Fetch hero data
  useEffect(() => {
    async function fetchHero() {
      if (!slug) return;
      
      try {
        setLoading(true);
        
        // Get hero details
        const heroData = await getHeroById(slug);
        
        // If user is logged in, check if hero is in favorites
        if (currentUser) {
          const userFavorites = await getUserFavorites(currentUser.uid);
          const favoriteIds = userFavorites.map(h => h.name.toLowerCase().replace(/\s+/g, '-'));
          setIsFavorite(favoriteIds.includes(slug));
        }
        
        setHero(heroData);
        setError(null);
      } catch (err) {
        console.error('Error fetching hero:', err);
        setError('Failed to load hero data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchHero();
  }, [slug, currentUser]);
  
  // Toggle favorite status
  const toggleFavorite = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    try {
      if (isFavorite) {
        await removeFromFavorites(currentUser.uid, slug);
      } else {
        await addToFavorites(currentUser.uid, slug);
      }
      
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };
  
  // Handle hero image
  const heroImage = hero?.image || `https://via.placeholder.com/300x300?text=${encodeURIComponent(hero?.name || 'Loading...')}`;
  
  return (
    <Layout title={hero ? `${hero.name} - ML Hero Intel` : 'Hero Details - ML Hero Intel'}>
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <FaArrowLeft className="mr-2" /> Back to Heroes
          </Link>
        </div>
        
        {loading ? (
          <Loading size="large" />
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : hero ? (
          <>
            {/* Hero header */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="w-32 h-32 md:w-40 md:h-40 overflow-hidden rounded-full border-4 border-white mb-4 md:mb-0 md:mr-6">
                    <img 
                      src={heroImage} 
                      alt={hero.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  <div className="flex-grow text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{hero.name}</h1>
                    
                    <div className="flex flex-wrap justify-center md:justify-start mb-3">
                      {Array.isArray(hero.role) && hero.role.map((role, index) => (
                        <span key={index} className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm mr-2 mb-2">
                          {role}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-center md:justify-start">
                      <span className={`tier-badge tier-${hero.tier || 'Unknown'} mr-2`}>
                        {hero.tier || '?'}
                      </span>
                      <span>Tier {hero.tier || 'Unknown'}</span>
                    </div>
                  </div>
                  
                  {/* Favorite button */}
                  {currentUser && (
                    <button
                      onClick={toggleFavorite}
                      className="flex items-center justify-center ml-auto bg-white text-primary-600 hover:bg-primary-50 font-bold py-2 px-4 rounded-full transition-colors"
                      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {isFavorite ? (
                        <>
                          <FaStar className="mr-2 text-yellow-500" />
                          Favorited
                        </>
                      ) : (
                        <>
                          <FaRegStar className="mr-2" />
                          Add to Favorites
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Hero details tabs */}
            <HeroDetailTabs hero={hero} />
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600">Hero not found</h3>
            <p className="mt-2 text-gray-500">The hero you're looking for doesn't exist or hasn't been added yet.</p>
            <Link href="/" className="button-primary inline-block mt-4">
              Browse All Heroes
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
} 