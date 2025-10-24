import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const NewsroomCard = ({ article }) => {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy');
    } catch {
      return '';
    }
  };

  return (
    <Link 
      to={`/article/${article.slug}`}
      className="group block"
    >
      {/* Image */}
      <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-light-gray mb-[1rem]">
        <img 
          src={article.image_url}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div>
        {/* Category Badge */}
        <div className="text-xs font-semibold text-dark-gray uppercase tracking-wide mb-[0.5rem]">
          {article.category_name}
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-semibold leading-tight mb-[0.75rem] text-antracite group-hover:text-blue transition-colors">
          {article.title}
        </h3>

        {/* Date */}
        <p className="text-sm text-dark-gray">
          {formatDate(article.created_at)}
        </p>
      </div>
    </Link>
  );
};

const NewsroomGrid = ({ articles, title = "More from Lit Investor" }) => {
  if (!articles || articles.length === 0) return null;

  // Prendi solo i primi 3 articoli
  const displayArticles = articles.slice(0, 3);

  return (
    <section className="bg-white-white py-[3rem] md:py-[5rem]">
      <div className="max-w-[1012px] mx-auto px-[1rem]">
        <h2 className="text-3xl md:text-4xl font-bold mb-[2rem] md:mb-[3rem] text-antracite">
          {title}
        </h2>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[2rem] md:gap-[2.5rem]">
          {displayArticles.map((article) => (
            <NewsroomCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsroomGrid;
