// LitInvestorBlog-frontend/src/components/RelatedArticles.jsx
// ✅ IMMAGINI SEMPRE QUADRATE E PADDING MOBILE IDENTICO PER ENTRAMBE LE VARIANTI

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Button } from './ui/button';

const RelatedArticles = ({ title, fetchUrl, variant = 'grid', showButton = true }) => {
  // ... (la logica useEffect e le altre funzioni rimangono invariate)
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        const response = await fetch(fetchUrl);
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles || []);
        }
      } catch (error) {
        console.error('Error loading related articles:', error);
      } finally {
        setLoading(false);
      }
    };
    if (fetchUrl) loadArticles();
  }, [fetchUrl]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: enUS });
    } catch {
      return '';
    }
  };

  if (loading || articles.length === 0) return null;

  // Variant "list"
  if (variant === 'list') {
    const displayArticles = articles.slice(0, 3);

    return (
      <section className="bg-white md:py-[2.5rem]">
        <div className="max-w-[1012px] mx-auto md:px-[1rem] smooth-padding">
          <h2 className="text-3xl font-bold mb-[2rem] text-antracite">{title}</h2>

          <div className="divide-y divide-input-gray">
            {displayArticles.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                // --- MODIFICA 2: Allineato il padding verticale a quello della GridCard ---
                className="group block py-[2rem] md:py-[2.5rem] first:pt-[0rem] last:pb-[0rem]"
              >
                <div className="flex flex-row gap-[1rem] md:gap-[1.5rem]">
                  {/* Image */}
                  {/* --- MODIFICA 1: Rimosso md:aspect-video per mantenere l'immagine sempre quadrata --- */}
                  <div className="w-[120px] md:w-[200px] aspect-square rounded-2xl overflow-hidden bg-light-gray flex-shrink-0">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-center">
                    <div className="text-xs font-semibold text-dark-gray uppercase tracking-wide mb-[0.5rem]">
                      {article.category_name}
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold leading-tight mb-[0.5rem] text-antracite group-hover:text-blue transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-dark-gray">
                      {formatDate(article.created_at)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Variant "grid" (invariata, rimane il nostro riferimento)
  const GridCard = ({ article }) => (
    <Link
      to={`/article/${article.slug}`}
      className="group block"
    >
      <div className="grid grid-cols-[120px_1fr] md:grid-cols-[180px_1fr] gap-[1rem] md:gap-[1.5rem] items-start py-[2rem] md:py-[2.5rem]">
        <div className="w-[120px] h-[120px] md:w-[180px] md:h-[180px] rounded-2xl md:rounded-3xl overflow-hidden bg-light-gray flex-shrink-0">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-center min-h-[120px] md:min-h-[180px]">
          <div className="text-xs font-semibold text-gray uppercase tracking-wide mb-[0.5rem]">
            {article.category_name}
          </div>
          <h3 className="text-xl md:text-2xl font-semibold leading-tight mb-[0.75rem] group-hover:text-blue transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-gray">
            {formatDate(article.created_at)}
          </p>
        </div>
      </div>
    </Link>
  );

  return (
    <section className="bg-white py-[3rem] md:py-[5rem]">
      <div className="max-w-[1012px] mx-auto px-[2rem] md:px-[1rem] smooth-padding">
        <h2 className="text-3xl md:text-4xl font-bold text-antracite">
          {title}
        </h2>
        <div className="hidden md:grid md:grid-cols-2 md:gap-x-[3rem]">
          {articles.map((article, index) => (
            <React.Fragment key={article.id}>
              {index === 2 && (
                <div className="col-span-2 border-t border-input-gray"></div>
              )}
              <GridCard article={article} />
            </React.Fragment>
          ))}
        </div>
        <div className="md:hidden divide-y divide-input-gray">
          {articles.map((article) => (
            <GridCard key={article.id} article={article} />
          ))}
        </div>
        {showButton && (
          <div className="mt-[3rem] flex justify-center">
            <Button asChild size="lg" variant="outline-blue">
              <Link to="/archive">Explore Archive</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default RelatedArticles;