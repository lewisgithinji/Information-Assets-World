import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Calendar, Users, Building, Award, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEventCategories, useEventTypes } from '@/hooks/useEventCategories';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MegaMenu = ({ isOpen, onClose }: MegaMenuProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: eventCategories = [] } = useEventCategories();
  const { data: eventTypes = [] } = useEventTypes();

  const quickLinks = [
    { name: 'All Events', href: '/events', icon: Calendar },
    { name: 'Upcoming', href: '/events?filter=upcoming', icon: Calendar },
    { name: 'Featured', href: '/events?filter=featured', icon: Award },
    { name: 'Virtual Events', href: '/events?format=virtual', icon: Users },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/events?search=${encodeURIComponent(searchQuery.trim())}`;
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute left-0 top-full mt-2 w-screen max-w-4xl bg-background border border-border rounded-lg shadow-lg z-50">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Access */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Quick Access
            </h3>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              ))}
            </div>
            
            {/* Search */}
            <form onSubmit={handleSearch} className="mt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-sm"
                />
                <Button type="submit" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Event Types */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Event Types
            </h3>
            <div className="space-y-2">
              {eventTypes.slice(0, 6).map((type) => (
                <Link
                  key={type.id}
                  to={`/events?type=${encodeURIComponent(type.name)}`}
                  onClick={onClose}
                  className="block p-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                </Link>
              ))}
              {eventTypes.length > 6 && (
                <Link
                  to="/events"
                  onClick={onClose}
                  className="block p-2 rounded-md text-xs text-primary hover:underline"
                >
                  View all types →
                </Link>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Categories
            </h3>
            <div className="space-y-2">
              {eventCategories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  to={`/events?category=${encodeURIComponent(category.name)}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <span>{category.name}</span>
                  {category.color && (
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                </Link>
              ))}
              {eventCategories.length > 6 && (
                <Link
                  to="/events"
                  onClick={onClose}
                  className="block p-2 rounded-md text-xs text-primary hover:underline"
                >
                  View all categories →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {eventTypes.length} Types
            </Badge>
            <Badge variant="outline" className="text-xs">
              {eventCategories.length} Categories
            </Badge>
          </div>
          <Link
            to="/events"
            onClick={onClose}
            className="text-sm text-primary hover:underline font-medium"
          >
            View All Events →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;