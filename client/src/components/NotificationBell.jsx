import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem('user'));

    // 1. Auto-Fetch when component mounts (and every 60s)
    useEffect(() => {
        if (user?.token) {
            fetchNotifications();
            
            // Optional: Poll every 60 seconds to keep it updated live
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, []);

    // Close dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/notifications', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                setNotifications(data);
                // Calculate unread count
                const count = data.filter(n => !n.isRead).length;
                setUnreadCount(count);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async (id, link) => {
        try {
            await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            // Refresh list to update UI
            fetchNotifications();
            setIsOpen(false);
            if (link) navigate(link);
        } catch (error) {
            console.error(error);
        }
    };

    const markAllRead = async () => {
        try {
            await fetch('http://localhost:5000/api/notifications/read-all', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="relative p-2 text-white hover:text-secondary transition"
            >
                <span className="text-2xl">🔔</span>
                
                {/* --- RED BADGE --- */}
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-primary">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200">
                    <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllRead}
                                className="text-xs text-blue-600 hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div 
                                    key={notification._id}
                                    onClick={() => markAsRead(notification._id, notification.link)}
                                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${!notification.isRead ? 'bg-blue-50' : 'bg-white'}`}
                                >
                                    <p className="text-sm font-semibold text-gray-800">{notification.title}</p>
                                    <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
