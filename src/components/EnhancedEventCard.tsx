import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import { UnifiedEvent } from '@/utils/eventAdapters';
import CountdownTimer from '@/components/CountdownTimer';

interface EnhancedEventCardProps {
  event: UnifiedEvent;
}

const EnhancedEventCard = ({ event }: EnhancedEventCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'conference': 'bg-blue-100 text-blue-800 border-blue-200',
      'exhibition': 'bg-green-100 text-green-800 border-green-200',
      'gala': 'bg-purple-100 text-purple-800 border-purple-200',
      'workshop': 'bg-orange-100 text-orange-800 border-orange-200',
      'seminar': 'bg-teal-100 text-teal-800 border-teal-200',
      'networking': 'bg-pink-100 text-pink-800 border-pink-200',
      'webinar': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const isUpcoming = startDate > now;
  const isOngoing = startDate <= now && endDate >= now;
  const isPast = endDate < now;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-3">
          <Badge className={getTypeColor(event.type)} variant="outline">
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </Badge>
          {event.category && (
            <Badge variant="secondary" className="ml-2">
              {event.category}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {event.title}
          </h3>
          {event.theme && (
            <p className="text-sm text-muted-foreground font-medium">
              {event.theme}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Countdown Timer for upcoming events */}
        {isUpcoming && (
          <div className="bg-primary/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Event Starts In:</span>
            </div>
            <CountdownTimer
              eventTitle={event.title}
              startDate={event.startDate}
              location={event.location}
              className="text-xs"
            />
          </div>
        )}

        {/* Ongoing event indicator */}
        {isOngoing && (
          <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
            <div className="flex items-center gap-2">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">Happening Now</span>
            </div>
          </div>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          {event.speakers && event.speakers.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>{event.speakers.length} Speaker{event.speakers.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {event.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button
            asChild
            className="flex-1 shadow-primary hover:shadow-lg transition-all"
          >
            <Link to={`/events/${event.id}`}>
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          {(isUpcoming || isOngoing) && (
            <Button
              asChild
              variant={isOngoing ? "default" : "outline"}
              className="flex-1 hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <Link to={`/register-interest?event=${event.id}`}>
                {isOngoing ? "Join Now" : "Register Now"}
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default EnhancedEventCard;