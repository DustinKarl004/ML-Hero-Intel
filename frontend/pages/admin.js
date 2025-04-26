import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { FaSync, FaExclamationTriangle, FaCalendarAlt, FaDatabase } from 'react-icons/fa';
import { triggerScraping, getScrapingMetadata } from '../services/api';
import { useAuth } from '../components/AuthContext';

export default function Admin() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const { currentUser } = useAuth();
  const router = useRouter();
  
  // Fetch scraping metadata
  useEffect(() => {
    async function fetchMetadata() {
      try {
        const data = await getScrapingMetadata();
        setMetadata(data);
      } catch (error) {
        console.error('Error fetching scraping metadata:', error);
      }
    }
    
    // Only fetch if user is logged in
    if (currentUser) {
      fetchMetadata();
    } else if (currentUser === null) {
      // Redirect if not logged in
      router.push('/login');
    }
  }, [currentUser, router]);
  
  // Trigger scraping
  const handleScrape = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);
    
    try {
      await triggerScraping();
      setSuccess(true);
      
      // Refresh metadata after successful scrape
      const newMetadata = await getScrapingMetadata();
      setMetadata(newMetadata);
    } catch (error) {
      console.error('Error triggering scraping:', error);
      setError('Failed to trigger scraping. You might not have permission to perform this action.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Layout title="Admin - ML Hero Intel">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
        
        {!currentUser ? (
          <Loading size="large" />
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-6 text-white">
                <div className="flex items-center">
                  <FaDatabase className="text-4xl mr-4" />
                  <div>
                    <h2 className="text-xl font-bold">Data Management</h2>
                    <p>Manage hero data scraped from external sources</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Last Successful Scrape</h3>
                  <div className="flex items-center text-gray-700">
                    <FaCalendarAlt className="mr-2" />
                    {formatDate(metadata?.lastSuccessfulScrape)}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Manual Data Update</h3>
                  <p className="text-gray-600 mb-4">
                    Trigger a manual scraping job to update hero data from all sources.
                    This process may take a few minutes to complete.
                  </p>
                  
                  <button
                    onClick={handleScrape}
                    disabled={loading}
                    className="button-primary flex items-center"
                  >
                    <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Processing...' : 'Start Scraping'}
                  </button>
                  
                  {success && (
                    <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
                      Scraping triggered successfully! It may take a few minutes to complete.
                    </div>
                  )}
                  
                  {error && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 rounded flex items-start">
                      <FaExclamationTriangle className="mr-2 mt-1 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Important Notes</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>
                      Please do not trigger scraping too frequently to avoid being blocked by the source websites.
                    </li>
                    <li>
                      The automatic scraping job runs daily at midnight UTC.
                    </li>
                    <li>
                      If you encounter repeated errors, please check the Firebase Functions logs.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
} 