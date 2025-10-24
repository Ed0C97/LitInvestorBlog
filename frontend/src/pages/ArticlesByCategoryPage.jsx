// LitInvestorBlog-frontend/src/pages/ArticlesByCategoryPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import SEO from '../components/SEO';
import NewsCard from '../components/NewsCard';
import ArticleActions from '../components/ArticleActions';
import FadeInOnScroll from '../components/FadeInOnScroll';

const ArticlesByCategoryPage = () => {
  const { slug } = useParams();
  const [articles, setArticles] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/articles/?category_slug=${slug}`);
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles || []);
          if (data.articles && data.articles.length > 0) {
            setCategoryName(data.articles[0].category_name || slug);
          }
        }
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchArticles();
  }, [slug]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: enUS });
    } catch {
      return '';
    }
  };

  const prepareArticle = (article) => ({
    ...article,
    formattedDate: formatDate(article.created_at),
  });

  if (loading) {
    return (
      <div className="bg-white-white min-h-screen">
        <div className="text-center py-[5rem] text-dark-gray">
          Loading articles...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white-white">
      <SEO 
        title={categoryName || slug}
        description={`Browse ${articles.length} articles in ${categoryName || slug}. Expert insights on finance and investing.`}
        keywords={[categoryName || slug, 'finance', 'investing', 'articles']}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Categories', url: '/categories' },
          { name: categoryName || slug, url: `/category/${slug}` },
        ]}
      />
      
      <div className="max-w-[1012px] mx-auto px-[1rem] py-[3rem]">
        <FadeInOnScroll>
          <div className="mb-[3rem]">
            <h1 className="text-4xl font-bold text-antracite mb-[0.5rem]">
              {categoryName || slug}
            </h1>
            <p className="text-dark-gray">
              {articles.length} {articles.length === 1 ? 'article' : 'articles'}
            </p>
          </div>
        </FadeInOnScroll>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2rem]">
            {articles.map((article, index) => (
              <FadeInOnScroll key={article.id} delay={index * 80}>
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
          <div className="text-center py-[5rem]">
            <p className="text-dark-gray text-lg">
              No articles found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesByCategoryPage;
