import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Notification {
    id: number;
    message: string;
}

export default function NotificationDropdown() {
    const {data: session} = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      const response = await fetch(`/api/notifications?userId=${session!.user!.id}`);

      const data = await response.json();
      setNotifications(data.notifications);
    }

    fetchNotifications();
  }, [session]);

  const markAsRead = async (notificationId: number) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    });

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    toast.success("Notification marked as read");
  };

  return (
    <div className="relative mt-1">
      <button onClick={() => setMenuOpen(!menuOpen)}>
        <Image
          src="/images/bell.svg"
          width={28}
          height={28}
          alt="Notifications"
        />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg">
          <ul>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <li key={notification.id} className="p-2 border-b">
                  <p className="text-sm">{notification.message}</p>
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-blue-500 text-xs"
                  >
                    Mark as read
                  </button>
                </li>
              ))
            ) : (
              <li className="p-2 text-center text-gray-500">
                No notifications
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
