import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import DropdownWrapper from "./DropdownWrapper";
import { cn } from "@/lib/utils";
// import { toast } from "react-toastify";

interface Notification {
  id: number;
  createdAt: Date;
  userId: number;
  meetingId: number | null;
  message: string;
  isRead: boolean;
  meeting: {
    title: string;
  } | null;
  document?: {
    googleId: string;
  } | null;
}

export default function NotificationDropdown() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      const response = await fetch(
        `/api/notifications?userId=${session!.user!.id}`
      );

      const data = await response.json();
      console.log("Fetched notifications:", data.notifications);
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
    // toast.success("Notification marked as read");
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
          <span className="absolute top-0 -right-1 bg-red-500 text-white text-[9px] px-1 py-0.5 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>
        <DropdownWrapper isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
          <div className={cn("absolute right-0 top-4 mt-2 w-80 bg-white shadow-lg rounded-2xl p-3 z-50 transition-all duration-300", 
            {
              "opacity-0 scale-95 pointer-events-none": !menuOpen,
              "opacity-100 scale-100 pointer-events-auto": menuOpen,
            }
          )}>
            <ul className="space-y-1">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="p-3 hover:bg-gray-200 rounded-2xl"
                  >
                    <p className="text-sm">
                      {notification.message + " " + (notification.meeting ? notification.meeting?.title : "")}
                    </p>
                    <div>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-green-500 text-xs"
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
        </DropdownWrapper>
    </div>
  );
}
