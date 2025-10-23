import React from 'react';
import PhoneInputWithCountry from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Label } from '@/components/ui/label';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, error }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="phone">Phone Number *</Label>
      <PhoneInputWithCountry
        international
        defaultCountry="KE"
        value={value}
        onChange={(val) => onChange(val || '')}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
