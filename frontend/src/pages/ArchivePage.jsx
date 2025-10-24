// LitInvestorBlog-frontend/src/pages/ArchivePage.jsx
// ✅ MOBILE OPTIMIZED

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { X } from 'lucide-react';
import FadeInOnScroll from '../components/FadeInOnScroll';
import ArchiveListItem from '../components/ArchiveListItem';
import Pagination from '../components/ui/pagination';
import FilterPanel from '../components/FilterPanel';

const ArchivePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    authors: [],
    dates: {},
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');

  const clearSearch = (e) => {
    e.preventDefault();
    setSearchParams({});
  };

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      try {
        if (!filterOptions.categories.length) {
          const filtersResponse = await fetch('/api/filters/options');
          if (filtersResponse.ok) {
            const filtersData = await filtersResponse.json();
            setFilterOptions(filtersData);
          }
        }

        const params = new URLSearchParams({
          per_page: '12',
          page: String(page),
        });
        if (searchParams.get('category'))
          params.append('category_slug', searchParams.get('category'));
        if (searchParams.get('author'))
          params.append('author_id', searchParams.get('author'));
        if (searchParams.get('year'))
          params.append('year', searchParams.get('year'));
        if (searchParams.get('month'))
          params.append('month', searchParams.get('month'));
        if (searchQuery) params.append('q', searchQuery);

        const articlesResponse = await fetch(`/api/articles/?${params.toString()}`);
        if (articlesResponse.ok) {
          const data = await articlesResponse.json();
          setArticles(data.articles || []);
          setTotalPages(data.total_pages || 1);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [searchParams, page, searchQuery]);

  const handleFilterChange = (filterName, value) => {
    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);
      if (value === 'all' || !value) {
        newParams.delete(filterName);
        if (filterName === 'year') {
          newParams.delete('month');
        }
      } else {
        newParams.set(filterName, value);
      }
      newParams.set('page', '1');
      return newParams;
    });
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);
      newParams.delete('category');
      newParams.delete('author');
      newParams.delete('year');
      newParams.delete('month');
      newParams.set('page', '1');
      return newParams;
    });
    setPage(1);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: enUS });
    } catch {
      return '';
    }
  };

  if (loading && !articles.length)
    return <div className="text-center p-[3rem] sm:p-[5rem] text-dark-gray">Loading...</div>;

  const groupedArticles = articles.reduce((acc, article) => {
    const monthYear = format(new Date(article.created_at), 'MMMM yyyy', { locale: enUS });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(article);
    return acc;
  }, {});

  const groupKeys = Object.keys(groupedArticles);

  return (
    <div className="bg-white w-full">
      <div className="max-w-[1012px] mx-auto px-[2rem] md:px-[1rem] py-[2rem] sm:py-[2.5rem] md:py-[3rem] smooth-padding">
        <FadeInOnScroll>
          {searchQuery ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-[0.75rem] sm:gap-[1rem] mb-[2rem] sm:mb-[3.5rem]">
              <h1 className="text-2xl sm:text-3xl font-bold text-antracite">Results for:</h1>
              <span className="inline-flex items-center gap-x-[0.75rem] px-[0.875rem] sm:px-[1rem] py-[0.5rem] text-lg sm:text-2xl font-bold bg-blue/10 text-blue rounded-full">
                "{searchQuery}"
                <button
                  onClick={clearSearch}
                  className="text-blue hover:text-blue/80 min-h-[32px] min-w-[32px] flex items-center justify-center"
                  aria-label="Clear search"
                >
                  <X className="w-[1.125rem] h-[1.125rem] sm:w-[1.25rem] sm:h-[1.25rem]" />
                </button>
              </span>
            </div>
          ) : (
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-[2rem] sm:mb-[3.5rem] text-antracite">Archive</h1>
          )}
        </FadeInOnScroll>

        {!searchQuery && (
          <FadeInOnScroll delay={100}>
            <FilterPanel
              filterOptions={filterOptions}
              activeFilters={{
                category: searchParams.get('category'),
                year: searchParams.get('year'),
                month: searchParams.get('month'),
              }}
              onFilterChange={handleFilterChange}
              onClearFilters={clearAllFilters}
            />
          </FadeInOnScroll>
        )}

        <div className="space-y-8 sm:space-y-10 md:space-y-12">
          {groupKeys.map((monthYear) => (
            <FadeInOnScroll key={monthYear} threshold={0.05}>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-[1rem] sm:mb-[1.5rem] capitalize text-antracite">{monthYear}</h2>
                <div className="flex flex-col gap-[1rem] sm:gap-[1.25rem] border-t border-input-gray pt-[1rem] sm:pt-[1.5rem]">
                  {groupedArticles[monthYear].map((article, idx) => (
                    <FadeInOnScroll key={article.id} delay={idx * 80}>
                      <ArchiveListItem
                        article={{
                          ...article,
                          formattedDate: formatDate(article.created_at)
                        }}
                        isLast={idx === groupedArticles[monthYear].length - 1}
                      />
                    </FadeInOnScroll>
                  ))}
                </div>
              </div>
            </FadeInOnScroll>
          ))}
        </div>

        <FadeInOnScroll>
          <Pagination 
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </FadeInOnScroll>
      </div>
    </div>
  );
};

export default ArchivePage;
