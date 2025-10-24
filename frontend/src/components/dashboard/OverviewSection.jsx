// LitInvestorBlog-frontend/src/components/dashboard/OverviewSection.jsx

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  Eye,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Heart,
  Newspaper,
  Clock,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';

const OverviewSection = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topArticles, setTopArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      // In un'implementazione reale, faresti chiamate API separate
      // Per ora usiamo dati mock che puoi sostituire con API reali

      // Fetch stats
      const statsData = {
        totalArticles: 45,
        publishedArticles: 38,
        draftArticles: 7,
        totalUsers: 1234,
        totalViews: 45678,
        totalLikes: 3456,
        totalComments: 892,
        totalDonations: 5280.50,
        newsletterSubscribers: 567,
        avgReadTime: '4.5 min',
      };
      setStats(statsData);

      // Fetch recent activity (mock)
      const activityData = [
        {
          id: 1,
          type: 'article',
          message: 'New article published: "Understanding Market Trends"',
          time: '2 hours ago',
          icon: FileText,
        },
        {
          id: 2,
          type: 'user',
          message: '3 new users registered',
          time: '5 hours ago',
          icon: Users,
        },
        {
          id: 3,
          type: 'donation',
          message: 'New donation received: €50.00',
          time: '1 day ago',
          icon: DollarSign,
        },
        {
          id: 4,
          type: 'comment',
          message: '15 new comments on articles',
          time: '1 day ago',
          icon: MessageSquare,
        },
        {
          id: 5,
          type: 'newsletter',
          message: '12 new newsletter subscribers',
          time: '2 days ago',
          icon: Newspaper,
        },
      ];
      setRecentActivity(activityData);

      // Fetch top articles (mock)
      const topArticlesData = [
        {
          id: 1,
          title: 'The Future of Crypto Investment',
          views: 2543,
          likes: 234,
          comments: 45,
          published_at: '2025-10-15',
        },
        {
          id: 2,
          title: 'Market Analysis Q3 2025',
          views: 1987,
          likes: 189,
          comments: 32,
          published_at: '2025-10-12',
        },
        {
          id: 3,
          title: 'Risk Management Strategies',
          views: 1654,
          likes: 156,
          comments: 28,
          published_at: '2025-10-10',
        },
        {
          id: 4,
          title: 'Beginner\'s Guide to DeFi',
          views: 1432,
          likes: 143,
          comments: 38,
          published_at: '2025-10-08',
        },
        {
          id: 5,
          title: 'Portfolio Diversification Tips',
          views: 1289,
          likes: 121,
          comments: 19,
          published_at: '2025-10-05',
        },
      ];
      setTopArticles(topArticlesData);
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIconColor = (type) => {
    switch (type) {
      case 'article':
        return 'text-blue';
      case 'user':
        return 'text-green';
      case 'donation':
        return 'text-yellow';
      case 'comment':
        return 'text-red';
      case 'newsletter':
        return 'text-antracite';
      default:
        return 'text-gray';
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-[1rem]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[1rem]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[6rem] bg-gray/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-[2rem]">
      {/* Primary Stats - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1.5rem]">
        <Card>
          <CardContent className="p-[1.5rem]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray">Total Articles</p>
                <p className="text-2xl font-bold text-dark">{stats.totalArticles}</p>
                <p className="text-xs text-gray mt-[0.25rem]">
                  {stats.publishedArticles} published · {stats.draftArticles} drafts
                </p>
              </div>
              <FileText className="w-[2rem] h-[2rem] text-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-[1.5rem]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray">Total Users</p>
                <p className="text-2xl font-bold text-dark">
                  {stats.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-green mt-[0.25rem]">
                  +12% from last month
                </p>
              </div>
              <Users className="w-[2rem] h-[2rem] text-green" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-[1.5rem]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray">Page Views</p>
                <p className="text-2xl font-bold text-dark">
                  {stats.totalViews.toLocaleString()}
                </p>
                <p className="text-xs text-gray mt-[0.25rem]">Last 30 days</p>
              </div>
              <Eye className="w-[2rem] h-[2rem] text-antracite" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-[1.5rem]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray">Total Donations</p>
                <p className="text-2xl font-bold text-dark">
                  €{stats.totalDonations.toFixed(2)}
                </p>
                <p className="text-xs text-yellow mt-[0.25rem]">
                  +8% from last month
                </p>
              </div>
              <DollarSign className="w-[2rem] h-[2rem] text-yellow" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1.5rem]">
        <Card>
          <CardContent className="p-[1.5rem]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray">Total Likes</p>
                <p className="text-2xl font-bold text-dark">
                  {stats.totalLikes.toLocaleString()}
                </p>
              </div>
              <Heart className="w-[2rem] h-[2rem] text-red" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-[1.5rem]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray">Comments</p>
                <p className="text-2xl font-bold text-dark">
                  {stats.totalComments.toLocaleString()}
                </p>
              </div>
              <MessageSquare className="w-[2rem] h-[2rem] text-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-[1.5rem]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray">Newsletter</p>
                <p className="text-2xl font-bold text-dark">
                  {stats.newsletterSubscribers.toLocaleString()}
                </p>
              </div>
              <Newspaper className="w-[2rem] h-[2rem] text-antracite" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-[1.5rem]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray">Avg Read Time</p>
                <p className="text-2xl font-bold text-dark">{stats.avgReadTime}</p>
              </div>
              <Clock className="w-[2rem] h-[2rem] text-gray" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid - Recent Activity & Top Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem]">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-[0.5rem]">
              <TrendingUp className="w-[1.25rem] h-[1.25rem]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-[1rem]">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-[0.75rem] p-[0.75rem] rounded-lg hover:bg-light-gray/30 transition-colors"
                  >
                    <div
                      className={`flex-shrink-0 w-[2.5rem] h-[2.5rem] rounded-full bg-light-gray/50 flex items-center justify-center ${getActivityIconColor(
                        activity.type
                      )}`}
                    >
                      <Icon className="w-[1.25rem] h-[1.25rem]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-dark font-medium">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray mt-[0.25rem]">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-[0.5rem]">
              <Award className="w-[1.25rem] h-[1.25rem]" />
              Top Performing Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-[1rem]">
              {topArticles.map((article, index) => (
                <Link
                  key={article.id}
                  to={`/article/${article.id}`}
                  className="flex items-start gap-[0.75rem] p-[0.75rem] rounded-lg hover:bg-light-gray/30 transition-colors group"
                >
                  <div className="flex-shrink-0 w-[2rem] h-[2rem] rounded-full bg-blue/10 flex items-center justify-center text-blue font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-dark group-hover:text-blue transition-colors line-clamp-1">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-[1rem] mt-[0.25rem] text-xs text-gray">
                      <span className="flex items-center gap-[0.25rem]">
                        <Eye className="w-[0.75rem] h-[0.75rem]" />
                        {article.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-[0.25rem]">
                        <Heart className="w-[0.75rem] h-[0.75rem]" />
                        {article.likes}
                      </span>
                      <span className="flex items-center gap-[0.25rem]">
                        <MessageSquare className="w-[0.75rem] h-[0.75rem]" />
                        {article.comments}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewSection;
