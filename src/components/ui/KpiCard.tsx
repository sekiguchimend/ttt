
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export interface KpiCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  format?: 'number' | 'percentage' | 'currency' | 'custom';
  minimumTarget?: number;
  standardTarget?: number;
  stretchTarget?: number;
  targetValue?: number; // 後方互換性のため
  prefix?: string;
  suffix?: string;
  className?: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  loading?: boolean;
  showDetailedProgress?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  previousValue,
  format = 'number',
  minimumTarget,
  standardTarget,
  stretchTarget,
  targetValue, // 後方互換性のため
  prefix = '',
  suffix = '',
  className,
  description,
  trend,
  trendValue,
  color = 'default',
  loading = false,
  showDetailedProgress = false,
}) => {
  // 後方互換性のため、targetValueが指定されている場合は標準目標として使用
  const actualStandardTarget = standardTarget || targetValue;
  const actualMinimumTarget = minimumTarget || (actualStandardTarget ? Math.round(actualStandardTarget * 0.7) : undefined);
  const actualStretchTarget = stretchTarget || (actualStandardTarget ? Math.round(actualStandardTarget * 1.3) : undefined);
  // Format value based on type
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'percentage':
        return `${prefix}${val.toFixed(1)}${suffix || '%'}`;
      case 'currency':
        return `${prefix || '¥'}${val.toLocaleString()}${suffix}`;
      case 'custom':
        return `${prefix}${val}${suffix}`;
      case 'number':
      default:
        return `${prefix}${val.toLocaleString()}${suffix}`;
    }
  };

  // Calculate trend direction if not explicitly provided
  const calculateTrend = () => {
    if (trend) return trend;
    if (previousValue === undefined || value === undefined) return 'neutral';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue > previousValue) return 'up';
    if (numValue < previousValue) return 'down';
    return 'neutral';
  };

  const actualTrend = calculateTrend();
  const actualTrendValue = trendValue ?? (
    previousValue && typeof value === 'number'
      ? (((value - previousValue) / previousValue) * 100)
      : 0
  );

  // Determine color classes based on trend and color prop
  const getColorClasses = () => {
    if (color !== 'default') {
      switch (color) {
        case 'primary':
          return 'bg-primary/10 text-primary border-primary/20';
        case 'success':
          return 'bg-green-50 text-green-600 border-green-200';
        case 'warning':
          return 'bg-amber-50 text-amber-600 border-amber-200';
        case 'danger':
          return 'bg-red-50 text-red-600 border-red-200';
        default:
          return 'bg-background border-border';
      }
    }
    
    switch (actualTrend) {
      case 'up':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'down':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-background border-border';
    }
  };

  // Trend indicator component
  const TrendIndicator = () => {
    if (actualTrend === 'neutral') {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
    
    const isPositive = actualTrend === 'up';
    const absValue = Math.abs(actualTrendValue);
    
    return (
      <div className={cn(
        "flex items-center gap-1 text-sm",
        isPositive ? "text-green-600" : "text-red-600"
      )}>
        {isPositive ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
        <span>{absValue.toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("", className)}
    >
      <Card className={cn(
        "p-6 border overflow-hidden",
        loading && "animate-pulse"
      )}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            {previousValue !== undefined && <TrendIndicator />}
          </div>
          
          <div className="mt-1">
            <div className="text-2xl font-semibold">
              {loading ? (
                <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
              ) : (
                formatValue(value)
              )}
            </div>
            
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          
          {actualStandardTarget !== undefined && (
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1 flex justify-between">
                <span>進捗</span>
                <span>目標: {formatValue(actualStandardTarget)}</span>
              </div>
              
              {/* 標準目標に対する進捗バー */}
              <div className="h-1.5 w-full bg-muted rounded overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded",
                    typeof value === 'number' && actualStretchTarget !== undefined && value >= actualStretchTarget
                      ? "bg-green-600"
                      : typeof value === 'number' && value >= actualStandardTarget
                        ? "bg-green-500"
                        : typeof value === 'number' && actualMinimumTarget !== undefined && value >= actualMinimumTarget
                          ? "bg-yellow-500"
                          : "bg-red-500"
                  )}
                  style={{
                    width: `${Math.min(
                      typeof value === 'number' ?
                      (value / actualStandardTarget) * 100 : 0, 100
                    )}%`
                  }}
                />
              </div>
              
              {/* 詳細な進捗表示 */}
              {showDetailedProgress && actualMinimumTarget !== undefined && actualStretchTarget !== undefined && (
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">最低</span>
                      <span>{formatValue(actualMinimumTarget)}</span>
                    </div>
                    <div className="h-1 w-full bg-muted rounded overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded",
                          typeof value === 'number' && value >= actualMinimumTarget ? "bg-green-500" : "bg-red-500"
                        )}
                        style={{
                          width: `${Math.min(
                            typeof value === 'number' ?
                            (value / actualMinimumTarget) * 100 : 0, 100
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">普通</span>
                      <span>{formatValue(actualStandardTarget)}</span>
                    </div>
                    <div className="h-1 w-full bg-muted rounded overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded",
                          typeof value === 'number' && value >= actualStandardTarget ? "bg-green-500" : "bg-yellow-500"
                        )}
                        style={{
                          width: `${Math.min(
                            typeof value === 'number' ?
                            (value / actualStandardTarget) * 100 : 0, 100
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">いい</span>
                      <span>{formatValue(actualStretchTarget)}</span>
                    </div>
                    <div className="h-1 w-full bg-muted rounded overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded",
                          typeof value === 'number' && value >= actualStretchTarget ? "bg-green-600" : "bg-blue-500"
                        )}
                        style={{
                          width: `${Math.min(
                            typeof value === 'number' ?
                            (value / actualStretchTarget) * 100 : 0, 100
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
