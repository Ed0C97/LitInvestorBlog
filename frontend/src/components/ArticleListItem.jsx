import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

const placeholderImage = 'https://images.unsplash.com/photo-1518186225043-963158e70a41?q=80&w=1974&auto=format&fit=crop';

const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), 'MMMM d, yyyy');
  } catch {
    return '';
  }
};

const articleListItemVariants = {
  archive: "group block no-underline text-inherit py-[1.5rem] border-b border-input-gray last:border-b-0 hover:opacity-80 transition-opacity",
  grid: "group block no-underline text-inherit"
};

const articleContentVariants = {
  archive: "grid grid-cols-1 md:grid-cols-[295px_1fr] gap-[1rem] md:gap-[2rem] items-center",
  grid: "flex flex-col"
};

const imageWrapperVariants = {
  archive: "w-full aspect-[295/167] rounded-[22px] overflow-hidden bg-white",
  grid: "w-full aspect-video rounded-lg overflow-hidden bg-white"
};

const imageVariants = {
  archive: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
  grid: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
};

const textContentVariants = {
  archive: "",
  grid: "mt-[1rem]"
};

const ArticleListItem = ({ article, variant = 'archive', className }) => {
  return (
    <Link
      to={`/article/${article.slug}`}
      className={cn(articleListItemVariants[variant], className)}
    >
      <div className={cn(articleContentVariants[variant])}>
        <div className={cn(imageWrapperVariants[variant])}>
          <img
            src={article.image_url || placeholderImage}
            alt={article.title}
            className={cn(imageVariants[variant])}
          />
        </div>
        <div className={cn(textContentVariants[variant])}>
          <p className="mb-[0.25rem] text-xs font-semibold uppercase text-dark-gray">
            {article.category_name}
          </p>
          <h3 className="mb-[0.5rem] text-xl font-semibold leading-tight transition-colors group-hover:text-blue">
            {article.title}
          </h3>
          <p className="text-sm text-dark-gray">
            {formatDate(article.created_at)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export { ArticleListItem };
export default ArticleListItem;
