// LitInvestorBlog-frontend/src/pages/FavoritesPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthContext.js';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Heart, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../components/ui/input';
import ArchiveListItem from '../components/ArchiveListItem';

const FavoritesPage = () => {
  const { user } = useAuth();
  const [likedArticles, setLikedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchLikedArticles();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchLikedArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/me/likes', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error loading articles.');
      const data = await response.json();
      setLikedArticles(data.articles || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: enUS });
    } catch {
      return '';
    }
  };

  if (loading) return <div className="text-center p-[5rem]">Loading...</div>;

  if (!user) {
    return (
      <div className="container mx-auto px-[1rem] py-[2rem] text-center">
        <h1 className="text-2xl font-bold mb-[0.5rem]">Access Required</h1>
        <p className="text-dark-gray">
          You must sign in to view your favorite articles.
        </p>
      </div>
    );
  }

  const filteredArticles = likedArticles.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-white-white">
      <div className="w-full mb-[3rem]">
        <div className="max-w-[1012px] mx-auto px-[1rem] pt-[3rem]">
          <div className="border-b border-input-gray my-[0.5rem]"></div>
          <h2 className="text-2xl font-regular text-dark-gray">
            Your Favorite Articles
          </h2>
        </div>
      </div>

      <div className="max-w-[1012px] mx-auto px-[1rem] pb-[4rem]">
        {likedArticles.length > 0 && (
          <div className="relative mb-[2rem] max-w-sm">
            <Search className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 text-dark-gray w-[1rem] h-[1rem]" />
            <Input
              type="text"
              placeholder="Search your favorite articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-[2.25rem]"
            />
          </div>
        )}

        {likedArticles.length > 0 ? (
          filteredArticles.length > 0 ? (
            <div className="flex flex-col gap-[1.25rem] border-t border-input-gray pt-[1.5rem]">
              {filteredArticles.map((article, idx) => (
                <ArchiveListItem
                  key={article.id}
                  article={{
                    ...article,
                    formattedDate: formatDate(article.created_at)
                  }}
                  isLast={idx === filteredArticles.length - 1}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-[3rem]">
              <p className="text-dark-gray">No articles found for "{searchTerm}".</p>
            </div>
          )
        ) : (
          <div className="text-center py-[3rem] border-t border-input-gray">
            <Heart className="w-[3rem] h-[3rem] text-dark-gray mx-auto mb-[1rem]" />
            <h3 className="text-xl font-semibold text-antracite">No Favorites Yet</h3>
            <p className="text-dark-gray">Articles you like will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
