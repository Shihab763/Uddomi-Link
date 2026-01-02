import { useState, useEffect } from 'react';

const TransactionDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sales'); 
    const [stats, setStats] = useState({ total: 0, pending: 0, active: 0 });

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user) fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/service-bookings/my-bookings', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setBookings(data);
                calculateStats(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const mySales = data.filter(b => b.seller._id === user._id);
        
        const totalEarned = mySales
            .filter(b => b.status === 'Completed')
            .reduce((sum, b) => sum + b.amount, 0);
            
        const pendingEarned = mySales
            .filter(b => b.status === 'Pending' || b.status === 'Accepted')
            .reduce((sum, b) => sum + b.amount, 0);

        setStats({
            total: totalEarned,
            pending: pendingEarned,
            active: mySales.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled').length
        });
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const res = await fetch(`http://localhost:5000/api/service-bookings/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchBookings();
        } catch (error) {
            console.error(error);
        }
    };

    const sales = bookings.filter(b => b.seller._id === user._id);
    const purchases = bookings.filter(b => b.buyer._id === user._id);
    const displayed = activeTab === 'sales' ? sales : purchases;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar is removed from here because it's already in App.jsx */}
            
            <div className="container mx-auto p-6 max-w-5xl">
                <h1 className="text-3xl font-bold mb-6">📊 Transaction Dashboard</h1>

                {/* Financial Stats (Only visible if I have sales) */}
                {user?.roles?.includes('business-owner') && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
                            <p className="text-sm font-bold text-gray-500 uppercase">Total Earnings</p>
                            <p className="text-2xl font-bold">৳{stats.total.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-4 rounded shadow border-l-4 border-yellow-500">
                            <p className="text-sm font-bold text-gray-500 uppercase">Pending Payments</p>
                            <p className="text-2xl font-bold">৳{stats.pending.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                            <p className="text-sm font-bold text-gray-500 uppercase">Active Jobs</p>
                            <p className="text-2xl font-bold">{stats.active}</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-6 border-b mb-6">
                    <button 
                        onClick={() => setActiveTab('sales')} 
                        className={`pb-2 font-bold px-4 ${activeTab === 'sales' ? 'text-green-700 border-b-2 border-green-700' : 'text-gray-500'}`}
                    >
                        Job Requests (My Sales)
                    </button>
                    <button 
                        onClick={() => setActiveTab('purchases')} 
                        className={`pb-2 font-bold px-4 ${activeTab === 'purchases' ? 'text-green-700 border-b-2 border-green-700' : 'text-gray-500'}`}
                    >
                        Hired Talent (My Purchases)
                    </button>
                </div>

                {/* Booking List */}
                <div className="space-y-4">
                    {displayed.length === 0 ? <p className="text-gray-500 text-center py-8">No records found in this category.</p> : displayed.map(booking => (
                        <div key={booking._id} className="bg-white p-6 rounded shadow flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="mb-4 md:mb-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-lg">{booking.serviceType}</h3>
                                    <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                        booking.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                        booking.status === 'Accepted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                                    }`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 italic text-sm mb-1">"{booking.description}"</p>
                                <p className="text-xs text-gray-400">
                                    {activeTab === 'sales' ? `Client: ${booking.buyer.name}` : `Artist: ${booking.seller.name}`} • {new Date(booking.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex flex-col items-end min-w-[120px]">
                                <p className="text-xl font-bold text-green-700 mb-2">৳{booking.amount}</p>
                                
                                {activeTab === 'sales' && booking.status === 'Pending' && (
                                    <button onClick={() => handleStatusUpdate(booking._id, 'Accepted')} className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition">
                                        Accept Job
                                    </button>
                                )}
                                {activeTab === 'sales' && booking.status === 'Accepted' && (
                                    <button onClick={() => handleStatusUpdate(booking._id, 'Completed')} className="w-full bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition">
                                        Mark Done
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TransactionDashboard;
