import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface LeadSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
}

export const LeadSearch: React.FC<LeadSearchProps> = ({ value, onChange, resultCount }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Search by name, email, organization, or reference number..."
        className="pl-10 pr-10"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {resultCount !== undefined && localValue && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {resultCount} results
        </div>
      )}
    </div>
  );
};
