import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { STATUS_LABELS } from '@/utils/leadStatusWorkflow';
import { useCountries } from '@/hooks/useCountries';
import { useUpcomingEvents } from '@/hooks/useUpcomingEvents';
import { useUsers } from '@/hooks/useUsers';
import { LeadFilters as LeadFiltersType } from '@/hooks/useLeads';
import { format } from 'date-fns';

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onFiltersChange: (filters: LeadFiltersType) => void;
}

const INQUIRY_TYPES = [
  { value: 'send_writeup', label: '📧 Send Writeup', icon: '📧' },
  { value: 'contact_discuss', label: '📞 Contact Discuss', icon: '📞' },
  { value: 'register_now', label: '✅ Ready to Register', icon: '✅' },
  { value: 'group_registration', label: '👥 Group Registration', icon: '👥' },
  { value: 'corporate_training', label: '🏢 Corporate Training', icon: '🏢' },
  { value: 'just_browsing', label: '📰 Just Browsing', icon: '📰' },
];

export const LeadFilters: React.FC<LeadFiltersProps> = ({ filters, onFiltersChange }) => {
  const { data: countries } = useCountries();
  const { data: events } = useUpcomingEvents();
  const { data: users } = useUsers();

  const handleStatusToggle = (status: string) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];
    onFiltersChange({ ...filters, status: newStatuses });
  };

  const handleCountryToggle = (country: string) => {
    const currentCountries = filters.country || [];
    const newCountries = currentCountries.includes(country)
      ? currentCountries.filter((c) => c !== country)
      : [...currentCountries, country];
    onFiltersChange({ ...filters, country: newCountries });
  };

  const handleInquiryTypeToggle = (inquiryType: string) => {
    const currentTypes = filters.inquiry_type || [];
    const newTypes = currentTypes.includes(inquiryType)
      ? currentTypes.filter((t) => t !== inquiryType)
      : [...currentTypes, inquiryType];
    onFiltersChange({ ...filters, inquiry_type: newTypes });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const handleFollowUpToggle = (status: string) => {
    const currentStatuses = filters.followUpStatus || [];
    const newStatuses = currentStatuses.includes(status as any)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status as any];
    onFiltersChange({ ...filters, followUpStatus: newStatuses });
  };

  const activeFilterCount =
    (filters.status?.length || 0) +
    (filters.country?.length || 0) +
    (filters.event_id ? 1 : 0) +
    (filters.inquiry_type?.length || 0) +
    (filters.assigned_to ? 1 : 0) +
    (filters.followUpStatus?.length || 0);

  // Get top 5 countries by lead count (simplified - just showing first 5)
  const topCountries = countries?.slice(0, 5) || [];
  const showAllCountries = countries && countries.length > 5;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear ({activeFilterCount})
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Status Filter */}
          <div>
            <Label className="mb-3 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Status
            </Label>
            <div className="space-y-2">
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${value}`}
                    checked={filters.status?.includes(value)}
                    onCheckedChange={() => handleStatusToggle(value)}
                  />
                  <label
                    htmlFor={`status-${value}`}
                    className="text-sm cursor-pointer hover:text-primary transition-colors"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Inquiry Type Filter */}
          <div>
            <Label className="mb-3 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Inquiry Type
            </Label>
            <div className="space-y-2">
              {INQUIRY_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`inquiry-${type.value}`}
                    checked={filters.inquiry_type?.includes(type.value)}
                    onCheckedChange={() => handleInquiryTypeToggle(type.value)}
                  />
                  <label
                    htmlFor={`inquiry-${type.value}`}
                    className="text-sm cursor-pointer hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <span>{type.icon}</span>
                    <span>{type.label.replace(type.icon + ' ', '')}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Event Filter */}
          {events && events.length > 0 && (
            <div>
              <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Event
              </Label>
              <Select
                value={filters.event_id || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, event_id: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="no-event">
                    <span className="text-muted-foreground italic">No Event (Legacy)</span>
                  </SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{event.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(event.start_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Country Filter - Compact */}
          {topCountries.length > 0 && (
            <div>
              <Label className="mb-3 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Top Countries
              </Label>
              <div className="space-y-2">
                {topCountries.map((country) => (
                  <div key={country.code} className="flex items-center space-x-2">
                    <Checkbox
                      id={`country-${country.code}`}
                      checked={filters.country?.includes(country.name)}
                      onCheckedChange={() => handleCountryToggle(country.name)}
                    />
                    <label
                      htmlFor={`country-${country.code}`}
                      className="text-sm cursor-pointer hover:text-primary transition-colors"
                    >
                      {country.name}
                    </label>
                  </div>
                ))}
                {showAllCountries && (
                  <p className="text-xs text-muted-foreground italic pt-1">
                    + {countries.length - 5} more countries available
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Assigned To Filter */}
          {users && users.length > 0 && (
            <div>
              <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Assigned To
              </Label>
              <Select
                value={filters.assigned_to || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, assigned_to: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="unassigned">
                    <span className="text-muted-foreground">Unassigned</span>
                  </SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Follow-up Status Filter */}
          <div>
            <Label className="mb-3 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Follow-up Status
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="followup-overdue"
                  checked={filters.followUpStatus?.includes('overdue')}
                  onCheckedChange={() => handleFollowUpToggle('overdue')}
                />
                <label htmlFor="followup-overdue" className="text-sm cursor-pointer hover:text-primary transition-colors">
                  <span className="text-red-600 dark:text-red-400">⚠️</span> Overdue
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="followup-today"
                  checked={filters.followUpStatus?.includes('today')}
                  onCheckedChange={() => handleFollowUpToggle('today')}
                />
                <label htmlFor="followup-today" className="text-sm cursor-pointer hover:text-primary transition-colors">
                  <span className="text-orange-600 dark:text-orange-400">📅</span> Due Today
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="followup-week"
                  checked={filters.followUpStatus?.includes('this_week')}
                  onCheckedChange={() => handleFollowUpToggle('this_week')}
                />
                <label htmlFor="followup-week" className="text-sm cursor-pointer hover:text-primary transition-colors">
                  📆 Due This Week
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="followup-none"
                  checked={filters.followUpStatus?.includes('none')}
                  onCheckedChange={() => handleFollowUpToggle('none')}
                />
                <label htmlFor="followup-none" className="text-sm cursor-pointer hover:text-primary transition-colors text-muted-foreground">
                  No Follow-up Scheduled
                </label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
