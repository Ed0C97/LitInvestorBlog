import { DropdownMenuSeparator } from '../components/ui/dropdown-menu';
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext.js';
import { useAnalytics } from '../hooks/useAnalytics';
import RoleGuard from '../components/RoleGuard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Users, FileText, MessageSquare, Heart, DollarSign, TrendingUp, Download, RefreshCw, Calendar, Eye, Plus, Search, Edit, Trash2, MoreVertical, Shield, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ModerationSection from '../components/ModerationSection';
import DonationsTable from '../components/DonationsTable';
import SlidingTabsNav from '../components/SlidingTabsNav';
import Pagination from '../components/ui/pagination';
import FadeInOnScroll from '../components/FadeInOnScroll';
import OverviewStats from '@/components/OverviewStats';
import AnalyticsDetailStats from '@/components/AnalyticsDetailStats';
import AdminFilterPanel from '../components/AdminFilterPanel';

const ArticlesOverTimeChart = lazy(() => import('../components/AnalyticsChart').then(m => ({ default: m.ArticlesOverTimeChart })));
const UsersGrowthChart = lazy(() => import('../components/AnalyticsChart').then(m => ({ default: m.UsersGrowthChart })));
const RevenueChart = lazy(() => import('../components/AnalyticsChart').then(m => ({ default: m.RevenueChart })));
const CategoriesChart = lazy(() => import('../components/AnalyticsChart').then(m => ({ default: m.CategoriesChart })));
const AuthorsChart = lazy(() => import('../components/AnalyticsChart').then(m => ({ default: m.AuthorsChart })));
const EngagementChart = lazy(() => import('../components/AnalyticsChart').then(m => ({ default: m.EngagementChart })));

const ChartLoader = () => <div className="h-[300px] flex items-center justify-center text-gray">Loading...</div>;

const STATUS_STYLES = {
  published: { text: 'PUBLISHED', color: 'text-green' },
  scheduled: { text: 'SCHEDULED', color: 'text-blue' },
  draft: { text: 'DRAFT', color: 'text-red' },
};

const getArticleStatusKey = (article) => {
  // Se l'articolo non è pubblicato, è una bozza. Semplice.
  if (!article.published) {
    return 'draft';
  }

  if (article.published_at && new Date(article.published_at) > new Date()) {
    return 'scheduled';
  }

  return 'published';
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatDate = (dateString) => {
  if (!dateString) return 'Date not available';
  try {
    return format(new Date(dateString), 'MMMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
};

const ArticleListItem = ({ article, onTogglePublish, onDelete }) => (
  <div className="group border-b border-input-gray last:border-b-0 transition-colors py-[2rem]">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-[0rem]">
        <div className="flex items-center space-x-4 mb-[0.625rem] flex-wrap">
          <span className={`text-xs font-semibold ${STATUS_STYLES[getArticleStatusKey(article)].color}`}>
            {STATUS_STYLES[getArticleStatusKey(article)].text}
          </span>
          {article.category && <span className="text-sm text-dark-gray">{article.category.name}</span>}
        </div>
        <h3 className="text-lg font-semibold text-antracite mb-[0.75rem] line-clamp-1">{article.title}</h3>
        <div className="flex items-center space-x-5 text-sm text-gray">
          <span className="text-sm">{formatDate(article.created_at)}</span>
          <div className="flex items-center space-x-1">
            <Heart className="w-[1rem] h-[1rem]" />
            <span>{formatNumber(article.likes_count)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare className="w-[1rem] h-[1rem]" />
            <span>{formatNumber(article.comments_count)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 ml-[1rem]">
        <Link to={`/admin/articles/edit/${article.id}`} aria-label="Edit article" className="hidden sm:inline-flex items-center justify-center h-[2rem] w-[2rem] hover:text-blue">
          <Edit className="w-[1rem] h-[1rem]" />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="More actions" className="inline-flex items-center justify-center h-[2rem] w-[2rem] hover:text-blue">
              <MoreVertical className="w-[1rem] h-[1rem]" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild className="sm:hidden">
              <Link to={`/admin/articles/edit/${article.id}`}>
                <Edit className="w-[1rem] h-[1rem] mr-[0.5rem]" /> Edit
              </Link>
            </DropdownMenuItem>

            {article.published && (
              <DropdownMenuItem asChild>
                <Link to={`/article/${article.slug}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-[1rem] h-[1rem] mr-[0.5rem]" /> View
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={() => onTogglePublish(article.id, article.published)}>
              <RefreshCw className="w-[1rem] h-[1rem] mr-[0.5rem]" />
              {article.published ? 'Set as draft' : 'Publish'}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => onDelete(article.id, article.title)} className="text-red focus:text-red">
              <Trash2 className="w-[1rem] h-[1rem] mr-[0.5rem]" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
);

const ArticleList = ({ articles, categories, onTogglePublish, onDelete, page, totalPages, onPageChange, searchTerm, onSearchTermChange, statusFilter, onStatusFilterChange, categoryFilter, onCategoryFilterChange }) => {

  const filteredArticles = useMemo(() => {
    return articles
      .filter((article) => {
        const searchMatch = searchTerm ? article.title.toLowerCase().includes(searchTerm.toLowerCase()) : true;
        const statusMatch = statusFilter === 'all' || getArticleStatusKey(article) === statusFilter;
        const categoryMatch = categoryFilter === 'all' || article.category?.slug === categoryFilter;
        return searchMatch && statusMatch && categoryMatch;
      })
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : 0;
        const dateB = b.created_at ? new Date(b.created_at) : 0;
        return dateB - dateA;
      });
  }, [articles, searchTerm, statusFilter, categoryFilter]);

  const groupedArticles = useMemo(() => {
    return filteredArticles.reduce((acc, article) => {
      try {
        const monthYear = format(new Date(article.created_at), 'MMMM yyyy');
        if (!acc[monthYear]) acc[monthYear] = [];
        acc[monthYear].push(article);
      } catch {
        console.warn(`Invalid date for article ID ${article.id}:`, article.created_at);
        if (!acc['No date']) acc['No date'] = [];
        acc['No date'].push(article);
      }
      return acc;
    }, {});
  }, [filteredArticles]);

  return (
    <Card className="shadow-none border-none bg-transparent">
      <CardContent className="px-[0rem]">
        <AdminFilterPanel title="Filter Articles">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-[0.75rem] top-1/2 transform -translate-y-1/2 text-gray w-[1rem] h-[1rem]" />
            <Input placeholder="Search by title..." value={searchTerm} onChange={(e) => onSearchTermChange(e.target.value)} className="pl-[2.5rem]" />
          </div>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full md:w-[12rem]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="w-full md:w-[12rem]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AdminFilterPanel>

        <div className="space-y-12">
          {articles.length > 0 ? (
            Object.entries(groupedArticles).map(([monthYear, articlesInGroup]) => (
              <div key={monthYear}>
                <h2 className="text-2xl font-semibold mb-[1.5rem] capitalize text-antracite">{monthYear}</h2>
                <div className="bg-trasparent shadow-none overflow-hidden">
                  {articlesInGroup.map((article) => (
                    <ArticleListItem key={article.id} article={article} onTogglePublish={onTogglePublish} onDelete={onDelete} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-[4rem] bg-trasparent border rounded-lg">
              <FileText className="w-[3rem] h-[3rem] text-gray mx-auto mb-[1rem]" />
              <h3 className="text-xl font-semibold">No articles found</h3>
              <p className="text-gray mt-[0.5rem]">Try adjusting your filters or create a new article.</p>
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="mt-[2rem]">
            <FadeInOnScroll>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </FadeInOnScroll>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { analytics, loading: analyticsLoading, error: analyticsError, fetchAnalytics, exportAnalytics } = useAnalytics(user);

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const tabs = [
    { value: 'overview', label: 'Overview', icon: LayoutDashboard },
    { value: 'articles', label: 'Articles', icon: FileText },
    { value: 'analytics', label: 'Analytics', icon: TrendingUp },
    { value: 'donations', label: 'Donations', icon: DollarSign },
    { value: 'moderation', label: 'Moderation', icon: Shield },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setArticlesLoading(true);
      try {
        const params = new URLSearchParams({
          per_page: '12',
          page: String(page),
          include_all: 'true',
        });

        if (searchTerm) params.append('q', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (categoryFilter !== 'all') params.append('category_slug', categoryFilter);

        const articlesRes = await fetch(`/api/articles/?${params.toString()}`, { credentials: 'include' });

        if (articlesRes.ok) {
          const data = await articlesRes.json();
          setArticles(data.articles || []);
          setTotalPages(data.total_pages || 1);
        } else {
          console.error('Articles API error:', articlesRes.status, await articlesRes.text());
          toast.error(`Error loading articles (status: ${articlesRes.status}).`);
        }
      } catch (error) {
        console.error('Connection error loading articles:', error);
        toast.error('Connection error loading articles.');
      }

      try {
        const categoriesRes = await fetch('/api/categories');
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories || []);
        } else {
          console.error('Categories API error:', categoriesRes.status, await categoriesRes.text());
          toast.error('Error loading categories.');
        }
      } catch (error) {
        console.error('Connection error loading categories:', error);
        toast.error('Connection error loading categories.');
      }
      setArticlesLoading(false);
    };

    if (user) {
      fetchData();
    } else {
      setArticlesLoading(false);
    }
  }, [user, page, searchTerm, statusFilter, categoryFilter]);

  const handleTogglePublish = async (articleId, currentStatus) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/toggle-publish`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (response.ok) {
        setArticles((prev) => prev.map((a) => a.id === articleId ? { ...a, published: !currentStatus } : a));
        toast.success(`Article ${currentStatus ? 'set as draft' : 'published'}.`);
      } else {
        toast.error('Error updating publication status.');
      }
    } catch (error) {
      console.error('Toggle publish failed:', error);
      toast.error('Connection error.');
    }
  };

  const handleDeleteArticle = async (articleId, articleTitle) => {
    if (!confirm(`Are you sure you want to delete "${articleTitle}"? This action is irreversible.`)) return;
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== articleId));
        toast.success('Article deleted successfully.');
      } else {
        toast.error('Error deleting article.');
      }
    } catch (error) {
      console.error('Delete article failed:', error);
      toast.error('Connection error.');
    }
  };

  const handleRefreshAnalytics = async () => {
    setRefreshing(true);
    await fetchAnalytics(timeRange);
    setRefreshing(false);
    toast.success('Analytics data updated.');
  };

  const handleExport = async (type) => {
    try {
      await exportAnalytics(type, 'csv', timeRange);
      toast.success(`Export ${type} started.`);
    } catch (error) {
      console.error(`Export ${type} failed:`, error);
      toast.error(`Error during ${type} export.`);
    }
  };

  if (analyticsLoading || articlesLoading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="text-center py-[5rem]">Loading dashboard...</div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="bg-white min-h-screen">
        <div className="text-center py-[5rem] text-red">
          <h3>Error loading Analytics data</h3>
          <p>{analyticsError.message || 'An unknown error occurred.'}</p>
          <Button onClick={handleRefreshAnalytics} className="mt-[1rem]">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard user={user} requiredRoles={['collaborator', 'admin']}>
      <div className="bg-white min-h-screen">
        <div className="w-full mb-[3rem]">
          <div className="max-w-[1012px] mx-auto px-[2rem] sm:px-[1rem] pt-[3rem]">
            <div className="mb-[2rem]">
              <div className="border-b border-input-gray my-[0.5rem]"></div>
              <h2 className="text-2xl font-regular text-dark-gray">Admin Dashboard</h2>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-[1rem]">
              <div>
                <h1 className="text-3xl font-bold mb-[0.5rem]">
                  Welcome, {user?.first_name || user?.last_name ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim() : user?.username}
                </h1>
                <p className="text-gray">
                  {tabs.find((tab) => tab.value === activeTab)?.label || 'Overview and blog management.'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button onClick={() => navigate('/admin/articles/new')} className="bg-blue hover:bg-blue/90">
                  <Plus className="w-[1rem] h-[1rem] mr-[0.5rem]" />
                  New Article
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1012px] mx-auto px-[2rem] sm:px-[1rem] pb-[4rem]">
          <div className="space-y-8">
            <SlidingTabsNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={tabs}
                variant="light"
            />

            {activeTab === 'overview' && (
              <div className="space-y-8">
                <OverviewStats />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem]">
                  <Card className="shadow-none border-none">
                    <CardHeader>
                      <CardTitle className="text-xl">Articles Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<ChartLoader />}>
                        <ArticlesOverTimeChart data={analytics.charts?.articlesOverTime} />
                      </Suspense>
                    </CardContent>
                  </Card>
                  <Card className="shadow-none border-none">
                    <CardHeader>
                      <CardTitle className="text-xl">User Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<ChartLoader />}>
                        <UsersGrowthChart data={analytics.charts?.usersOverTime} />
                      </Suspense>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'articles' && (
              <ArticleList
                articles={articles}
                categories={categories}
                onTogglePublish={handleTogglePublish}
                onDelete={handleDeleteArticle}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
              />
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <AnalyticsDetailStats />

                <Card className="shadow-none border-none">
                  <AdminFilterPanel
                    title="Analytics Options"
                    actions={
                      <>
                        <Button onClick={handleRefreshAnalytics} disabled={refreshing} variant="outline" size="icon">
                          <RefreshCw className={`w-[1rem] h-[1rem] ${refreshing ? 'animate-spin' : ''}`} />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              <Download className="w-[1rem] h-[1rem] mr-[0.5rem]" />
                              Export
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleExport('overview')}>Overview</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('articles')}>Articles</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('users')}>Users</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('engagement')}>Engagement</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    }
                  >
                    <Select
                      value={timeRange}
                      onValueChange={(v) => {
                        setTimeRange(v);
                        fetchAnalytics(v);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[12rem]">
                        <Calendar className="w-[1rem] h-[1rem] mr-[0.5rem]" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 3 months</SelectItem>
                        <SelectItem value="1y">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </AdminFilterPanel>
                  <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem]">
                      <Card className="shadow-none border-none">
                        <CardHeader>
                          <CardTitle className="text-lg">Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Suspense fallback={<ChartLoader />}>
                            <RevenueChart data={analytics.charts?.revenueOverTime} />
                          </Suspense>
                        </CardContent>
                      </Card>
                      <Card className="shadow-none border-none">
                        <CardHeader>
                          <CardTitle className="text-lg">Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Suspense fallback={<ChartLoader />}>
                            <CategoriesChart data={analytics.charts?.categoriesDistribution} />
                          </Suspense>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem]">
                      <Card className="shadow-none border-none">
                        <CardHeader>
                          <CardTitle className="text-lg">Authors</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Suspense fallback={<ChartLoader />}>
                            <AuthorsChart data={analytics.charts?.authorsPerformance} />
                          </Suspense>
                        </CardContent>
                      </Card>
                      <Card className="shadow-none border-none">
                        <CardHeader>
                          <CardTitle className="text-lg">Engagement</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Suspense fallback={<ChartLoader />}>
                            <EngagementChart data={analytics.charts?.engagementMetrics} />
                          </Suspense>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'donations' && (
              <DonationsTable variant="admin" />
            )}

            {activeTab === 'moderation' && (
              <ModerationSection />
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default AdminPage;
