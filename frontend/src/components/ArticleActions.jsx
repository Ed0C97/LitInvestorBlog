// LitInvestorBlog-frontend/src/components/ArticleActions.jsx
// ✅ MOBILE OPTIMIZED

import React, { useState } from 'react';
import { useAuth } from '../hooks/AuthContext.js';
import { Heart, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';

const ArticleActions = ({ article, onUpdate, size = 'default' }) => {
  const { user } = useAuth();

  const [likes, setLikes] = useState(article.likes_count || 0);
  const [hasLiked, setHasLiked] = useState(article.user_has_liked || false);
  const [isLiking, setIsLiking] = useState(false);

  const isSmall = size === 'small';
  const iconSize = isSmall ? 'w-[1rem] h-[1rem]' : 'w-[1.25rem] h-[1.25rem]';

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Devi essere loggato per mettere 'mi piace'.");
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    setHasLiked((prev) => !prev);
    setLikes((prev) => (hasLiked ? prev - 1 : prev + 1));

    try {
      const response = await fetch(`/api/articles/${article.id}/like`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error("L'operazione non è riuscita.");

      const data = await response.json();
      setLikes(data.likes_count);
      setHasLiked(data.liked);

      if (onUpdate) {
        onUpdate({
          ...article,
          likes_count: data.likes_count,
          user_has_liked: data.liked,
        });
      }
    } catch (error) {
      toast.error(error.message);
      setHasLiked((prev) => !prev);
      setLikes((prev) => (hasLiked ? prev + 1 : prev - 1));
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div
      className={clsx(
        'flex items-center gap-[1rem] sm:gap-[1rem]',
        isSmall ? 'text-xs' : 'text-sm',
      )}
    >
      {/* Like Button */}
      <div
        onClick={handleLike}
        role="button"
        aria-disabled={isLiking}
        aria-label={hasLiked ? 'Remove like' : 'Add like'}
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleLike(e)}
        className="flex items-center gap-[0.375rem] group transition-colors duration-200 text-dark-gray cursor-pointer min-h-[44px] min-w-[44px] justify-center sm:justify-start sm:min-w-0"
      >
        <Heart
          className={clsx(iconSize, 'transition-all duration-200 flex-shrink-0', {
            'text-red fill-red stroke-red': hasLiked,
            'text-red fill-transparent stroke-current group-hover:fill-red group-hover:stroke-red':
              !hasLiked,
          })}
          strokeWidth={1.5}
        />
        <span
          className={clsx('font-medium', {
            'text-red': hasLiked,
            'group-hover:text-red': !hasLiked,
          })}
        >
          {likes}
        </span>
      </div>

      {/* Comment Button */}
      <div className="flex items-center gap-[0.375rem] group text-dark-gray hover:text-blue transition-colors duration-200 min-h-[44px] min-w-[44px] justify-center sm:justify-start sm:min-w-0">
        <MessageCircle
          className={clsx(
            iconSize,
            'text-blue fill-transparent stroke-current group-hover:fill-blue group-hover:stroke-blue transition-all duration-200 flex-shrink-0',
          )}
          strokeWidth={1.5}
        />
        <span className="font-medium">{article.comments_count || 0}</span>
      </div>
    </div>
  );
};

export default ArticleActions;
