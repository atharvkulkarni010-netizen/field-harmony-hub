import React from 'react';
import { LucideIcon, SearchX } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-display font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-[min(100%,400px)] mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction} 
          variant="outline" 
          className="rounded-xl border-dashed border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
