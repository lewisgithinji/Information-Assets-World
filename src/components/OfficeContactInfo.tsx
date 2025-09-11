import { Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { DatabaseOffice } from '@/hooks/useOffices';

interface OfficeContactInfoProps {
  office: DatabaseOffice;
  showAddress?: boolean;
}

export default function OfficeContactInfo({ office, showAddress = true }: OfficeContactInfoProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {/* Address is always visible */}
      {showAddress && office.address && (
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1">Address</h4>
          <p className="text-sm">{office.address}</p>
        </div>
      )}

      {/* Contact information only for authenticated users */}
      {user ? (
        <>
          {office.phone && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Phone</h4>
              <a href={`tel:${office.phone}`} className="text-sm text-primary hover:underline">
                {office.phone}
              </a>
            </div>
          )}

          {office.email && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Email</h4>
              <a href={`mailto:${office.email}`} className="text-sm text-primary hover:underline">
                {office.email}
              </a>
            </div>
          )}
        </>
      ) : (
        <div className="bg-muted/50 p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground mb-3">
            Sign in to view contact details for this office.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </Button>
        </div>
      )}
    </div>
  );
}