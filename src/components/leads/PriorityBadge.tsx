import { Badge } from '@/components/ui/badge';
import { PRIORITY_COLORS } from '@/utils/leadStatusWorkflow';

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  return (
    <Badge className={`${PRIORITY_COLORS[priority]} ${className}`} variant="secondary">
      {priority.toUpperCase()}
    </Badge>
  );
};
