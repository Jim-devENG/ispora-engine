import React, { useState } from 'react';
import { Menu, X, Home, Users, Briefcase, Bell, CreditCard, Settings, LogOut } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '../../components/ui/sheet';
import { Badge } from '../../components/ui/badge';
import { useNavigation } from '../../components/NavigationContext';

interface MobileNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function MobileNavigation({ currentPage, onNavigate }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { navigationItems } = useNavigation();

  const navigationItemsWithIcons = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'network', label: 'Network', icon: Users },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'credits', label: 'Credits', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm border"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle>iSpora</SheetTitle>
            <SheetDescription>Navigation menu</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col h-full">

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItemsWithIcons.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start h-12 text-left"
                    onClick={() => handleNavigation(item.id)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                    {item.id === 'notifications' && (
                      <Badge variant="destructive" className="ml-auto">
                        3
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-left text-destructive"
                onClick={() => {
                  // Handle logout
                  setIsOpen(false);
                }}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
