import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  label?: string;
  fallbackTo?: string;
}

export default function BackButton({ 
  to, 
  label = "Back", 
  fallbackTo = "/" 
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      // Try to go back in history, fallback to specified route
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(fallbackTo);
      }
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleBack}
      className="mb-4"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}