// LitInvestorBlog-frontend/src/components/dashboard/AnalyticsSection.jsx

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  TrendingUp,
  Users,
  Eye,
  MessageSquare,
  Heart,
  FileText,
  Calendar,
  DollarSign,
} from 'lucide-react';

const AnalyticsSection = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y

  // Mock data - sostituisci con chiamate API reali
  const [chartData, setChartData] = useState({
    viewsOverTime: [],
    userGrowth: [],
    engagementMetrics: [],
    categoryDistribution: [],
    donationsTrend: [],
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      // Mock data per views over time
      const viewsData = [
        { date: 'Oct 1', views: 2400, likes: 240, comments: 120 },
        { date: 'Oct 5', views: 3200, likes: 310, comments: 155 },
        { date: 'Oct 10', views: 2800, likes: 280, comments: 140 },
        { date: 'Oct 15', views: 4100, likes: 380, comments: 190 },
        { date: 'Oct 20', views: 3800, likes: 350, comments: 175 },
      ];

      // Mock data per user growth
      const userGrowthData = [
        { month: 'Jun', users: 450 },
        { month: 'Jul', users: 520 },
        { month: 'Aug', users: 680 },
        { month: 'Sep', users: 890 },
        { month: 'Oct', users: 1234 },
      ];

      // Mock data per category distribution
      const categoryData = [
        { name: 'Crypto', value: 35, color: '#3B82F6' },
        { name: 'Stocks', value: 25, color: '#10B981' },
        { name: 'DeFi', value: 20, color: '#F59E0B' },
        { name: 'Trading', value: 15, color: '#EF4444' },
        { name: 'Other', value: 5, color: '#6B7280' },
      ];

      // Mock data per donations trend
      const donationsData = [
        { month: 'Jun', amount: 450 },
        { month: 'Jul', amount: 680 },
        { month: 'Aug', amount: 890 },
        { month: 'Sep', amount: 1150 },
        { month: 'Oct', amount: 1420 },
      ];

      // Mock data per engagement
      const engagementData = [
        { metric: 'Avg Session', value: '4m 32s', change: '+12%', trend: 'up' },
        { metric: 'Bounce Rate', value: '42%', change: '-8%', trend: 'down' },
        { metric: 'Pages/Session', value: '3.2', change: '+5%', trend: 'up' },
        { metric: 'Return Rate', value: '58%', change: '+15%', trend: 'up' },
      ];

      setChartData({
        viewsOverTime: viewsData,
        userGrowth: userGrowthData,
        categoryDistribution: categoryData,
        donationsTrend: donationsData,
        engagementMetrics: engagementData,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-[1rem]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1rem]">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[20rem] bg-gray/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-[2rem]">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-dark">Analytics Dashboard</h3>
        <div className="flex gap-[0.5rem]">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-[1rem] py-[0.5rem] rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue text-white'
                  : 'bg-light-gray text-gray hover:bg-light-gray/80'
              }`}
            >
              {range === '7d'
                ? '7 Days'
                : range === '30d'
                ? '30 Days'
                : range === '90d'
                ? '90 Days'
                : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Engagement Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-[1.5rem]">
        {chartData.engagementMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-[1.5rem]">
              <div>
                <p className="text-sm text-gray mb-[0.5rem]">{metric.metric}</p>
                <p className="text-2xl font-bold text-dark mb-[0.25rem]">
                  {metric.value}
                </p>
                <div className="flex items-center gap-[0.5rem]">
                  <Badge
                    variant={metric.trend === 'up' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {metric.change}
                  </Badge>
                  <span className="text-xs text-gray">vs last period</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem]">
        {/* Views, Likes, Comments Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-[0.5rem]">
              <Eye className="w-[1.25rem] h-[1.25rem]" />
              Content Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.viewsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Views"
                />
                <Line
                  type="monotone"
                  dataKey="likes"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Likes"
                />
                <Line
                  type="monotone"
                  dataKey="comments"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Comments"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-[0.5rem]">
              <Users className="w-[1.25rem] h-[1.25rem]" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="users" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-[0.5rem]">
              <FileText className="w-[1.25rem] h-[1.25rem]" />
              Content Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Donations Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-[0.5rem]">
              <DollarSign className="w-[1.25rem] h-[1.25rem]" />
              Donations Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.donationsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => `€${value}`}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  name="Donations (€)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[1.5rem]">
        <Card>
          <CardContent className="p-[1.5rem]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray">Most Active Day</p>
                <p className="text-xl font-bold text-dark">Monday</p>
                <p className="text-xs text-gray mt-[0.25rem]">
                  Avg 1,234 visitors
                </p>
              </div>
              <Calendar className="w-[2rem] h-[2rem] text-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-[1.5rem]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray">Peak Hour</p>
                <p className="text-xl font-bold text-dark">2:00 PM - 4:00 PM</p>
                <p className="text-xs text-gray mt-[0.25rem]">
                  Best time to publish
                </p>
              </div>
              <TrendingUp className="w-[2rem] h-[2rem] text-green" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-[1.5rem]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray">Engagement Rate</p>
                <p className="text-xl font-bold text-dark">7.8%</p>
                <p className="text-xs text-green mt-[0.25rem]">
                  +2.3% vs last month
                </p>
              </div>
              <Heart className="w-[2rem] h-[2rem] text-red" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsSection;
