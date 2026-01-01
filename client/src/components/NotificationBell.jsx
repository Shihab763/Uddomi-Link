// client/src/components/NotificationBell.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Helper to get token securely
    const getToken = () => {
        const userInfo = JSON.parse(localStorage.getItem('user')); // Adjust key if needed ('userInfo' or 'user')
        return userInfo?.token || localStorage.getItem('token');
    };

    // 1. Fetch Unread Count on Load
    useEffect(() => {
        const fetchUnreadCount = async () => {
            const token = getToken();
            if (!token) return;

            try {
                const res = await fetch('http://localhost:5000/api/notifications/unread-count', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setUnreadCount(data.count);
            } catch (err) {
                console.error("Failed to fetch notification count", err);
            }
        };

        fetchUnreadCount();
        // Optional: Poll every 60 seconds to update count
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, []);

    // 2. Fetch Notifications when Dropdown opens
    const handleToggle = async () => {
        if (!isOpen) {
            setLoading(true);
            const token = getToken();
            try {
                const res = await fetch('http://localhost:5000/api/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setNotifications(data);
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            } finally {
                setLoading(false);
            }
        }
        setIsOpen(!isOpen);
    };

    // 3. Handle Click on Notification
    const handleNotificationClick = async (notification) => {
        // A. Mark as read in backend
        if (!notification.isRead) {
            const token = getToken();
            try {
                await fetch(`http://localhost:5000/api/notifications/${notification._id}/read`, {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Update local state to remove unread status
                setNotifications(prev => 
                    prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (err) {
                console.error("Failed to mark read", err);
            }
        }

        // B. Redirect if link exists
        setIsOpen(false);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    // Close dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button 
                onClick={handleToggle} 
                className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                
                {/* Red Dot Badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-100">
                    <div className="py-2 px-4 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700">
                        Notifications
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No notifications yet</div>
                        ) : (
                            notifications.map((note) => (
                                <div 
                                    key={note._id}
                                    onClick={() => handleNotificationClick(note)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${!note.isRead ? 'bg-blue-50' : ''}`}
                                >
                                    <h4 className="text-sm font-semibold text-gray-800">{note.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{note.message}</p>
                                    <span className="text-xs text-gray-400 mt-2 block">
                                        {new Date(note.createdAt).toLocaleDateString()}
                                    </span>
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