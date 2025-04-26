import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import HeroCard from '../components/HeroCard';
import Loading from '../components/Loading';
import { getUserFavorites } from '../services/api';
import { useAuth } from '../components/AuthContext';
import { FaStar } from 'react-icons/fa';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not logged in
    if (!currentUser && !loading) {
      router.push('/login');
      return;
    }

    async function fetchFavorites() {
      try {
        if (currentUser) {
          setLoading(true);
          const favoritesData = await getUserFavorites(currentUser.uid);
          setFavorites(favoritesData);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [currentUser, router]);

  return (
    <Layout title="My Favorites - ML Hero Intel">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <FaStar className="text-yellow-500 text-2xl mr-2" />
          <h1 className="text-3xl font-bold">My Favorite Heroes</h1>
        </div>

        {loading ? (
          <Loading size="large" />
        ) : (
          <>
            {favorites.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <FaStar className="mx-auto text-gray-300 text-5xl mb-4" />
                <h3 className="text-xl text-gray-600 mb-2">You don't have any favorite heroes yet</h3>
                <p className="text-gray-500 mb-6">Add heroes to your favorites to see them here</p>
                <button 
                  onClick={() => router.push('/')}
                  className="button-primary"
                >
                  Browse Heroes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favorites.map((hero) => (
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