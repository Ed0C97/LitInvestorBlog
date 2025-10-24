// LitInvestorBlog-frontend/src/components/dashboard/ArticlesSection.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PenTool,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';

const ArticlesSection = () => {
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/my-articles', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (articleId) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setArticles(articles.filter((article) => article.id !== articleId));
        toast.success('Article deleted successfully');
      } else {
        toast.error('Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Connection error');
    }
  };

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-[1rem]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[8rem] bg-gray/10 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-[2rem]">
      {/* Header with Search and New Article Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[1rem]">
        <div className="flex items-center gap-[0.75rem]">
          <PenTool className="w-[1.5rem] h-[1.5rem] text-blue" />
          <h3 className="text-2xl font-bold text-dark">My Articles</h3>
        </div>

        <div className="flex items-center gap-[1rem] w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-[20rem]">
            <Search className="absolute left-[0.75rem] top-1/2 transform -translate-y-1/2 text-gray w-[1rem] h-[1rem]" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-[2.5rem]"
            />
          </div>
          <Link to="/admin/new-article">
            <Button size="sm">
              <Plus className="w-[1rem] h-[1rem] mr-[0.5rem]" />
              New Article
            </Button>
          </Link>
        </div>
      </div>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-[4rem]">
          <FileText className="w-[4rem] h-[4rem] text-gray/50 mx-auto mb-[1rem]" />
          <h3 className="text-lg font-semibold text-dark mb-[0.5rem]">
            {searchQuery ? 'No articles found' : 'No articles yet'}
          </h3>
          <p className="text-gray mb-[1.5rem]">
            {searchQuery
              ? 'Try adjusting your search criteria.'
              : 'Start creating your first article.'}
          </p>
          {!searchQuery && (
            <Link to="/admin/new-article">
              <Button>
                <Plus className="w-[1rem] h-[1rem] mr-[0.5rem]" />
                Create First Article
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-[1rem]">
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-[1.5rem]">
                <div className="flex items-start justify-between gap-[1rem]">
                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex items-center gap-[0.5rem] mb-[0.75rem] flex-wrap">
                      <Badge
                        style={{
                          backgroundColor: article.category_color || '#3B82F6',
                          color: 'white',
                          borderColor: article.category_color || '#3B82F6',
                        }}
                      >
                        {article.category_name}
                      </Badge>
                      <Badge
                        variant={article.published ? 'default' : 'secondary'}
                      >
                        {article.published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-dark mb-[0.5rem] line-clamp-2">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    {article.excerpt && (
                      <p className="text-gray text-sm mb-[0.75rem] line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-[1rem] sm:gap-[1.5rem] text-sm text-gray flex-wrap">
                      <span className="flex items-center gap-[0.25rem]">
                        <Eye className="w-[1rem] h-[1rem]" />
                        {article.views_count || 0} views
                      </span>
                      <span>•</span>
                      <span>{article.likes_count || 0} likes</span>
                      <span>•</span>
                      <span>
                        Created:{' '}
                        {new Date(article.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-[0.5rem] flex-shrink-0">
                    <Link to={`/article/${article.id}`}>
                      <Button variant="ghost" size="sm" title="View article">
                        <Eye className="w-[1rem] h-[1rem]" />
                      </Button>
                    </Link>
                    <Link to={`/admin/edit-article/${article.id}`}>
                      <Button variant="ghost" size="sm" title="Edit article">
                        <Edit className="w-[1rem] h-[1rem]" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteArticle(article.id)}
                      className="text-red hover:text-red hover:bg-red/10"
                      title="Delete article"
                    >
                      <Trash2 className="w-[1rem] h-[1rem]" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredArticles.length > 0 && (
        <div className="text-sm text-gray text-center">
          Showing {filteredArticles.length} of {articles.length} articles
        </div>
      )}
    </div>
  );
};

export default ArticlesSection;
