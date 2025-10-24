// LitInvestorBlog-frontend/src/components/NewsCard.jsx
// ✅ VERSIONE OTTIMIZZATA PER MOBILE - DESKTOP INTATTO

import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { cn } from '../lib/utils';

const NewsCard = ({
  article,
  variant = 'standard',
  className,
  showActions = false,
  children
}) => {
  const baseClasses = "bg-white rounded-[20px] sm:rounded-[30px] overflow-hidden transition-shadow duration-300 flex flex-col h-full hover:shadow-default";

  const variantClasses = {
    hero: "md:flex-row md:min-h-[420px]",
    standard: "md:min-h-[480px]",
    small: "md:min-h-[260px]"
  };

  const mediaClasses = {
    hero: "h-[200px] sm:h-[250px] md:flex-[66%] md:h-full",
    standard: "h-[180px] sm:h-[220px] md:h-[210px] md:flex-shrink-0",
    small: "h-[160px] sm:h-[180px] md:h-[175px] md:flex-shrink-0"
  };

  const contentClasses = {
    hero: "p-[1.25rem] sm:p-[1.5rem] md:p-[2rem] md:flex-[34%]",
    standard: "p-[1.25rem] sm:p-[1.5rem] md:flex-[40%]",
    small: "p-[1rem] sm:p-[1.25rem] md:p-[1.5rem] md:flex-[54%]"
  };

  const headlineClasses = {
    hero: "text-xl sm:text-2xl md:text-[2.2rem] leading-tight",
    standard: "text-lg sm:text-xl md:text-2xl leading-tight",
    small: "text-base sm:text-lg md:text-xl leading-tight"
  };

  return (
    <Link
      to={`/article/${article.slug}`}
      className={cn(baseClasses, variantClasses[variant], className)}
    >
      <div className={cn("overflow-hidden bg-white relative", mediaClasses[variant])}>
        <img
          src={article.image_url}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04]"
        />
      </div>

      <div className={cn("flex flex-col flex-grow", contentClasses[variant])}>
        <div className="flex-grow">
          <div className="flex justify-between items-baseline mb-[0.5rem]">
            <p className="text-xs font-semibold text-dark-gray uppercase tracking-wide">
              {article.category_name}
            </p>
            {article.isNew && (
              <span className="inline-flex items-center gap-[0.25rem] px-[0.625rem] py-[0.25rem] text-xs font-semibold text-blue uppercase tracking-[0.02em] bg-blue-glass rounded-full">
                New
              </span>
            )}
          </div>

          <h3 className={cn("font-semibold text-antracite", headlineClasses[variant])}>
            {article.title}
          </h3>
        </div>

        <div className="flex items-center justify-between mt-[0.75rem] sm:mt-[1rem]">
          <p className="text-xs sm:text-sm text-dark-gray flex items-center gap-[0.5rem]">
            {article.showClock && <Clock className="w-[0.875rem] h-[0.875rem] sm:w-[1rem] sm:h-[1rem]" />}
            <span>{article.formattedDate}</span>
          </p>
          {showActions && children}
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
