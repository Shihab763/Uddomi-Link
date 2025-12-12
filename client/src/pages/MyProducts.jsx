import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MyProducts() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'handicrafts',
        imageUrl: '',
        stock: ''
    });

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user || !user.roles || !user.roles.includes('business-owner')) {
            navigate('/');
            return;
        }
        fetchMyProducts();
        fetchAnalytics();
    }, [navigate, user]);

    const fetchMyProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/products/seller/my-products', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/seller/analytics', {
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = editingProduct
            ? `http://localhost:5000/api/products/${editingProduct._id}`
            : 'http://localhost:5000/api/products';

        const method = editingProduct ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert(editingProduct ? 'Product updated!' : 'Product created! Awaiting admin approval.');
                setShowForm(false);
                setEditingProduct(null);
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    category: 'handicrafts',
                    imageUrl: '',
                    stock: ''
                });
                fetchMyProducts();
                fetchAnalytics();
            } else {
                const data = await response.json();
                alert(data.message || 'Error saving product');
            }
        } catch (error) {
            alert('Error saving product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            imageUrl: product.imageUrl,
            stock: product.stock
        });
        setShowForm(true);
    };

    const handleDelete = async (productId, productName) => {
        if (!window.confirm(`Delete ${productName}?`)) return;

        try {
            const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                alert('Product deleted!');
                fetchMyProducts();
                fetchAnalytics();
            }
        } catch (error) {
            alert('Error deleting product');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'handicrafts',
            imageUrl: '',
            stock: ''
        });
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
                    <h1 className="text-4xl font-bold mb-2">🏪 My Shop</h1>
                    <p className="text-lg opacity-90">Manage your products and view analytics</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg mb-8">
                    <div className="grid grid-cols-2 border-b">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'products'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            📦 Products ({products.length})
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
                    </div>

                    {activeTab === 'products' && (
                        <div className="p-6">
                            <div className="mb-6">
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-800 transition font-bold"
                                >
                                    + Add New Product
                                </button>
                            </div>

                            {showForm && (
                                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                                    <h2 className="text-2xl font-bold mb-4">
                                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                                    </h2>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-dark font-medium mb-1">Product Name *</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-dark font-medium mb-1">Category *</label>
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full p-2 border rounded focus:outline-none focus:border-primary bg-white"
                                                    required
                                                >
                                                    <option value="handicrafts">Handicrafts</option>
                                                    <option value="textiles">Textiles</option>
                                                    <option value="pottery">Pottery</option>
                                                    <option value="jewelry">Jewelry</option>
                                                    <option value="food">Food</option>
                                                    <option value="furniture">Furniture</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-dark font-medium mb-1">Price (৳) *</label>
                                                <input
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                                    min="0"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-dark font-medium mb-1">Stock *</label>
                                                <input
                                                    type="number"
                                                    value={formData.stock}
                                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                    className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                                    min="0"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-dark font-medium mb-1">Description *</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                                rows="3"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-dark font-medium mb-1">Image URL *</label>
                                            <input
                                                type="url"
                                                value={formData.imageUrl}
                                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                                className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                                placeholder="https://example.com/image.jpg"
                                                required
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                type="submit"
                                                className="bg-primary text-white px-6 py-2 rounded hover:bg-green-800 transition font-bold"
                                            >
                                                {editingProduct ? 'Update' : 'Create'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {products.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600 text-lg mb-4">No products yet</p>
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="bg-primary text-white px-6 py-2 rounded hover:bg-green-800 transition font-bold"
                                    >
                                        Add Your First Product
                                    </button>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map(product => (
                                        <div key={product._id} className="bg-white border rounded-lg overflow-hidden shadow">
                                            <div className="relative">
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-48 object-cover"
                                                />
                                                {!product.isApproved && (
                                                    <span className="absolute top-2 right-2 bg-yellow-400 text-dark px-3 py-1 rounded-full text-xs font-bold">
                                                        PENDING APPROVAL
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-xl font-bold text-primary">৳{product.price}</span>
                                                    <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="flex-1 bg-secondary text-dark py-2 rounded hover:bg-yellow-500 transition font-bold"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product._id, product.name)}
                                                        className="flex-1 bg-accent text-white py-2 rounded hover:bg-red-700 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'analytics' && analytics && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6">My Shop Analytics</h2>

                            {/* Overview Cards */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-lg">
                                    <p className="text-sm opacity-90">Total Revenue</p>
                                    <p className="text-3xl font-bold">৳{analytics.overview.totalRevenue.toFixed(2)}</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-lg">
                                    <p className="text-sm opacity-90">Orders</p>
                                    <p className="text-3xl font-bold">{analytics.overview.totalOrders}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 rounded-lg">
                                    <p className="text-sm opacity-90">Units Sold</p>
                                    <p className="text-3xl font-bold">{analytics.overview.totalProductsSold}</p>
                                </div>
                            </div>

                            {/* Status Cards */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                                    <p className="text-gray-600 text-sm">Pending Approval</p>
                                    <p className="text-2xl font-bold text-yellow-600">{analytics.overview.pendingProducts}</p>
                                </div>
                                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                                    <p className="text-gray-600 text-sm">Approved Products</p>
                                    <p className="text-2xl font-bold text-green-600">{analytics.overview.approvedProducts}</p>
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
                                                    <th className="text-right py-2">Sold</th>
                                                    <th className="text-right py-2">Revenue</th>
                                                    <th className="text-right py-2">Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analytics.topProducts.map((p, i) => (
                                                    <tr key={i} className="border-b last:border-0">
                                                        <td className="py-2">{p.name}</td>
                                                        <td className="text-right">{p.quantity}</td>
                                                        <td className="text-right">৳{p.revenue.toFixed(2)}</td>
                                                        <td className="text-right">{p.stock}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No sales yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Low Stock Alert */}
                            {analytics.lowStockProducts.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold mb-4 text-accent">⚠️ Low Stock Alert</h3>
                                    <div className="bg-red-50 rounded-lg p-4">
                                        <ul className="space-y-2">
                                            {analytics.lowStockProducts.map(p => (
                                                <li key={p._id} className="flex justify-between">
                                                    <span>{p.name}</span>
                                                    <span className="font-bold text-accent">Only {p.stock} left!</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Recent Orders */}
                            <div>
                                <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    {analytics.recentOrders.length > 0 ? (
                                        <div className="space-y-3">
                                            {analytics.recentOrders.map(order => (
                                                <div key={order._id} className="bg-white p-4 rounded shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-semibold">{order.buyer}</p>
                                                            <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <span className={`text-xs px-2 py-1 rounded ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm">
                                                        {order.items.map((item, i) => (
                                                            <p key={i} className="text-gray-700">
                                                                {item.name} × {item.quantity} = ৳{(item.price * item.quantity).toFixed(2)}
                                                            </p>
                                                        ))}
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

export default MyProducts;
