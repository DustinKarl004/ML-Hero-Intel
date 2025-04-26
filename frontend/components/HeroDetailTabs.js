import { useState } from 'react';
import { 
  FaInfoCircle, 
  FaShieldAlt, 
  FaHammer, 
  FaComments, 
  FaHistory
} from 'react-icons/fa';

// Tab content components
import HeroOverview from './HeroOverview';
import HeroCounters from './HeroCounters';
import HeroBuilds from './HeroBuilds';
import HeroComments from './HeroComments';
import HeroPatchNotes from './HeroPatchNotes';

export default function HeroDetailTabs({ hero }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaInfoCircle /> },
    { id: 'counters', label: 'Counters', icon: <FaShieldAlt /> },
    { id: 'builds', label: 'Builds', icon: <FaHammer /> },
    { id: 'comments', label: 'Comments', icon: <FaComments /> }
  ];
  
  // Only add patch notes tab if there are patch notes
  if (hero.patchChanges && hero.patchChanges.length > 0) {
    tabs.push({ id: 'patchnotes', label: 'Patch Notes', icon: <FaHistory /> });
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Tabs navigation */}
      <div className="flex overflow-x-auto border-b scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      <div className="p-6">
        {activeTab === 'overview' && <HeroOverview hero={hero} />}
        {activeTab === 'counters' && <HeroCounters hero={hero} />}
        {activeTab === 'builds' && <HeroBuilds hero={hero} />}
        {activeTab === 'comments' && <HeroComments hero={hero} />}
        {activeTab === 'patchnotes' && <HeroPatchNotes hero={hero} />}
      </div>
    </div>
  );
} 