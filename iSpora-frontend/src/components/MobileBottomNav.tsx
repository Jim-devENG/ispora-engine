import React from 'react';
import { Home, Users, Briefcase, Bell, CreditCard } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { useNavigation } from '../../components/NavigationContext';

interface MobileBottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function MobileBottomNav({ currentPage, onNavigate }: MobileBottomNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'network', label: 'Network', icon: Users },
    { id: 'notifications', label: 'Alerts', icon: Bell, badge: 3 },
    { id: 'credits', label: 'Credits', icon: CreditCard },
  ];

  return (
    <nav className="mobile-nav">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
