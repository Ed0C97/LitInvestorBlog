import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const ArchiveListItem = ({ article, isLast = false, className }) => {
  return (
    <Link 
      to={`/article/${article.slug}`}
      className={cn(
        "block no-underline text-inherit py-[1.5rem] pb-[2.75rem] border-b border-input-gray transition-all",
        isLast && "border-b-0",
        "hover:opacity-80",
        className
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-[295px_1fr] gap-[1rem] md:gap-[2rem] items-center">
        <div className="w-full aspect-[295/167] rounded-[22px] overflow-hidden bg-white">
          <img 
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        
        <div>
          <p className="text-xs font-semibold text-dark-gray uppercase mb-[0.25rem]">
            {article.category_name}
          </p>
          <h3 className="text-xl font-semibold leading-[1.4] mb-[0.5rem] transition-colors hover:text-blue">
            {article.title}
          </h3>
          <p className="text-sm text-dark-gray">
            {article.formattedDate}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ArchiveListItem;
