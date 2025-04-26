import { FaMedal, FaChessBishop } from 'react-icons/fa';

export default function HeroOverview({ hero }) {
  // Format roles array to string
  const roleString = Array.isArray(hero.role) 
    ? hero.role.join(', ') 
    : hero.role || 'Unknown';
  
  // Get tier color
  const getTierColor = (tier) => {
    switch(tier) {
      case 'S': return 'text-purple-600';
      case 'A': return 'text-blue-600';
      case 'B': return 'text-green-600';
      case 'C': return 'text-yellow-600';
      case 'D': 
      case 'F': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
        <div className="mr-6 mb-4 sm:mb-0">
          <h3 className="text-gray-500 text-sm mb-1">Hero Tier</h3>
          <div className="flex items-center">
            <FaMedal className={`mr-2 ${getTierColor(hero.tier)}`} size={20} />
            <span className={`text-xl font-bold ${getTierColor(hero.tier)}`}>
              {hero.tier || 'Unknown'} Tier
            </span>
          </div>
        </div>
        
        <div>
          <h3 className="text-gray-500 text-sm mb-1">Role</h3>
          <div className="flex items-center">
            <FaChessBishop className="mr-2 text-gray-600" size={18} />
            <span className="text-lg">{roleString}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Description</h3>
        {hero.description ? (
          <p className="text-gray-700">{hero.description}</p>
        ) : (
          <p className="text-gray-500 italic">
            No description available. ML Hero Intel is constantly updating our hero database.
          </p>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Specialties</h3>
        <div className="flex flex-wrap gap-2">
          {hero.specialties && hero.specialties.length > 0 ? (
            hero.specialties.map((specialty, index) => (
              <span 
                key={index} 
                className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
              >
                {specialty}
              </span>
            ))
          ) : (
            <p className="text-gray-500 italic">No specialties data available.</p>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Last Updated</h3>
        <p className="text-gray-600">
          {hero.lastUpdated 
            ? new Date(hero.lastUpdated).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'Unknown'
          }
        </p>
      </div>
    </div>
  );
} 