
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  color?: string;
  metrics?: Array<{
    label: string;
    value: string | number;
  }>;
  className?: string;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  icon,
  to,
  color = 'bg-primary',
  metrics,
  className,
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={cn("", className)}
    >
      <Link to={to}>
        <Card className="h-full overflow-hidden border hover:shadow-md transition-all duration-300">
          <div className="relative">
            <div className={cn(
              "absolute top-0 left-0 w-1 h-full",
              color
            )} />
            
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-lg",
                  `${color}/10`
                )}>
                  {icon}
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
              </div>
              
              {metrics && metrics.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {metrics.map((metric, index) => (
                    <div key={index} className="space-y-1">
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <p className="text-lg font-semibold">{metric.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="p-0">
              <div className="py-3 px-6 w-full flex justify-end border-t">
                <div className="text-sm text-primary flex items-center gap-1">
                  <span>詳細を見る</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </CardFooter>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};
