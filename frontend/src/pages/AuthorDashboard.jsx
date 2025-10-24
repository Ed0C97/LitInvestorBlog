// LitInvestorBlog-frontend/src/pages/AuthorDashboard.jsx

import React, { useState } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Shield,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import OverviewSection from '../components/dashboard/OverviewSection';
import AnalyticsSection from '../components/dashboard/AnalyticsSection';
import ArticlesSection from '../components/dashboard/ArticlesSection';
import ModerationSection from '../components/ModerationSection';
import DonationsSection from '../components/dashboard/DonationsSection';

const AuthorDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Verifica se l'utente è admin
  const isAdmin = user?.role === 'admin';

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      visible: true,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      visible: isAdmin,
    },
    {
      id: 'articles',
      label: 'Articles',
      icon: FileText,
      visible: true,
    },
    {
      id: 'moderation',
      label: 'Moderation',
      icon: Shield,
      visible: isAdmin,
    },
    {
      id: 'donations',
      label: 'Donations',
      icon: DollarSign,
      visible: isAdmin,
    },
  ];

  const visibleTabs = tabs.filter((tab) => tab.visible);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'articles':
        return <ArticlesSection />;
      case 'moderation':
        return <ModerationSection />;
      case 'donations':
        return <DonationsSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen bg-light-gray/30 py-[2rem]">
      <div className="container mx-auto px-[1rem]">
        {/* Header */}
        <div className="mb-[2rem]">
          <h1 className="text-3xl font-bold text-dark mb-[0.5rem]">
            {isAdmin ? 'Admin Dashboard' : 'Author Dashboard'}
          </h1>
          <p className="text-gray">
            Welcome back, {user?.first_name || user?.username}! Here's what's
            happening with your blog.
          </p>
        </div>

        {/* Tabs Navigation */}
        <Card className="mb-[2rem]">
          <CardContent className="p-0">
            <div className="flex overflow-x-auto">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-[0.5rem] px-[1.5rem] py-[1rem] font-medium transition-colors whitespace-nowrap border-b-2 ${
                      isActive
                        ? 'border-blue text-blue bg-blue/5'
                        : 'border-transparent text-gray hover:text-dark hover:bg-light-gray/30'
                    }`}
                  >
                    <Icon className="w-[1.125rem] h-[1.125rem]" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <div className="animate-fadeIn">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default AuthorDashboard;
