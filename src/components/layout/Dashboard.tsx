
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardProps {
  children: ReactNode;
  className?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  children,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col min-h-screen bg-background",
      className
    )}>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

interface DashboardSectionProps {
  children: ReactNode;
  className?: string;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  children,
  className
}) => {
  return (
    <section className={cn("py-6", className)}>
      {children}
    </section>
  );
};

interface DashboardHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  description,
  actions,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6",
      className
    )}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};

interface DashboardContentProps {
  children: ReactNode;
  className?: string;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(
      "grid gap-6",
      className
    )}>
      {children}
    </div>
  );
};

interface DashboardGridProps {
  children: ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  className?: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  className
}) => {
  return (
    <div className={cn(
      "grid gap-6",
      columns.sm && `grid-cols-${columns.sm}`,
      columns.md && `md:grid-cols-${columns.md}`,
      columns.lg && `lg:grid-cols-${columns.lg}`,
      columns.xl && `xl:grid-cols-${columns.xl}`,
      className
    )}>
      {children}
    </div>
  );
};
