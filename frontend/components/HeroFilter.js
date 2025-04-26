import { useState } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

export default function HeroFilter({ onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedTier, setSelectedTier] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // List of all possible roles
  const allRoles = [
    'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'
  ];
  
  // List of all possible tiers
  const allTiers = ['S', 'A', 'B', 'C', 'D', 'F'];
  
  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Trigger filter change
    onFilterChange({
      searchTerm: value,
      roles: selectedRoles,
      tier: selectedTier
    });
  };
  
  // Toggle role selection
  const toggleRole = (role) => {
    const updatedRoles = selectedRoles.includes(role)
      ? selectedRoles.filter(r => r !== role)
      : [...selectedRoles, role];
    
    setSelectedRoles(updatedRoles);
    
    // Trigger filter change
    onFilterChange({
      searchTerm,
      roles: updatedRoles,
      tier: selectedTier
    });
  };
  
  // Set tier filter
  const handleTierChange = (tier) => {
    const newTier = tier === selectedTier ? '' : tier;
    setSelectedTier(newTier);
    
    // Trigger filter change
    onFilterChange({
      searchTerm,
      roles: selectedRoles,
      tier: newTier
    });
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRoles([]);
    setSelectedTier('');
    
    // Trigger filter change
    onFilterChange({
      searchTerm: '',
      roles: [],
      tier: ''
    });
  };
  
  // Toggle filter visibility on mobile
  const toggleFilterVisibility = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-grow max-w-xl">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search heroes..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                onFilterChange({
                  searchTerm: '',
                  roles: selectedRoles,
                  tier: selectedTier
                });
              }}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>
        
        {/* Filter toggle for mobile */}
        <button
          onClick={toggleFilterVisibility}
          className="md:hidden button-outline flex items-center justify-center"
        >
          <FaFilter className="mr-2" /> Filters
          {(selectedRoles.length > 0 || selectedTier) && (
            <span className="ml-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {selectedRoles.length + (selectedTier ? 1 : 0)}
            </span>
          )}
        </button>
        
        {/* Desktop filter buttons */}
        <div className="hidden md:flex space-x-2">
          {selectedRoles.length > 0 || selectedTier ? (
            <button
              onClick={resetFilters}
              className="button-outline flex items-center"
            >
              <FaTimes className="mr-1" /> Clear Filters
            </button>
          ) : null}
        </div>
      </div>
      
      {/* Filter options (responsive) */}
      <div className={`mt-4 filter-options ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
        {/* Role filters */}
        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Filter by Role:</h3>
          <div className="flex flex-wrap gap-2">
            {allRoles.map(role => (
              <button
                key={role}
                onClick={() => toggleRole(role)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedRoles.includes(role)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tier filters */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Filter by Tier:</h3>
          <div className="flex flex-wrap gap-2">
            {allTiers.map(tier => (
              <button
                key={tier}
                onClick={() => handleTierChange(tier)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTier === tier
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tier {tier}
              </button>
            ))}
          </div>
        </div>
        
        {/* Mobile clear button */}
        <div className="mt-4 md:hidden">
          {selectedRoles.length > 0 || selectedTier ? (
            <button
              onClick={resetFilters}
              className="button-outline w-full flex items-center justify-center"
            >
              <FaTimes className="mr-1" /> Clear All Filters
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
} 