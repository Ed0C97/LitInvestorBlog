// LitInvestorBlog-frontend/src/pages/NotFoundPage.jsx

import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import directLinks from '../data/directLinks.json';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Home,
  Search,
  ArrowLeft,
  FileQuestion,
  BookOpen,
  Users,
  Mail,
  Heart,
} from 'lucide-react';

const NotFoundPage = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      if (directLinks[query]) {
        navigate(directLinks[query]);
      } else {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
      setSearchQuery('');
    }
  };

  const popularPages = [
    {
      title: 'Home',
      description: 'Return to the main page',
      icon: <Home className="h-[1.25rem] w-[1.25rem] text-dark-gray" />,
      href: '/',
    },
    {
      title: 'Archive',
      description: 'Discover our latest content',
      icon: <BookOpen className="h-[1.25rem] w-[1.25rem] text-dark-gray" />,
      href: '/archive',
    },
    {
      title: 'Support Us',
      description: 'Help us keep the blog running',
      icon: <Heart className="h-[1.25rem] w-[1.25rem] text-dark-gray" />,
      href: '/donate',
    },
    {
      title: 'About Us',
      description: 'Learn more about our mission',
      icon: <Users className="h-[1.25rem] w-[1.25rem] text-dark-gray" />,
      href: '/about-us',
    },
  ];

  return (
    <div className="bg-white-white">
      <div className="w-full mb-[4rem]">
        <div className="max-w-[1012px] mx-auto px-[1rem] pt-[3rem]">
          <div className="border-b border-input-gray my-[0.5rem]"></div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-[1rem]">
            <h2 className="text-2xl font-regular text-dark-gray">
              Page Not Found
            </h2>

            <form onSubmit={handleSearch} className="w-full max-w-xs relative">
              <Search className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 text-dark-gray w-[1rem] h-[1rem] pointer-events-none" />
              <Input
                type="text"
                placeholder="Search the site..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-[2.5rem] pr-[0.75rem] py-[0.5rem] w-full"
              />
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-[1012px] mx-auto px-[1rem] text-center mb-[4rem]">
        <FileQuestion className="h-[4rem] w-[4rem] text-dark-gray/30 mx-auto mb-[1.5rem]" />
        <h1 className="text-5xl font-semibold text-antracite mb-[1rem]">Error 404</h1>
        <p className="text-lg text-dark-gray max-w-3xl mx-auto mb-[2rem]">
          The page at{' '}
          <strong className="text-blue font-medium">
            {location.pathname}
          </strong>{' '}
          could not be found. Don't worry, you can use the tools below to get
          back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-[1rem] justify-center">
          <Button
            variant="outline-blue"
            size="lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-[1rem] h-[1rem] mr-[0.5rem]" />
            Go Back
          </Button>
          <Button
            variant="outline-blue"
            size="lg"
            onClick={() => (window.location.href = '/')}
          >
            <Home className="w-[1rem] h-[1rem] mr-[0.5rem]" />
            Go Home
          </Button>
        </div>
      </div>

      <div className="bg-white border-y border-input-gray">
        <div className="max-w-[1012px] mx-auto px-[1rem] py-[5rem]">
          <h3 className="text-3xl font-semibold text-antracite text-center mb-[3rem]">
            Popular Pages
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1.5rem]">
            {popularPages.map((page, index) => (
              <Link key={index} to={page.href} className="block group">
                <Card className="h-full hover:border-input-gray hover:shadow-sm transition-all">
                  <CardContent className="p-[1.5rem] text-center">
                    <div className="w-[3rem] h-[3rem] bg-white rounded-lg flex items-center justify-center mx-auto mb-[1rem] transition-colors group-hover:bg-white/80">
                      {page.icon}
                    </div>
                    <h4 className="font-semibold text-antracite mb-[0.25rem]">
                      {page.title}
                    </h4>
                    <p className="text-sm text-dark-gray">{page.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white-white">
        <div className="max-w-[1012px] mx-auto px-[1rem] py-[4rem] text-center">
          <Mail className="h-[2.5rem] w-[2.5rem] text-dark-gray mx-auto mb-[1rem]" />
          <h3 className="text-2xl font-semibold text-antracite mb-[0.5rem]">
            Still can't find what you're looking for?
          </h3>
          <p className="text-dark-gray mb-[1.5rem]">
            Our team is available to help you.
          </p>
          <Button
            variant="outline-blue"
            size="lg"
            onClick={() => (window.location.href = '/contact')}
          >
            Contact us
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
