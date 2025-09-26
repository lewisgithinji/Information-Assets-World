import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Users, Clock, ExternalLink, Download, Share2 } from 'lucide-react';
import { useEvent } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';

const EventDetails = () => {
  const { slug: id } = useParams();
  const { toast } = useToast();
  const { data: event, isLoading, error } = useEvent(id || '');

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/events">Browse All Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Event link has been copied to your clipboard.",
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'conference':
        return 'bg-primary text-primary-foreground';
      case 'exhibition':
        return 'bg-teal text-white';
      case 'gala':
        return 'bg-accent text-accent-foreground';
      case 'vendor':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="relative h-96 rounded-lg overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-teal"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 flex items-end">
            <div className="p-8 text-white">
              <div className="mb-4">
                <Badge className={`${getTypeColor(event.event_type || 'conference')} mb-2`}>
                  {(event.event_type || 'Conference').charAt(0).toUpperCase() + (event.event_type || 'conference').slice(1)}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
                <p className="text-xl opacity-90 max-w-2xl">{event.theme}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-muted-foreground">
                        {formatDate(event.start_date)}
                        {event.start_date !== event.end_date && (
                          <span> - {formatDate(event.end_date)}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">
                        {event.location}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">About This Event</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Speakers */}
            {event.event_speakers && event.event_speakers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Featured Speakers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {event.event_speakers.map((speakerData: any, index: number) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{speakerData.speakers?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {speakerData.speakers?.title}
                          </p>
                          <p className="text-sm font-medium text-primary">
                            {speakerData.speakers?.organization}
                          </p>
                          {speakerData.speakers?.bio && (
                            <p className="text-sm text-foreground/70 mt-2">
                              {speakerData.speakers.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Agenda */}
            {event.agenda_items && event.agenda_items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Event Agenda
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {event.agenda_items.map((item: any, index: number) => (
                      <div key={index} className="flex gap-4 pb-4 border-b border-border last:border-b-0 last:pb-0">
                        <div className="text-sm font-mono text-muted-foreground whitespace-nowrap">
                          {item.start_time} - {item.end_time}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration */}
            <Card>
              <CardHeader>
                <CardTitle>Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {event.event_type === 'gala' ? '$299' : '$199'}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Early Bird Price
                  </p>
                </div>
                
                <Button className="w-full" size="lg">
                  Register Now
                </Button>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Event
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download .ics
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span>{event.category || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Speakers</span>
                  <span>{event.event_speakers?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span>
                    {event.start_date === event.end_date ? '1 day' : 
                     `${Math.ceil((new Date(event.end_date).getTime() - new Date(event.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} days`}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Sponsors */}
            {event.event_sponsors && event.event_sponsors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sponsors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {event.event_sponsors.map((sponsorData: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 border border-border rounded-lg"
                      >
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {sponsorData.sponsors?.name?.charAt(0) || 'S'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{sponsorData.sponsors?.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {sponsorData.sponsors?.tier}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;