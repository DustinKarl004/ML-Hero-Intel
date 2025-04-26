import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../components/AuthContext';

export default function Login() {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);
  
  return (
    <Layout title="Login - ML Hero Intel">
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 bg-gradient-to-r from-primary-600 to-primary-800 p-8 text-white flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
              <p className="mb-6">
                Sign in to access your favorite heroes, contribute to the community, and get the latest updates from ML Hero Intel.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10C20 4.477 15.523 0 10 0zm0 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Save your favorite heroes</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-9 3a1 1 0 112 0v2a1 1 0 11-2 0v-2zm0-6a1 1 0 112 0v2a1 1 0 11-2 0V7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Get the latest hero updates</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h10v8H5V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Comment on heroes and builds</span>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 p-8">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 