import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [roleRequests, setRoleRequests] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [reports, setReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);
    const [reportsError, setReportsError] = useState("");

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        admins: 0,
        businessOwners: 0,
        ngos: 0,
        regularUsers: 0
    });

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user || !user.roles || !user.roles.includes('admin')) {
            navigate('/');
            return;
        }

        fetchUsers();
        fetchPendingProducts();
        fetchRoleRequests();
        fetchAnalytics();
    }, [navigate, user]);
    
    useEffect(() => {
    if (activeTab === 'reports') {
        fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);


    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);

                const stats = {
                    total: data.length,
                    admins: data.filter(u => u.roles && u.roles.includes('admin')).length,
                    businessOwners: data.filter(u => u.roles && u.roles.includes('business-owner')).length,
                    ngos: data.filter(u => u.roles && u.roles.includes('ngo')).length,
                    regularUsers: data.filter(u => u.roles && u.roles.includes('user') && u.roles.length === 1).length
                };
                setStats(stats);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/products/pending', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPendingProducts(data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchRoleRequests = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/role-requests/pending', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setRoleRequests(data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const fetchReports = async () => {
    try {
        setReportsError("");
        setReportsLoading(true);

        const response = await fetch("http://localhost:5000/api/reports?status=pending", {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch reports");
        }

        const data = await response.json();
        setReports(data);
    } catch (error) {
        console.error("fetchReports error:", error);
        setReportsError("Failed to load reports.");
    } finally {
        setReportsLoading(false);
    }
};

const resolveReport = async (reportId) => {
    try {
        const response = await fetch(`http://localhost:5000/api/reports/${reportId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ status: "resolved" }),
        });

        if (!response.ok) {
            throw new Error("Failed to resolve report");
        }

        // Remove resolved report from UI
        setReports(prev => prev.filter(r => r._id !== reportId));
    } catch (error) {
        alert("Failed to resolve report.");
    }
};

    const fetchAnalytics = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/analytics', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleApproveProduct = async (productId) => {
        if (!confirm('Approve this product?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/admin/products/${productId}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                alert('Product approved!');
                fetchPendingProducts();
                fetchAnalytics();
            }
        } catch (error) {
            alert('Error approving product');
        }
    };

    const handleRejectProduct = async (productId, productName) => {
        if (!confirm(`Reject and delete "${productName}"?`)) return;

        try {
            const response = await fetch(`http://localhost:5000/api/admin/products/${productId}/reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                alert('Product rejected');
                fetchPendingProducts();
                fetchAnalytics();
            }
        } catch (error) {
            alert('Error rejecting product');
        }
    };

    const handleApproveRole = async (requestId) => {
        if (!confirm('Approve this role request?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/role-requests/${requestId}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                alert('Role request approved!');
                fetchRoleRequests();
                fetchUsers();
            }
        } catch (error) {
            alert('Error approving request');
        }
    };

    const handleRejectRole = async (requestId) => {
        if (!confirm('Reject this role request?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/role-requests/${requestId}/reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                alert('Role request rejected');
                fetchRoleRequests();
            }
        } catch (error) {
            alert('Error rejecting request');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (userId === user._id) {
            alert('You cannot delete yourself!');
            return;
        }

        if (!confirm(`Delete user ${userName}?`)) return;

        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                alert('User deleted');
                fetchUsers();
            }
        } catch (error) {
            alert('Error deleting user');
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
            <div className="bg-primary text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">👑 Admin Dashboard</h1>
                    <p className="text-lg opacity-90">Manage users and moderate content</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg mb-8">
                    <div className="grid grid-cols-5 border-b">

                        <button
                            onClick={() => setActiveTab('users')}
                            className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'users'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            👥 Users ({stats.total})
                        </button>
                        <button
                            onClick={() => setActiveTab('approvals')}
                            className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'approvals'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            ⏳ Products
                            {pendingProducts.length > 0 && (
                                <span className="ml-2 bg-accent text-white px-2 py-1 rounded-full text-sm">
                                    {pendingProducts.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'roles'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🎭 Roles
                            {roleRequests.length > 0 && (
                                <span className="ml-2 bg-purple-500 text-white px-2 py-1 rounded-full text-sm">
                                    {roleRequests.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'analytics'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            📊 Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'reports'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🚩 Reports
                            {reports.length > 0 && (
                                <span className="ml-2 bg-red-600 text-white px-2 py-1 rounded-full text-sm">
                                    {reports.length}
                                </span>
                            )}
                        </button>

                    </div>

                    {activeTab === 'users' && (
                        <div className="p-6">
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                    <p className="text-gray-600 text-sm">Total Users</p>
                                    <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                                </div>
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                                    <p className="text-gray-600 text-sm">Admins</p>
                                    <p className="text-3xl font-bold text-red-600">{stats.admins}</p>
                                </div>
                                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                                    <p className="text-gray-600 text-sm">Business Owners</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.businessOwners}</p>
                                </div>
                                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                                    <p className="text-gray-600 text-sm">NGOs</p>
                                    <p className="text-3xl font-bold text-purple-600">{stats.ngos}</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Name</th>
                                            <th className="px-4 py-3 text-left">Email</th>
                                            <th className="px-4 py-3 text-left">Roles</th>
                                            <th className="px-4 py-3 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u._id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3">{u.name}</td>
                                                <td className="px-4 py-3">{u.email}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {u.roles && u.roles.map(role => (
                                                            <span
                                                                key={role}
                                                                className={`px-2 py-1 rounded text-xs font-semibold ${role === 'admin'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : role === 'business-owner'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : role === 'ngo'
                                                                            ? 'bg-purple-100 text-purple-800'
                                                                            : 'bg-gray-100 text-gray-800'
                                                                    }`}
                                                            >
                                                                {role}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => handleDeleteUser(u._id, u.name)}
                                                        disabled={u._id === user._id}
                                                        className="text-accent hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'approvals' && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6">Pending Product Approvals</h2>

                            {pendingProducts.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <p className="text-gray-600 text-lg">✅ No pending products</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pendingProducts.map(product => (
                                        <div key={product._id} className="bg-white border-2 border-yellow-300 rounded-lg overflow-hidden shadow-md">
                                            <div className="relative">
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-48 object-cover"
                                                />
                                                <span className="absolute top-2 right-2 bg-yellow-400 text-dark px-3 py-1 rounded-full text-sm font-bold">
                                                    PENDING
                                                </span>
                                            </div>

                                            <div className="p-4">
                                                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                                                <div className="mb-3 text-sm">
                                                    <p><span className="font-semibold">Category:</span> {product.category}</p>
                                                    <p><span className="font-semibold">Price:</span> ৳{product.price}</p>
                                                    <p><span className="font-semibold">Stock:</span> {product.stock}</p>
                                                    <p><span className="font-semibold">Seller:</span> {product.seller?.name}</p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApproveProduct(product._id)}
                                                        className="flex-1 bg-primary text-white py-2 rounded hover:bg-green-800 transition font-bold"
                                                    >
                                                        ✓ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectProduct(product._id, product.name)}
                                                        className="flex-1 bg-accent text-white py-2 rounded hover:bg-red-700 transition font-bold"
                                                    >
                                                        ✕ Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'roles' && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6">Pending Role Requests</h2>

                            {roleRequests.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <p className="text-gray-600 text-lg">✅ No pending role requests</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {roleRequests.map(request => (
                                        <div key={request._id} className="bg-white border-2 border-purple-300 rounded-lg p-6 shadow-md">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-dark">{request.user?.name}</h3>
                                                    <p className="text-gray-600">{request.user?.email}</p>
                                                </div>
                                                <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-bold">
                                                    {request.requestedRole}
                                                </span>
                                            </div>

                                            <div className="mb-4 p-4 bg-gray-50 rounded">
                                                <p className="text-sm text-gray-600 mb-1 font-semibold">Reason:</p>
                                                <p className="text-gray-800">{request.reason}</p>
                                            </div>

                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleApproveRole(request._id)}
                                                    className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-green-800 transition font-bold"
                                                >
                                                    ✓ Approve & Grant Role
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRole(request._id)}
                                                    className="flex-1 bg-accent text-white py-3 rounded-lg hover:bg-red-700 transition font-bold"
                                                >
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'reports' && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6">Reports</h2>

                            {reportsLoading && (
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    Loading reports...
                                </div>
                            )}

                            {reportsError && (
                                <div className="bg-red-50 text-red-700 rounded-lg p-4">
                                    {reportsError}
                                </div>
                            )}

                            {!reportsLoading && !reportsError && reports.length === 0 && (
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    No pending reports 🎉
                                </div>
                            )}

                            {!reportsLoading && !reportsError && reports.length > 0 && (
                                <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
                                    <table className="min-w-full text-sm text-left">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-4 py-3">Seller</th>
                                                <th className="px-4 py-3">Reporter</th>
                                                <th className="px-4 py-3">Reason</th>
                                                <th className="px-4 py-3">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reports.map((r) => (
                                                <tr key={r._id} className="border-b">
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold">{r.sellerId?.name}</div>
                                                        <div className="text-xs text-gray-500">{r.sellerId?.email}</div>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold">{r.reporterId?.name}</div>
                                                        <div className="text-xs text-gray-500">{r.reporterId?.email}</div>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold">{r.reason}</div>
                                                        {r.details && (
                                                            <div className="text-xs text-gray-600 mt-1">
                                                                {r.details}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => resolveReport(r._id)}
                                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                                                    >
                                                        Resolved
                                                    </button>
                                                </td>
                                           </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                    {activeTab === 'analytics' && analytics && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6">System Analytics</h2>

                            {/* Overview Cards */}
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-lg shadow">
                                    <p className="text-sm opacity-90">Total Revenue</p>
                                    <p className="text-3xl font-bold">৳{analytics.overview.totalRevenue.toFixed(2)}</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-lg shadow">
                                    <p className="text-sm opacity-90">Total Orders</p>
                                    <p className="text-3xl font-bold">{analytics.overview.totalOrders}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 rounded-lg shadow">
                                    <p className="text-sm opacity-90">Avg Order Value</p>
                                    <p className="text-3xl font-bold">৳{analytics.overview.avgOrderValue.toFixed(2)}</p>
                                </div>
                                <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-6 rounded-lg shadow">
                                    <p className="text-sm opacity-90">Products</p>
                                    <p className="text-3xl font-bold">{analytics.overview.totalProducts}</p>
                                </div>
                            </div>

                            {/* Top Products */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-4">Top Selling Products</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    {analytics.topProducts.length > 0 ? (
                                        <table className="w-full">
                                            <thead className="border-b">
                                                <tr>
                                                    <th className="text-left py-2">Product</th>
                                                    <th className="text-right py-2">Units Sold</th>
                                                    <th className="text-right py-2">Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analytics.topProducts.map((p, i) => (
                                                    <tr key={i} className="border-b last:border-0">
                                                        <td className="py-2">{p.name}</td>
                                                        <td className="text-right">{p.quantity}</td>
                                                        <td className="text-right">৳{p.revenue.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No sales data yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Top Sellers */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-4">Top Sellers</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    {analytics.topSellers.length > 0 ? (
                                        <table className="w-full">
                                            <thead className="border-b">
                                                <tr>
                                                    <th className="text-left py-2">Seller</th>
                                                    <th className="text-right py-2">Products</th>
                                                    <th className="text-right py-2">Total Sold</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analytics.topSellers.map((s, i) => (
                                                    <tr key={i} className="border-b last:border-0">
                                                        <td className="py-2">{s.name}</td>
                                                        <td className="text-right">{s.productCount}</td>
                                                        <td className="text-right">{s.totalSold} units</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No seller data yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div>
                                <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    {analytics.recentOrders.length > 0 ? (
                                        <div className="space-y-3">
                                            {analytics.recentOrders.map(order => (
                                                <div key={order._id} className="bg-white p-4 rounded shadow-sm flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold">{order.buyer}</p>
                                                        <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-primary">৳{order.totalAmount}</p>
                                                        <span className={`text-xs px-2 py-1 rounded ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No orders yet</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
