// src/components/admin/StatCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

const GrowthIndicator = ({ growth }) => {
  if (!growth) return null;

  const isPositive = growth.value.startsWith('+');
  const isNegative = growth.value.startsWith('-');
  const colorClass = isPositive ? 'text-green' : isNegative ? 'text-red' : 'text-gray';

  return (
    <div className={`text-xs font-medium flex items-center ${colorClass}`}>
      {isPositive && <ArrowUp className="h-[0.75rem] w-[0.75rem] mr-[0.25rem]" />}
      {isNegative && <ArrowDown className="h-[0.75rem] w-[0.75rem] mr-[0.25rem]" />}
      <span>{growth.value}</span>
      <span className="text-gray ml-[0.25rem]">{growth.period}</span>
    </div>
  );
};

const SubMetric = ({ metric }) => {
  if (!metric) return null;
  return (
    <p className="text-xs text-gray">
      <span className="font-semibold text-antracite">{metric.value}</span> {metric.label}
    </p>
  );
};

const StatCard = ({ stat }) => {
  const { title, value, icon: Icon, color, growth, subMetric } = stat;

  return (
    <Card className="overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Header con icona a sinistra */}
        <div className="flex items-center gap-[0.75rem] mb-[1rem]">
          <Icon className={`h-[1.5rem] w-[1.5rem] ${color} flex-shrink-0`} />
          <h3 className="text-sm font-medium text-gray">{title}</h3>
        </div>
        
        {/* Value */}
        <div className="text-2xl font-bold mb-[0.25rem]">{value}</div>
        
        {/* Growth indicator */}
        {growth && <GrowthIndicator growth={growth} />}
        
        {/* Sub metric */}
        {subMetric && <SubMetric metric={subMetric} />}
      </div>
    </Card>
  );
};

// Prop types per validazione
GrowthIndicator.propTypes = { growth: PropTypes.object };
SubMetric.propTypes = { metric: PropTypes.object };
StatCard.propTypes = { stat: PropTypes.object.isRequired };

export default StatCard;
