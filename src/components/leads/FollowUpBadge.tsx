import { Badge } from '@/components/ui/badge';
import { differenceInDays, isPast, isToday, format } from 'date-fns';
import { Calendar, Clock, AlertCircle, Plus } from 'lucide-react';

interface FollowUpBadgeProps {
  nextActionDate: string | null;
  status: string;
  compact?: boolean;
}

export const FollowUpBadge: React.FC<FollowUpBadgeProps> = ({ 
  nextActionDate, 
  status,
  compact = false 
}) => {
  // Don't show follow-up for completed/closed statuses
  if (['confirmed', 'lost'].includes(status)) {
    return null;
  }

  if (!nextActionDate) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Plus className="h-3 w-3" />
        {!compact && 'Schedule'}
      </Badge>
    );
  }

  const dueDate = new Date(nextActionDate);
  const today = new Date();
  const daysUntil = differenceInDays(dueDate, today);

  if (isPast(dueDate) && !isToday(dueDate)) {
    const daysOverdue = Math.abs(daysUntil);
    return (
      <Badge variant="destructive" className="gap-1 animate-pulse">
        <AlertCircle className="h-3 w-3" />
        {compact ? `${daysOverdue}d` : `Overdue ${daysOverdue}d`}
      </Badge>
    );
  }

  if (isToday(dueDate)) {
    return (
      <Badge className="gap-1 bg-yellow-500 hover:bg-yellow-600 text-white">
        <Clock className="h-3 w-3" />
        {compact ? 'Today' : 'Due Today'}
      </Badge>
    );
  }

  if (daysUntil <= 7) {
    return (
      <Badge variant="outline" className="gap-1 border-green-500 text-green-700 dark:text-green-400">
        <Calendar className="h-3 w-3" />
        {compact ? `${daysUntil}d` : `${daysUntil}d away`}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <Calendar className="h-3 w-3" />
      {compact ? format(dueDate, 'MMM d') : format(dueDate, 'MMM d, yyyy')}
    </Badge>
  );
};
