import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Filter, X, Search, MapPin, Users, Clock } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import SearchBox from '@/components/SearchBox';
import PageHero from '@/components/PageHero';
import EnhancedEventCard from '@/components/EnhancedEventCard';
import { useEvents } from '@/hooks/useEvents';
import { useEventCategories, useEventTypes } from '@/hooks/useEventCategories';
import { sampleEvents } from '@/data/content';
import { adaptEvents, UnifiedEvent } from '@/utils/eventAdapters';

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'date');

  const { data: databaseEvents, isLoading } = useEvents();
  const { data: eventCategories } = useEventCategories();
  const { data: eventTypes } = useEventTypes();

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery && searchQuery !== '') params.set('search', searchQuery);
    if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter);
    if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter);
    if (sortBy && sortBy !== 'date') params.set('sort', sortBy);
    
    const paramString = params.toString();
    if (paramString !== searchParams.toString()) {
      navigate(`?${paramString}`, { replace: true });
    }
  }, [searchQuery, typeFilter, categoryFilter, sortBy, navigate, searchParams]);

  // Initialize from URL params
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setTypeFilter(searchParams.get('type') || 'all');
    setCategoryFilter(searchParams.get('category') || 'all');
    setSortBy(searchParams.get('sort') || 'date');
  }, [searchParams]);

  // Use adapter to unify event types
  const events = useMemo(() => adaptEvents(databaseEvents, sampleEvents), [databaseEvents]);

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter(event => {
      const matchesSearch = searchQuery === '' || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.theme && event.theme.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.category && event.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === 'all' || event.event_type === typeFilter || event.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter || event.sector === categoryFilter;

      return matchesSearch && matchesType && matchesCategory && (event.published || event.status === 'published');
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'location':
          return a.location.localeCompare(b.location);
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, searchQuery, typeFilter, categoryFilter, sortBy]);

  // Available filters from database
  const availableTypes = useMemo(() => {
    const types = eventTypes?.map(type => ({ 
      value: type.name, 
      label: type.name.charAt(0).toUpperCase() + type.name.slice(1) 
    })) || [];
    return [{ value: 'all', label: 'All Types' }, ...types];
  }, [eventTypes]);

  const availableCategories = useMemo(() => {
    const categories = eventCategories?.map(cat => ({ 
      value: cat.name, 
      label: cat.name 
    })) || [];
    return [{ value: 'all', label: 'All Categories' }, ...categories];
  }, [eventCategories]);

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'title', label: 'Title' },
    { value: 'location', label: 'Location' },
  ];

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setSortBy('date');
  };

  const hasActiveFilters = searchQuery || typeFilter !== 'all' || categoryFilter !== 'all';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="Professional Events"
        description="Join industry leaders at conferences, exhibitions, and networking events worldwide"
        gradient="blue"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
            <div className="text-2xl font-bold">{events.length}</div>
            <div className="text-sm text-white/80">Total Events</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <MapPin className="h-6 w-6 text-accent" />
            </div>
            <div className="text-2xl font-bold">{new Set(events.map(e => e.location)).size}</div>
            <div className="text-sm text-white/80">Locations</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div className="text-2xl font-bold">10,000+</div>
            <div className="text-sm text-white/80">Attendees</div>
          </div>
        </div>
      </PageHero>

      {/* Enhanced Filters Section */}
      <section className="py-8 bg-secondary/30">
        <div className="container mx-auto px-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Search & Filter Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <SearchBox 
                  placeholder="Search events by title, location, theme, or category..." 
                  onSearch={setSearchQuery}
                  className="pl-10"
                />
              </div>
              
              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Event Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Actions</label>
                  <div className="flex gap-2">
                    {hasActiveFilters && (
                      <Button 
                        variant="outline" 
                        onClick={clearFilters}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="secondary" className="flex items-center gap-2">
                      Search: "{searchQuery}"
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setSearchQuery('')}
                      />
                    </Badge>
                  )}
                  {typeFilter !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-2">
                      Type: {availableTypes.find(t => t.value === typeFilter)?.label}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setTypeFilter('all')}
                      />
                    </Badge>
                  )}
                  {categoryFilter !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-2">
                      Category: {availableCategories.find(c => c.value === categoryFilter)?.label}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setCategoryFilter('all')}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Events Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="text-lg font-semibold text-foreground">
                {filteredAndSortedEvents.length} {filteredAndSortedEvents.length === 1 ? 'Event' : 'Events'} Found
              </div>
              {hasActiveFilters && (
                <Badge variant="outline" className="text-primary">
                  <Filter className="h-3 w-3 mr-1" />
                  Filtered
                </Badge>
              )}
            </div>
            <Button className="shadow-primary">
              <Download className="h-4 w-4 mr-2" />
              Export Calendar
            </Button>
          </div>

          {filteredAndSortedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedEvents.map((event) => (
                <div key={event.id} className="animate-fade-in">
                  <EnhancedEventCard event={event as any} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">No Events Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {hasActiveFilters 
                  ? "Try adjusting your search criteria or clear filters to see more events."
                  : "There are currently no events available. Check back soon for updates!"
                }
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-16 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              Want to Host an Event with Us?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join our global network and reach thousands of information management professionals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-glow" asChild>
                <Link to="/admin/events/new">
                  <Calendar className="h-5 w-5 mr-2" />
                  Propose an Event
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Users className="h-5 w-5 mr-2" />
                Partner with Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;