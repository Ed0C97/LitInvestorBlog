// LitInvestorBlog-frontend/src/components/ExpandingSearchBar.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import SearchResultsDropdown from './SearchResultsDropdown.jsx';
import directLinks from '../data/directLinks.json';

const ExpandingSearchBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(true);

  const { searchQuery, setSearchQuery, results } = useSearch();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const searchBarRef = useRef(null);
  const [dropdownRect, setDropdownRect] = useState(null);

  const toggleSearch = () => {
    const nextIsExpanded = !isExpanded;
    setIsExpanded(nextIsExpanded);
    if (nextIsExpanded) {
      setIsDropdownVisible(true);
    }
    if (!nextIsExpanded) {
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (inputRef.current) {
        setDropdownRect(inputRef.current.getBoundingClientRect());
      }
    };
    const shouldShowDropdown =
      isExpanded && results.length > 0 && isDropdownVisible;
    if (shouldShowDropdown) {
      handleResize();
      window.addEventListener('resize', handleResize);
    } else {
      setDropdownRect(null);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isExpanded, results.length, isDropdownVisible]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        setIsDropdownVisible(false);
      }
    };
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      if (directLinks[query]) navigate(directLinks[query]);
      else if (results.length > 0 && results[0].score < 0.1)
        navigate(results[0].item.slug);
      else navigate(`/search?q=${encodeURIComponent(query)}`);
      setSearchQuery('');
      setIsExpanded(false);
    }
  };

  const handleResultClick = () => {
    setSearchQuery('');
    setIsExpanded(false);
  };

  return (
    <div className="relative flex items-center" ref={searchBarRef}>
      <div
        onClick={toggleSearch}
        className="cursor-pointer text-dark-gray hover:text-antracite"
      >
        <Search className="w-[1rem] h-[1rem]" />
      </div>
      <div
        className={`transition-all duration-300 ${isExpanded ? 'w-[16rem] opacity-100 ml-[0.5rem]' : 'w-[0rem] opacity-0'}`}
      >
        {/* Search Input */}
        <form onSubmit={handleFormSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search the blog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsDropdownVisible(true)}
            className="w-full text-sm rounded-md px-[0.5rem] py-[0.25rem] focus:outline-none"
            autoFocus={isExpanded}
          />
        </form>
      </div>
      <SearchResultsDropdown
        results={results}
        rect={dropdownRect}
        onResultClick={handleResultClick}
      />
    </div>
  );
};

export default ExpandingSearchBar;

