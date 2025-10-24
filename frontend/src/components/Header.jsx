// LitInvestorBlog-frontend/src/components/Header.jsx
// 🍎 STILE APPLE NEWSROOM - MOBILE PERFETTO

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext.js';
import { Button } from './ui/button';
import {
  Search,
  Menu,
  X,
  User,
  LogOut,
  Heart,
  PenTool,
  BadgeEuro,
  LayoutDashboard,
  ArrowRight,
} from 'lucide-react';
import LitInvestorLogo from '../assets/litinvestor_logo.webp';
import UserAvatar from '../components/ui/UserAvatar';
import { useSearch } from '../hooks/useSearch';
import SearchResultsDropdown from './SearchResultsDropdown.jsx';
import directLinks from '../data/directLinks.json';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Header = () => {

  const { user, logout, canWriteArticles, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileNavOpen, setIsProfileNavOpen] = useState(false);

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  const { searchQuery, setSearchQuery, results } = useSearch();
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  const openSearch = () => {
    if (isProfileNavOpen) setIsProfileNavOpen(false);
    if (isMenuOpen) setIsMenuOpen(false);
    setIsSearchVisible(true);
    requestAnimationFrame(() => {
      setIsSearchExpanded(true);
      searchInputRef.current?.focus();
      setTimeout(() => setIsContentVisible(true), 150);
    });
  };

  const closeSearch = () => {
    setIsContentVisible(false);
    setTimeout(() => {
      setIsSearchExpanded(false);
      setTimeout(() => {
        setIsSearchVisible(false);
        setSearchQuery('');
      }, 300);
    }, 50);
  };

  const toggleSearch = () => {
    if (isSearchVisible) {
      closeSearch();
    } else {
      openSearch();
    }
  };

  const toggleProfileNav = () => {
    if (isSearchVisible) closeSearch();
    if (isMenuOpen) setIsMenuOpen(false);
    setIsProfileNavOpen((prev) => !prev);
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsProfileNavOpen(false);
  };

  const toggleMenu = () => {
    if (isSearchVisible) closeSearch();
    if (isProfileNavOpen) setIsProfileNavOpen(false);
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isSearchVisible) closeSearch();
        if (isProfileNavOpen) setIsProfileNavOpen(false);
        if (isMenuOpen) setIsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchVisible, isProfileNavOpen, isMenuOpen]);

  // Prevent body scroll when mobile menu/profile is open
  useEffect(() => {
    if (isMenuOpen || isProfileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, isProfileNavOpen]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      if (directLinks[query]) navigate(directLinks[query]);
      else if (results.length > 0 && results[0].score < 0.1)
        navigate(results[0].item.slug);
      else navigate(`/search?q=${encodeURIComponent(query)}`);
      closeSearch();
    }
  };

  const handleResultClick = () => closeSearch();
  
  const handleLogout = async () => {
    closeAllMenus();
    const result = await logout();
    if (result.success) navigate('/');
  };

  const showSearchResults =
    isSearchVisible && searchQuery.trim().length > 0 && results.length > 0;
  
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Archive', path: '/archive' },
    { name: 'About me', path: '/about-us' },
    { name: 'Contacts', path: '/contact' },
    { name: 'Drop a tip', path: '/donate' },
  ];

  return (
    <>
      {/* Search Overlay Backdrop */}
      {isSearchVisible && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={closeSearch}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Overlay */}
      {(isMenuOpen || isProfileNavOpen) && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity duration-300"
          onClick={() => {
            setIsMenuOpen(false);
            setIsProfileNavOpen(false);
          }}
          aria-hidden="true"
        />
      )}

      <header className="sticky top-0 z-50">
        {/* Top Bar */}
        <div className="bg-antracite relative z-50 shadow-sm">
          <div className="max-w-[1012px] mx-auto px-[1.5rem] md:px-[16px] h-[3.5rem] flex items-center justify-between smooth-padding">
            
            {/* Logo + Desktop Nav */}
            <div className="flex items-center gap-[1.5rem] md:gap-[2.5rem]">
              <Link 
                to="/" 
                className="flex-shrink-0 transition-transform hover:scale-105 duration-200"
                aria-label="Lit Investor Blog Home"
              >
                <img
                  src={LitInvestorLogo}
                  alt="Lit Investor Logo"
                  className="h-[1.5rem] sm:h-[1.75rem] w-auto"
                />
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-[1.5rem] lg:gap-[2rem]" aria-label="Main navigation">
                <Link
                  to="/"
                  className="text-sm font-normal text-light-gray hover:text-white hover:scale-105 transition-all duration-200"
                >
                  Home
                </Link>
                <Link
                  to="/archive"
                  className="text-sm font-normal text-light-gray hover:text-white hover:scale-105 transition-all duration-200"
                >
                  Archive
                </Link>
                <Link
                  to="/about-us"
                  className="text-sm font-normal text-light-gray hover:text-white hover:scale-105 transition-all duration-200"
                >
                  About Me
                </Link>
                <Link
                  to="/contact"
                  className="text-sm font-normal text-light-gray hover:text-white hover:scale-105 transition-all duration-200"
                >
                  Contacts
                </Link>
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-[0.75rem] sm:gap-[1.5rem] md:space-x-10 flex-shrink-0">
              
              {/* Donate Link - Desktop Only */}
              <Link
                to="/donate"
                className="hidden md:flex items-center text-sm font-normal text-light-gray hover:text-white hover:scale-105 transition-all duration-200"
              >
                <BadgeEuro className="w-[1rem] h-[1rem] mr-[0.25rem]" />
                <span>Drop a Tip</span>
              </Link>

              {/* User Profile / Login - DESKTOP ONLY */}
              {user ? (
                <div 
                  onClick={toggleProfileNav} 
                  className="hidden md:flex cursor-pointer min-w-[44px] min-h-[44px] items-center justify-center transition-transform hover:scale-110 duration-200"
                  role="button"
                  aria-label="Open user menu"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleProfileNav()}
                >
                  <UserAvatar
                    username={user.username}
                    first_name={user.first_name}
                    last_name={user.last_name}
                    imageUrl={user.avatar_url}
                    size={32}
                  />
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center space-x-1 text-sm font-normal text-light-gray hover:text-white hover:scale-105 transition-all duration-200 min-h-[44px]"
                >
                  <User className="w-[0.875rem] h-[0.875rem]" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* MOBILE: Avatar SEMPRE visibile (anche se loggato) */}
              {user ? (
                <div 
                  onClick={toggleProfileNav} 
                  className="md:hidden cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  role="button"
                  aria-label="Open profile menu"
                >
                  <UserAvatar
                    username={user.username}
                    first_name={user.first_name}
                    last_name={user.last_name}
                    imageUrl={user.avatar_url}
                    size={32}
                  />
                </div>
              ) : (
                <Link
                  to="/login"
                  className="md:hidden flex items-center justify-center text-sm font-medium text-light-gray hover:text-white transition-colors duration-200 min-h-[44px] min-w-[44px]"
                  aria-label="Sign in"
                >
                  <User className="w-[1.125rem] h-[1.125rem]" />
                </Link>
              )}

              <button
                className="md:hidden text-light-gray hover:text-white hover:bg-white/10 active:bg-white/20 h-auto min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-200 bg-transparent border-0"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <X className="w-[1.25rem] h-[1.25rem]" strokeWidth={2} />
                ) : (
                  <Menu className="w-[1.25rem] h-[1.25rem]" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer - SFONDO DARK-GRAY FINO IN FONDO */}
        <nav
          className={twMerge(
            'fixed top-[3.5rem] left-0 right-0 bg-antracite shadow-2xl z-45 transition-all duration-300 ease-in-out md:hidden overflow-hidden',
            isMenuOpen ? 'h-[calc(100vh-3.5rem)] opacity-100' : 'h-0 opacity-0 pointer-events-none'
          )}
          aria-label="Mobile navigation"
          aria-hidden={!isMenuOpen}
        >
          <div className="overflow-y-auto h-full pt-[2.5rem]">
            <div className="flex flex-col p-[1.5rem] gap-[0.5rem]">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-base font-medium text-white hover:text-yellow active:bg-yellow/5 py-[0.75rem] px-[1rem] rounded-lg hover:bg-white/5 transition-all duration-200 min-h-[48px] flex items-center"
              >
                Home
              </Link>
              <Link
                to="/archive"
                onClick={() => setIsMenuOpen(false)}
                className="text-base font-medium text-white hover:text-yellow active:bg-yellow/5 py-[0.75rem] px-[1rem] rounded-lg hover:bg-white/5 transition-all duration-200 min-h-[48px] flex items-center"
              >
                Archive
              </Link>
              <Link
                to="/about-us"
                onClick={() => setIsMenuOpen(false)}
                className="text-base font-medium text-white hover:text-yellow active:bg-yellow/5 py-[0.75rem] px-[1rem] rounded-lg hover:bg-white/5 transition-all duration-200 min-h-[48px] flex items-center"
              >
                About Me
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="text-base font-medium text-white hover:text-yellow active:bg-yellow/5 py-[0.75rem] px-[1rem] rounded-lg hover:bg-white/5 transition-all duration-200 min-h-[48px] flex items-center"
              >
                Contacts
              </Link>
              <Link
                to="/donate"
                onClick={() => setIsMenuOpen(false)}
                className="text-base font-medium text-white hover:text-yellow active:bg-yellow/5 py-[0.75rem] px-[1rem] rounded-lg hover:bg-white/5 transition-all duration-200 min-h-[48px] flex items-center gap-[0.5rem]"
              >
                <BadgeEuro className="w-[1.25rem] h-[1.25rem]" />
                Drop a Tip
              </Link>
            </div>
          </div>
        </nav>

        {/* Mobile Profile Drawer - SFONDO DARK-GRAY FINO IN FONDO */}
        <nav
          className={twMerge(
            'fixed top-[3.5rem] left-0 right-0 bg-antracite shadow-2xl z-45 transition-all duration-300 ease-in-out md:hidden overflow-hidden',
            isProfileNavOpen ? 'h-[calc(100vh-3.5rem)] opacity-100' : 'h-0 opacity-0 pointer-events-none'
          )}
          aria-label="User menu"
          aria-hidden={!isProfileNavOpen}
        >
          <div className="overflow-y-auto h-full pt-[2.5rem]">
            <div className="flex flex-col p-[1.5rem] gap-[0.5rem]">

              <Link
                to="/profile"
                onClick={() => setIsProfileNavOpen(false)}
                className="flex items-center gap-[0.75rem] text-base font-medium text-white hover:text-yellow active:bg-yellow/5 py-[0.75rem] px-[1rem] rounded-lg hover:bg-white/5 transition-all duration-200 min-h-[48px]"
              >
                <User className="w-[1.25rem] h-[1.25rem]" />
                Profile
              </Link>
              <Link
                to="/favorites"
                onClick={() => setIsProfileNavOpen(false)}
                className="flex items-center gap-[0.75rem] text-base font-medium text-white hover:text-yellow active:bg-yellow/5 py-[0.75rem] px-[1rem] rounded-lg hover:bg-white/5 transition-all duration-200 min-h-[48px]"
              >
                <Heart className="w-[1.25rem] h-[1.25rem]" />
                Favorites
              </Link>
              {canWriteArticles() && (
                <Link
                  to="/admin/articoli/nuovo"
                  onClick={() => setIsProfileNavOpen(false)}
                  className="flex items-center gap-[0.75rem] text-base font-medium text-white hover:text-yellow active:bg-yellow/5 py-[0.75rem] px-[1rem] rounded-lg hover:bg-white/5 transition-all duration-200 min-h-[48px]"
                >
                  <PenTool className="w-[1.25rem] h-[1.25rem]" />
                  New Article
                </Link>
              )}
              {isAdmin() && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsProfileNavOpen(false)}
                  className="flex items-center gap-[0.75rem] text-base font-medium text-white hover:text-yellow active:bg-yellow/5 py-[0.75rem] px-[1rem] rounded-lg hover:bg-white/5 transition-all duration-200 min-h-[48px]"
                >
                  <LayoutDashboard className="w-[1.25rem] h-[1.25rem]" />
                  Dashboard
                </Link>
              )}
              
              <div className="border-t border-input-gray my-[1rem]" role="separator" />
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-[0.75rem] text-base font-medium text-red hover:text-red/80 active:bg-red/5 py-[0.75rem] px-[1rem] rounded-lg hover:bg-red/5 transition-all duration-200 min-h-[48px] text-left w-full"
              >
                <LogOut className="w-[1.25rem] h-[1.25rem]" />
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Main Header */}
        <div
          className={twMerge(
            'transition-all duration-300 ease-out relative overflow-hidden',
            isSearchExpanded ? 'min-h-[100vh] md:min-h-[450px]' : 'h-[3.5rem]',
            (isMenuOpen || isProfileNavOpen)
              ? 'bg-white'
              : 'bg-white/40 backdrop-blur-lg'
          )}
        >
          {isSearchExpanded && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-xl backdrop-brightness-325 pointer-events-none transition-all duration-500" />
          )}

          <div className="max-w-[1012px] mx-auto px-[1.5rem] md:px-[16px] h-full flex flex-col smooth-padding">
            <div className="h-[3.5rem] flex items-center justify-between flex-shrink-0 relative">
              <h2
                className="text-lg sm:text-xl font-semibold text-antracite transition-opacity duration-200"
              >
                Lit Investor Blog
              </h2>

              {/* Mobile Search Button */}
              <button
                onClick={toggleSearch}
                className="md:hidden cursor-pointer text-dark-gray hover:text-antracite active:text-blue min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-200 rounded-lg hover:bg-light-gray active:bg-blue/5"
                aria-label={isSearchVisible ? "Close search" : "Open search"}
                aria-expanded={isSearchVisible}
              >
                {isSearchVisible ? (
                  <X className="w-[1.25rem] h-[1.25rem]" />
                ) : (
                  <Search className="w-[1.25rem] h-[1.25rem]" />
                )}
              </button>

              {/* Desktop Nav Links */}
              <div
                className={twMerge(
                  'hidden md:flex items-center gap-[2rem] absolute top-0 right-0 h-full transition-opacity duration-300',
                  isProfileNavOpen && 'opacity-0 pointer-events-none',
                )}
              >
                <nav
                  className={twMerge(
                    'flex items-center gap-[2rem] transition-opacity duration-200',
                    isSearchVisible && 'opacity-0',
                  )}
                  aria-label="Secondary navigation"
                >
                  <Link
                    to="/category/market-analysis"
                    className="text-sm font-medium text-dark-gray hover:text-antracite transition-colors duration-200"
                  >
                    References
                  </Link>
                  <Link
                    to="/category/guides"
                    className="text-sm font-medium text-dark-gray hover:text-antracite transition-colors duration-200"
                  >
                    Services
                  </Link>
                </nav>
                <button
                  onClick={toggleSearch}
                  className="cursor-pointer text-dark-gray hover:text-antracite p-[0.5rem] rounded-lg hover:bg-light-gray transition-all duration-200"
                  aria-label={isSearchVisible ? "Close search" : "Open search"}
                >
                  {isSearchVisible ? (
                    <X className="w-[1rem] h-[1rem]" />
                  ) : (
                    <Search className="w-[1rem] h-[1rem]" />
                  )}
                </button>
              </div>

              {/* Desktop Profile Nav */}
              <div
                className={twMerge(
                  'hidden md:flex items-center gap-[2rem] absolute top-0 right-0 h-full transition-opacity duration-300',
                  !isProfileNavOpen && 'opacity-0 pointer-events-none',
                )}
              >
                <nav className="flex items-center gap-[2rem]" aria-label="User menu">
                  <Link
                    to="/profile"
                    onClick={closeAllMenus}
                    className="flex items-center gap-[0.5rem] text-sm font-medium text-dark-gray hover:text-antracite transition-colors duration-200"
                  >
                    <User className="w-[1rem] h-[1rem]" />
                    Profile
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={closeAllMenus}
                    className="flex items-center gap-[0.5rem] text-sm font-medium text-dark-gray hover:text-antracite transition-colors duration-200"
                  >
                    <Heart className="w-[1rem] h-[1rem]" />
                    Favorites
                  </Link>
                  {canWriteArticles() && (
                    <Link
                      to="/admin/articoli/nuovo"
                      onClick={closeAllMenus}
                      className="flex items-center gap-[0.5rem] text-sm font-medium text-dark-gray hover:text-antracite transition-colors duration-200"
                    >
                      <PenTool className="w-[1rem] h-[1rem]" />
                      New Article
                    </Link>
                  )}
                  {isAdmin() && (
                    <Link
                      to="/admin/dashboard"
                      onClick={closeAllMenus}
                      className="flex items-center gap-[0.5rem] text-sm font-medium text-dark-gray hover:text-antracite transition-colors duration-200"
                    >
                      <LayoutDashboard className="w-[1rem] h-[1rem]" />
                      Dashboard
                    </Link>
                  )}
                </nav>
                <div className="flex items-center gap-[2rem] ml-[2rem]">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-[0.5rem] text-sm font-medium text-dark-gray hover:text-antracite transition-colors duration-200"
                  >
                    <LogOut className="w-[1rem] h-[1rem]" />
                    Logout
                  </button>
                  <button
                    onClick={toggleProfileNav}
                    className="text-dark-gray hover:text-antracite transition-colors duration-200"
                    aria-label="Close user menu"
                  >
                    <X className="w-[1.25rem] h-[1.25rem]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Search Overlay - STILE APPLE */}
            <div
              className={twMerge(
                'transition-opacity duration-300 ease-out pt-[1rem] pb-[2rem]',
                'overflow-y-auto md:overflow-y-auto',
                'max-h-[calc(100vh-3.5rem-2rem)] md:max-h-[70vh]',
                // NASCONDE SCROLLBAR
                'scrollbar-hide',
                isContentVisible ? 'opacity-100' : 'opacity-0',
                !isSearchVisible && 'hidden',
              )}
              role="search"
            >
              {/* Search Input */}
              <form
                onSubmit={handleFormSubmit}
                className="relative flex items-center gap-[0.75rem] sm:gap-[1rem] mb-[2rem] sm:mb-[3rem] mt-[1.5rem]"
              >
                <Search className="w-[1.25rem] h-[1.25rem] sm:w-[1.5rem] sm:h-[1.5rem] text-gray flex-shrink-0" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search the Lit Investor blog"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-lg sm:text-xl font-normal bg-transparent focus:outline-none text-antracite placeholder-gray [&::-webkit-search-cancel-button]:appearance-none"
                  aria-label="Search articles"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-gray hover:text-antracite transition-colors duration-200"
                    aria-label="Clear search"
                  >
                    <X className="w-[1.25rem] h-[1.25rem]" />
                  </button>
                )}
              </form>
              
              <div
                className={clsx(
                  'transition-all duration-300 ease-out',
                  isContentVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4',
                )}
              >
                {showSearchResults ? (
                  <SearchResultsDropdown
                    results={results}
                    onResultClick={handleResultClick}
                    isExpandedView={true}
                  />
                ) : (
                  <div>
                    <h3 className="text-xs font-regular text-dark-gray mb-[0.75rem] uppercase tracking-wider">
                      Quick links
                    </h3>
                    <ul className="space-y-1" role="list">
                      {quickLinks.map((link, index) => (
                        <li
                          key={link.name}
                          style={{ transitionDelay: `${index * 50}ms` }}
                          className={clsx(
                            'transition-all duration-300 ease-out',
                            isContentVisible
                              ? 'opacity-100 translate-y-0'
                              : 'opacity-0 translate-y-4',
                          )}
                        >
                          <Link
                            to={link.path}
                            onClick={closeSearch}
                            className="flex items-center gap-[0.75rem] text-sm text-dark-gray hover:text-blue active:text-blue group min-h-[44px] py-[0.5rem] transition-colors duration-200"
                          >
                            <ArrowRight className="w-[1rem] h-[1rem] transition-transform group-hover:translate-x-1 flex-shrink-0" />
                            <span>{link.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
