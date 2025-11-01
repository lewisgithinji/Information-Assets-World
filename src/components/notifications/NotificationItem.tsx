import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Clock, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (notification.type) {
      case 'overdue_followup':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'today_followup':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'upcoming_followup':
        return <Bell className="h-4 w-4 text-primary" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'overdue_followup':
        return 'border-l-destructive';
      case 'today_followup':
        return 'border-l-warning';
      case 'upcoming_followup':
        return 'border-l-primary';
      default:
        return 'border-l-border';
    }
  };

  const handleClick = async () => {
    try {
      if (!notification.is_read) {
        await onMarkAsRead(notification.id);
      }
      if (notification.lead_id) {
        navigate(`/admin/leads/${notification.lead_id}`);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 border-l-4 p-3 cursor-pointer transition-colors',
        getBorderColor(),
        notification.is_read ? 'bg-muted/30' : 'bg-background hover:bg-muted/50'
      )}
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', !notification.is_read && 'font-semibold')}>
          {notification.title}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
      {!notification.is_read && (
        <div className="h-2 w-2 rounded-full bg-primary mt-2" />
      )}
    </div>
  );
};
