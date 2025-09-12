import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Event } from '@/data/content';

interface EventCardProps {
  event: UnifiedEvent;
}

const EventCard = ({ event }: EventCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
    <Card className="h-full hover:shadow-lg transition-all duration-300 group border-card-border">
      <CardHeader className="relative p-0">
        <div className="h-48 bg-gradient-to-r from-primary to-teal rounded-t-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-4 left-4">
            <Badge className={getTypeColor(event.type)}>
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </Badge>
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-accent transition-colors">
              {event.title}
            </h3>
            <p className="text-sm opacity-90">{event.theme}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {formatDate(event.startDate)}
              {event.startDate !== event.endDate && ` - ${formatDate(event.endDate)}`}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{event.city}, {event.country}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>{event.speakers.length} Speakers</span>
          </div>
          
          <p className="text-sm text-foreground/80 line-clamp-3 mt-4">
            {event.description}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full" variant="outline">
          <Link to={`/events/${event.slug}`}>
            Learn More
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;