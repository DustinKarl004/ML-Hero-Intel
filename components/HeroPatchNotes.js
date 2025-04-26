import { FaHistory, FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function HeroPatchNotes({ hero }) {
  const hasPatchChanges = hero.patchChanges && hero.patchChanges.length > 0;
  
  // Sort patch changes by version (newest first)
  const sortedPatchChanges = hasPatchChanges 
    ? [...hero.patchChanges].sort((a, b) => {
        // Try to extract version numbers for comparison
        const versionA = a.version && a.version.match(/\d+(\.\d+)*/);
        const versionB = b.version && b.version.match(/\d+(\.\d+)*/);
        
        if (versionA && versionB) {
          // If both can be parsed as versions, compare them
          return -versionA[0].localeCompare(versionB[0], undefined, { numeric: true });
        }
        // Otherwise, just do a string comparison
        return -String(a.version).localeCompare(String(b.version));
      })
    : [];
  
  // Function to determine if change is a buff or nerf
  const getChangeType = (change) => {
    const lowerChange = change.toLowerCase();
    if (lowerChange.includes('buff') || 
        lowerChange.includes('increas') || 
        lowerChange.includes('improv') ||
        lowerChange.includes('enhanc')) {
      return 'buff';
    }
    if (lowerChange.includes('nerf') || 
        lowerChange.includes('decreas') || 
        lowerChange.includes('reduc') ||
        lowerChange.includes('lower')) {
      return 'nerf';
    }
    return 'neutral';
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <FaHistory className="text-gray-600 mr-2" size={20} />
        <h3 className="text-xl font-semibold">Patch Notes History</h3>
      </div>
      
      {hasPatchChanges ? (
        <div className="space-y-8">
          {sortedPatchChanges.map((patch, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                <h4 className="font-medium text-gray-800">
                  Patch {patch.version || `Unknown Version ${index + 1}`}
                </h4>
              </div>
              
              <div className="p-4">
                {patch.changes && patch.changes.length > 0 ? (
                  <ul className="space-y-3">
                    {patch.changes.map((change, changeIndex) => {
                      const changeType = getChangeType(change);
                      return (
                        <li 
                          key={changeIndex} 
                          className={`flex items-start p-2 rounded-md ${
                            changeType === 'buff' 
                              ? 'bg-green-50' 
                              : changeType === 'nerf' 
                                ? 'bg-red-50' 
                                : 'bg-gray-50'
                          }`}
                        >
                          {changeType === 'buff' && (
                            <FaArrowUp className="text-green-600 mt-1 mr-2 flex-shrink-0" />
                          )}
                          {changeType === 'nerf' && (
                            <FaArrowDown className="text-red-600 mt-1 mr-2 flex-shrink-0" />
                          )}
                          <span className={
                            changeType === 'buff' 
                              ? 'text-green-800' 
                              : changeType === 'nerf' 
                                ? 'text-red-800' 
                                : 'text-gray-800'
                          }>
                            {change}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-gray-600 italic">
                    No detailed changes available for this patch.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-600">
            No patch notes available for this hero. We'll update this section as new patches are released.
          </p>
        </div>
      )}
    </div>
  );
} 