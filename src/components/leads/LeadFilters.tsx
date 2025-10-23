import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { STATUS_LABELS } from '@/utils/leadStatusWorkflow';
import { useCountries } from '@/hooks/useCountries';
import { useTrainingTypes } from '@/hooks/useTrainingTypes';
import { useUsers } from '@/hooks/useUsers';
import { LeadFilters as LeadFiltersType } from '@/hooks/useLeads';

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onFiltersChange: (filters: LeadFiltersType) => void;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({ filters, onFiltersChange }) => {
  const { data: countries } = useCountries();
  const { data: trainingTypes } = useTrainingTypes();
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

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = 
    (filters.status?.length || 0) +
    (filters.country?.length || 0) +
    (filters.training_interest ? 1 : 0) +
    (filters.assigned_to ? 1 : 0);

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
            <Label className="mb-3 block">Status</Label>
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
                    className="text-sm cursor-pointer"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Country Filter */}
          {countries && countries.length > 0 && (
            <div>
              <Label className="mb-3 block">Country</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {countries.map((country) => (
                  <div key={country.code} className="flex items-center space-x-2">
                    <Checkbox
                      id={`country-${country.code}`}
                      checked={filters.country?.includes(country.name)}
                      onCheckedChange={() => handleCountryToggle(country.name)}
                    />
                    <label
                      htmlFor={`country-${country.code}`}
                      className="text-sm cursor-pointer"
                    >
                      {country.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Training Interest Filter */}
          {trainingTypes && trainingTypes.length > 0 && (
            <div>
              <Label className="mb-2 block">Training Interest</Label>
              <Select
                value={filters.training_interest || ''}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, training_interest: value || undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All training types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All training types</SelectItem>
                  {trainingTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Assigned To Filter */}
          {users && users.length > 0 && (
            <div>
              <Label className="mb-2 block">Assigned To</Label>
              <Select
                value={filters.assigned_to || ''}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, assigned_to: value || undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All users</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
