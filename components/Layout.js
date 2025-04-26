import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaHome, FaStar, FaBars, FaTimes } from 'react-icons/fa';

export default function Layout({ children, title = 'ML Hero Intel' }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Mobile Legends Bang Bang Hero Intelligence" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-gradient-to-r from-primary-700 to-primary-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 text-2xl font-bold">
            <span>ML Hero Intel</span>
          </Link>
          
          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-6 items-center">
            <Link href="/" className={`nav-link ${router.pathname === '/' ? 'font-bold' : ''}`}>
              <FaHome className="inline mr-1" /> Home
            </Link>
            <Link href="/favorites" className={`nav-link ${router.pathname === '/favorites' ? 'font-bold' : ''}`}>
              <FaStar className="inline mr-1" /> Favorites
            </Link>
          </nav>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-primary-800 px-4 py-2">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className={`nav-link ${router.pathname === '/' ? 'font-bold' : ''}`} onClick={() => setIsMenuOpen(false)}>
                <FaHome className="inline mr-2" /> Home
              </Link>
              <Link href="/favorites" className={`nav-link ${router.pathname === '/favorites' ? 'font-bold' : ''}`} onClick={() => setIsMenuOpen(false)}>
                <FaStar className="inline mr-2" /> Favorites
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} ML Hero Intel. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                ML Hero Intel is not affiliated with Moonton or Mobile Legends: Bang Bang.
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/about" className="text-gray-600 hover:text-primary-600 text-sm">
                About
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-primary-600 text-sm">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-primary-600 text-sm">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 