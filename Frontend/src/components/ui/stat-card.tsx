import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  className?: string;
}

const variantStyles = {
  default: 'bg-card',
  primary: 'bg-primary/5 border-primary/20',
  secondary: 'bg-secondary/10 border-secondary/20',
  accent: 'bg-accent/5 border-accent/20',
};

const iconVariantStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/20 text-secondary-foreground',
  accent: 'bg-accent/10 text-accent',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'nature-card p-6 flex items-start justify-between animate-fade-in',
        variantStyles[variant],
        className
      )}
    >
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold font-display text-foreground">{value}</p>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 text-sm">
            {trend && (
              <span
                className={cn(
                  'font-medium',
                  trend.isPositive ? 'text-secondary' : 'text-destructive'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
            {subtitle && (
              <span className="text-muted-foreground">{subtitle}</span>
            )}
          </div>
        )}
      </div>
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          iconVariantStyles[variant]
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
