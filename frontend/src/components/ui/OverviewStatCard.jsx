// src/components/ui/OverviewStatCard.jsx
import React from 'react';
import { Card, CardContent } from './card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const OverviewStatCard = ({
  title,
  value,
  color,
  bgColor,
  growth,
}) => {
  const growthValue = parseFloat(growth) || 0;
  
  return (
    <Card className="shadow-none border-none">
      <CardContent className="p-[1.5rem]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-dark-gray mb-[0.25rem]">
              {title}
            </p>
            <p className="text-2xl font-bold text-antracite">{value}</p>
            {growth !== undefined && growth !== 0 && (
              <div
                className={`flex items-center space-x-1 text-sm ${
                  growthValue >= 0 ? 'text-green' : 'text-red-600'
                }`}
              >
                {growthValue >= 0 ? (
                  <TrendingUp className="w-[0.75rem] h-[0.75rem]" />
                ) : (
                  <TrendingDown className="w-[0.75rem] h-[0.75rem]" />
                )}
                <span>{Math.abs(growth)}%</span>
              </div>
            )}
          </div>
          <div
            className={`w-[3rem] h-[3rem] ${bgColor} rounded-lg flex items-center justify-center`}
          >
            <Icon className={`w-[1.5rem] h-[1.5rem] ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverviewStatCard;
