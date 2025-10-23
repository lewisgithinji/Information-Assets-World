import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface VerificationBadgeProps {
  verified: boolean;
  emailConfirmed?: boolean;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  verified, 
  emailConfirmed,
  className 
}) => {
  const isVerified = verified || emailConfirmed;
  
  return (
    <Badge 
      className={`${
        isVerified 
          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      } ${className}`} 
      variant="secondary"
    >
      {isVerified ? (
        <>
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Verified
        </>
      ) : (
        <>
          <AlertCircle className="h-3 w-3 mr-1" />
          Unverified
        </>
      )}
    </Badge>
  );
};
