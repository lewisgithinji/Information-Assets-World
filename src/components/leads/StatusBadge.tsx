import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS, STATUS_LABELS } from '@/utils/leadStatusWorkflow';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  return (
    <Badge className={`${STATUS_COLORS[status]} ${className}`} variant="secondary">
      {STATUS_LABELS[status]}
    </Badge>
  );
};
