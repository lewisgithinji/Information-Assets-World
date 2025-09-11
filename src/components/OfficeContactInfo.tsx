import { Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { DatabaseOffice } from '@/hooks/useOffices';

interface OfficeContactInfoProps {
  office: DatabaseOffice;
  showAddress?: boolean;
}

export default function OfficeContactInfo({ office, showAddress = true }: OfficeContactInfoProps) {
  const { user } = useAuth();

  // Show contact info only to authenticated users
  const showContactInfo = user && office.email && office.phone;
  
  return (
    <div className="space-y-4">
      {showAddress && office.address && (
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="text-sm text-foreground/80">
            {office.address}
          </div>
        </div>
      )}
      
      {showContactInfo ? (
        <>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a 
              href={`tel:${office.phone}`}
              className="text-sm text-primary hover:underline"
            >
              {office.phone}
            </a>
          </div>
          
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a 
              href={`mailto:${office.email}`}
              className="text-sm text-primary hover:underline"
            >
              {office.email}
            </a>
          </div>
        </>
      ) : (
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
            <Mail className="h-4 w-4" />
            <Phone className="h-4 w-4" />
            Contact Information
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Sign in to access office contact details
          </p>
          <Button size="sm" variant="outline" asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </div>
      )}
    </div>
  );
}