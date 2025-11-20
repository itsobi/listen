'use client';

import { Bell, BellOff, Bot } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const NOTIFICATION_TYPES = {
  LISTEN_AGENT: 'listen_agent',
} as const;

function NotificationsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
      <BellOff className="size-8 mb-2 text-zinc-400" />
      <p className="text-base font-semibold">You&rsquo;re all caught up!</p>
      <p className="text-xs mt-1 max-w-xs mx-auto">
        We&rsquo;ll keep you posted when your listen agents are ready to chat
        with!
      </p>
    </div>
  );
}

type NotificationType = {
  _id: Id<'notifications'>;
  read: boolean;
  trackId: number;
  type: string;
  user_id: string;
  episodeTitle: string;
  _creationTime: number;
};

function Notification({ notification }: { notification: NotificationType }) {
  const router = useRouter();
  const markNotificationAsRead = useMutation(
    api.notifications.markNotificationAsRead
  );

  const handleClickNotification = async () => {
    try {
      await markNotificationAsRead({
        notificationId: notification._id,
      });
      router.push(`/listen-agent/${notification.trackId.toString()}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark notification as read');
    }
  };

  return (
    <button
      onClick={handleClickNotification}
      className="flex justify-between items-center text-sm text-left hover:bg-accent p-4 cursor-pointer rounded-sm outline-none relative"
    >
      <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
      <div className="flex items-center gap-6">
        <Bot className="size-12" />
        <div>
          <p>Listen Agent is ready!</p>
          <p className="text-xs text-muted-foreground">
            {notification.episodeTitle}
          </p>
        </div>
      </div>
    </button>
  );
}

export function Notifications() {
  const data = useQuery(api.notifications.getNotifications);

  return (
    <Popover>
      <PopoverTrigger asChild className="cursor-pointer">
        <div className="relative">
          <Bell className="size-4 hover:text-primary" />
          {data && data.count > 0 ? (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              <span className="text-xs">{data.count}</span>
            </div>
          ) : null}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="">
          <h2 className="font-semibold">Notifications</h2>
        </div>
        {data && data.notifications.length > 0 ? (
          data.notifications.map((notification) => (
            <Notification key={notification._id} notification={notification} />
          ))
        ) : (
          <NotificationsEmpty />
        )}
      </PopoverContent>
    </Popover>
  );
}
