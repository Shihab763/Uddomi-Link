import { useState, useEffect } from 'react';

function CustomOrders() {
    const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'sent'
    const [requests, setRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [formData, setFormData] = useState({
        sellerId: '',
        title: '',
        description: '',
        category: 'artwork',
        budget: '',
        deadline: '',
        specifications: {
            dimensions: '',
            materials: '',
            colors: '',
            quantity: 1
        }
    });

    const user = JSON.parse(localStorage.getItem('user'));
    const isSeller = user?.roles?.includes('business-owner') || user?.roles?.includes('artist');

    useEffect(() => {
        if (isSeller) {
            fetchSellerRequests();
        }
        fetchSentRequests();
    }, []);

    const fetchSellerRequests = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/custom-orders/seller/orders', {
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
        }
    };

    const fetchSentRequests = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/custom-orders/customer/orders', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSentRequests(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        // Implementation similar to MyProducts.jsx
    };

    const handleRespond = async (orderId, status, quotedPrice) => {
        // Implementation for seller response
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
                    <p className="text-lg opacity-90">Request custom creations or manage incoming requests</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg">
                    <div className="grid grid-cols-2 border-b">
                        {isSeller && (
                            <button
                                onClick={() => setActiveTab('requests')}
                                className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'requests'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                📥 Requests ({requests.length})
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab('sent')}
                            className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'sent'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            📤 My Requests ({sentRequests.length})
                        </button>
                    </div>

                    {/* Content will go here following your MyProducts.jsx pattern */}
                    <div className="p-6">
                        {/* Similar to MyProducts.jsx tab content structure */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomOrders;
