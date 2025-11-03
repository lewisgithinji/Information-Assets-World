import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCountries } from "@/hooks/useCountries";

interface CountrySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function CountrySelect({ value, onValueChange, disabled }: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);
  const { data: countries, isLoading } = useCountries();

  const sortedCountries = React.useMemo(() => {
    if (!countries) return [];

    // Prioritize East African countries at the top
    const eastAfricanCountries = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda'];

    const prioritized = countries.filter(c => eastAfricanCountries.includes(c.name));
    const rest = countries.filter(c => !eastAfricanCountries.includes(c.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    return [...prioritized, ...rest];
  }, [countries]);

  const selectedCountry = sortedCountries.find(
    (country) => country.name === value
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            "Loading countries..."
          ) : selectedCountry ? (
            <span className="flex items-center gap-2">
              {selectedCountry.phone_code && (
                <span className="text-muted-foreground text-xs">
                  {selectedCountry.phone_code}
                </span>
              )}
              {selectedCountry.name}
            </span>
          ) : (
            "Select a country"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {sortedCountries.map((country) => (
              <CommandItem
                key={country.id}
                value={country.name}
                onSelect={(currentValue) => {
                  onValueChange(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === country.name ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex items-center gap-2 flex-1">
                  <span>{country.name}</span>
                  {country.phone_code && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {country.phone_code}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
