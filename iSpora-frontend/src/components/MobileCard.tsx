import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { cn } from '../../components/ui/utils';

interface MobileCardProps {
  title: string;
  description?: string;
  image?: string;
  avatar?: string;
  status?: string;
  tags?: string[];
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function MobileCard({
  title,
  description,
  image,
  avatar,
  status,
  tags,
  actions,
  onClick,
  className,
  children
}: MobileCardProps) {
  return (
    <Card 
      className={cn(
        "w-full cursor-pointer hover:shadow-md transition-all duration-200",
        onClick && "hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      {image && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {avatar && (
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={avatar} alt={title} />
                <AvatarFallback>{title.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold text-gray-900 truncate">
                {title}
              </CardTitle>
              {description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </div>
          {status && (
            <Badge 
              variant={status === 'active' ? 'default' : 'secondary'}
              className="ml-2 flex-shrink-0"
            >
              {status}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {children}
        
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {actions && (
          <div className="flex justify-end">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Mobile-optimized list item component
export function MobileListItem({
  title,
  subtitle,
  description,
  avatar,
  icon,
  badge,
  rightContent,
  onClick,
  className
}: {
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: string;
  icon?: React.ReactNode;
  badge?: string;
  rightContent?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div 
      className={cn(
        "flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {avatar && (
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={avatar} alt={title} />
          <AvatarFallback>{title.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      
      {icon && !avatar && (
        <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center">
          {icon}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-900 truncate">
            {title}
          </h3>
          {badge && (
            <Badge variant="secondary" className="ml-2 flex-shrink-0">
              {badge}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500 truncate">{subtitle}</p>
        )}
        {description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {description}
          </p>
        )}
      </div>
      
      {rightContent && (
        <div className="flex-shrink-0">
          {rightContent}
        </div>
      )}
    </div>
  );
}

// Mobile-optimized section component
export function MobileSection({
  title,
  description,
  children,
  action,
  className
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </section>
  );
}
