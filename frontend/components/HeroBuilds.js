import { FaHammer, FaGem, FaBookmark, FaInfoCircle } from 'react-icons/fa';

export default function HeroBuilds({ hero }) {
  const hasBuilds = hero.builds && hero.builds.length > 0;
  const hasEmblems = hero.emblems && hero.emblems.length > 0;
  
  return (
    <div>
      {/* Item Builds */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FaHammer className="text-blue-600 mr-2" size={20} />
          <h3 className="text-xl font-semibold">Item Builds</h3>
        </div>
        
        {hasBuilds ? (
          <div className="space-y-6">
            {hero.builds.map((build, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-blue-50 border-b border-blue-100 px-4 py-3">
                  <h4 className="font-medium text-blue-800">
                    {build.name || `Build ${index + 1}`}
                  </h4>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {build.items && build.items.map((item, itemIndex) => (
                      <div 
                        key={itemIndex} 
                        className="border border-gray-200 rounded-lg p-2 text-center"
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <FaGem className="text-gray-400" size={18} />
                        </div>
                        <p className="text-sm font-medium truncate" title={item}>
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-start">
              <FaInfoCircle className="text-blue-500 mt-1 mr-3" size={18} />
              <div>
                <p className="text-blue-800">No item builds available for this hero.</p>
                <p className="text-blue-600 text-sm mt-1">
                  We're continually updating our database with new builds.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Emblem Sets */}
      <div>
        <div className="flex items-center mb-4">
          <FaBookmark className="text-purple-600 mr-2" size={20} />
          <h3 className="text-xl font-semibold">Emblem Sets</h3>
        </div>
        
        {hasEmblems ? (
          <div className="space-y-4">
            {hero.emblems.map((emblem, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-purple-50 border-b border-purple-100 px-4 py-3">
                  <h4 className="font-medium text-purple-800">
                    {emblem.name || `Emblem Set ${index + 1}`}
                  </h4>
                </div>
                
                <div className="p-4">
                  {emblem.talents && emblem.talents.length > 0 ? (
                    <ul className="space-y-2">
                      {emblem.talents.map((talent, talentIndex) => (
                        <li 
                          key={talentIndex} 
                          className="flex items-center text-gray-700"
                        >
                          <span className="w-6 h-6 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full mr-2 text-xs font-medium">
                            {talentIndex + 1}
                          </span>
                          {talent}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">
                      No talent details available for this emblem set.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <div className="flex items-start">
              <FaInfoCircle className="text-purple-500 mt-1 mr-3" size={18} />
              <div>
                <p className="text-purple-800">No emblem sets available for this hero.</p>
                <p className="text-purple-600 text-sm mt-1">
                  We're continually updating our database with recommended emblems.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 