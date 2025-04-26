import { FaSkull, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';

export default function HeroCounters({ hero }) {
  // Check if counters exist and is non-empty
  const hasCounters = hero.counters && hero.counters.length > 0;
  
  // Function to create hero slug
  const createHeroSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <FaSkull className="text-red-600 mr-2" size={20} />
          <h3 className="text-xl font-semibold">Counter Heroes</h3>
        </div>
        
        {hasCounters ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hero.counters.map((counter, index) => (
              <Link 
                key={index}
                href={`/hero/${createHeroSlug(counter)}`}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-500 font-medium">{counter.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{counter}</h4>
                    <p className="text-sm text-gray-500">Counter Hero</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-yellow-500 mt-1 mr-3" />
              <div>
                <p className="text-yellow-800">No counter data available for this hero.</p>
                <p className="text-yellow-600 text-sm mt-1">
                  We're continuously updating our database with new hero information.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <FaShieldAlt className="text-blue-600 mr-2" size={20} />
          <h3 className="text-xl font-semibold">Counter Tips</h3>
        </div>
        
        {hero.counterTips && hero.counterTips.length > 0 ? (
          <ul className="space-y-3">
            {hero.counterTips.map((tip, index) => (
              <li key={index} className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-blue-800">{tip}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600">
              No counter tips available for this hero. Counter tips help you understand how to play against this hero effectively.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 