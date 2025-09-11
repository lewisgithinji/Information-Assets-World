import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { isAfter, isBefore, parseISO } from 'date-fns';

interface CountdownTimerProps {
  eventTitle: string;
  startDate: string;
  location: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ eventTitle, startDate, location, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isHappening, setIsHappening] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const eventStart = parseISO(startDate);
      
      if (isBefore(now, eventStart)) {
        const difference = eventStart.getTime() - now.getTime();
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
        setIsHappening(false);
      } else {
        setIsHappening(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [startDate, mounted]);

  if (!mounted) {
    // Server-side fallback
    const eventStart = parseISO(startDate);
    const formattedDate = formatInTimeZone(eventStart, 'Africa/Nairobi', 'PPP');
    
    return (
      <Card className={`bg-gradient-to-r from-primary to-primary-dark text-white ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-5 w-5" />
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Next Event
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-2">{eventTitle}</h3>
          <p className="text-sm opacity-90 mb-1">{location}</p>
          <p className="text-sm opacity-75">{formattedDate} (GMT+3)</p>
        </CardContent>
      </Card>
    );
  }

  if (isHappening) {
    return (
      <Card className={`bg-gradient-to-r from-accent to-accent-light text-white animate-pulse ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-5 w-5" />
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Happening Now
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-2">{eventTitle}</h3>
          <p className="text-sm opacity-90">{location}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-r from-primary to-primary-dark text-white ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <Clock className="h-5 w-5" />
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Next Event
          </Badge>
        </div>
        <h3 className="font-semibold text-lg mb-4">{eventTitle}</h3>
        
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{timeLeft.days}</div>
            <div className="text-xs opacity-75 uppercase">Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{timeLeft.hours}</div>
            <div className="text-xs opacity-75 uppercase">Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{timeLeft.minutes}</div>
            <div className="text-xs opacity-75 uppercase">Mins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{timeLeft.seconds}</div>
            <div className="text-xs opacity-75 uppercase">Secs</div>
          </div>
        </div>
        
        <div className="text-sm opacity-90 flex items-center justify-between">
          <span>{location}</span>
          <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
            GMT+3
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}