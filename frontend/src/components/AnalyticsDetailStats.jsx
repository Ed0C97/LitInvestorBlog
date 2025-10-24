// src/components/admin/AnalyticsDetailStats.jsx
import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, ThumbsUp, Share2, DollarSign } from 'lucide-react'; // Esempio di icone
import { Card, CardContent } from '@/components/ui/card';

const AnalyticsDetailStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetailData = async () => {
      setIsLoading(true);
      try {
        // La chiamata ora punta al nuovo endpoint
        const response = await fetch('/api/analytics/details');
        if (!response.ok) throw new Error('Failed to fetch detail data');

        const data = await response.json();

        const formattedStats = {
          comments: {
            ...data.comments,
            icon: MessageSquare,
            color: 'text-antracite',
            bgColor: 'bg-light-gray'
          },
          likes: {
            ...data.likes,
            icon: ThumbsUp,
            color: 'text-blue',
            bgColor: 'bg-blue/10'
          },
          shares: {
            ...data.shares,
            icon: Share2,
            color: 'text-info', // 'info' è un buon colore per la condivisione
            bgColor: 'bg-info/10'
          },
          donations: {
            ...data.donations,
            icon: DollarSign,
            color: 'text-success',
            bgColor: 'bg-success/10'
          },
        };
        setStats(Object.values(formattedStats));


      } catch (error) {
        console.error("Failed to fetch detail stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetailData();
  }, []);

  if (isLoading || !stats) {
    // Scheletro di caricamento
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

export default AnalyticsDetailStats;

