import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ChevronRight, Calendar, User, MapPin } from 'lucide-react';

interface MobileTableProps {
  data: Array<{
    id: string;
    title: string;
    description?: string;
    status?: string;
    date?: string;
    author?: string;
    location?: string;
    tags?: string[];
    [key: string]: any;
  }>;
  onItemClick?: (item: any) => void;
  renderActions?: (item: any) => React.ReactNode;
}

export function MobileTable({ data, onItemClick, renderActions }: MobileTableProps) {
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <Card 
          key={item.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onItemClick?.(item)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-semibold text-gray-900 truncate">
                  {item.title}
                </CardTitle>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
              {item.status && (
                <Badge 
                  variant={item.status === 'active' ? 'default' : 'secondary'}
                  className="ml-2 flex-shrink-0"
                >
                  {item.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-2">
              {/* Metadata */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {item.date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                )}
                {item.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{item.author}</span>
                  </div>
                )}
                {item.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{item.location}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Actions */}
              {renderActions && (
                <div className="flex justify-end pt-2">
                  {renderActions(item)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Mobile-friendly data table component
export function MobileDataTable({ 
  columns, 
  data, 
  onRowClick 
}: {
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
  }>;
  data: any[];
  onRowClick?: (row: any) => void;
}) {
  return (
    <div className="space-y-3">
      {data.map((row, index) => (
        <Card 
          key={index}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onRowClick?.(row)}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              {columns.map((column) => (
                <div key={column.key} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-500 min-w-0 flex-1">
                    {column.label}:
                  </span>
                  <span className="text-sm text-gray-900 text-right min-w-0 flex-1 ml-2">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
