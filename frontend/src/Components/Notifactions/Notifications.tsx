import { useEffect } from 'react';
import useStore from '@/hooks/useStore.ts';
import { ScrollArea } from '../ui/scroll-area';

export function Notifications() {
  const {
    notifications,
    unreadCount,
    getNotifications,
    markAsRead,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  } = useStore((state) => state);

  useEffect(() => {
    getNotifications();
    subscribeToNotifications();
    return () => unsubscribeFromNotifications();
  }, []);

  console.log(notifications);

  return (
    <div className='pt-14'>
    <div className="w-80 bg-white rounded-xl shadow-lg pt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Notifications</h3>
      </div>
      <ScrollArea className="h-96">
        {notifications.length === 0 && (
          <p className="text-sm text-gray-500">No notifications yet 😴</p>
        )}
        <ul>
          {notifications.map((n) => (
            <li
              key={n._id}
              className={`p-2 mb-1 rounded-md cursor-pointer ${
                n.isRead ? 'bg-gray-100' : 'bg-blue-50 font-semibold'
              } hover:bg-blue-100`}
              onClick={() => markAsRead(n._id)}
            >
              <span className="text-sm">
                <b>{n.fromUser?.username}</b> {n.message}
              </span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>

    </div>
  );
}
