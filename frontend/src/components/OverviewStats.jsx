// src/components/admin/OverviewStats.jsx
import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Users, BarChart, Heart } from 'lucide-react'; // Esempio di icone
import { Card, CardContent } from '@/components/ui/card';

const OverviewStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      setIsLoading(true);
      try {
        // La chiamata ora punta al nuovo endpoint
        const response = await fetch('/api/analytics/overview');
        if (!response.ok) throw new Error('Failed to fetch overview data');

        const data = await response.json();

        const formattedStats = {
          articles: {
            ...data.articles,
            icon: BookOpen,
            color: 'text-blue',
            bgColor: 'bg-blue/10'
          },
          users: {
            ...data.users,
            icon: Users,
            color: 'text-success',
            bgColor: 'bg-success'
          },
          websiteVisits: {
            ...data.websiteVisits,
            icon: BarChart,
            color: 'text-antracite',
            bgColor: 'bg-light-gray'
          },
          engagementRate: {
            ...data.engagementRate,
            icon: Heart,
            color: 'text-red',
            bgColor: 'bg-red/10'
          },
        };
        setStats(Object.values(formattedStats));

      } catch (error) {
        console.error("Failed to fetch overview stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOverviewData();
}, []);

  if (isLoading || !stats) {
    return (
      <div className="grid gap-[0.75rem] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}><CardContent className="p-[1rem]"><Skeleton className="h-[6rem] w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-[0.75rem] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} stat={stat} />
      ))}
    </div>
  );
};

export default OverviewStats;

