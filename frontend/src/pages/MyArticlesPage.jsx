// LitInvestorBlog-frontend/src/pages/MyArticlesPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext.js';
import RoleGuard from '../components/RoleGuard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  FileText,
  TrendingUp,
  Heart,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

const MyArticlesPage = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, statusFilter, categoryFilter]);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles/my-articles', {
        credentials: 'include',
        cache: 'no-cache',
      });

      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      toast.error('Error loading articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filterArticles = () => {
    let filtered = [...articles];

    if (searchTerm) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((article) => {
        switch (statusFilter) {
          case 'published':
            return article.published;
          case 'draft':
            return !article.published;
          case 'featured':
            return article.featured;
          default:
            return true;
        }
      });
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (article) => article.category?.slug === categoryFilter,
      );
    }

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredArticles(filtered);
  };

  const handleDeleteArticle = async (articleId, articleTitle) => {
    if (!confirm(`Are you sure you want to delete "${articleTitle}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setArticles((prev) => prev.filter((article) => article.id !== articleId));
        toast.success('Article deleted successfully');
      } else {
        toast.error('Error deleting article');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Connection error');
    }
  };

  const togglePublishStatus = async (articleId, currentStatus) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/toggle-publish`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (response.ok) {
        setArticles((prev) =>
          prev.map((article) =>
            article.id === articleId
              ? { ...article, published: !currentStatus }
              : article,
          ),
        );
        toast.success(
          currentStatus ? 'Article unpublished' : 'Article published',
        );
      } else {
        toast.error('Error updating status');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Connection error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (article) => {
    if (article.featured) {
      return <Badge className="bg-yellow-100 text-yellow-[2rem]00">Featured</Badge>;
    }
    if (article.published) {
      return <Badge className="bg-green-100 text-green-800">Published</Badge>;
    }
    return <Badge variant="border-input-gray">Draft</Badge>;
  };

  const getStats = () => {
    const total = articles.length;
    const published = articles.filter((a) => a.published).length;
    const drafts = articles.filter((a) => !a.published).length;
    const featured = articles.filter((a) => a.featured).length;

    return { total, published, drafts, featured };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="bg-white-white min-h-screen">
        <div className="container mx-auto px-[1rem] py-[5rem]">
          <div className="text-center">
            <p className="text-dark-gray">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard user={user} requiredRoles={['collaborator', 'admin']}>
      <div className="bg-white-white min-h-screen">
        <div className="w-full mb-[3rem]">
          <div className="max-w-[1012px] mx-auto px-[1rem] pt-[3rem]">
            <div className="border-b border-input-gray my-[0.5rem]"></div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-regular text-dark-gray">
                My Articles
              </h2>
              <Link to="/admin/articles/new">
                <Button variant="outline-blue">
                  <Plus className="w-[1rem] h-[1rem] mr-[0.5rem]" />
                  New Article
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-[1012px] mx-auto px-[1rem] pb-[4rem]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[1rem] mb-[2rem]">
            <Card>
              <CardContent className="pt-[1.5rem]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dark-gray">Total</p>
                    <p className="text-2xl font-bold text-antracite">{stats.total}</p>
                  </div>
                  <FileText className="w-[2rem] h-[2rem] text-dark-gray" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-[1.5rem]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dark-gray">Published</p>
                    <p className="text-2xl font-bold text-green">{stats.published}</p>
                  </div>
                  <Eye className="w-[2rem] h-[2rem] text-green" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-[1.5rem]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dark-gray">Drafts</p>
                    <p className="text-2xl font-bold text-yellow">{stats.drafts}</p>
                  </div>
                  <Edit className="w-[2rem] h-[2rem] text-yellow" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-[1.5rem]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dark-gray">Featured</p>
                    <p className="text-2xl font-bold text-yellow">{stats.featured}</p>
                  </div>
                  <TrendingUp className="w-[2rem] h-[2rem] text-yellow" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-[1.5rem]">
            <CardContent className="pt-[1.5rem]">
              <div className="flex flex-col md:flex-row gap-[1rem]">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-[0.75rem] top-1/2 transform -translate-y-1/2 text-dark-gray w-[1rem] h-[1rem]" />
                    <Input
                      type="text"
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-[2.5rem]"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[10rem]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Drafts</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[10rem]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="pt-[1.5rem]">
                <div className="text-center py-[2rem]">
                  <FileText className="w-[4rem] h-[4rem] text-dark-gray mx-auto mb-[1rem] opacity-50" />
                  <h3 className="text-xl font-semibold mb-[0.5rem] text-antracite">
                    {articles.length === 0 ? 'No articles yet' : 'No articles found'}
                  </h3>
                  <p className="text-dark-gray mb-[1rem]">
                    {articles.length === 0
                      ? 'Start by creating your first article'
                      : 'Try changing the search filters'}
                  </p>
                  {articles.length === 0 && (
                    <Link to="/admin/articles/new">
                      <Button variant="outline-blue">
                        <Plus className="w-[1rem] h-[1rem] mr-[0.5rem]" />
                        Create your first article
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-[1.5rem]">
                    <div className="flex gap-[1rem]">
                      {article.cover_image && (
                        <div className="w-[6rem] h-[6rem] flex-shrink-0 overflow-hidden rounded-lg">
                          <img
                            src={article.cover_image}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-[0rem]">
                        <div className="flex items-start justify-between mb-[0.5rem]">
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(article)}
                            {article.category && (
                              <Badge
                                variant="outline"
                                style={{
                                  borderColor: article.category.color,
                                  color: article.category.color,
                                }}
                              >
                                {article.category.name}
                              </Badge>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-[1rem] h-[1rem]" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/articoli/modifica/${article.id}`}>
                                  <Edit className="w-[1rem] h-[1rem] mr-[0.5rem]" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              {article.published && (
                                <DropdownMenuItem asChild>
                                  <Link to={`/article/${article.slug}`} target="_blank">
                                    <Eye className="w-[1rem] h-[1rem] mr-[0.5rem]" />
                                    View
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  togglePublishStatus(article.id, article.published)
                                }
                              >
                                <Eye className="w-[1rem] h-[1rem] mr-[0.5rem]" />
                                {article.published ? 'Unpublish' : 'Publish'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteArticle(article.id, article.title)}
                                className="text-dark-gray"
                              >
                                <Trash2 className="w-[1rem] h-[1rem] mr-[0.5rem]" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <h3 className="text-lg font-semibold mb-[0.5rem] line-clamp-2 text-antracite">
                          <Link
                            to={`/admin/articles/edit/${article.id}`}
                            className="hover:text-blue transition-colors"
                          >
                            {article.title}
                          </Link>
                        </h3>

                        {article.excerpt && (
                          <p className="text-dark-gray text-sm line-clamp-2 mb-[0.75rem]">
                            {article.excerpt}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm text-dark-gray">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-[1rem] h-[1rem]" />
                              <span>{formatDate(article.created_at)}</span>
                            </div>
                            {article.updated_at !== article.created_at && (
                              <div className="flex items-center space-x-1">
                                <Edit className="w-[1rem] h-[1rem]" />
                                <span>Updated {formatDate(article.updated_at)}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Heart className="w-[1rem] h-[1rem]" />
                              <span>{article.likes_count || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-[1rem] h-[1rem]" />
                              <span>{article.comments_count || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Share2 className="w-[1rem] h-[1rem]" />
                              <span>{article.shares_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
};

export default MyArticlesPage;
