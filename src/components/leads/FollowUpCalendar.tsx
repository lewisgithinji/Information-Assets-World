import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { PriorityBadge } from './PriorityBadge';

interface Lead {
  id: string;
  reference_number: string;
  full_name: string;
  next_action: string;
  next_action_date: string;
  priority: string;
  status: string;
}

interface FollowUpCalendarProps {
  leads: Lead[] | undefined;
}

export const FollowUpCalendar: React.FC<FollowUpCalendarProps> = ({ leads }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const navigate = useNavigate();

  // Filter leads with follow-up dates
  const leadsWithFollowUp = leads?.filter(
    (lead) => lead.next_action_date && !['confirmed', 'lost'].includes(lead.status)
  ) || [];

  // Get leads for selected date
  const leadsForSelectedDate = selectedDate
    ? leadsWithFollowUp.filter((lead) =>
        isSameDay(new Date(lead.next_action_date), selectedDate)
      )
    : [];

  // Count follow-ups per day for calendar dots
  const followUpCounts = leadsWithFollowUp.reduce((acc, lead) => {
    const dateKey = format(new Date(lead.next_action_date), 'yyyy-MM-dd');
    acc[dateKey] = (acc[dateKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Add custom modifiers for calendar
  const datesWithFollowUps = Object.keys(followUpCounts).map((date) => new Date(date));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Follow-up Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="w-full max-w-2xl">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border w-full"
              modifiers={{
                hasFollowUp: datesWithFollowUps,
              }}
              modifiersStyles={{
                hasFollowUp: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  textDecorationColor: 'hsl(var(--primary))',
                },
              }}
            />
            
            {/* Legend */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Legend</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span>Has follow-ups</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-primary"></div>
                  <span>Selected date</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads for Selected Date */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Select a date'}
          </CardTitle>
          {leadsForSelectedDate.length > 0 && (
            <Badge variant="secondary">{leadsForSelectedDate.length} follow-up{leadsForSelectedDate.length !== 1 ? 's' : ''}</Badge>
          )}
        </CardHeader>
        <CardContent>
          {leadsForSelectedDate.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No follow-ups scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leadsForSelectedDate.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/admin/leads/${lead.id}`)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{lead.full_name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {lead.reference_number}
                      </div>
                    </div>
                    <PriorityBadge priority={lead.priority} />
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {lead.next_action}
                  </p>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/leads/${lead.id}`);
                    }}
                  >
                    View Lead
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
