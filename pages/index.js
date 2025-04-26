import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import HeroCard from '../components/HeroCard';
import HeroFilter from '../components/HeroFilter';
import Loading from '../components/Loading';
import { getAllHeroes, getUserFavorites, isHeroFavorite } from '../services/api';

export default function Home() {
  const [heroes, setHeroes] = useState([]);
  const [filteredHeroes, setFilteredHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch heroes data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch all heroes
        const heroesData = await getAllHeroes();
        
        // Fetch favorites from localStorage
        const favoritesData = await getUserFavorites();
        const favoriteIds = favoritesData.map(hero => hero.name.toLowerCase().replace(/\s+/g, '-'));
        
        // Mark favorite heroes
        heroesData.forEach(hero => {
          const heroId = hero.name.toLowerCase().replace(/\s+/g, '-');
          hero.isFavorite = favoriteIds.includes(heroId);
        });
        
        setHeroes(heroesData);
        setFilteredHeroes(heroesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching heroes:', err);
        setError('Failed to load heroes. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Handle filter changes
  const handleFilterChange = ({ searchTerm, roles, tier }) => {
    let filtered = [...heroes];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(hero => 
        hero.name.toLowerCase().includes(term)
      );
    }
    
    // Filter by roles
    if (roles && roles.length > 0) {
      filtered = filtered.filter(hero => {
        if (!hero.role || hero.role.length === 0) return false;
        return roles.some(role => 
          hero.role.map(r => r.toLowerCase()).includes(role.toLowerCase())
        );
      });
    }
    
    // Filter by tier
    if (tier) {
      filtered = filtered.filter(hero => 
        hero.tier === tier
      );
    }
    
    setFilteredHeroes(filtered);
  };
  
  return (
    <Layout title="ML Hero Intel - Mobile Legends Hero Guide">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ML Hero Intel</h1>
          <p className="text-xl text-gray-600">
            Your ultimate guide to Mobile Legends: Bang Bang heroes
          </p>
        </div>
        
        <HeroFilter onFilterChange={handleFilterChange} />
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <Loading size="large" />
        ) : (
          <>
            <p className="text-gray-500 mb-4">
              Showing {filteredHeroes.length} of {heroes.length} heroes
            </p>
            
            {filteredHeroes.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl text-gray-600">No heroes found matching your filters</h3>
                <p className="mt-2 text-gray-500">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredHeroes.map((hero) => (
                  <HeroCard key={hero.name} hero={hero} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
} 