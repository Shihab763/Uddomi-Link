import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function CustomOrdersPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('requests');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [selectedCreator, setSelectedCreator] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        budgetRange: { min: '', max: '' },
        deadline: '',
        portfolioItemId: ''
    });

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchMyOrders();
    }, [navigate, user]);

    const fetchMyOrders = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/custom-orders/my-orders', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/custom-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    ...formData,
                    creatorId: selectedCreator._id,
                    budgetRange: {
                        min: parseFloat(formData.budgetRange.min),
                        max: parseFloat(formData.budgetRange.max)
                    }
                })
            });

            if (response.ok) {
                alert('Custom order request sent!');
                setShowRequestForm(false);
                setSelectedCreator(null);
                setFormData({
                    title: '',
                    description: '',
                    requirements: '',
                    budgetRange: { min: '', max: '' },
                    deadline: '',
                    portfolioItemId: ''
                });
                fetchMyOrders();
            } else {
                const data = await response.json();
                alert(data.message || 'Error sending request');
            }
        } catch (error) {
            alert('Error sending request');
        }
    };

    const handleStatusUpdate = async (orderId, status) => {
        try {
            const response = await fetch(`http://localhost:5000/api/custom-orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                alert(`Order ${status}`);
                fetchMyOrders();
            }
        } catch (error) {
            alert('Error updating status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-blue-100 text-blue-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'in_progress': return 'bg-purple-100 text-purple-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">🎯 Custom Orders</h1>
                    <p className="text-lg opacity-90">Request unique creations or manage incoming requests</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg mb-8">
                    <div className="grid grid-cols-2 border-b">
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'requests'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            📨 My Requests ({orders.filter(o => !user.roles.includes('business-owner')).length})
                        </button>
                        <button
                            onClick={() => setActiveTab('incoming')}
                            className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'incoming'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            📥 Incoming Requests ({orders.filter(o => user.roles.includes('business-owner')).length})
                        </button>
                    </div>

                    <div className="p-6">
                        {(user.roles.includes('business-owner') || user.roles.includes('artist')) && activeTab === 'incoming' ? (
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Incoming Custom Order Requests</h2>
                                
                                {orders.filter(o => o.creator._id === user._id).length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-600 text-lg mb-4">No incoming requests yet</p>
                                        <p className="text-gray-500">When customers request custom work, it will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {orders.filter(o => o.creator._id === user._id).map(order => (
                                            <div key={order._id} className="border rounded-lg p-6 hover:shadow-md transition">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-dark">{order.title}</h3>
                                                        <p className="text-gray-600">From: {order.customer.name}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                                                        {order.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>

                                                <p className="text-gray-700 mb-4">{order.description}</p>

                                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Budget Range</p>
                                                        <p className="font-bold">৳{order.budgetRange.min} - ৳{order.budgetRange.max}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Deadline</p>
                                                        <p className="font-bold">{new Date(order.deadline).toLocaleDateString()}</p>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600 mb-2">Requirements:</p>
                                                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{order.requirements}</p>
                                                </div>

                                                {order.status === 'pending' && (
                                                    <div className="flex gap-4">
                                                        <button
                                                            onClick={() => handleStatusUpdate(order._id, 'accepted')}
                                                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition font-bold"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(order._id, 'rejected')}
                                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}

                                                {order.status === 'accepted' && (
                                                    <div>
                                                        <button
                                                            onClick={() => handleStatusUpdate(order._id, 'in_progress')}
                                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition font-bold mr-4"
                                                        >
                                                            Start Work
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(order._id, 'completed')}
                                                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                                                        >
                                                            Mark Complete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-dark">My Custom Order Requests</h2>
                                    <button
                                        onClick={() => setShowRequestForm(true)}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-bold"
                                    >
                                        + New Request
                                    </button>
                                </div>

                                {showRequestForm && (
                                    <div className="bg-gray-50 p-6 rounded-lg mb-8">
                                        <h2 className="text-2xl font-bold mb-4">Request Custom Work</h2>

                                        <form onSubmit={handleSubmitRequest} className="space-y-4">
                                            <div>
                                                <label className="block text-dark font-medium mb-1">Title *</label>
                                                <input
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                                                    placeholder="e.g., Custom painted portrait"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-dark font-medium mb-1">Description *</label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                                                    rows="3"
                                                    placeholder="Describe what you want created..."
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-dark font-medium mb-1">Requirements *</label>
                                                <textarea
                                                    value={formData.requirements}
                                                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                                    className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                                                    rows="3"
                                                    placeholder="Specific details, size, colors, materials, etc..."
                                                    required
                                                />
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-dark font-medium mb-1">Min Budget (৳) *</label>
                                                    <input
                                                        type="number"
                                                        value={formData.budgetRange.min}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            budgetRange: { ...formData.budgetRange, min: e.target.value }
                                                        })}
                                                        className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                                                        min="0"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-dark font-medium mb-1">Max Budget (৳) *</label>
                                                    <input
                                                        type="number"
                                                        value={formData.budgetRange.max}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            budgetRange: { ...formData.budgetRange, max: e.target.value }
                                                        })}
                                                        className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-dark font-medium mb-1">Deadline *</label>
                                                <input
                                                    type="date"
                                                    value={formData.deadline}
                                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                                    className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                                                    required
                                                />
                                            </div>

                                            <div className="flex gap-4">
                                                <button
                                                    type="submit"
                                                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-bold"
                                                >
                                                    Send Request
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowRequestForm(false)}
                                                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {orders.filter(o => o.customer._id === user._id).length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-600 text-lg mb-4">No custom order requests yet</p>
                                        <button
                                            onClick={() => setShowRequestForm(true)}
                                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-bold"
                                        >
                                            Make Your First Request
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {orders.filter(o => o.customer._id === user._id).map(order => (
                                            <div key={order._id} className="border rounded-lg p-6 hover:shadow-md transition">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-dark">{order.title}</h3>
                                                        <p className="text-gray-600">To: {order.creator.name}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                                                        {order.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>

                                                <p className="text-gray-700 mb-4">{order.description}</p>

                                                <div className="grid md:grid-cols-3 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Budget</p>
                                                        <p className="font-bold">৳{order.budgetRange.min} - ৳{order.budgetRange.max}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Deadline</p>
                                                        <p className="font-bold">{new Date(order.deadline).toLocaleDateString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Requested</p>
                                                        <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <Link
                                                        to={`/custom-orders/${order._id}`}
                                                        className="text-blue-600 hover:text-blue-800 font-bold"
                                                    >
                                                        View Details & Messages →
                                                    </Link>
                                                    
                                                    {order.status === 'completed' && !order.rating && (
                                                        <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">
                                                            Rate Order
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomOrdersPage;
