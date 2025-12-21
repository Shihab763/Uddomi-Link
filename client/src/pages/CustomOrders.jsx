import { useState, useEffect } from 'react';

function CustomOrders() {
    const [activeTab, setActiveTab] = useState('my-requests');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        sellerId: '',
        title: '',
        description: '',
        category: 'artwork',
        budget: '',
        deadline: '',
        referenceImages: [{ url: '', caption: '' }]
    });

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/custom-orders/customer/orders', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setRequests(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:5000/api/custom-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Custom order request sent!');
                setShowForm(false);
                setFormData({
                    sellerId: '',
                    title: '',
                    description: '',
                    category: 'artwork',
                    budget: '',
                    deadline: '',
                    referenceImages: [{ url: '', caption: '' }]
                });
                fetchMyRequests();
            }
        } catch (error) {
            alert('Error sending request');
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
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">🎨 Custom Orders</h1>
                    <p className="text-lg opacity-90">Request custom creations from artisans</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg">
                    <div className="grid grid-cols-2 border-b">
                        <button
                            onClick={() => setActiveTab('my-requests')}
                            className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'my-requests'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            📤 My Requests ({requests.length})
                        </button>
                        <button
                            onClick={() => setShowForm(true)}
                            className="py-4 px-6 font-bold text-lg bg-green-600 text-white hover:bg-green-700 transition"
                        >
                            + New Request
                        </button>
                    </div>

                    {showForm && (
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold mb-4">Create Custom Order Request</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-dark font-medium mb-1">Title *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full p-3 border rounded focus:outline-none focus:border-primary"
                                            placeholder="e.g., Custom Wooden Sculpture"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-dark font-medium mb-1">Category *</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full p-3 border rounded focus:outline-none focus:border-primary bg-white"
                                            required
                                        >
                                            <option value="artwork">Artwork</option>
                                            <option value="handicraft">Handicraft</option>
                                            <option value="textile">Textile</option>
                                            <option value="jewelry">Jewelry</option>
                                            <option value="furniture">Furniture</option>
                                            <option value="food">Food</option>
                                            <option value="service">Service</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-dark font-medium mb-1">Description *</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full p-3 border rounded focus:outline-none focus:border-primary"
                                        rows="4"
                                        placeholder="Describe exactly what you want..."
                                        required
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-dark font-medium mb-1">Budget (৳) *</label>
                                        <input
                                            type="number"
                                            value={formData.budget}
                                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                            className="w-full p-3 border rounded focus:outline-none focus:border-primary"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-dark font-medium mb-1">Deadline *</label>
                                        <input
                                            type="date"
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                            className="w-full p-3 border rounded focus:outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-dark font-medium mb-1">Seller ID *</label>
                                    <input
                                        type="text"
                                        value={formData.sellerId}
                                        onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })}
                                        className="w-full p-3 border rounded focus:outline-none focus:border-primary"
                                        placeholder="Enter seller's user ID"
                                        required
                                    />
                                    <p className="text-sm text-gray-600 mt-1">You'll need to find and copy the seller's ID from their profile</p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        className="bg-primary text-white px-6 py-3 rounded hover:bg-green-800 transition font-bold"
                                    >
                                        Submit Request
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="bg-gray-300 text-dark px-6 py-3 rounded hover:bg-gray-400 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="p-6">
                        {requests.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg mb-4">No custom order requests yet</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-primary text-white px-6 py-3 rounded hover:bg-green-800 transition font-bold"
                                >
                                    Make Your First Request
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {requests.map(request => (
                                    <div key={request._id} className="border rounded-lg p-4 hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg">{request.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-sm ${
                                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {request.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-3">{request.description}</p>
                                        <div className="flex justify-between text-sm">
                                            <span>Budget: ৳{request.budget}</span>
                                            <span>Deadline: {new Date(request.deadline).toLocaleDateString()}</span>
                                        </div>
                                        {request.sellerResponse && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded">
                                                <p className="font-medium">Seller's Response:</p>
                                                <p>{request.sellerResponse.message}</p>
                                                {request.sellerResponse.quotedPrice && (
                                                    <p>Quoted Price: ৳{request.sellerResponse.quotedPrice}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomOrders;
