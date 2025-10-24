// LitInvestorBlog-frontend/src/pages/HomePage.jsx
// ✅ VERSIONE OTTIMIZZATA PER MOBILE - DESKTOP INTATTO

import React, { useState, useEffect } from 'react';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { enUS } from 'date-fns/locale';
import SEO from '../components/SEO';
import RelatedArticles from '../components/RelatedArticles';
import ArticleActions from '../components/ArticleActions';
import Disclaimer from '../components/Disclaimer';
import FadeInOnScroll from '../components/FadeInOnScroll';
import NewsCard from '../components/NewsCard';

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles/?per_page=10');
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles || []);
        }
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (differenceInDays(new Date(), date) > 7) {
        return format(date, 'd MMMM yyyy', { locale: enUS });
      }
      return formatDistanceToNow(date, { addSuffix: true, locale: enUS });
    } catch {
      return '';
    }
  };

  const isRecent = (dateString) => {
    try {
      return differenceInDays(new Date(), new Date(dateString)) <= 7;
    } catch {
      return false;
    }
  };

  const isVeryRecent = (dateString) => {
    try {
      const articleDate = new Date(dateString);
      const now = new Date();
      const hoursDiff = (now - articleDate) / (1000 * 60 * 60);
      return hoursDiff <= 24;
    } catch {
      return false;
    }
  };

  const placeholderImage =
    'https://images.unsplash.com/photo-1518186225043-963158e70a41?q=80&w=1974&auto=format&fit=crop';

  if (loading) {
    return <div className="text-center p-[3rem] sm:p-[5rem] text-dark-gray">Loading...</div>;
  }
  if (articles.length === 0) {
    return <div className="text-center p-[3rem] sm:p-[5rem] text-dark-gray">No articles to display.</div>;
  }

  const prepareArticle = (article) => ({
    ...article,
    image_url: article.image_url || placeholderImage,
    formattedDate: formatDate(article.created_at),
    showClock: isRecent(article.created_at),
    isNew: isVeryRecent(article.created_at),
  });

  return (
    <>
      <SEO 
        title="Home"
        type="homepage"
        description="Expert insights on finance, investments, and personal wealth management. Stay informed with the latest articles from Lit Investor."
        keywords={['finance', 'investing', 'wealth management', 'stocks', 'trading', 'personal finance']}
      />
      
      <div className="min-h-screen bg-light-gray">
        <div className="max-w-[1012px] mx-auto px-[2rem] md:px-[1rem] py-[2rem] sm:py-[2.5rem] md:py-[3rem] smooth-padding">
          <FadeInOnScroll>
            <div className="mb-[1.5rem] sm:mb-[2rem]">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-antracite smooth-font">
                Latest Articles
              </h1>
            </div>
          </FadeInOnScroll>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-[1.5rem] sm:gap-[2rem] md:gap-[2.25rem] smooth-gap">
              {/* Hero Article - Full Width */}
              <FadeInOnScroll className="col-span-1 md:col-span-2 lg:col-span-6" delay={0}>
                <NewsCard
                  article={prepareArticle(articles[0])}
                  variant="hero"
                  showActions={true}
                >
                  <ArticleActions article={articles[0]} size="small" />
                </NewsCard>
              </FadeInOnScroll>

              {/* Second & Third Articles */}
              {articles[1] && (
                <FadeInOnScroll className="col-span-1 md:col-span-1 lg:col-span-3" delay={100}>
                  <NewsCard
                    article={prepareArticle(articles[1])}
                    variant="standard"
                    showActions={true}
                  >
                    <ArticleActions article={articles[1]} size="small" />
                  </NewsCard>
                </FadeInOnScroll>
              )}
              {articles[2] && (
                <FadeInOnScroll className="col-span-1 md:col-span-1 lg:col-span-3" delay={200}>
                  <NewsCard
                    article={prepareArticle(articles[2])}
                    variant="standard"
                    showActions={true}
                  >
                    <ArticleActions article={articles[2]} size="small" />
                  </NewsCard>
                </FadeInOnScroll>
              )}

              {/* Articles 4-6 - Small Cards */}
              {articles.slice(3, 6).map((article, index) => (
                <FadeInOnScroll
                  className="col-span-1 md:col-span-1 lg:col-span-2"
                  key={article.id}
                  delay={300 + index * 100}
                >
                  <NewsCard
                    article={prepareArticle(article)}
                    variant="small"
                    showActions={true}
                  >
                    <ArticleActions article={article} size="small" />
                  </NewsCard>
                </FadeInOnScroll>
              ))}
            </div>
          ) : (
            <div className="text-center py-[2rem] sm:py-[3rem]">
              <h3 className="text-lg sm:text-xl font-semibold text-antracite">
                No articles to display.
              </h3>
            </div>
          )}

          <FadeInOnScroll>
            <div className="mt-[4rem] sm:mt-[5rem] md:mt-[6rem] mb-[1rem]">
              <Disclaimer variant="white" />
            </div>
          </FadeInOnScroll>
        </div>

        <FadeInOnScroll>
          <div className="mt-[3rem] sm:mt-[4rem]">
            <RelatedArticles
              title="Most Popular"
              fetchUrl="/api/articles/?per_page=4"
              variant="grid"
            />
          </div>
        </FadeInOnScroll>
      </div>
    </>
  );
};

export default HomePage;
