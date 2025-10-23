import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NotificationBadge } from './NotificationBadge';
import { NotificationDropdown } from './NotificationDropdown';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationGenerator } from '@/hooks/useNotificationGenerator';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const {
    unreadNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Auto-generate notifications based on follow-ups
  useNotificationGenerator();

  const hasUnread = unreadCount > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${hasUnread ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className={cn('h-5 w-5', hasUnread && 'animate-pulse')} />
          <NotificationBadge count={unreadCount} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <NotificationDropdown
          notifications={unreadNotifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          isLoading={isLoading}
        />
      </PopoverContent>
    </Popover>
  );
};
