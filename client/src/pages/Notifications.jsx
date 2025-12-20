import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/notifications/my-notifications', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => 
                    n._id === notificationId ? { ...n, isRead: true } : n
                ));
                setUnreadCount(prev => prev - 1);
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/notifications/mark-all-read', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
                alert('All notifications marked as read!');
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        if (!window.confirm('Delete this notification?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(n => n._id !== notificationId));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'unread') return !n.isRead;
        return n.type === activeFilter;
    });

    const getIcon = (type) => {
        switch (type) {
            case 'order': return '📦';
            case 'message': return '💬';
            case 'opportunity': return '🌟';
            case 'custom_order': return '🎨';
            case 'booking': return '📅';
            default: return '🔔';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'border-l-4 border-accent';
            case 'medium': return 'border-l-4 border-secondary';
            default: return 'border-l-4 border-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <p className="text-xl">Loading notifications...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light">
            <div className="bg-primary text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">🔔 Notifications</h1>
                    <p className="text-lg opacity-90">
                        {unreadCount > 0 
                            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                            : 'All caught up!'
                        }
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg">
                    {/* Header */}
                    <div className="border-b p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setActiveFilter('all')}
                                    className={`px-4 py-2 rounded ${activeFilter === 'all' 
                                        ? 'bg-primary text-white' 
                                        : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                    All ({notifications.length})
                                </button>
                                <button
                                    onClick={() => setActiveFilter('unread')}
                                    className={`px-4 py-2 rounded flex items-center gap-2 ${activeFilter === 'unread' 
                                        ? 'bg-accent text-white' 
                                        : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                    <span>Unread</span>
                                    {unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={markAllAsRead}
                                    disabled={unreadCount === 0}
                                    className={`px-4 py-2 rounded ${unreadCount === 0 
                                        ? 'bg-gray-300 cursor-not-allowed' 
                                        : 'bg-secondary text-dark hover:bg-yellow-500'}`}
                                >
                                    Mark All Read
                                </button>
                                <button
                                    onClick={() => setNotifications([])}
                                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="p-6">
                        {filteredNotifications.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📭</div>
                                <p className="text-gray-600 text-lg mb-2">No notifications found</p>
                                <p className="text-gray-500">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredNotifications.map(notification => (
                                    <div 
                                        key={notification._id}
                                        className={`p-4 rounded-lg shadow-sm ${getPriorityColor(notification.priority)} ${
                                            notification.isRead ? 'bg-white' : 'bg-blue-50'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="text-2xl mt-1">
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">{notification.title}</h3>
                                                    <p className="text-gray-700">{notification.message}</p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {new Date(notification.createdAt).toLocaleString()}
                                                    </p>
                                                    {notification.actionUrl && (
                                                        <Link 
                                                            to={notification.actionUrl}
                                                            className="inline-block mt-2 text-primary hover:underline font-medium"
                                                        >
                                                            View Details →
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notification._id)}
                                                        className="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-green-800"
                                                    >
                                                        Mark Read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification._id)}
                                                    className="text-gray-400 hover:text-accent"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filter by Type */}
                    <div className="border-t p-6">
                        <h3 className="font-bold text-lg mb-4">Filter by Type</h3>
                        <div className="flex flex-wrap gap-2">
                            {['order', 'message', 'opportunity', 'custom_order', 'booking', 'system'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setActiveFilter(type)}
                                    className={`px-4 py-2 rounded capitalize ${activeFilter === type 
                                        ? 'bg-primary text-white' 
                                        : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                    {getIcon(type)} {type.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Notifications;
